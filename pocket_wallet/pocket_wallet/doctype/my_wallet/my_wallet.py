# Copyright (c) 2024, D-codE and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.exceptions import ValidationError
from decimal import Decimal
from typing import Optional


class MyWallet(Document):
	"""
	DocType for recording wallet transactions (Expense, Income, Transfer).
	Automatically updates account balances when transactions are created, modified, or deleted.
	"""
	
	def validate(self) -> None:
		"""Validate transaction and update account balances."""
		self._validate_transaction_data()
		self._update_account_balance()
		self._update_transfer_account_balance()

	def on_trash(self) -> None:
		"""Reverse account balance updates when transaction is deleted."""
		self._reverse_account_balance()
		self._reverse_transfer_balance()

	def _validate_transaction_data(self) -> None:
		"""Validate transaction type, amounts, and relationships."""
		# Validate amount is positive
		if self.amount <= 0:
			raise ValidationError("Amount must be greater than 0")

		# Validate category is only required for Expense and Income
		if self.type in ["Expense", "Income"] and not self.category:
			raise ValidationError(f"Category is required for {self.type} transactions")

		# Validate Transfer has both accounts and they are different
		if self.type == "Transfer":
			if not self.to_account:
				raise ValidationError("To Account is required for Transfer transactions")
			if self.account == self.to_account:
				raise ValidationError("Cannot transfer to the same account")

	def _update_account_balance(self) -> None:
		"""
		Update the source account balance based on transaction type and amount changes.
		For new transactions: apply full amount adjustment.
		For edits: calculate delta and apply the difference.
		"""
		try:
			account_doc = frappe.get_doc("Wallet Account", self.account)
			
			if self.is_new():
				# New transaction: apply full amount
				if self.type == "Income":
					account_doc.account_balance += Decimal(str(self.amount))
				else:  # Expense or Transfer
					account_doc.account_balance -= Decimal(str(self.amount))
			else:
				# Edited transaction: calculate and apply delta
				old_doc = self.get_doc_before_save()
				old_amount = Decimal(str(old_doc.amount))
				new_amount = Decimal(str(self.amount))
				
				# If amount changed, calculate the delta
				if old_amount != new_amount:
					amount_delta = new_amount - old_amount
					
					# Check if transaction type changed
					if old_doc.type != self.type:
						# Type changed: reverse old amount and apply new amount
						if old_doc.type == "Income":
							account_doc.account_balance -= old_amount
						else:
							account_doc.account_balance += old_amount
						
						# Apply new amount with new type
						if self.type == "Income":
							account_doc.account_balance += new_amount
						else:
							account_doc.account_balance -= new_amount
					else:
						# Type stayed same: apply delta
						if self.type == "Income":
							account_doc.account_balance += amount_delta
						else:
							account_doc.account_balance -= amount_delta
			
			account_doc.save(ignore_permissions=True)
		except frappe.DoesNotExistError:
			raise ValidationError(f"Wallet Account '{self.account}' does not exist")
		except Exception as e:
			frappe.log_error(f"Error updating account balance: {str(e)}", "Wallet Balance Update Error")
			raise ValidationError(f"Failed to update account balance: {str(e)}")

	def _update_transfer_account_balance(self) -> None:
		"""
		Update the destination account balance for Transfer type transactions.
		Transfer always adds to the destination account.
		"""
		if self.type != "Transfer":
			return

		try:
			to_account_doc = frappe.get_doc("Wallet Account", self.to_account)
			
			if self.is_new():
				# New transfer: add amount to destination account
				to_account_doc.account_balance += Decimal(str(self.amount))
			else:
				# Edited transfer: calculate delta
				old_doc = self.get_doc_before_save()
				old_amount = Decimal(str(old_doc.amount))
				new_amount = Decimal(str(self.amount))
				
				if old_amount != new_amount:
					amount_delta = new_amount - old_amount
					to_account_doc.account_balance += amount_delta
			
			to_account_doc.save(ignore_permissions=True)
		except frappe.DoesNotExistError:
			raise ValidationError(f"Wallet Account '{self.to_account}' does not exist")
		except Exception as e:
			frappe.log_error(f"Error updating transfer account balance: {str(e)}", "Wallet Transfer Error")
			raise ValidationError(f"Failed to update transfer account: {str(e)}")

	def _reverse_account_balance(self) -> None:
		"""Reverse the account balance adjustment when transaction is deleted."""
		try:
			account_doc = frappe.get_doc("Wallet Account", self.account)
			
			# Reverse the original transaction
			if self.type == "Income":
				account_doc.account_balance -= Decimal(str(self.amount))
			else:  # Expense or Transfer
				account_doc.account_balance += Decimal(str(self.amount))
			
			account_doc.save(ignore_permissions=True)
		except frappe.DoesNotExistError:
			frappe.log_error(f"Wallet Account '{self.account}' not found during deletion", "Wallet Deletion Error")
		except Exception as e:
			frappe.log_error(f"Error reversing account balance: {str(e)}", "Wallet Reversal Error")

	def _reverse_transfer_balance(self) -> None:
		"""Reverse the transfer destination account balance when transaction is deleted."""
		if self.type != "Transfer":
			return

		try:
			to_account_doc = frappe.get_doc("Wallet Account", self.to_account)
			to_account_doc.account_balance -= Decimal(str(self.amount))
			to_account_doc.save(ignore_permissions=True)
		except frappe.DoesNotExistError:
			frappe.log_error(f"Wallet Account '{self.to_account}' not found during deletion", "Wallet Deletion Error")
		except Exception as e:
			frappe.log_error(f"Error reversing transfer balance: {str(e)}", "Wallet Reversal Error")