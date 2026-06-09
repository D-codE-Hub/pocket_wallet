// Mock API layer. Every method returns a Promise with a small artificial delay
// so the UI exercises its real loading/skeleton states. Swap the bodies for
// `call('/api/method/...')` against the Frappe backend when going live — the
// signatures are designed to map cleanly onto My Wallet / Wallet Account.
import type {
  AppNotification,
  Budget,
  Category,
  Transaction,
  UserProfile,
  Wallet,
} from "@/types";
import * as seed from "./mockData";

// In-memory clones so mutations during a session don't touch the seed module.
let _wallets = clone(seed.wallets);
let _transactions = clone(seed.transactions);
let _budgets = clone(seed.budgets);
let _notifications = clone(seed.notifications);

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function uid(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}

export const walletService = {
  getCategories(): Promise<Category[]> {
    return delay(seed.categories, 120);
  },

  getProfile(): Promise<UserProfile> {
    return delay(seed.profile, 120);
  },

  getWallets(): Promise<Wallet[]> {
    return delay(clone(_wallets));
  },

  getTransactions(): Promise<Transaction[]> {
    return delay(clone(_transactions), 650);
  },

  getBudgets(): Promise<Budget[]> {
    return delay(clone(_budgets), 500);
  },

  getNotifications(): Promise<AppNotification[]> {
    return delay(clone(_notifications), 300);
  },

  // --- Mutations (also keep wallet balances consistent, like the backend) ---

  addTransaction(input: Omit<Transaction, "id">): Promise<Transaction> {
    const tx: Transaction = { ...input, id: uid("t") };
    _transactions = [tx, ..._transactions];
    applyToBalance(_wallets, tx, +1);
    return delay(clone(tx), 300);
  },

  deleteTransaction(id: string): Promise<void> {
    const tx = _transactions.find((t) => t.id === id);
    if (tx) applyToBalance(_wallets, tx, -1);
    _transactions = _transactions.filter((t) => t.id !== id);
    return delay(undefined, 200);
  },

  saveBudget(input: Omit<Budget, "id" | "spent"> & { id?: string }): Promise<Budget> {
    if (input.id) {
      _budgets = _budgets.map((b) =>
        b.id === input.id ? { ...b, amount: input.amount, categoryId: input.categoryId } : b,
      );
      return delay(clone(_budgets.find((b) => b.id === input.id)!), 250);
    }
    const budget: Budget = { ...input, id: uid("b"), spent: 0 };
    _budgets = [..._budgets, budget];
    return delay(clone(budget), 250);
  },

  deleteBudget(id: string): Promise<void> {
    _budgets = _budgets.filter((b) => b.id !== id);
    return delay(undefined, 200);
  },

  markNotificationRead(id: string): Promise<void> {
    _notifications = _notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    return delay(undefined, 100);
  },
};

// Mirrors the backend invariant: income credits the source wallet; expense and
// transfer debit it; transfer additionally credits the destination wallet.
// `dir` is +1 to apply, -1 to reverse.
function applyToBalance(walletList: Wallet[], tx: Transaction, dir: 1 | -1) {
  const src = walletList.find((w) => w.id === tx.walletId);
  if (!src) return;
  if (tx.type === "income") src.balance += dir * tx.amount;
  else src.balance -= dir * tx.amount;
  if (tx.type === "transfer" && tx.toWalletId) {
    const dest = walletList.find((w) => w.id === tx.toWalletId);
    if (dest) dest.balance += dir * tx.amount;
  }
}
