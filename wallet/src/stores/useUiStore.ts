// UI / preferences store: theme, currency and the global Add-Transaction sheet.
import { defineStore } from "pinia";

type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  currency: string;
  addSheetOpen: boolean;
}

const THEME_KEY = "pw-theme";
const CURRENCY_KEY = "pw-currency";

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
    setCurrency(code: string) {
      this.currency = code;
      localStorage.setItem(CURRENCY_KEY, code);
    },
    openAddSheet() {
      this.addSheetOpen = true;
    },
    closeAddSheet() {
      this.addSheetOpen = false;
    },
  },
});
