<script setup lang="ts">
// Small labelled metric tile (used in quick stats / analytics summaries).
import Icon from "@/components/ui/Icon.vue";

withDefaults(
  defineProps<{ label: string; value: string; icon?: string; tint?: string; delta?: string; up?: boolean }>(),
  { tint: "#10b981" },
);
</script>

<template>
  <div class="card p-4">
    <div class="flex items-center justify-between">
      <span
        class="flex h-9 w-9 items-center justify-center rounded-xl"
        :style="{ backgroundColor: tint + '1f', color: tint }"
      >
        <Icon v-if="icon" :name="icon" :size="18" />
      </span>
      <span
        v-if="delta"
        class="text-xs font-bold"
        :class="up ? 'text-brand-500' : 'text-red-500'"
        >{{ up ? "↑" : "↓" }} {{ delta }}</span
      >
    </div>
    <p class="mt-3 text-xl font-extrabold tracking-tight">{{ value }}</p>
    <p class="text-xs font-medium text-slate-400">{{ label }}</p>
  </div>
</template>
