<script setup lang="ts">
// Transactions list: search, type + category filters, date-range segment,
// day-grouped rows, and infinite scroll via IntersectionObserver.
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import AppHeader from "@/components/ui/AppHeader.vue";
import Icon from "@/components/ui/Icon.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import FilterChip from "@/components/ui/FilterChip.vue";
import TransactionCard from "@/components/cards/TransactionCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import SkeletonLoader from "@/components/ui/SkeletonLoader.vue";
import { useWalletStore } from "@/stores/useWalletStore";
import { useUiStore } from "@/stores/useUiStore";
import { relativeDay } from "@/composables/useFormat";
import type { Transaction, TransactionType } from "@/types";

const store = useWalletStore();
const ui = useUiStore();

const query = ref("");
const typeFilter = ref<TransactionType | "all">("all");
const categoryFilter = ref<string | "all">("all");
const range = ref<"all" | "week" | "month" | "custom">("all");
const refreshing = ref(false);

const types = [
  { key: "all", label: "All" },
  { key: "expense", label: "Expense" },
  { key: "income", label: "Income" },
  { key: "transfer", label: "Transfer" },
] as const;
const ranges = [
  { key: "all", label: "All" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "custom", label: "Custom" },
] as const;

// Local YYYY-MM-DD helpers (avoid UTC day-shift).
const localDay = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
function firstOfMonth(): string {
  const d = new Date();
  return localDay(new Date(d.getFullYear(), d.getMonth(), 1));
}
const customFrom = ref(firstOfMonth());
const customTo = ref(localDay());

// Calendar-based, period-to-date (week = Mon→today, month = 1st→today).
function startOfWeek(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}
function startOfMonth(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}

function inRange(iso: string): boolean {
  if (range.value === "all") return true;
  const ts = new Date(iso).getTime();
  if (range.value === "week") return ts >= startOfWeek();
  if (range.value === "month") return ts >= startOfMonth();
  // custom from/to (inclusive)
  const from = new Date(`${customFrom.value}T00:00:00`).getTime();
  const to = new Date(`${customTo.value}T23:59:59`).getTime();
  return ts >= from && ts <= to;
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return store.transactions.filter((t) => {
    if (typeFilter.value !== "all" && t.type !== typeFilter.value) return false;
    if (categoryFilter.value !== "all" && t.categoryId !== categoryFilter.value) return false;
    if (!inRange(t.date)) return false;
    if (q) {
      const cat = t.categoryId ? store.categoryMap[t.categoryId]?.name ?? "" : "";
      const hay = `${t.note ?? ""} ${cat} ${t.tags?.join(" ") ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
});

// --- Infinite scroll -------------------------------------------------------
const PAGE = 15;
const limit = ref(PAGE);
const visible = computed(() => filtered.value.slice(0, limit.value));
const hasMore = computed(() => limit.value < filtered.value.length);

// Group the visible rows by relative day for sticky headers.
const grouped = computed(() => {
  const groups: { day: string; items: Transaction[] }[] = [];
  for (const tx of visible.value) {
    const day = relativeDay(tx.date);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(tx);
    else groups.push({ day, items: [tx] });
  }
  return groups;
});

// Reset paging whenever filters change.
watch([query, typeFilter, categoryFilter, range, customFrom, customTo], () => (limit.value = PAGE));

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value) limit.value += PAGE;
    },
    { rootMargin: "200px" },
  );
  if (sentinel.value) observer.observe(sentinel.value);
});
onUnmounted(() => observer?.disconnect());
watch(sentinel, (el) => el && observer?.observe(el));

async function pullRefresh() {
  refreshing.value = true;
  await store.refresh();
  refreshing.value = false;
}

async function remove(tx: Transaction) {
  const ok = await ui.confirm({
    title: "Delete transaction?",
    message: "This entry will be removed from your activity.",
    confirmLabel: "Delete",
    danger: true,
  });
  if (ok) store.deleteTransaction(tx.id);
}
</script>

<template>
  <div>
    <AppHeader title="Transactions" :subtitle="`${filtered.length} records`">
      <template #actions>
        <button
          class="tap h-10 w-10 rounded-full bg-white text-slate-600 shadow-soft dark:bg-ink-800 dark:text-slate-300"
          aria-label="Refresh"
          @click="pullRefresh"
        >
          <Icon name="refresh" :size="18" class="mx-auto" :class="refreshing ? 'animate-spin' : ''" />
        </button>
      </template>
    </AppHeader>

    <div class="space-y-4 px-5 pt-2">
      <SearchBar v-model="query" placeholder="Search notes, categories, tags…" />

      <!-- Type filter -->
      <div class="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        <FilterChip
          v-for="t in types"
          :key="t.key"
          :label="t.label"
          :active="typeFilter === t.key"
          @click="typeFilter = t.key"
        />
      </div>

      <!-- Category chips -->
      <div class="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        <FilterChip label="All categories" :active="categoryFilter === 'all'" @click="categoryFilter = 'all'" />
        <FilterChip
          v-for="c in store.categories"
          :key="c.id"
          :label="c.name"
          :emoji="c.emoji"
          :color="c.color"
          :active="categoryFilter === c.id"
          @click="categoryFilter = c.id"
        />
      </div>

      <!-- Date range -->
      <div class="grid grid-cols-4 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-ink-800">
        <button
          v-for="r in ranges"
          :key="r.key"
          class="tap rounded-xl py-2 text-xs font-semibold transition-all"
          :class="
            range === r.key
              ? 'bg-white text-brand-600 shadow-sm dark:bg-ink-700 dark:text-brand-400'
              : 'text-slate-500'
          "
          @click="range = r.key"
        >
          {{ r.label }}
        </button>
      </div>

      <!-- Custom from / to -->
      <div v-if="range === 'custom'" class="grid grid-cols-2 gap-3">
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

      <!-- List -->
      <div v-if="store.loading.transactions" class="card divide-y divide-slate-100 dark:divide-white/5">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 p-3.5">
          <SkeletonLoader class="h-11 w-11 !rounded-2xl" />
          <div class="flex-1"><SkeletonLoader :lines="2" /></div>
        </div>
      </div>

      <EmptyState
        v-else-if="!filtered.length"
        icon="receipt"
        title="No transactions found"
        message="Try changing the filters or add a new transaction."
        cta="Add transaction"
        @cta="ui.openAddSheet()"
      />

      <div v-else class="space-y-4">
        <div v-for="g in grouped" :key="g.day">
          <p class="mb-1.5 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">{{ g.day }}</p>
          <div class="card overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            <TransactionCard
              v-for="tx in g.items"
              :key="tx.id"
              :tx="tx"
              swipeable
              @delete="remove"
              @edit="ui.openEditSheet(tx)"
            />
          </div>
        </div>

        <div ref="sentinel" class="h-8">
          <p v-if="hasMore" class="text-center text-xs text-slate-400">Loading more…</p>
        </div>
      </div>
    </div>
  </div>
</template>
