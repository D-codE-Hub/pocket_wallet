<script setup lang="ts">
// Grouped bar chart for Income vs Expense comparisons. Each group renders two
// rounded bars. Pure CSS/flex — no SVG needed, scales to container width.
import { computed } from "vue";

const props = defineProps<{
  groups: { label: string; income: number; expense: number }[];
}>();

const max = computed(() =>
  Math.max(...props.groups.flatMap((g) => [g.income, g.expense]), 1),
);

function h(v: number): string {
  return `${Math.max((v / max.value) * 100, 2)}%`;
}
</script>

<template>
  <div class="w-full">
    <div class="flex h-44 items-end justify-between gap-2">
      <div v-for="(g, i) in groups" :key="i" class="flex flex-1 flex-col items-center gap-1.5">
        <div class="flex h-full w-full items-end justify-center gap-1">
          <div
            class="w-2.5 rounded-full bg-gradient-to-t from-brand-600 to-brand-400 transition-[height] duration-700 ease-out"
            :style="{ height: h(g.income) }"
            :title="`Income ${g.income}`"
          />
          <div
            class="w-2.5 rounded-full bg-gradient-to-t from-accent-600 to-accent-400 transition-[height] duration-700 ease-out"
            :style="{ height: h(g.expense) }"
            :title="`Expense ${g.expense}`"
          />
        </div>
        <span class="text-[10px] font-medium text-slate-400">{{ g.label }}</span>
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
