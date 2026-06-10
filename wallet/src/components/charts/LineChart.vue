<script setup lang="ts">
// Smooth area + line chart (pure SVG). Takes a list of {label,value} points and
// renders a gradient-filled trend. Responsive via a fixed viewBox.
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ points: { label: string; value: number }[]; color?: string; height?: number }>(),
  { color: "#10b981", height: 160 },
);

const W = 320;
const H = computed(() => props.height);
const PAD = 8;

const max = computed(() => Math.max(...props.points.map((p) => p.value), 1));
const min = computed(() => Math.min(...props.points.map((p) => p.value), 0));

const coords = computed(() => {
  const n = props.points.length;
  const span = max.value - min.value || 1;
  return props.points.map((p, i) => {
    const x = n === 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (p.value - min.value) / span) * (H.value - PAD * 2);
    return { x, y };
  });
});

// Catmull-Rom → cubic bézier for a smooth curve.
const linePath = computed(() => {
  const pts = coords.value;
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
});

const areaPath = computed(() =>
  linePath.value
    ? `${linePath.value} L ${coords.value[coords.value.length - 1].x} ${H.value} L ${coords.value[0].x} ${H.value} Z`
    : "",
);

const gradId = `lg-${Math.random().toString(36).slice(2, 8)}`;
</script>

<template>
  <div class="w-full">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" :style="{ height: `${H}px` }" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.35" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="areaPath" :fill="`url(#${gradId})`" />
      <path :d="linePath" fill="none" :stroke="color" stroke-width="2.5" stroke-linecap="round" />
      <circle
        v-for="(c, i) in coords"
        :key="i"
        :cx="c.x"
        :cy="c.y"
        :r="i === coords.length - 1 ? 3.4 : 2.4"
        :fill="color"
        :vector-effect="'non-scaling-stroke'"
      />
    </svg>
    <div class="mt-1.5 flex justify-between px-1 text-[10px] font-medium text-slate-400">
      <span v-for="(p, i) in points" :key="i" v-show="i % Math.ceil(points.length / 6) === 0">{{
        p.label
      }}</span>
    </div>
  </div>
</template>
