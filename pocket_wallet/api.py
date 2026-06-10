# Copyright (c) 2026, D-codE and contributors
# For license information, please see license.txt
"""Thin convenience APIs for the Pocket Wallet frontend (the `wallet` SPA).

The SPA talks to the standard Frappe REST/RPC surface for CRUD
(`frappe.client.*` over My Wallet / Wallet Account / Wallet Category /
Wallet Budget). These helpers only cover what that surface doesn't give cheaply:
the current session and a server-side spend rollup.
"""

import frappe
from frappe.utils import cint, flt, get_fullname, getdate

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


# --- Wallet create / edit / default -----------------------------------------


def _assert_wallet_owner(doc):
	if doc.owner != frappe.session.user and not has_full_access():
		frappe.throw("Only the wallet owner can edit this wallet", frappe.PermissionError)


def _make_default(wallet, owner):
	"""Mark `wallet` as the user's single default (clears it on their others)."""
	for name in frappe.get_all("Wallet Account", filters={"owner": owner}, pluck="name"):
		frappe.db.set_value("Wallet Account", name, "is_default", 1 if name == wallet else 0)


@frappe.whitelist()
def save_wallet(
	name=None,
	account_name=None,
	wallet_type=None,
	color=None,
	icon=None,
	account_balance=None,
	is_default=None,
):
	"""Create a new wallet (no `name`) or update an existing owned one."""
	if name:
		doc = frappe.get_doc("Wallet Account", name)
		_assert_wallet_owner(doc)
	else:
		doc = frappe.new_doc("Wallet Account")

	if account_name is not None:
		doc.account_name = account_name
	if wallet_type is not None:
		doc.wallet_type = wallet_type
	if color is not None:
		doc.color = color
	if icon is not None:
		doc.icon = icon
	if account_balance is not None:
		# Setting a balance manually is an explicit opening/adjustment action.
		doc.edit_account_balance = 1
		doc.account_balance = flt(account_balance)

	doc.save()  # respects create/write perms; owner is set to the session user

	if cint(is_default):
		_make_default(doc.name, doc.owner)
		frappe.db.commit()

	return {"name": doc.name}


@frappe.whitelist()
def set_default_wallet(wallet):
	"""Set the caller's default wallet (used to preselect it in the app)."""
	doc = frappe.get_doc("Wallet Account", wallet)
	_assert_wallet_owner(doc)
	_make_default(wallet, doc.owner)
	frappe.db.commit()
	return {"ok": True}


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
