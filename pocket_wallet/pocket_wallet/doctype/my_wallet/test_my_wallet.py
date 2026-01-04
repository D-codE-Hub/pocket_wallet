# Copyright (c) 2024, D-codE and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase
from frappe.exceptions import ValidationError
from decimal import Decimal


class TestMyWallet(FrappeTestCase):
	"""Test suite for MyWallet DocType covering transactions, balance updates, and edge cases."""

	def setUp(self) -> None:
		"""Set up test fixtures: create accounts and categories."""
		super().setUp()
		
		# Create test accounts
		if not frappe.db.exists("Wallet Account", "Test Cash"):
			account1 = frappe.new_doc("Wallet Account")
			account1.account_name = "Test Cash"
			account1.account_type = "Cash"
			account1.account_balance = 1000
			account1.save()
		
		if not frappe.db.exists("Wallet Account", "Test Savings"):
			account2 = frappe.new_doc("Wallet Account")
			account2.account_name = "Test Savings"
			account2.account_type = "Savings"
			account2.account_balance = 5000
			account2.save()
		
		# Create test categories
		if not frappe.db.exists("Wallet Category", "Food"):
			cat1 = frappe.new_doc("Wallet Category")
			cat1.category = "Food"
			cat1.category_type = "Expense"
			cat1.save()
		
		if not frappe.db.exists("Wallet Category", "Salary"):
			cat2 = frappe.new_doc("Wallet Category")
			cat2.category = "Salary"
			cat2.category_type = "Income"
			cat2.save()

	def tearDown(self) -> None:
		"""Clean up test data."""
		# Delete test transactions
		frappe.db.delete("My Wallet", {"account": "Test Cash"})
		frappe.db.delete("My Wallet", {"account": "Test Savings"})
		super().tearDown()

	def test_expense_transaction_decreases_balance(self) -> None:
		"""Test that creating an expense transaction decreases account balance."""
		# Get initial balance
		account = frappe.get_doc("Wallet Account", "Test Cash")
		initial_balance = account.account_balance
		
		# Create expense transaction
		expense = frappe.new_doc("My Wallet")
		expense.type = "Expense"
		expense.amount = 100
		expense.category = "Food"
		expense.account = "Test Cash"
		expense.date = frappe.utils.today()
		expense.time = frappe.utils.now_time()
		expense.save()
		
		# Check balance decreased
		account.reload()
		self.assertEqual(
			account.account_balance,
			initial_balance - 100,
			"Account balance should decrease by expense amount"
		)

	def test_income_transaction_increases_balance(self) -> None:
		"""Test that creating an income transaction increases account balance."""
		account = frappe.get_doc("Wallet Account", "Test Cash")
		initial_balance = account.account_balance
		
		# Create income transaction
		income = frappe.new_doc("My Wallet")
		income.type = "Income"
		income.amount = 500
		income.category = "Salary"
		income.account = "Test Cash"
		income.date = frappe.utils.today()
		income.time = frappe.utils.now_time()
		income.save()
		
		# Check balance increased
		account.reload()
		self.assertEqual(
			account.account_balance,
			initial_balance + 500,
			"Account balance should increase by income amount"
		)

	def test_transfer_transaction_updates_both_accounts(self) -> None:
		"""Test that transfer decreases source and increases destination account."""
		source = frappe.get_doc("Wallet Account", "Test Cash")
		dest = frappe.get_doc("Wallet Account", "Test Savings")
		
		source_initial = source.account_balance
		dest_initial = dest.account_balance
		
		# Create transfer transaction
		transfer = frappe.new_doc("My Wallet")
		transfer.type = "Transfer"
		transfer.amount = 200
		transfer.account = "Test Cash"
		transfer.to_account = "Test Savings"
		transfer.date = frappe.utils.today()
		transfer.time = frappe.utils.now_time()
		transfer.save()
		
		# Check both accounts updated correctly
		source.reload()
		dest.reload()
		
		self.assertEqual(
			source.account_balance,
			source_initial - 200,
			"Source account balance should decrease"
		)
		self.assertEqual(
			dest.account_balance,
			dest_initial + 200,
			"Destination account balance should increase"
		)

	def test_edit_expense_amount_updates_balance(self) -> None:
		"""Test that editing an expense amount updates the balance correctly."""
		account = frappe.get_doc("Wallet Account", "Test Cash")
		initial_balance = account.account_balance
		
		# Create expense
		expense = frappe.new_doc("My Wallet")
		expense.type = "Expense"
		expense.amount = 100
		expense.category = "Food"
		expense.account = "Test Cash"
		expense.date = frappe.utils.today()
		expense.time = frappe.utils.now_time()
		expense.save()
		
		account.reload()
		after_create = account.account_balance
		self.assertEqual(after_create, initial_balance - 100)
		
		# Edit expense to 150
		expense.amount = 150
		expense.save()
		
		account.reload()
		# Balance should be initial - 150 (not initial - 100 - 150)
		self.assertEqual(
			account.account_balance,
			initial_balance - 150,
			"Edited expense should update balance correctly"
		)

	def test_delete_transaction_reverses_balance(self) -> None:
		"""Test that deleting a transaction reverses the balance change."""
		account = frappe.get_doc("Wallet Account", "Test Cash")
		initial_balance = account.account_balance
		
		# Create expense
		expense = frappe.new_doc("My Wallet")
		expense.type = "Expense"
		expense.amount = 100
		expense.category = "Food"
		expense.account = "Test Cash"
		expense.date = frappe.utils.today()
		expense.time = frappe.utils.now_time()
		expense.save()
		expense_name = expense.name
		
		account.reload()
		self.assertEqual(account.account_balance, initial_balance - 100)
		
		# Delete expense
		frappe.delete_doc("My Wallet", expense_name)
		
		account.reload()
		self.assertEqual(
			account.account_balance,
			initial_balance,
			"Balance should revert to initial after deletion"
		)

	def test_delete_transfer_reverses_both_accounts(self) -> None:
		"""Test that deleting a transfer reverses changes in both accounts."""
		source = frappe.get_doc("Wallet Account", "Test Cash")
		dest = frappe.get_doc("Wallet Account", "Test Savings")
		
		source_initial = source.account_balance
		dest_initial = dest.account_balance
		
		# Create transfer
		transfer = frappe.new_doc("My Wallet")
		transfer.type = "Transfer"
		transfer.amount = 200
		transfer.account = "Test Cash"
		transfer.to_account = "Test Savings"
		transfer.date = frappe.utils.today()
		transfer.time = frappe.utils.now_time()
		transfer.save()
		transfer_name = transfer.name
		
		# Delete transfer
		frappe.delete_doc("My Wallet", transfer_name)
		
		source.reload()
		dest.reload()
		
		self.assertEqual(source.account_balance, source_initial)
		self.assertEqual(dest.account_balance, dest_initial)

	def test_change_expense_type_to_income(self) -> None:
		"""Test changing transaction type from Expense to Income."""
		account = frappe.get_doc("Wallet Account", "Test Cash")
		initial_balance = account.account_balance
		
		# Create expense
		transaction = frappe.new_doc("My Wallet")
		transaction.type = "Expense"
		transaction.amount = 100
		transaction.category = "Food"
		transaction.account = "Test Cash"
		transaction.date = frappe.utils.today()
		transaction.time = frappe.utils.now_time()
		transaction.save()
		
		account.reload()
		self.assertEqual(account.account_balance, initial_balance - 100)
		
		# Change to income
		transaction.type = "Income"
		transaction.category = "Salary"
		transaction.save()
		
		account.reload()
		# Should be initial + 100 (reversed expense, added income)
		self.assertEqual(account.account_balance, initial_balance + 100)

	def test_negative_amount_validation_fails(self) -> None:
		"""Test that negative amounts are rejected."""
		expense = frappe.new_doc("My Wallet")
		expense.type = "Expense"
		expense.amount = -100
		expense.category = "Food"
		expense.account = "Test Cash"
		expense.date = frappe.utils.today()
		expense.time = frappe.utils.now_time()
		
		with self.assertRaises(ValidationError):
			expense.save()

	def test_zero_amount_validation_fails(self) -> None:
		"""Test that zero amounts are rejected."""
		expense = frappe.new_doc("My Wallet")
		expense.type = "Expense"
		expense.amount = 0
		expense.category = "Food"
		expense.account = "Test Cash"
		expense.date = frappe.utils.today()
		expense.time = frappe.utils.now_time()
		
		with self.assertRaises(ValidationError):
			expense.save()

	def test_transfer_same_account_validation_fails(self) -> None:
		"""Test that transferring to the same account is rejected."""
		transfer = frappe.new_doc("My Wallet")
		transfer.type = "Transfer"
		transfer.amount = 100
		transfer.account = "Test Cash"
		transfer.to_account = "Test Cash"
		transfer.date = frappe.utils.today()
		transfer.time = frappe.utils.now_time()
		
		with self.assertRaises(ValidationError):
			transfer.save()

	def test_missing_category_for_expense_fails(self) -> None:
		"""Test that expense without category is rejected."""
		expense = frappe.new_doc("My Wallet")
		expense.type = "Expense"
		expense.amount = 100
		expense.account = "Test Cash"
		expense.date = frappe.utils.today()
		expense.time = frappe.utils.now_time()
		
		with self.assertRaises(ValidationError):
			expense.save()

	def test_missing_to_account_for_transfer_fails(self) -> None:
		"""Test that transfer without to_account is rejected."""
		transfer = frappe.new_doc("My Wallet")
		transfer.type = "Transfer"
		transfer.amount = 100
		transfer.account = "Test Cash"
		transfer.date = frappe.utils.today()
		transfer.time = frappe.utils.now_time()
		
		with self.assertRaises(ValidationError):
			transfer.save()

	def test_transfer_does_not_require_category(self) -> None:
		"""Test that transfer transactions do not require a category."""
		transfer = frappe.new_doc("My Wallet")
		transfer.type = "Transfer"
		transfer.amount = 100
		transfer.account = "Test Cash"
		transfer.to_account = "Test Savings"
		transfer.date = frappe.utils.today()
		transfer.time = frappe.utils.now_time()
		transfer.save()
		
		# Should save successfully without category
		self.assertTrue(transfer.name)
