# Copyright (c) 2026, D-codE and contributors
# For license information, please see license.txt
"""Multi-user visibility rules for Pocket Wallet.

Model:
  * Every Wallet Account is owned by the user who created it.
  * An owner can share a wallet with other users (the `shared_with` child table).
  * A user can access a wallet if they own it OR it's shared with them.
  * Transactions (My Wallet) are visible to anyone who can access the wallet they
    sit on — so a shared wallet shows the entries of *all* its participants.
  * Editing/deleting a transaction stays restricted to its author; creating one
    is allowed on any wallet the user can access.

These are wired in hooks.py via `permission_query_conditions` (list filtering)
and `has_permission` (per-document checks). All `frappe.get_all` calls below
bypass permissions by design, which also avoids recursing into these conditions.
"""

import frappe

# Roles that see everything (no per-user scoping).
FULL_ACCESS_ROLES = {"System Manager", "Pocket Manager"}


def has_full_access(user=None) -> bool:
	user = user or frappe.session.user
	if user == "Administrator":
		return True
	return bool(FULL_ACCESS_ROLES.intersection(frappe.get_roles(user)))


def get_accessible_wallets(user=None) -> list[str]:
	"""Names of wallets the user owns or that are shared with them."""
	user = user or frappe.session.user
	owned = frappe.get_all("Wallet Account", filters={"owner": user}, pluck="name")
	shared = frappe.get_all(
		"Wallet Account User",
		filters={"user": user, "parenttype": "Wallet Account"},
		pluck="parent",
	)
	return list(dict.fromkeys(owned + shared))


def can_access_wallet(wallet, user=None) -> bool:
	user = user or frappe.session.user
	if not wallet:
		return False
	if has_full_access(user):
		return True
	return wallet in get_accessible_wallets(user)


def _in_clause(values) -> str:
	if not values:
		return "('__pw_none__')"
	return "(" + ", ".join(frappe.db.escape(v) for v in values) + ")"


# --- permission_query_conditions (list/report filtering) --------------------


def wallet_account_query(user=None):
	user = user or frappe.session.user
	if has_full_access(user):
		return ""
	return f"`tabWallet Account`.`name` in {_in_clause(get_accessible_wallets(user))}"


def my_wallet_query(user=None):
	user = user or frappe.session.user
	if has_full_access(user):
		return ""
	clause = _in_clause(get_accessible_wallets(user))
	return (
		f"(`tabMy Wallet`.`account` in {clause} "
		f"or `tabMy Wallet`.`to_account` in {clause} "
		f"or `tabMy Wallet`.`owner` = {frappe.db.escape(user)})"
	)


# --- has_permission (per-document checks) -----------------------------------
# These hooks may only further restrict role permissions, and must always return
# a real boolean (a None would be treated as "deny").


def wallet_account_has_permission(doc, ptype=None, user=None) -> bool:
	user = user or frappe.session.user
	if has_full_access(user):
		return True
	if doc.owner == user:
		return True
	shared_users = [row.user for row in (doc.get("shared_with") or [])]
	if user in shared_users:
		# Participants can view the wallet; only the owner edits/shares it.
		return ptype in ("read", "select")
	return False


def my_wallet_has_permission(doc, ptype=None, user=None) -> bool:
	user = user or frappe.session.user
	if has_full_access(user):
		return True

	accessible = get_accessible_wallets(user)
	wallet_ok = doc.account in accessible or bool(doc.to_account and doc.to_account in accessible)

	if ptype in ("read", "select"):
		return bool(wallet_ok or doc.owner == user)
	if ptype == "create":
		# May post only into wallets they can access (both ends for transfers).
		if doc.to_account:
			return bool(doc.account in accessible and doc.to_account in accessible)
		return bool(doc.account in accessible)
	# write / delete / submit / cancel / amend → only the entry's own author.
	return doc.owner == user
