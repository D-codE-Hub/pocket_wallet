// Authentication state. Probes the Frappe session on boot, and handles
// login/logout. After a successful login/logout we do a full reload so the
// server re-renders wallet.html with a fresh, valid CSRF token for the new
// session — the most reliable approach for a Frappe-served SPA.
import { defineStore } from "pinia";
import { walletService } from "@/services/walletService";
import { useUiStore } from "@/stores/useUiStore";

const BASE = "/wallet";

interface AuthState {
  user: string;
  fullName: string;
  email: string;
  roles: string[];
  isLoggedIn: boolean;
  ready: boolean;
  error: string;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: "Guest",
    fullName: "",
    email: "",
    roles: [],
    isLoggedIn: false,
    ready: false,
    error: "",
  }),

  actions: {
    /** Called once before the app mounts to determine auth state. */
    async fetchSession() {
      try {
        const s = await walletService.getSession();
        this.isLoggedIn = !!s?.logged_in;
        this.user = s?.user ?? "Guest";
        this.fullName = s?.full_name ?? "";
        this.email = s?.email ?? "";
        this.roles = s?.roles ?? [];
        // Adopt the backend's default currency (unless the user picked one).
        useUiStore().applyDefaultCurrency(s?.currency);
      } catch {
        this.isLoggedIn = false;
      } finally {
        this.ready = true;
      }
    },

    async login(usr: string, pwd: string) {
      this.error = "";
      try {
        await walletService.login(usr, pwd);
        // Reload into the app so the authenticated session's CSRF token is used.
        window.location.href = BASE + "/";
      } catch (e: any) {
        this.error = e?.messages?.[0] || "Invalid login credentials";
        throw e;
      }
    },

    async logout() {
      try {
        await walletService.logout();
      } finally {
        window.location.href = BASE + "/login";
      }
    },
  },
});
