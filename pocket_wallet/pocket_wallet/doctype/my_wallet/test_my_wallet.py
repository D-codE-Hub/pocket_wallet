# Copyright (c) 2024, D-codE and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase
from frappe.exceptions import ValidationError


class TestMyWallet(FrappeTestCase):
	"""Test suite for MyWallet DocType covering transactions, balance updates, and edge cases."""

	CASH_INITIAL = 1000
	SAVINGS_INITIAL = 5000

	def setUp(self):
		"""Set up test fixtures: create accounts, categories, and reset balances."""
		super().setUp()

		# ── accounts ───────────────────────────────────────────
		for name, atype, balance in [
			("Test Cash", "Cash", self.CASH_INITIAL),
			("Test Savings", "Savings", self.SAVINGS_INITIAL),
		]:
			if not frappe.db.exists("Wallet Account", name):
				doc = frappe.new_doc("Wallet Account")
				doc.account_name = name
				doc.account_type = atype
				doc.account_balance = balance
				doc.save()
			else:
				frappe.db.set_value("Wallet Account", name, "account_balance", balance)

		# ── categories ─────────────────────────────────────────
		for name, ctype in [("Food", "Expense"), ("Salary", "Income")]:
			if not frappe.db.exists("Wallet Category", name):
				doc = frappe.new_doc("Wallet Category")
				doc.category = name
				doc.category_type = ctype
				doc.save()

		frappe.db.commit()

	def tearDown(self):
		"""Delete test transactions via the ORM so on_trash reverses balances."""
		for name in frappe.get_all(
			"My Wallet",
			filters={"account": ["in", ["Test Cash", "Test Savings"]]},
			pluck="name",
		):
			frappe.delete_doc("My Wallet", name, force=True, ignore_permissions=True)
		frappe.db.commit()
		super().tearDown()

	# ── helper ─────────────────────────────────────────────────

	def _balance(self, account_name):
		"""Return the current balance of a Wallet Account."""
		return frappe.db.get_value("Wallet Account", account_name, "account_balance")

	def _make_transaction(self, **kwargs):
		"""Shortcut to create and save a My Wallet transaction."""
		defaults = {
			"type": "Expense",
			"amount": 100,
			"category": "Food",
			"account": "Test Cash",
			"date": frappe.utils.today(),
			"time": frappe.utils.nowtime(),
		}
		defaults.update(kwargs)
		doc = frappe.new_doc("My Wallet")
		for k, v in defaults.items():
			setattr(doc, k, v)
		doc.save()
		return doc

	# ── 1. Basic balance updates ──────────────────────────────

	def test_expense_decreases_balance(self):
		"""Creating an expense decreases the account balance."""
		self._make_transaction(type="Expense", amount=100, category="Food")
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 100)

	def test_income_increases_balance(self):
		"""Creating an income increases the account balance."""
		self._make_transaction(type="Income", amount=500, category="Salary")
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL + 500)

	def test_transfer_updates_both_accounts(self):
		"""Transfer debits source and credits destination."""
		self._make_transaction(
			type="Transfer", amount=200,
			account="Test Cash", to_account="Test Savings",
			category="",
		)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 200)
		self.assertEqual(self._balance("Test Savings"), self.SAVINGS_INITIAL + 200)

	# ── 2. Editing transactions ───────────────────────────────

	def test_edit_expense_amount(self):
		"""Editing an expense amount correctly adjusts the balance."""
		txn = self._make_transaction(type="Expense", amount=100)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 100)

		txn.amount = 250
		txn.save()
		# Balance should reflect only the new amount, not old + new
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 250)

	def test_edit_income_amount(self):
		"""Editing an income amount correctly adjusts the balance."""
		txn = self._make_transaction(type="Income", amount=300, category="Salary")
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL + 300)

		txn.amount = 100
		txn.save()
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL + 100)

	def test_edit_account_moves_balance(self):
		"""Changing the account reverses the old account and applies to the new one."""
		txn = self._make_transaction(type="Expense", amount=200)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 200)
		self.assertEqual(self._balance("Test Savings"), self.SAVINGS_INITIAL)

		txn.account = "Test Savings"
		txn.save()
		# Old account restored, new account debited
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL)
		self.assertEqual(self._balance("Test Savings"), self.SAVINGS_INITIAL - 200)

	def test_edit_transfer_amount(self):
		"""Editing a transfer amount correctly adjusts both accounts."""
		txn = self._make_transaction(
			type="Transfer", amount=100,
			account="Test Cash", to_account="Test Savings",
			category="",
		)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 100)
		self.assertEqual(self._balance("Test Savings"), self.SAVINGS_INITIAL + 100)

		txn.amount = 300
		txn.save()
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 300)
		self.assertEqual(self._balance("Test Savings"), self.SAVINGS_INITIAL + 300)

	# ── 3. Deleting transactions ──────────────────────────────

	def test_delete_expense_reverses_balance(self):
		"""Deleting an expense restores the balance."""
		txn = self._make_transaction(type="Expense", amount=100)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL - 100)

		frappe.delete_doc("My Wallet", txn.name, force=True)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL)

	def test_delete_income_reverses_balance(self):
		"""Deleting an income restores the balance."""
		txn = self._make_transaction(type="Income", amount=500, category="Salary")
		frappe.delete_doc("My Wallet", txn.name, force=True)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL)

	def test_delete_transfer_reverses_both_accounts(self):
		"""Deleting a transfer reverses changes in both accounts."""
		txn = self._make_transaction(
			type="Transfer", amount=200,
			account="Test Cash", to_account="Test Savings",
			category="",
		)
		frappe.delete_doc("My Wallet", txn.name, force=True)
		self.assertEqual(self._balance("Test Cash"), self.CASH_INITIAL)
		self.assertEqual(self._balance("Test Savings"), self.SAVINGS_INITIAL)

	# ── 4. Validation rules ───────────────────────────────────

	def test_negative_amount_rejected(self):
		with self.assertRaises(ValidationError):
			self._make_transaction(amount=-50)

	def test_zero_amount_rejected(self):
		with self.assertRaises(ValidationError):
			self._make_transaction(amount=0)

	def test_expense_without_category_rejected(self):
		with self.assertRaises(ValidationError):
			self._make_transaction(type="Expense", category="")

	def test_income_without_category_rejected(self):
		with self.assertRaises(ValidationError):
			self._make_transaction(type="Income", category="", amount=100)

	def test_transfer_without_to_account_rejected(self):
		with self.assertRaises(ValidationError):
			self._make_transaction(type="Transfer", category="", to_account="")

	def test_transfer_same_account_rejected(self):
		with self.assertRaises(ValidationError):
			self._make_transaction(
				type="Transfer", category="",
				account="Test Cash", to_account="Test Cash",
			)

	def test_transfer_does_not_require_category(self):
		txn = self._make_transaction(
			type="Transfer", amount=100,
			account="Test Cash", to_account="Test Savings",
			category="",
		)
		self.assertTrue(txn.name)

	def test_wrong_category_type_rejected(self):
		"""Using an Income category for an Expense transaction is rejected."""
		with self.assertRaises(ValidationError):
			self._make_transaction(type="Expense", category="Salary")

	def test_wrong_category_type_income_rejected(self):
		"""Using an Expense category for an Income transaction is rejected."""
		with self.assertRaises(ValidationError):
			self._make_transaction(type="Income", category="Food")

	# ── 5. Deletion protection on linked records ──────────────

	def test_cannot_delete_account_with_transactions(self):
		"""A Wallet Account with linked transactions cannot be deleted."""
		self._make_transaction(type="Expense", amount=50)
		with self.assertRaises(ValidationError):
			frappe.delete_doc("Wallet Account", "Test Cash", force=True)

	def test_cannot_delete_category_with_transactions(self):
		"""A Wallet Category with linked transactions cannot be deleted."""
		self._make_transaction(type="Expense", amount=50, category="Food")
		with self.assertRaises(ValidationError):
			frappe.delete_doc("Wallet Category", "Food", force=True)
