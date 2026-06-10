<script setup lang="ts">
// Analytics: expense trend line, category donut, income-vs-expense bars and a
// top-categories list, all driven off the transaction history with a
// week/month/year period switch.
import { computed, ref } from "vue";
import AppHeader from "@/components/ui/AppHeader.vue";
import DonutChart from "@/components/charts/DonutChart.vue";
import LineChart from "@/components/charts/LineChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import SkeletonLoader from "@/components/ui/SkeletonLoader.vue";
import { useWalletStore } from "@/stores/useWalletStore";
import { useFormat } from "@/composables/useFormat";

const store = useWalletStore();
const { formatMoney } = useFormat();

type Period = "week" | "month" | "year" | "custom";
const period = ref<Period>("month");
const periods: { key: Period; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "custom", label: "Custom" },
];

function startToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
const localDay = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// Custom range inputs (default to this month-to-date).
const customFrom = ref(localDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
const customTo = ref(localDay());

// Period boundaries are calendar-based and run up to *today* (period-to-date),
// except `custom`, which uses the chosen from/to dates.
const rangeStart = computed(() => {
  if (period.value === "custom") return new Date(`${customFrom.value}T00:00:00`);
  const d = startToday();
  if (period.value === "week") {
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  } else if (period.value === "month") {
    d.setDate(1);
  } else {
    d.setMonth(0, 1); // Jan 1
  }
  return d;
});
const rangeEnd = computed(() =>
  period.value === "custom" ? new Date(`${customTo.value}T23:59:59`) : new Date(),
);

const inWindow = computed(() => {
  const start = rangeStart.value.getTime();
  const end = rangeEnd.value.getTime();
  return store.transactions.filter((t) => {
    const ts = new Date(t.date).getTime();
    return ts >= start && ts <= end;
  });
});

const totalIncome = computed(() =>
  inWindow.value.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
);
const totalExpense = computed(() =>
  inWindow.value.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
);

const sameDay = (iso: string, d: Date) => new Date(iso).toDateString() === d.toDateString();

// Expense trend buckets across the selected range:
//   year             → one point per month (Jan → current month)
//   week/month/custom → one point per day from start through end
const trend = computed(() => {
  const buckets: { label: string; value: number }[] = [];

  if (period.value === "year") {
    const today = startToday();
    for (let m = 0; m <= today.getMonth(); m++) {
      const d = new Date(today.getFullYear(), m, 1);
      const value = store.transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            new Date(t.date).getMonth() === m &&
            new Date(t.date).getFullYear() === today.getFullYear(),
        )
        .reduce((s, t) => s + t.amount, 0);
      buckets.push({ label: d.toLocaleDateString("en-US", { month: "short" }), value });
    }
  } else {
    const cur = new Date(rangeStart.value);
    cur.setHours(0, 0, 0, 0);
    const end = rangeEnd.value;
    const labelOpts: Intl.DateTimeFormatOptions =
      period.value === "week" ? { weekday: "short" } : { month: "short", day: "numeric" };
    while (cur <= end) {
      const value = store.transactions
        .filter((t) => t.type === "expense" && sameDay(t.date, cur))
        .reduce((s, t) => s + t.amount, 0);
      buckets.push({ label: cur.toLocaleDateString("en-US", labelOpts), value });
      cur.setDate(cur.getDate() + 1);
    }
  }
  return buckets;
});

// Category breakdown within the window.
const categoryBreakdown = computed(() => {
  const totals: Record<string, number> = {};
  for (const t of inWindow.value) {
    if (t.type !== "expense" || !t.categoryId) continue;
    totals[t.categoryId] = (totals[t.categoryId] ?? 0) + t.amount;
  }
  return Object.entries(totals)
    .map(([id, total]) => ({ category: store.categoryMap[id], total }))
    .filter((x) => x.category)
    .sort((a, b) => b.total - a.total);
});

const donutData = computed(() =>
  categoryBreakdown.value.slice(0, 6).map((c) => ({
    label: c.category.name,
    value: c.total,
    color: c.category.color,
  })),
);

// Income vs expense by month (last 6).
const barGroups = computed(() => {
  const groups: { label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const sameMonth = (iso: string) =>
      new Date(iso).getMonth() === d.getMonth() && new Date(iso).getFullYear() === d.getFullYear();
    groups.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      income: store.transactions.filter((t) => t.type === "income" && sameMonth(t.date)).reduce((s, t) => s + t.amount, 0),
      expense: store.transactions.filter((t) => t.type === "expense" && sameMonth(t.date)).reduce((s, t) => s + t.amount, 0),
    });
  }
  return groups;
});

const maxCat = computed(() => categoryBreakdown.value[0]?.total ?? 1);
const hasData = computed(() => inWindow.value.length > 0);
</script>

<template>
  <div>
    <AppHeader title="Analytics" subtitle="Insights & trends" />

    <div class="space-y-5 px-5 pt-2">
      <!-- Period switch -->
      <div class="grid grid-cols-4 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-ink-800">
        <button
          v-for="p in periods"
          :key="p.key"
          class="tap rounded-xl py-2 text-sm font-semibold transition-all"
          :class="
            period === p.key
              ? 'bg-white text-brand-600 shadow-sm dark:bg-ink-700 dark:text-brand-400'
              : 'text-slate-500'
          "
          @click="period = p.key"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- Custom from / to -->
      <div v-if="period === 'custom'" class="grid grid-cols-2 gap-3">
        <div class="min-w-0">
          <p class="mb-1.5 text-xs font-semibold text-slate-500">From</p>
          <input
            v-model="customFrom"
            type="date"
            :max="customTo"
            class="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-brand-400 dark:border-white/10 dark:bg-ink-800"
          />
        </div>
        <div class="min-w-0">
          <p class="mb-1.5 text-xs font-semibold text-slate-500">To</p>
          <input
            v-model="customTo"
            type="date"
            :min="customFrom"
            class="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-brand-400 dark:border-white/10 dark:bg-ink-800"
          />
        </div>
      </div>

      <template v-if="store.loading.transactions">
        <SkeletonLoader class="h-44 w-full" />
        <SkeletonLoader class="h-60 w-full" />
      </template>

      <EmptyState
        v-else-if="!hasData"
        icon="bar-chart"
        title="No data to analyse"
        message="Add some transactions to see your trends."
      />

      <template v-else>
        <!-- Income / expense summary -->
        <div class="grid grid-cols-2 gap-3">
          <div class="card p-4">
            <p class="text-xs font-medium text-slate-400">Income</p>
            <p class="mt-1 text-xl font-extrabold text-brand-600 dark:text-brand-400">
              {{ formatMoney(totalIncome) }}
            </p>
          </div>
          <div class="card p-4">
            <p class="text-xs font-medium text-slate-400">Expense</p>
            <p class="mt-1 text-xl font-extrabold text-accent-600 dark:text-accent-400">
              {{ formatMoney(totalExpense) }}
            </p>
          </div>
        </div>

        <!-- Expense trend -->
        <section class="card p-5">
          <h2 class="mb-4 text-base font-bold">Expense trend</h2>
          <LineChart :points="trend" />
        </section>

        <!-- Category donut -->
        <section v-if="donutData.length" class="card p-5">
          <h2 class="mb-3 text-base font-bold">By category</h2>
          <div class="flex items-center gap-4">
            <DonutChart :data="donutData" :size="150" center-label="Total" :center-value="formatMoney(totalExpense)" />
            <ul class="flex-1 space-y-2">
              <li v-for="d in donutData.slice(0, 5)" :key="d.label" class="flex items-center gap-2 text-sm">
                <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: d.color }" />
                <span class="flex-1 truncate text-slate-500">{{ d.label }}</span>
                <span class="font-semibold">{{ formatMoney(d.value) }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Income vs expense -->
        <section class="card p-5">
          <h2 class="mb-4 text-base font-bold">Income vs Expense</h2>
          <BarChart :groups="barGroups" />
        </section>

        <!-- Top categories -->
        <section v-if="categoryBreakdown.length" class="card p-5">
          <h2 class="mb-3 text-base font-bold">Top categories</h2>
          <ul class="space-y-3">
            <li v-for="c in categoryBreakdown.slice(0, 5)" :key="c.category.id">
              <div class="mb-1 flex items-center gap-2 text-sm">
                <span>{{ c.category.emoji }}</span>
                <span class="flex-1 font-semibold">{{ c.category.name }}</span>
                <span class="font-bold">{{ formatMoney(c.total) }}</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-700">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{ width: `${(c.total / maxCat) * 100}%`, backgroundColor: c.category.color }"
                />
              </div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>
