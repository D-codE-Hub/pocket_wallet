# Copyright (c) 2024, D-codE and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class WalletCategory(Document):
	def on_trash(self):
		"""Prevent deletion if there are linked transactions."""
		count = frappe.db.count("My Wallet", filters={"category": self.name})
		if count:
			frappe.throw(
				f"Cannot delete category '{self.name}' because it has {count} linked transaction(s). "
				"Delete the transactions first."
			)
