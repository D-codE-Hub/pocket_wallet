<script setup lang="ts">
// Monthly budget card: amount / used / remaining with a coloured progress bar
// and an alert chip when the budget is close to or over its limit.
import { computed } from "vue";
import Icon from "@/components/ui/Icon.vue";
import ProgressBar from "@/components/ui/ProgressBar.vue";
import { useFormat } from "@/composables/useFormat";
import { useWalletStore } from "@/stores/useWalletStore";
import type { Budget } from "@/types";

const props = defineProps<{ budget: Budget }>();
const emit = defineEmits<{ (e: "edit", b: Budget): void }>();

const store = useWalletStore();
const { formatMoney } = useFormat();

const category = computed(() => store.categoryMap[props.budget.categoryId]);
const remaining = computed(() => props.budget.amount - props.budget.spent);
const pct = computed(() => (props.budget.spent / props.budget.amount) * 100);
const over = computed(() => remaining.value < 0);
const near = computed(() => !over.value && pct.value >= 80);
</script>

<template>
  <div class="card p-4">
    <div class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
        :style="{ backgroundColor: (category?.color ?? '#64748b') + '22' }"
      >
        {{ category?.emoji ?? "📦" }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold">{{ category?.name ?? "Category" }}</p>
        <p class="text-xs text-slate-400">{{ formatMoney(budget.amount) }} / month</p>
      </div>
      <button
        type="button"
        class="tap h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
        aria-label="Edit budget"
        @click="emit('edit', budget)"
      >
        <Icon name="pencil" :size="16" class="mx-auto" />
      </button>
    </div>

    <div class="mt-3">
      <ProgressBar :value="budget.spent" :max="budget.amount" :height="9" />
    </div>

    <div class="mt-2.5 flex items-center justify-between text-xs">
      <span class="font-medium text-slate-500">
        Spent <span class="font-bold text-slate-700 dark:text-slate-200">{{ formatMoney(budget.spent) }}</span>
      </span>
      <span
        v-if="over"
        class="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-500"
      >
        <Icon name="alert-triangle" :size="12" /> Over by {{ formatMoney(-remaining) }}
      </span>
      <span
        v-else-if="near"
        class="rounded-full bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-500"
      >
        {{ formatMoney(remaining) }} left
      </span>
      <span v-else class="font-semibold text-brand-600 dark:text-brand-400">
        {{ formatMoney(remaining) }} left
      </span>
    </div>
  </div>
</template>
