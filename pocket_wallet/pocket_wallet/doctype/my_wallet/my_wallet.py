# Copyright (c) 2024, D-codE and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class MyWallet(Document):
	
	def validate(self):
		self.update_account_balance()
		self.update_transfer_account_balance()

	def update_account_balance(self):
		if self.is_new():
			if self.type == "Income":
				amt = self.amount
			else:
				amt = -self.amount
			frappe.db.set_value("Wallet Account",self.account,"account_balance",self.account_balance+amt)
		else:
			old_amt = self.get_doc_before_save().amount
			amt= 0
			if old_amt != self.amount:
				wal_acc =frappe.get_doc("Wallet Account",self.account)
				if old_amt > self.amount:
					amt = old_amt - self.amount 
					if self.type == "Income":
						amt = self.amount - old_amt 
				else:
					amt = old_amt - self.amount 
					if self.type == "Income":
						amt = self.amount - old_amt 
				wal_acc.account_balance += amt 
				wal_acc.save()

	def update_transfer_account_balance(self):
		if self.type == "Transfer":
			t_amt  = self.amount
			old_amt = 0
			trf_acc =frappe.get_doc("Wallet Account",self.to_account)
			if not self.is_new():
				old_amt = self.get_doc_before_save().amount
			if old_amt != self.amount:
				if old_amt > self.amount: 
					t_amt = self.amount - old_amt 
				else:
					t_amt = self.amount - old_amt 
			trf_acc.account_balance += t_amt		
			trf_acc.save()