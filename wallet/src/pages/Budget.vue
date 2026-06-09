<script setup lang="ts">
// Budget screen: a monthly overview ring plus per-category budget cards with
// create/edit in a bottom sheet.
import { computed, reactive, ref } from "vue";
import AppHeader from "@/components/ui/AppHeader.vue";
import Icon from "@/components/ui/Icon.vue";
import BudgetCard from "@/components/cards/BudgetCard.vue";
import DonutChart from "@/components/charts/DonutChart.vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import CategoryCard from "@/components/cards/CategoryCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import SkeletonLoader from "@/components/ui/SkeletonLoader.vue";
import { useWalletStore } from "@/stores/useWalletStore";
import { useFormat } from "@/composables/useFormat";
import type { Budget } from "@/types";

const store = useWalletStore();
const { formatMoney } = useFormat();

const budgets = computed(() => store.budgetsWithSpend);
const totalBudget = computed(() => budgets.value.reduce((s, b) => s + b.amount, 0));
const totalSpent = computed(() => budgets.value.reduce((s, b) => s + b.spent, 0));
const remaining = computed(() => totalBudget.value - totalSpent.value);

const ringData = computed(() => [
  { label: "Spent", value: totalSpent.value, color: totalSpent.value > totalBudget.value ? "#ef4444" : "#10b981" },
  { label: "Left", value: Math.max(remaining.value, 0), color: "#e2e8f0" },
]);

// --- Create / edit sheet ---------------------------------------------------
const sheetOpen = ref(false);
const form = reactive({ id: "" as string, categoryId: "", amount: "" });
const saving = ref(false);

// Categories not already budgeted (plus the one being edited).
const availableCategories = computed(() =>
  store.categories.filter(
    (c) => c.kind === "expense" && (!store.budgets.some((b) => b.categoryId === c.id) || c.id === form.categoryId),
  ),
);

function openCreate() {
  Object.assign(form, { id: "", categoryId: "", amount: "" });
  sheetOpen.value = true;
}
function openEdit(b: Budget) {
  Object.assign(form, { id: b.id, categoryId: b.categoryId, amount: String(b.amount) });
  sheetOpen.value = true;
}
const canSave = computed(() => !!form.categoryId && parseFloat(form.amount) > 0);

async function save() {
  if (!canSave.value) return;
  saving.value = true;
  try {
    await store.saveBudget({
      id: form.id || undefined,
      categoryId: form.categoryId,
      amount: parseFloat(form.amount),
      period: "monthly",
    });
    sheetOpen.value = false;
  } finally {
    saving.value = false;
  }
}
async function remove() {
  if (!form.id) return;
  await store.deleteBudget(form.id);
  sheetOpen.value = false;
}
</script>

<template>
  <div>
    <AppHeader title="Budget" subtitle="Monthly limits">
      <template #actions>
        <button
          class="tap h-10 w-10 rounded-full bg-brand-500 text-white shadow-glow"
          aria-label="Create budget"
          @click="openCreate"
        >
          <Icon name="plus" :size="20" class="mx-auto" />
        </button>
      </template>
    </AppHeader>

    <div class="space-y-5 px-5 pt-2">
      <!-- Overview -->
      <SkeletonLoader v-if="store.loading.budgets" class="h-48 w-full" />
      <section v-else class="card flex items-center gap-5 p-5">
        <DonutChart
          :data="ringData"
          :size="130"
          :thickness="16"
          center-label="left"
          :center-value="formatMoney(Math.max(remaining, 0))"
        />
        <div class="flex-1 space-y-3">
          <div>
            <p class="text-xs font-medium text-slate-400">Total budget</p>
            <p class="text-lg font-extrabold">{{ formatMoney(totalBudget) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Spent</p>
            <p class="text-lg font-extrabold text-accent-600 dark:text-accent-400">
              {{ formatMoney(totalSpent) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Budget cards -->
      <EmptyState
        v-if="!store.loading.budgets && !budgets.length"
        icon="wallet"
        title="No budgets yet"
        message="Set monthly limits per category to stay on track."
        cta="Create budget"
        @cta="openCreate"
      />
      <div v-else class="space-y-3">
        <BudgetCard v-for="b in budgets" :key="b.id" :budget="b" @edit="openEdit" />
      </div>
    </div>

    <!-- Create / edit sheet -->
    <BottomSheet :open="sheetOpen" :title="form.id ? 'Edit budget' : 'New budget'" @close="sheetOpen = false">
      <p class="mb-2 text-sm font-semibold">Category</p>
      <div class="mb-5 grid grid-cols-4 gap-2">
        <CategoryCard
          v-for="c in availableCategories"
          :key="c.id"
          :category="c"
          selectable
          :selected="form.categoryId === c.id"
          @click="form.categoryId = c.id"
        />
      </div>

      <p class="mb-1.5 text-sm font-semibold">Monthly limit</p>
      <input
        v-model="form.amount"
        type="number"
        inputmode="decimal"
        placeholder="0"
        class="mb-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-brand-400 dark:border-white/10 dark:bg-ink-800"
      />

      <div class="mb-2 flex gap-3">
        <button
          v-if="form.id"
          class="tap rounded-2xl bg-red-500/10 px-5 py-4 font-bold text-red-500"
          @click="remove"
        >
          <Icon name="trash" :size="18" />
        </button>
        <button
          class="tap flex-1 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 font-bold text-white shadow-glow disabled:opacity-40"
          :disabled="!canSave || saving"
          @click="save"
        >
          {{ saving ? "Saving…" : "Save budget" }}
        </button>
      </div>
    </BottomSheet>
  </div>
</template>
