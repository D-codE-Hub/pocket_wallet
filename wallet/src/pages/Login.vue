<script setup lang="ts">
// Branded login screen. Posts credentials to Frappe's /api/method/login via the
// auth store, which reloads into the app on success.
import { ref } from "vue";
import Icon from "@/components/ui/Icon.vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUiStore } from "@/stores/useUiStore";

const auth = useAuthStore();
const ui = useUiStore();

const usr = ref("");
const pwd = ref("");
const showPwd = ref(false);
const loading = ref(false);

async function submit() {
  if (!usr.value || !pwd.value || loading.value) return;
  loading.value = true;
  try {
    await auth.login(usr.value, pwd.value);
  } catch {
    /* error surfaced via auth.error */
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-50 px-6 dark:bg-ink-900">
    <!-- ambient gradient blobs -->
    <div class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-400/25 blur-3xl" />

    <!-- theme toggle -->
    <button
      class="tap absolute right-5 top-6 h-10 w-10 rounded-full bg-white text-slate-600 shadow-soft dark:bg-ink-800 dark:text-slate-300"
      aria-label="Toggle theme"
      @click="ui.toggleTheme()"
    >
      <Icon :name="ui.isDark ? 'sun' : 'moon'" :size="18" class="mx-auto" />
    </button>

    <div class="relative mx-auto w-full max-w-sm animate-slide-up-fade">
      <!-- brand -->
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow"
        >
          <Icon name="wallet" :size="30" />
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight">Pocket Wallet</h1>
        <p class="mt-1 text-sm text-slate-400">Track your money effortlessly.</p>
      </div>

      <form class="card space-y-4 p-6" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-sm font-semibold">Email or Username</label>
          <input
            v-model="usr"
            type="text"
            autocomplete="username"
            placeholder="you@example.com"
            class="pw-field"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-semibold">Password</label>
          <div class="relative">
            <input
              v-model="pwd"
              :type="showPwd ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="pw-field pr-11"
              @keydown.enter="submit"
            />
            <button
              type="button"
              class="tap absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-slate-400"
              :aria-label="showPwd ? 'Hide password' : 'Show password'"
              @click="showPwd = !showPwd"
            >
              <Icon :name="showPwd ? 'sun' : 'lock'" :size="17" class="mx-auto" />
            </button>
          </div>
        </div>

        <p v-if="auth.error" class="flex items-center gap-1.5 text-sm font-medium text-red-500">
          <Icon name="alert-triangle" :size="15" /> {{ auth.error }}
        </p>

        <button
          type="submit"
          class="tap w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 text-base font-bold text-white shadow-glow disabled:opacity-50"
          :disabled="loading || !usr || !pwd"
        >
          {{ loading ? "Signing in…" : "Sign in" }}
        </button>
      </form>

      <p class="mt-6 text-center text-xs text-slate-400">
        Secured by Frappe · Pocket Wallet v1.0.0
      </p>
    </div>
  </div>
</template>

<style scoped>
.pw-field {
  @apply w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-ink-800;
}
</style>
