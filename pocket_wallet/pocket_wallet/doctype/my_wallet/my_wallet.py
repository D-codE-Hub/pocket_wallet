# Copyright (c) 2024, D-codE and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt


class MyWallet(Document):
	
	def validate(self):
		"""Validate transaction data only — no side-effects here."""
		self._validate_amount()
		self._validate_category()
		self._validate_transfer()

	def on_update(self):
		"""Update account balances after the document is saved."""
		old_doc = self.get_doc_before_save()
		if old_doc:
			# Editing: undo the effect of the previous version first
			self._reverse_transaction(old_doc)
		self._apply_transaction()

	def on_trash(self):
		"""Reverse account balance updates when transaction is deleted."""
		self._reverse_transaction(self)

	# ── Validation helpers ──────────────────────────────────────────────

	def _validate_amount(self):
		"""Ensure amount is a positive number."""
		if not self.amount or self.amount <= 0:
			frappe.throw("Amount must be greater than 0")

	def _validate_category(self):
		"""Ensure category is provided for Expense/Income and matches the transaction type."""
		if self.type in ("Expense", "Income"):
			if not self.category:
				frappe.throw(f"Category is required for {self.type} transactions")

			category_type = frappe.db.get_value(
				"Wallet Category", self.category, "category_type"
			)
			if category_type and category_type != self.type:
				frappe.throw(
					f"Category '{self.category}' is of type '{category_type}' "
					f"but the transaction type is '{self.type}'"
				)

	def _validate_transfer(self):
		"""Ensure transfer transactions have valid source and destination accounts."""
		if self.type == "Transfer":
			if not self.to_account:
				frappe.throw("To Account is required for Transfer transactions")
			if self.account == self.to_account:
				frappe.throw("Cannot transfer to the same account")

	# ── Balance update helpers ──────────────────────────────────────────

	def _apply_transaction(self):
		"""Apply the current transaction to the relevant account balances."""
		amount = flt(self.amount)

		account_doc = frappe.get_doc("Wallet Account", self.account)
		if self.type == "Income":
			account_doc.account_balance += amount
		else:  # Expense or Transfer — debit from source
			account_doc.account_balance -= amount
		account_doc.save(ignore_permissions=True)

		# Credit the destination account for transfers
		if self.type == "Transfer" and self.to_account:
			to_account_doc = frappe.get_doc("Wallet Account", self.to_account)
			to_account_doc.account_balance += amount
			to_account_doc.save(ignore_permissions=True)

	def _reverse_transaction(self, doc):
		"""Reverse the effect of a transaction on account balances."""
		amount = flt(doc.amount)

		account_doc = frappe.get_doc("Wallet Account", doc.account)
		if doc.type == "Income":
			account_doc.account_balance -= amount
		else:  # Expense or Transfer
			account_doc.account_balance += amount
		account_doc.save(ignore_permissions=True)

		if doc.type == "Transfer" and doc.to_account:
			to_account_doc = frappe.get_doc("Wallet Account", doc.to_account)
			to_account_doc.account_balance -= amount
			to_account_doc.save(ignore_permissions=True)
		