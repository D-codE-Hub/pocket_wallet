// Core data store: wallets, categories, transactions, budgets, notifications,
// plus the derived totals every screen depends on. Talks only to walletService
// (the mock API), so swapping in real endpoints touches nothing here.
import { defineStore } from "pinia";
import { walletService } from "@/services/walletService";
import type {
  AppNotification,
  Budget,
  Category,
  Transaction,
  UserProfile,
} from "@/types";
import type { Wallet } from "@/types";

interface State {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  notifications: AppNotification[];
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
    notifications: [],
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

    unreadNotifications(state): number {
      return state.notifications.filter((n) => !n.read).length;
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
            ({ id, name: "Others", emoji: "📦", icon: "box", color: "#64748b", kind: "expense" } as Category),
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
  },

  actions: {
    async loadAll() {
      if (this.loaded) return;
      // Fast static data first.
      this.categories = await walletService.getCategories();
      this.profile = await walletService.getProfile();

      const [wallets, transactions, budgets, notifications] = await Promise.all([
        walletService.getWallets().finally(() => (this.loading.wallets = false)),
        walletService.getTransactions().finally(() => (this.loading.transactions = false)),
        walletService.getBudgets().finally(() => (this.loading.budgets = false)),
        walletService.getNotifications(),
      ]);
      this.wallets = wallets;
      this.transactions = transactions;
      this.budgets = budgets;
      this.notifications = notifications;
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

    async markNotificationRead(id: string) {
      await walletService.markNotificationRead(id);
      const n = this.notifications.find((x) => x.id === id);
      if (n) n.read = true;
    },
  },
});
