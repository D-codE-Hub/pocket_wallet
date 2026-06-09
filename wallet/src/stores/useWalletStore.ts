// Core data store: wallets, categories, transactions, budgets, plus the derived
// totals and (client-derived) notifications every screen depends on. Talks only
// to walletService, which calls the Frappe backend.
import { defineStore } from "pinia";
import { walletService } from "@/services/walletService";
import type {
  AppNotification,
  Budget,
  Category,
  Transaction,
  UserProfile,
  Wallet,
} from "@/types";

interface State {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  readNotificationIds: string[];
  profile: UserProfile | null;
  loading: {
    wallets: boolean;
    transactions: boolean;
    budgets: boolean;
  };
  loaded: boolean;
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export const useWalletStore = defineStore("wallet", {
  state: (): State => ({
    wallets: [],
    categories: [],
    transactions: [],
    budgets: [],
    readNotificationIds: [],
    profile: null,
    loading: { wallets: true, transactions: true, budgets: true },
    loaded: false,
  }),

  getters: {
    categoryMap(state): Record<string, Category> {
      return Object.fromEntries(state.categories.map((c) => [c.id, c]));
    },
    walletMap(state): Record<string, Wallet> {
      return Object.fromEntries(state.wallets.map((w) => [w.id, w]));
    },

    totalBalance(state): number {
      return state.wallets.reduce((sum, w) => sum + w.balance, 0);
    },

    monthlyIncome(state): number {
      return state.transactions
        .filter((t) => t.type === "income" && isThisMonth(t.date))
        .reduce((s, t) => s + t.amount, 0);
    },

    monthlyExpense(state): number {
      return state.transactions
        .filter((t) => t.type === "expense" && isThisMonth(t.date))
        .reduce((s, t) => s + t.amount, 0);
    },

    monthlySavings(): number {
      return this.monthlyIncome - this.monthlyExpense;
    },

    recentTransactions(state): Transaction[] {
      return [...state.transactions]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 5);
    },

    /** This month's expense grouped by category, for the donut + analytics. */
    expenseByCategory(state): { category: Category; total: number }[] {
      const totals: Record<string, number> = {};
      for (const t of state.transactions) {
        if (t.type !== "expense" || !t.categoryId || !isThisMonth(t.date)) continue;
        totals[t.categoryId] = (totals[t.categoryId] ?? 0) + t.amount;
      }
      return Object.entries(totals)
        .map(([id, total]) => ({
          category:
            state.categories.find((c) => c.id === id) ??
            ({ id, name: id, emoji: "📦", icon: "box", color: "#64748b", kind: "expense" } as Category),
          total,
        }))
        .sort((a, b) => b.total - a.total);
    },

    /** Budgets with live `spent` recomputed from this month's transactions. */
    budgetsWithSpend(state): (Budget & { spent: number })[] {
      return state.budgets.map((b) => {
        const spent = state.transactions
          .filter(
            (t) => t.type === "expense" && t.categoryId === b.categoryId && isThisMonth(t.date),
          )
          .reduce((s, t) => s + t.amount, 0);
        return { ...b, spent };
      });
    },

    /** Notifications derived from budget status + savings (no backend store). */
    notifications(): AppNotification[] {
      const now = new Date().toISOString();
      const list: AppNotification[] = [];
      for (const b of this.budgetsWithSpend) {
        const cat = this.categoryMap[b.categoryId];
        if (!cat || !b.amount) continue;
        const pct = Math.round((b.spent / b.amount) * 100);
        if (b.spent > b.amount) {
          list.push({
            id: `budget-over-${b.id}`,
            kind: "budget",
            title: "Budget exceeded",
            message: `You've gone over your ${cat.name} budget (${pct}%).`,
            date: now,
            read: this.readNotificationIds.includes(`budget-over-${b.id}`),
          });
        } else if (pct >= 80) {
          list.push({
            id: `budget-near-${b.id}`,
            kind: "budget",
            title: "Budget alert",
            message: `You've used ${pct}% of your ${cat.name} budget.`,
            date: now,
            read: this.readNotificationIds.includes(`budget-near-${b.id}`),
          });
        }
      }
      if (this.monthlySavings > 0) {
        list.push({
          id: "milestone-savings",
          kind: "milestone",
          title: "Savings milestone 🎉",
          message: "You're saving money this month. Keep it up!",
          date: now,
          read: this.readNotificationIds.includes("milestone-savings"),
        });
      }
      return list;
    },

    unreadNotifications(): number {
      return this.notifications.filter((n) => !n.read).length;
    },
  },

  actions: {
    async loadAll() {
      if (this.loaded) return;
      // Static-ish data first.
      this.categories = await walletService.getCategories();
      this.profile = await walletService.getProfile();

      const [wallets, transactions, budgets] = await Promise.all([
        walletService.getWallets().finally(() => (this.loading.wallets = false)),
        walletService.getTransactions().finally(() => (this.loading.transactions = false)),
        walletService.getBudgets().finally(() => (this.loading.budgets = false)),
      ]);
      this.wallets = wallets;
      this.transactions = transactions;
      this.budgets = budgets;
      this.loaded = true;
    },

    async refresh() {
      const [wallets, transactions] = await Promise.all([
        walletService.getWallets(),
        walletService.getTransactions(),
      ]);
      this.wallets = wallets;
      this.transactions = transactions;
    },

    async addTransaction(input: Omit<Transaction, "id">) {
      const tx = await walletService.addTransaction(input);
      this.transactions = [tx, ...this.transactions];
      // Backend updated wallet balances as a side-effect — pull the new values.
      this.wallets = await walletService.getWallets();
      return tx;
    },

    async deleteTransaction(id: string) {
      await walletService.deleteTransaction(id);
      this.transactions = this.transactions.filter((t) => t.id !== id);
      this.wallets = await walletService.getWallets();
    },

    async saveBudget(input: Omit<Budget, "id" | "spent"> & { id?: string }) {
      await walletService.saveBudget(input);
      this.budgets = await walletService.getBudgets();
    },

    async deleteBudget(id: string) {
      await walletService.deleteBudget(id);
      this.budgets = this.budgets.filter((b) => b.id !== id);
    },

    markNotificationRead(id: string) {
      if (!this.readNotificationIds.includes(id)) this.readNotificationIds.push(id);
    },
  },
});
