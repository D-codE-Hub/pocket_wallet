// Copyright (c) 2024, D-codE and contributors
// For license information, please see license.txt

frappe.ui.form.on("My Wallet", {
	setup(frm) {
		// Filter categories to match the current transaction type (Expense/Income)
		frm.set_query("category", function () {
			return {
				filters: {
					category_type: frm.doc.type,
				},
			};
		});
	},

	refresh(frm) {
		if (frm.is_new()) {
			// Load defaults from Pocket Wallet Settings for new transactions
			frappe.db.get_doc("Pocket Wallet Settings").then((settings) => {
				if (settings.default_account && !frm.doc.account) {
					frm.set_value("account", settings.default_account);
				}
				if (
					settings.default_category &&
					!frm.doc.category &&
					frm.doc.type !== "Transfer"
				) {
					frm.set_value("category", settings.default_category);
				}
			});
		}
	},

	type(frm) {
		// Clear category when type changes during creation,
		// since Expense and Income categories are different
		frm.set_value("category", "");
	},
});
