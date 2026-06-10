<script setup lang="ts">
// Grouped bar chart for Income vs Expense comparisons. Each group renders two
// rounded bars. Heights are in pixels against a fixed-height plot area —
// percentage heights inside flex items don't resolve reliably across browsers.
import { computed } from "vue";

const props = defineProps<{
  groups: { label: string; income: number; expense: number }[];
}>();

const PLOT = 150; // plot-area height in px

const max = computed(() =>
  Math.max(...props.groups.flatMap((g) => [g.income, g.expense]), 1),
);

function barHeight(v: number): string {
  if (v <= 0) return "0px";
  return `${Math.max((v / max.value) * PLOT, 4)}px`;
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-end justify-between gap-2">
      <div v-for="(g, i) in groups" :key="i" class="flex flex-1 flex-col items-center">
        <div class="flex items-end justify-center gap-1" :style="{ height: `${PLOT}px` }">
          <div
            class="w-2.5 rounded-full bg-gradient-to-t from-brand-600 to-brand-400 transition-[height] duration-700 ease-out"
            :style="{ height: barHeight(g.income) }"
            :title="`Income ${g.income}`"
          />
          <div
            class="w-2.5 rounded-full bg-gradient-to-t from-accent-600 to-accent-400 transition-[height] duration-700 ease-out"
            :style="{ height: barHeight(g.expense) }"
            :title="`Expense ${g.expense}`"
          />
        </div>
        <span class="mt-1.5 text-[10px] font-medium text-slate-400">{{ g.label }}</span>
      </div>
    </div>
    <div class="mt-3 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-500">
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-brand-500" /> Income
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-accent-500" /> Expense
      </span>
    </div>
  </div>
</template>
