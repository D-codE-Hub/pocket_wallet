# Copyright (c) 2026, D-codE and contributors
# For license information, please see license.txt
"""Seed the default categories and starter wallets the Pocket Wallet app ships
with. Everything here is idempotent so it can run on both install and migrate.
"""

import frappe

# (category, type, emoji, icon, color). The `icon` is a key understood by the
# frontend Icon component; unknown keys fall back to a generic glyph, so the
# emoji is what users actually see.
DEFAULT_CATEGORIES = [
	# --- Expenses ---
	("Food", "Expense", "🍔", "utensils", "#f97316"),
	("Grocery", "Expense", "🛒", "bag", "#f59e0b"),
	("Transport", "Expense", "🚕", "car", "#3b82f6"),
	("Fuel", "Expense", "⛽", "car", "#0ea5e9"),
	("Shopping", "Expense", "🛍️", "bag", "#ec4899"),
	("Bills", "Expense", "🧾", "receipt", "#ef4444"),
	("Electricity Bill", "Expense", "⚡", "receipt", "#eab308"),
	("Water Bill", "Expense", "💧", "receipt", "#06b6d4"),
	("Internet", "Expense", "🌐", "globe", "#0284c7"),
	("Mobile Recharge", "Expense", "📱", "smartphone", "#14b8a6"),
	("Rent", "Expense", "🏠", "home", "#f43f5e"),
	("Health", "Expense", "💊", "heart", "#10b981"),
	("Insurance", "Expense", "🛡️", "shield", "#64748b"),
	("Entertainment", "Expense", "🎬", "film", "#8b5cf6"),
	("Subscriptions", "Expense", "📺", "film", "#a855f7"),
	("Travel", "Expense", "✈️", "plane", "#0891b2"),
	("Education", "Expense", "📚", "book", "#6366f1"),
	("Others", "Expense", "📦", "box", "#64748b"),
	# --- Income ---
	("Salary", "Income", "💼", "briefcase", "#10b981"),
	("Freelance Work", "Income", "💻", "briefcase", "#22c55e"),
	("Business", "Income", "🏢", "briefcase", "#0ea5e9"),
	("Bonus", "Income", "🎁", "gift", "#f59e0b"),
	("Interest", "Income", "🏦", "bank", "#14b8a6"),
	("Investment", "Income", "📈", "trending-up", "#16a34a"),
]

# (account_name, wallet_type, icon, color)
DEFAULT_WALLETS = [
	("Cash", "Cash", "wallet", "#10b981"),
	("Bank Account", "Bank Account", "bank", "#2563eb"),
	("Google Pay", "E-Wallet", "google", "#f43f5e"),
	("PhonePe", "E-Wallet", "phonepe", "#8b5cf6"),
	("Credit Card", "Credit Card", "credit-card", "#f43f5e"),
]


def after_install():
	create_default_categories()


def after_migrate():
	create_default_categories()


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


def ensure_user_wallets(user: str):
	"""Provision the default wallets for a user the first time they use the app.

	Wallets are per-user (owned by their creator), so this runs in the user's own
	session — the inserted docs take `owner = user` automatically. No-ops if the
	user already owns any wallet.
	"""
	if user in ("Guest", "Administrator"):
		return
	if frappe.db.exists("Wallet Account", {"owner": user}):
		return

	for idx, (name, wtype, icon, color) in enumerate(DEFAULT_WALLETS):
		frappe.get_doc(
			{
				"doctype": "Wallet Account",
				"account_name": name,
				"wallet_type": wtype,
				"icon": icon,
				"color": color,
				"account_balance": 0,
				# Make the first provisioned wallet the user's default.
				"is_default": 1 if idx == 0 else 0,
			}
		).insert(ignore_permissions=True)
