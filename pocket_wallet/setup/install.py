# Copyright (c) 2026, D-codE and contributors
# For license information, please see license.txt
"""Seed the default categories and starter wallets the Pocket Wallet app ships
with. Everything here is idempotent so it can run on both install and migrate.
"""

import frappe

# (category, type, emoji, icon, color) — these mirror the frontend defaults.
DEFAULT_CATEGORIES = [
	("Food", "Expense", "🍔", "utensils", "#f97316"),
	("Transport", "Expense", "🚕", "car", "#3b82f6"),
	("Shopping", "Expense", "🛍️", "bag", "#ec4899"),
	("Bills", "Expense", "🧾", "receipt", "#ef4444"),
	("Health", "Expense", "💊", "heart", "#14b8a6"),
	("Entertainment", "Expense", "🎬", "film", "#8b5cf6"),
	("Travel", "Expense", "✈️", "plane", "#06b6d4"),
	("Education", "Expense", "📚", "book", "#6366f1"),
	("Others", "Expense", "📦", "box", "#64748b"),
	("Salary", "Income", "💼", "briefcase", "#10b981"),
	("Investment", "Income", "📈", "trending-up", "#22c55e"),
]

# (account_name, wallet_type, icon, color)
DEFAULT_WALLETS = [
	("Cash", "Cash", "wallet", "#10b981"),
	("Bank Account", "Bank Account", "bank", "#2563eb"),
]


def after_install():
	create_default_categories()
	create_default_wallets()


def after_migrate():
	create_default_categories()
	create_default_wallets()


def create_default_categories():
	for name, ctype, emoji, icon, color in DEFAULT_CATEGORIES:
		if frappe.db.exists("Wallet Category", name):
			continue
		frappe.get_doc(
			{
				"doctype": "Wallet Category",
				"category": name,
				"category_type": ctype,
				"emoji": emoji,
				"icon": icon,
				"color": color,
			}
		).insert(ignore_permissions=True)


def create_default_wallets():
	for name, wtype, icon, color in DEFAULT_WALLETS:
		if frappe.db.exists("Wallet Account", name):
			continue
		frappe.get_doc(
			{
				"doctype": "Wallet Account",
				"account_name": name,
				"wallet_type": wtype,
				"icon": icon,
				"color": color,
				"account_balance": 0,
			}
		).insert(ignore_permissions=True)
