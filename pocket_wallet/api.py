import frappe

@frappe.whitelist()
def craete_my_wallet(data):
	my_w = frappe.new_doc("My Wallet")
	my_w.type = data.get("type")
	my_w.category = data.get("category")
	my_w.amount = data.get("amount")
	my_w.account = data.get("account")
	my_w.date = data.get("date")
	my_w.note = data.get("note")
	my_w.save(ignore_permissions=True)

@frappe.whitelist()
def craete_category(data):
	my_w = frappe.new_doc("My Wallet")
	my_w.type = data.get("type")
	my_w.category = data.get("category")
	my_w.amount = data.get("amount")
	my_w.account = data.get("account")
	my_w.date = data.get("date")
	my_w.note = data.get("note")
	my_w.save(ignore_permissions=True)

@frappe.whitelist()
def craete_account(data):
	my_w = frappe.new_doc("My Wallet")
	my_w.type = data.get("type")
	my_w.category = data.get("category")
	my_w.amount = data.get("amount")
	my_w.account = data.get("account")
	my_w.date = data.get("date")
	my_w.note = data.get("note")
	my_w.save(ignore_permissions=True)