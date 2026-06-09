<script setup lang="ts">
// Rounded progress bar that shifts colour as it fills (green → amber → red),
// or honours an explicit `color`. Width animates on value change.
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ value: number; max?: number; color?: string; height?: number }>(),
  { max: 100, height: 8 },
);

const pct = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)));

const barColor = computed(() => {
  if (props.color) return props.color;
  if (pct.value >= 100) return "#ef4444";
  if (pct.value >= 80) return "#f59e0b";
  return "#10b981";
});
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-ink-700"
    :style="{ height: `${height}px` }"
    role="progressbar"
    :aria-valuenow="Math.round(pct)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="h-full rounded-full transition-[width] duration-700 ease-out"
      :style="{ width: `${pct}%`, backgroundColor: barColor }"
    />
  </div>
</template>
