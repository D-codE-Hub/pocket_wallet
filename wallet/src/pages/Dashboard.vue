<script setup lang="ts">
// Home screen: greeting, hero balance, wallet carousel, expense donut, quick
// actions, and recent transactions (with swipe-to-delete).
import { computed } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/ui/AppHeader.vue";
import Icon from "@/components/ui/Icon.vue";
import BalanceCard from "@/components/cards/BalanceCard.vue";
import WalletCard from "@/components/cards/WalletCard.vue";
import TransactionCard from "@/components/cards/TransactionCard.vue";
import DonutChart from "@/components/charts/DonutChart.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import SkeletonLoader from "@/components/ui/SkeletonLoader.vue";
import { useWalletStore } from "@/stores/useWalletStore";
import { useUiStore } from "@/stores/useUiStore";
import { useFormat, greeting } from "@/composables/useFormat";
import type { Transaction, TransactionType } from "@/types";

const store = useWalletStore();
const ui = useUiStore();
const router = useRouter();
const { formatMoney } = useFormat();

const donutData = computed(() =>
  store.expenseByCategory.slice(0, 6).map((e) => ({
    label: e.category.name,
    value: e.total,
    color: e.category.color,
  })),
);

const quickActions = [
  { label: "Add Income", icon: "arrow-down", tint: "#10b981", type: "income" as TransactionType | null },
  { label: "Add Expense", icon: "arrow-up", tint: "#ef4444", type: "expense" as TransactionType | null },
  { label: "Transfer", icon: "transfer", tint: "#3b82f6", type: "transfer" as TransactionType | null },
  { label: "Budgets", icon: "wallet", tint: "#8b5cf6", type: null },
];

function onQuickAction(a: { type: TransactionType | null }) {
  if (a.type === null) router.push("/budget");
  else ui.openAddSheet(a.type);
}

function remove(tx: Transaction) {
  store.deleteTransaction(tx.id);
}
</script>

<template>
  <div>
    <AppHeader :title="`${greeting()} 👋`" :subtitle="store.profile?.name ?? 'Welcome back'">
      <template #actions>
        <button
          class="tap relative h-10 w-10 rounded-full bg-white text-slate-600 shadow-soft dark:bg-ink-800 dark:text-slate-300"
          aria-label="Notifications"
          @click="router.push('/profile')"
        >
          <Icon name="bell" :size="19" class="mx-auto" />
          <span
            v-if="store.unreadNotifications"
            class="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-ink-800"
          />
        </button>
        <button
          class="tap h-10 w-10 rounded-full bg-white text-slate-600 shadow-soft dark:bg-ink-800 dark:text-slate-300"
          aria-label="Toggle theme"
          @click="ui.toggleTheme()"
        >
          <Icon :name="ui.isDark ? 'sun' : 'moon'" :size="18" class="mx-auto" />
        </button>
      </template>
    </AppHeader>

    <div class="space-y-6 px-5 pt-2">
      <!-- Balance hero -->
      <SkeletonLoader v-if="store.loading.wallets" class="h-56 w-full" />
      <BalanceCard
        v-else
        :balance="store.totalBalance"
        :income="store.monthlyIncome"
        :expense="store.monthlyExpense"
        :savings="store.monthlySavings"
      />

      <!-- Wallet carousel -->
      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-bold">My Wallets</h2>
          <button class="text-xs font-semibold text-brand-600 dark:text-brand-400" @click="router.push('/profile')">
            Manage
          </button>
        </div>
        <div v-if="store.loading.wallets" class="flex gap-3 overflow-hidden">
          <SkeletonLoader v-for="i in 3" :key="i" class="h-40 w-64 shrink-0" />
        </div>
        <div v-else class="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
          <div v-for="w in store.walletsDefaultFirst" :key="w.id" class="snap-start">
            <WalletCard :wallet="w" />
          </div>
        </div>
      </section>

      <!-- Expense summary donut -->
      <section class="card p-5">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-base font-bold">Spending this month</h2>
          <button class="text-xs font-semibold text-brand-600 dark:text-brand-400" @click="router.push('/analytics')">
            Details
          </button>
        </div>
        <div v-if="store.loading.transactions" class="flex justify-center py-6">
          <SkeletonLoader class="h-44 w-44 !rounded-full" />
        </div>
        <EmptyState
          v-else-if="!donutData.length"
          icon="bar-chart"
          title="Nothing spent yet"
          message="Your category breakdown will appear here."
        />
        <div v-else class="flex items-center gap-4">
          <DonutChart
            :data="donutData"
            :size="150"
            center-label="Spent"
            :center-value="formatMoney(store.monthlyExpense)"
          />
          <ul class="flex-1 space-y-2">
            <li v-for="d in donutData.slice(0, 5)" :key="d.label" class="flex items-center gap-2 text-sm">
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: d.color }" />
              <span class="flex-1 truncate text-slate-500">{{ d.label }}</span>
              <span class="font-semibold">{{ formatMoney(d.value) }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Quick actions -->
      <section>
        <h2 class="mb-3 text-base font-bold">Quick actions</h2>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="a in quickActions"
            :key="a.label"
            class="tap flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-100 dark:bg-ink-800 dark:ring-white/5"
            @click="onQuickAction(a)"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-2xl"
              :style="{ backgroundColor: a.tint + '1f', color: a.tint }"
            >
              <Icon :name="a.icon" :size="20" />
            </span>
            <span class="text-[11px] font-semibold leading-tight text-slate-600 dark:text-slate-300">{{
              a.label
            }}</span>
          </button>
        </div>
      </section>

      <!-- Recent transactions -->
      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-bold">Recent activity</h2>
          <button class="text-xs font-semibold text-brand-600 dark:text-brand-400" @click="router.push('/transactions')">
            See all
          </button>
        </div>
        <div v-if="store.loading.transactions" class="card divide-y divide-slate-100 dark:divide-white/5">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3 p-3.5">
            <SkeletonLoader class="h-11 w-11 !rounded-2xl" />
            <div class="flex-1"><SkeletonLoader :lines="2" /></div>
          </div>
        </div>
        <EmptyState
          v-else-if="!store.recentTransactions.length"
          title="No transactions yet"
          message="Tap the + button to add your first one."
          cta="Add transaction"
          @cta="ui.openAddSheet()"
        />
        <div v-else class="card overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
          <TransactionCard
            v-for="tx in store.recentTransactions"
            :key="tx.id"
            :tx="tx"
            swipeable
            @delete="remove"
            @edit="ui.openEditSheet(tx)"
          />
        </div>
        <p class="mt-2 text-center text-[11px] text-slate-400">Swipe a row left to edit or delete</p>
      </section>
    </div>
  </div>
</template>
