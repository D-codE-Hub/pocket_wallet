<script setup lang="ts">
// Compact category tile — used in the category grid and as a selectable chip
// in the Add-Transaction sheet.
import type { Category } from "@/types";

withDefaults(
  defineProps<{ category: Category; selected?: boolean; selectable?: boolean }>(),
  { selected: false, selectable: false },
);
defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button
    type="button"
    class="tap flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all"
    :class="[
      selectable ? 'cursor-pointer' : 'cursor-default',
      selected
        ? 'bg-brand-500/10 ring-2 ring-brand-500'
        : 'bg-white ring-1 ring-slate-100 dark:bg-ink-800 dark:ring-white/5',
    ]"
    @click="$emit('click')"
  >
    <span
      class="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
      :style="{ backgroundColor: category.color + '22' }"
      >{{ category.emoji }}</span
    >
    <span class="text-[11px] font-semibold leading-tight text-slate-600 dark:text-slate-300">{{
      category.name
    }}</span>
  </button>
</template>
