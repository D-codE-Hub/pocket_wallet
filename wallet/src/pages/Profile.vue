<script setup lang="ts">
// Profile & settings: user card, notification center, wallet list, settings
// groups, currency picker, and the dark-mode toggle.
import { computed, ref } from "vue";
import AppHeader from "@/components/ui/AppHeader.vue";
import Icon from "@/components/ui/Icon.vue";
import SettingsItem from "@/components/ui/SettingsItem.vue";
import NotificationCard from "@/components/cards/NotificationCard.vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import { useWalletStore } from "@/stores/useWalletStore";
import { useUiStore } from "@/stores/useUiStore";
import { useFormat } from "@/composables/useFormat";

const store = useWalletStore();
const ui = useUiStore();
const { formatMoney } = useFormat();

const initials = computed(() =>
  (store.profile?.name ?? "PW")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
);

const notifOpen = ref(false);
const currencyOpen = ref(false);
const currencies = ["USD", "EUR", "GBP", "INR", "AED"];

function toast(label: string) {
  // Placeholder for actions not wired to a backend in this mock build.
  window.alert(`${label} — coming soon (mock build).`);
}

const account = [
  { icon: "user", label: "Account settings", tint: "#3b82f6", action: () => toast("Account settings") },
  { icon: "wallet", label: "Wallet management", tint: "#8b5cf6", action: () => toast("Wallet management") },
  { icon: "box", label: "Categories", tint: "#f97316", action: () => toast("Categories") },
  { icon: "credit-card", label: "Payment methods", tint: "#10b981", action: () => toast("Payment methods") },
];
const prefs = [
  { icon: "shield", label: "Security", tint: "#ef4444", action: () => toast("Security") },
  { icon: "download", label: "Export data", tint: "#06b6d4", action: () => toast("Export data") },
  { icon: "database", label: "Backup & restore", tint: "#6366f1", action: () => toast("Backup & restore") },
];
</script>

<template>
  <div>
    <AppHeader title="Profile" subtitle="Account & settings">
      <template #actions>
        <button
          class="tap relative h-10 w-10 rounded-full bg-white text-slate-600 shadow-soft dark:bg-ink-800 dark:text-slate-300"
          aria-label="Notifications"
          @click="notifOpen = true"
        >
          <Icon name="bell" :size="19" class="mx-auto" />
          <span
            v-if="store.unreadNotifications"
            class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-ink-800"
            >{{ store.unreadNotifications }}</span
          >
        </button>
      </template>
    </AppHeader>

    <div class="space-y-5 px-5 pt-2">
      <!-- User card -->
      <section class="card flex items-center gap-4 p-5">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-accent-500 text-xl font-extrabold text-white shadow-glow"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-lg font-extrabold">{{ store.profile?.name ?? "Pocket User" }}</p>
          <p class="truncate text-sm text-slate-400">{{ store.profile?.email }}</p>
        </div>
        <button
          class="tap h-9 w-9 rounded-full bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-300"
          aria-label="Edit profile"
          @click="toast('Edit profile')"
        >
          <Icon name="pencil" :size="16" class="mx-auto" />
        </button>
      </section>

      <!-- Net worth strip -->
      <section class="card flex items-center justify-between p-5">
        <div>
          <p class="text-xs font-medium text-slate-400">Net worth</p>
          <p class="text-2xl font-extrabold">{{ formatMoney(store.totalBalance) }}</p>
        </div>
        <span class="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400">
          {{ store.wallets.length }} wallets
        </span>
      </section>

      <!-- Appearance -->
      <section class="card overflow-hidden">
        <p class="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Appearance</p>
        <SettingsItem icon="palette" label="Dark mode" tint="#8b5cf6" :chevron="false">
          <template #trailing>
            <button
              class="relative h-7 w-12 rounded-full transition-colors"
              :class="ui.isDark ? 'bg-brand-500' : 'bg-slate-300'"
              role="switch"
              :aria-checked="ui.isDark"
              aria-label="Toggle dark mode"
              @click="ui.toggleTheme()"
            >
              <span
                class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all"
                :class="ui.isDark ? 'left-6' : 'left-1'"
              />
            </button>
          </template>
        </SettingsItem>
        <div class="border-t border-slate-100 dark:border-white/5" />
        <SettingsItem
          icon="globe"
          label="Currency"
          tint="#06b6d4"
          :value="ui.currency"
          @click="currencyOpen = true"
        />
        <div class="border-t border-slate-100 dark:border-white/5" />
        <SettingsItem icon="bell" label="Notifications" tint="#f59e0b" @click="notifOpen = true" />
      </section>

      <!-- Account -->
      <section class="card overflow-hidden">
        <p class="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Account</p>
        <template v-for="(item, i) in account" :key="item.label">
          <div v-if="i" class="border-t border-slate-100 dark:border-white/5" />
          <SettingsItem :icon="item.icon" :label="item.label" :tint="item.tint" @click="item.action" />
        </template>
      </section>

      <!-- Data & security -->
      <section class="card overflow-hidden">
        <p class="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Data & security</p>
        <template v-for="(item, i) in prefs" :key="item.label">
          <div v-if="i" class="border-t border-slate-100 dark:border-white/5" />
          <SettingsItem :icon="item.icon" :label="item.label" :tint="item.tint" @click="item.action" />
        </template>
      </section>

      <button
        class="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3.5 text-sm font-bold text-red-500"
        @click="toast('Sign out')"
      >
        <Icon name="log-out" :size="18" /> Sign out
      </button>

      <p class="pb-2 text-center text-[11px] text-slate-400">Pocket Wallet · v1.0.0</p>
    </div>

    <!-- Notification center -->
    <BottomSheet :open="notifOpen" title="Notifications" @close="notifOpen = false">
      <EmptyState
        v-if="!store.notifications.length"
        icon="bell"
        title="You're all caught up"
        message="New alerts about budgets and bills will show here."
      />
      <div v-else class="-mx-2 divide-y divide-slate-100 pb-2 dark:divide-white/5">
        <NotificationCard
          v-for="n in store.notifications"
          :key="n.id"
          :notification="n"
          @click="store.markNotificationRead(n.id)"
        />
      </div>
    </BottomSheet>

    <!-- Currency picker -->
    <BottomSheet :open="currencyOpen" title="Currency" @close="currencyOpen = false">
      <div class="space-y-1 pb-3">
        <button
          v-for="c in currencies"
          :key="c"
          class="tap flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5"
          @click="ui.setCurrency(c); currencyOpen = false"
        >
          {{ c }}
          <Icon v-if="ui.currency === c" name="check" :size="18" class="text-brand-500" />
        </button>
      </div>
    </BottomSheet>
  </div>
</template>
