<template>
  <div
    :class="{ dark: isDark }"
    class="min-h-screen transition-colors duration-300"
  >
    <div
      class="min-h-screen flex flex-col bg-[#f8fafb] dark:bg-[#0c0f14] transition-colors duration-300"
    >
      <!-- ═══════════════ NAVBAR ═══════════════ -->
      <nav class="sticky top-0 z-40 bg-white/70 dark:bg-[#0c0f14]/70 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/[0.06] pt-[env(safe-area-inset-top)]">
        <div class="max-w-6xl mx-auto px-5 sm:px-6 flex items-center justify-between h-14">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-[10px] bg-emerald-500 flex items-center justify-center">
              <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <span class="text-[15px] font-semibold tracking-[-0.01em] text-gray-900 dark:text-gray-100">Pocket Wallet</span>
          </div>
          <button @click="toggleDark" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all" aria-label="Toggle dark mode">
            <svg v-if="isDark" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg v-else class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.005 9.005 0 0012 21a9.005 9.005 0 008.354-5.646z"/></svg>
          </button>
        </div>
      </nav>

      <!-- ═══════════════ LOGIN CONTENT ═══════════════ -->
      <div class="flex-1 flex items-center justify-center px-5 sm:px-6 py-8">

      <div class="w-full max-w-md">
        <!-- Card -->
        <div
          class="bg-white dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-7 sm:p-9 transition-colors duration-300"
        >
          <!-- Logo / Brand -->
          <div class="text-center mb-8">
            <div
              class="inline-flex items-center justify-center w-14 h-14 rounded-[14px] bg-emerald-500 mb-4"
            >
              <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <h1
              class="text-xl font-semibold text-gray-900 dark:text-white tracking-[-0.01em]"
            >
              Welcome back
            </h1>
            <p class="mt-1.5 text-[13px] text-gray-500 dark:text-gray-400">
              Sign in to manage your finances
            </p>
          </div>

          <!-- Error message -->
          <div
            v-if="errorMessage"
            class="mb-5 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ errorMessage }}
          </div>

          <!-- Form -->
          <form @submit.prevent="login" class="space-y-5">
            <!-- Email -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email or Username
              </label>
              <div class="relative">
                <span
                  class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  id="email"
                  type="text"
                  v-model="email"
                  placeholder="you@example.com"
                  required
                  class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200/60 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div class="relative">
                <span
                  class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Enter your password"
                  required
                  class="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200/60 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <!-- Eye open -->
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <!-- Eye closed -->
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                v-if="loading"
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {{ loading ? "Signing in..." : "Sign in" }}
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p
          class="mt-6 text-center text-xs text-gray-400 dark:text-gray-500"
        >
          &copy; {{ new Date().getFullYear() }} Pocket Wallet &middot;
          Manage your money, your way.
        </p>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: null,
      password: null,
      showPassword: false,
      loading: false,
      isDark: false,
      errorMessage: null,
    };
  },
  inject: ["$auth"],
  async mounted() {
    // Restore saved theme preference
    const saved = localStorage.getItem("pw-theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      this.isDark = true;
    }

    if (this.$route?.query?.route) {
      this.redirect_route = this.$route.query.route;
      this.$router.replace({ query: null });
    }
  },
  methods: {
    toggleDark() {
      this.isDark = !this.isDark;
      localStorage.setItem("pw-theme", this.isDark ? "dark" : "light");
    },
    async login() {
      this.errorMessage = null;
      if (!this.email || !this.password) {
        this.errorMessage = "Please enter both email and password.";
        return;
      }
      this.loading = true;
      try {
        let res = await this.$auth.login(this.email, this.password);
        if (res) {
          if (this.redirect_route) {
            this.$router.replace(this.redirect_route);
            this.redirect_route = null;
          } else {
            this.$router.push({ name: "Home" });
          }
        }
      } catch (err) {
        this.errorMessage =
          err?.message || "Invalid credentials. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
