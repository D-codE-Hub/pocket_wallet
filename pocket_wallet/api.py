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
		fields=["category", "sum(amount) as spent"],
		group_by="category",
	)
	spent_by_category = {r.category: r.spent or 0 for r in spend_rows}

	for b in budgets:
		b["spent"] = spent_by_category.get(b.category, 0)
	return budgets
