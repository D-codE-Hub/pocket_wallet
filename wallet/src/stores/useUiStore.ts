// UI / preferences store: theme, currency and the global Add-Transaction sheet.
import { defineStore } from "pinia";
import type { Transaction, TransactionType } from "@/types";

type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  currency: string;
  addSheetOpen: boolean;
  // When set, the Add sheet opens in "edit" mode for this transaction.
  editingTransaction: Transaction | null;
  // Preselected type for a fresh Add sheet (from Quick Actions); null = default.
  addPresetType: TransactionType | null;
  // Global confirmation dialog state.
  confirmDialog: ConfirmState;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

// Resolver for the in-flight confirm() promise (kept out of reactive state).
let confirmResolve: ((value: boolean) => void) | null = null;

const THEME_KEY = "pw-theme";
const CURRENCY_KEY = "pw-currency";
// Set once the user picks a currency manually, so the backend default never
// overrides their explicit choice on subsequent loads.
const CURRENCY_EXPLICIT_KEY = "pw-currency-explicit";

function initialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useUiStore = defineStore("ui", {
  state: (): UiState => ({
    theme: initialTheme(),
    currency: localStorage.getItem(CURRENCY_KEY) ?? "USD",
    addSheetOpen: false,
    editingTransaction: null,
    addPresetType: null,
    confirmDialog: { open: false, title: "", message: "", confirmLabel: "Confirm", danger: false },
  }),

  getters: {
    isDark: (s) => s.theme === "dark",
  },

  actions: {
    /** Sync the <html> class + persist. Call once on app boot. */
    applyTheme() {
      document.documentElement.classList.toggle("dark", this.theme === "dark");
      localStorage.setItem(THEME_KEY, this.theme);
    },
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      this.applyTheme();
    },
    /** User picked a currency in the UI — remember it as an explicit choice. */
    setCurrency(code: string) {
      this.currency = code;
      localStorage.setItem(CURRENCY_KEY, code);
      localStorage.setItem(CURRENCY_EXPLICIT_KEY, "1");
    },
    /** Apply the backend's default currency unless the user has chosen one. */
    applyDefaultCurrency(code?: string) {
      if (!code || localStorage.getItem(CURRENCY_EXPLICIT_KEY)) return;
      this.currency = code;
      localStorage.setItem(CURRENCY_KEY, code);
    },
    openAddSheet(presetType: TransactionType | null = null) {
      this.editingTransaction = null;
      this.addPresetType = presetType;
      this.addSheetOpen = true;
    },
    openEditSheet(tx: Transaction) {
      this.editingTransaction = tx;
      this.addSheetOpen = true;
    },
    closeAddSheet() {
      this.addSheetOpen = false;
      this.editingTransaction = null;
    },

    /** Open the confirm dialog; resolves true (confirmed) or false (cancelled). */
    confirm(opts: ConfirmOptions): Promise<boolean> {
      this.confirmDialog = {
        open: true,
        title: opts.title,
        message: opts.message ?? "",
        confirmLabel: opts.confirmLabel ?? "Confirm",
        danger: !!opts.danger,
      };
      return new Promise((resolve) => {
        confirmResolve = resolve;
      });
    },
    resolveConfirm(value: boolean) {
      this.confirmDialog.open = false;
      confirmResolve?.(value);
      confirmResolve = null;
    },
  },
});
