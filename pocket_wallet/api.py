# Copyright (c) 2026, D-codE and contributors
# For license information, please see license.txt
"""Thin convenience APIs for the Pocket Wallet frontend (the `wallet` SPA).

The SPA talks to the standard Frappe REST/RPC surface for CRUD
(`frappe.client.*` over My Wallet / Wallet Account / Wallet Category /
Wallet Budget). These helpers only cover what that surface doesn't give cheaply:
the current session and a server-side spend rollup.
"""

import frappe
from frappe.utils import get_fullname, getdate

from pocket_wallet.permissions import has_full_access
from pocket_wallet.setup.install import ensure_user_wallets


@frappe.whitelist()
def bootstrap():
	"""Per-user first-run setup. Idempotent; safe to call on every app load."""
	ensure_user_wallets(frappe.session.user)
	return {"ok": True}


@frappe.whitelist(allow_guest=True)
def get_session():
	"""Return the logged-in user (or Guest) plus app preferences.

	`allow_guest` so the SPA can probe auth state without triggering a 401 —
	it inspects `logged_in` and routes to the login screen itself.
	"""
	user = frappe.session.user
	if user == "Guest":
		return {"logged_in": False, "user": "Guest"}

	return {
		"logged_in": True,
		"user": user,
		"full_name": get_fullname(user),
		"email": frappe.db.get_value("User", user, "email") or user,
		"currency": (
			frappe.db.get_single_value("Pocket Wallet Settings", "default_currency")
			or frappe.db.get_single_value("Global Defaults", "default_currency")
			or "USD"
		),
		"roles": frappe.get_roles(user),
	}


@frappe.whitelist()
def get_budget_status():
	"""Budgets joined with this month's spend per category.

	Mirrors the frontend's `budgetsWithSpend`, but computed in SQL so a client
	never needs the full transaction history just to render the Budget screen.
	"""
	budgets = frappe.get_all(
		"Wallet Budget",
		fields=["name", "category", "amount", "period"],
	)
	if not budgets:
		return []

	today = getdate()
	month_start = today.replace(day=1)

	spend_rows = frappe.get_all(
		"My Wallet",
		filters={
			"type": "Expense",
			"date": (">=", month_start),
			"category": ("in", [b.category for b in budgets]),
		},
		fields=["category", "amount", "status"],
	)
	# Sum in Python so soft-deleted ("Deleted") rows are excluded null-safely.
	spent_by_category: dict = {}
	for r in spend_rows:
		if (r.status or "") == "Deleted":
			continue
		spent_by_category[r.category] = spent_by_category.get(r.category, 0) + (r.amount or 0)

	for b in budgets:
		b["spent"] = spent_by_category.get(b.category, 0)
	return budgets


# --- Wallet sharing ---------------------------------------------------------


def _get_owned_wallet(wallet):
	"""Load a wallet, asserting the caller is allowed to manage its sharing."""
	doc = frappe.get_doc("Wallet Account", wallet)
	if doc.owner != frappe.session.user and not has_full_access():
		frappe.throw("Only the wallet owner can manage sharing", frappe.PermissionError)
	return doc


def _shares(doc):
	return {
		"wallet": doc.name,
		"owner": doc.owner,
		"shared_with": [row.user for row in (doc.shared_with or [])],
	}


@frappe.whitelist()
def get_wallet_shares(wallet):
	"""Owner + the users a wallet is shared with."""
	return _shares(_get_owned_wallet(wallet))


@frappe.whitelist()
def share_wallet(wallet, user):
	"""Grant another user access to a wallet (view + post transactions)."""
	doc = _get_owned_wallet(wallet)
	if not frappe.db.exists("User", user):
		frappe.throw(f"User '{user}' not found")
	if user == doc.owner:
		frappe.throw("The owner already has access")
	if any(row.user == user for row in (doc.shared_with or [])):
		return _shares(doc)
	doc.append("shared_with", {"user": user})
	doc.save(ignore_permissions=True)
	return _shares(doc)


@frappe.whitelist()
def unshare_wallet(wallet, user):
	"""Revoke a user's access to a wallet."""
	doc = _get_owned_wallet(wallet)
	doc.shared_with = [row for row in (doc.shared_with or []) if row.user != user]
	doc.save(ignore_permissions=True)
	return _shares(doc)


@frappe.whitelist()
def get_shareable_users(txt=""):
	"""Enabled system users the wallet can be shared with (excludes self/system)."""
	or_filters = None
	if txt:
		or_filters = [["name", "like", f"%{txt}%"], ["full_name", "like", f"%{txt}%"]]
	return frappe.get_all(
		"User",
		filters=[
			["enabled", "=", 1],
			["user_type", "=", "System User"],
			["name", "not in", ["Administrator", "Guest", frappe.session.user]],
		],
		or_filters=or_filters,
		fields=["name", "full_name"],
		limit=20,
		order_by="full_name asc",
	)
