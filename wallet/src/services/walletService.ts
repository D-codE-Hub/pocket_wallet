// Backend API layer. Talks to Frappe over the shared `call` transport using the
// generic `frappe.client.*` RPCs plus a couple of `pocket_wallet.api` helpers,
// and maps between Frappe DocType payloads and the frontend domain types.
import call from "@/lib/frappe/call";
import type {
  Budget,
  Category,
  PaymentMethod,
  ShareableUser,
  Transaction,
  TransactionType,
  UserProfile,
  Wallet,
  WalletShares,
  WalletType,
} from "@/types";

// --- enum maps (frontend <-> Frappe Select options) -------------------------
const WALLET_TYPE_FROM: Record<string, WalletType> = {
  Cash: "cash",
  "Bank Account": "bank",
  "Credit Card": "credit",
  "E-Wallet": "ewallet",
};
const TYPE_TO: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};
const PAYMENT_TO: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank: "Bank",
  wallet: "Wallet",
};

// --- generic frappe.client helpers ------------------------------------------
function getList<T = any>(doctype: string, fields: string[], extra: Record<string, any> = {}): Promise<T[]> {
  return call<T[]>("frappe.client.get_list", {
    doctype,
    fields,
    limit_page_length: 0, // 0 = all (personal-scale data)
    ...extra,
  });
}

// --- mappers ----------------------------------------------------------------
function toWallet(d: any): Wallet {
  return {
    id: d.name,
    name: d.account_name ?? d.name,
    type: WALLET_TYPE_FROM[d.wallet_type] ?? "cash",
    balance: d.account_balance ?? 0,
    color: d.color || "#10b981",
    icon: d.icon || "wallet",
    owner: d.owner,
  };
}

function toCategory(d: any): Category {
  return {
    id: d.name,
    name: d.category ?? d.name,
    emoji: d.emoji || "📦",
    icon: d.icon || "box",
    color: d.color || "#64748b",
    kind: (d.category_type || "Expense").toLowerCase() === "income" ? "income" : "expense",
  };
}

function toTransaction(d: any): Transaction {
  const time = d.time ? String(d.time) : "00:00:00";
  return {
    id: d.name,
    type: (d.type || "Expense").toLowerCase() as TransactionType,
    amount: d.amount ?? 0,
    categoryId: d.category || null,
    walletId: d.account,
    toWalletId: d.to_account || null,
    date: new Date(`${d.date}T${time}`).toISOString(),
    note: d.note || "",
    paymentMethod: d.payment_method ? (d.payment_method.toLowerCase() as PaymentMethod) : undefined,
    tags: d.tags
      ? String(d.tags)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    receipt: d.receipt || null,
  };
}

function toBudget(d: any): Budget {
  return {
    id: d.name,
    categoryId: d.category,
    amount: d.amount ?? 0,
    spent: d.spent ?? 0, // recomputed client-side from transactions
    period: "monthly",
  };
}

export const walletService = {
  async getProfile(): Promise<UserProfile> {
    const s = await call<any>("pocket_wallet.api.get_session");
    return {
      name: s.full_name || s.user || "Pocket User",
      email: s.email || "",
      avatar: null,
      currency: s.currency || "USD",
    };
  },

  async getCategories(): Promise<Category[]> {
    const rows = await getList("Wallet Category", [
      "name",
      "category",
      "category_type",
      "emoji",
      "icon",
      "color",
    ]);
    return rows.map(toCategory);
  },

  async getWallets(): Promise<Wallet[]> {
    const rows = await getList("Wallet Account", [
      "name",
      "account_name",
      "wallet_type",
      "account_balance",
      "color",
      "icon",
      "owner",
    ]);
    return rows.map(toWallet);
  },

  async getTransactions(): Promise<Transaction[]> {
    const rows = await getList(
      "My Wallet",
      [
        "name",
        "type",
        "amount",
        "category",
        "account",
        "to_account",
        "date",
        "time",
        "note",
        "payment_method",
        "tags",
        "receipt",
        "status",
      ],
      { order_by: "date desc, time desc" },
    );
    // Hide soft-deleted entries (status "Deleted"); keep null/empty statuses.
    return rows.filter((d) => d.status !== "Deleted").map(toTransaction);
  },

  async getBudgets(): Promise<Budget[]> {
    const rows = await getList("Wallet Budget", ["name", "category", "amount", "period"]);
    return rows.map(toBudget);
  },

  // --- mutations ------------------------------------------------------------
  async addTransaction(input: Omit<Transaction, "id">): Promise<Transaction> {
    const d = new Date(input.date);
    const doc: Record<string, any> = {
      doctype: "My Wallet",
      type: TYPE_TO[input.type],
      amount: input.amount,
      account: input.walletId,
      date: d.toISOString().slice(0, 10),
      time: d.toTimeString().slice(0, 8),
      note: input.note || "",
    };
    if (input.type === "transfer") {
      doc.to_account = input.toWalletId;
    } else {
      doc.category = input.categoryId;
      if (input.paymentMethod) doc.payment_method = PAYMENT_TO[input.paymentMethod];
    }
    if (input.tags?.length) doc.tags = input.tags.join(", ");
    if (input.receipt) doc.receipt = input.receipt;

    const created = await call<any>("frappe.client.insert", { doc });
    return toTransaction(created);
  },

  async updateTransaction(id: string, input: Omit<Transaction, "id">): Promise<Transaction> {
    const d = new Date(input.date);
    // `type` is set-only-once on My Wallet, so it's intentionally omitted here.
    // Saving the doc triggers the controller's reverse-then-reapply balance logic.
    const fieldname: Record<string, any> = {
      amount: input.amount,
      account: input.walletId,
      date: d.toISOString().slice(0, 10),
      time: d.toTimeString().slice(0, 8),
      note: input.note || "",
      tags: input.tags?.length ? input.tags.join(", ") : "",
      receipt: input.receipt || null,
    };
    if (input.type === "transfer") {
      fieldname.to_account = input.toWalletId;
      fieldname.category = null;
      fieldname.payment_method = null;
    } else {
      fieldname.category = input.categoryId;
      fieldname.to_account = null;
      fieldname.payment_method = input.paymentMethod ? PAYMENT_TO[input.paymentMethod] : null;
    }
    const updated = await call<any>("frappe.client.set_value", {
      doctype: "My Wallet",
      name: id,
      fieldname,
    });
    return toTransaction(updated);
  },

  // Soft delete: mark the entry "Deleted" (the controller reverses its balance
  // effect) and keep the row in the backend, rather than hard-deleting it.
  deleteTransaction(id: string): Promise<void> {
    return call("frappe.client.set_value", {
      doctype: "My Wallet",
      name: id,
      fieldname: { status: "Deleted" },
    });
  },

  async saveBudget(input: Omit<Budget, "id" | "spent"> & { id?: string }): Promise<void> {
    if (input.id) {
      await call("frappe.client.set_value", {
        doctype: "Wallet Budget",
        name: input.id,
        fieldname: { amount: input.amount, category: input.categoryId },
      });
      return;
    }
    await call("frappe.client.insert", {
      doc: {
        doctype: "Wallet Budget",
        category: input.categoryId,
        amount: input.amount,
        period: "Monthly",
      },
    });
  },

  deleteBudget(id: string): Promise<void> {
    return call("frappe.client.delete", { doctype: "Wallet Budget", name: id });
  },

  // --- wallet sharing -------------------------------------------------------
  getWalletShares(wallet: string): Promise<WalletShares> {
    return call("pocket_wallet.api.get_wallet_shares", { wallet });
  },
  shareWallet(wallet: string, user: string): Promise<WalletShares> {
    return call("pocket_wallet.api.share_wallet", { wallet, user });
  },
  unshareWallet(wallet: string, user: string): Promise<WalletShares> {
    return call("pocket_wallet.api.unshare_wallet", { wallet, user });
  },
  getShareableUsers(txt = ""): Promise<ShareableUser[]> {
    return call("pocket_wallet.api.get_shareable_users", { txt });
  },

  // --- auth -----------------------------------------------------------------
  /** First-run per-user setup (ensures default wallets exist). */
  bootstrap(): Promise<{ ok: boolean }> {
    return call("pocket_wallet.api.bootstrap");
  },
  getSession(): Promise<any> {
    return call("pocket_wallet.api.get_session");
  },
  login(usr: string, pwd: string): Promise<any> {
    return call("login", { usr, pwd });
  },
  logout(): Promise<void> {
    return call("logout");
  },
};
