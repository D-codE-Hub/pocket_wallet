# Copyright (c) 2026, D-codE and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class WalletBudget(Document):
	def validate(self):
		if not self.amount or self.amount <= 0:
			frappe.throw("Budget amount must be greater than 0")

		# One budget per category + period.
		duplicate = frappe.db.exists(
			"Wallet Budget",
			{
				"category": self.category,
				"period": self.period,
				"name": ("!=", self.name),
			},
		)
		if duplicate:
			frappe.throw(f"A {self.period} budget for '{self.category}' already exists")
