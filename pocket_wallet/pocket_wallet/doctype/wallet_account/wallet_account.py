# Copyright (c) 2024, D-codE and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class WalletAccount(Document):
	def on_trash(self):
		"""Prevent deletion if there are linked transactions."""
		transactions = frappe.db.count("My Wallet", filters={"account": self.name})
		transfers = frappe.db.count("My Wallet", filters={"to_account": self.name})
		total = transactions + transfers
		if total:
			frappe.throw(
				f"Cannot delete account '{self.name}' because it has {total} linked transaction(s). "
				"Delete the transactions first."
			)
