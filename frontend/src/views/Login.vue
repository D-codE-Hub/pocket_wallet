<template>
  <div
    :class="{ dark: isDark }"
    class="min-h-screen transition-colors duration-500"
  >
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 transition-colors duration-500"
    >
      <!-- Dark / Light toggle -->
      <button
        @click="toggleDark"
        class="absolute top-5 right-5 p-2.5 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:shadow-md"
        aria-label="Toggle dark mode"
      >
        <!-- Sun icon (shown in dark mode) -->
        <svg
          v-if="isDark"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <!-- Moon icon (shown in light mode) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.005 9.005 0 0012 21a9.005 9.005 0 008.354-5.646z"
          />
        </svg>
      </button>

      <div class="w-full max-w-md">
        <!-- Card -->
        <div
          class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-emerald-900/10 border border-gray-100 dark:border-gray-800 p-8 sm:p-10 transition-colors duration-500"
        >
          <!-- Logo / Brand -->
          <div class="text-center mb-8">
            <div
              class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h1
              class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              Pocket Wallet
            </h1>
            <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
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
                  class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:ring-emerald-400/30 dark:focus:border-emerald-400 transition-all duration-200 text-sm"
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
                  class="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:ring-emerald-400/30 dark:focus:border-emerald-400 transition-all duration-200 text-sm"
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
              class="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
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
          class="mt-6 text-center text-xs text-gray-400 dark:text-gray-600"
        >
          &copy; {{ new Date().getFullYear() }} Pocket Wallet &middot;
          Manage your money, your way.
        </p>
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
          this.$router.push({ name: "Home" });
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
