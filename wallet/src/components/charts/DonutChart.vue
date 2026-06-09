<script setup lang="ts">
// Pure-SVG donut chart with a centered total. Slices are drawn as stroked
// circle segments via stroke-dasharray so there are no path-math surprises.
import { computed } from "vue";

interface Slice {
  label: string;
  value: number;
  color: string;
}

const props = withDefaults(
  defineProps<{ data: Slice[]; size?: number; thickness?: number; centerLabel?: string; centerValue?: string }>(),
  { size: 180, thickness: 22 },
);

const radius = computed(() => (props.size - props.thickness) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const total = computed(() => props.data.reduce((s, d) => s + d.value, 0) || 1);

// Pre-compute each slice's dash length + rotation offset.
const segments = computed(() => {
  let acc = 0;
  return props.data.map((d) => {
    const frac = d.value / total.value;
    const seg = {
      ...d,
      dash: frac * circumference.value,
      gap: circumference.value - frac * circumference.value,
      offset: -acc * circumference.value,
    };
    acc += frac;
    return seg;
  });
});
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="-rotate-90">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="thickness"
        class="stroke-slate-100 dark:stroke-ink-700"
      />
      <circle
        v-for="(s, i) in segments"
        :key="i"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="s.color"
        :stroke-width="thickness"
        stroke-linecap="round"
        :stroke-dasharray="`${Math.max(s.dash - 2, 0)} ${s.gap + 2}`"
        :stroke-dashoffset="s.offset"
        class="transition-all duration-700 ease-out"
      />
    </svg>
    <div class="absolute flex flex-col items-center">
      <span v-if="centerValue" class="text-xl font-extrabold tracking-tight">{{ centerValue }}</span>
      <span v-if="centerLabel" class="text-[11px] font-medium text-slate-400">{{ centerLabel }}</span>
    </div>
  </div>
</template>
