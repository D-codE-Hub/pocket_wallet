<script setup lang="ts">
// Pill toggle used for category/type/date filters. Shows an optional emoji and
// a coloured ring/tint when active.
withDefaults(
  defineProps<{ label: string; active?: boolean; emoji?: string; color?: string }>(),
  { active: false },
);
defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button
    type="button"
    class="tap shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all"
    :class="
      active
        ? 'border-transparent text-white shadow-sm'
        : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-ink-800 dark:text-slate-300'
    "
    :style="active ? { backgroundColor: color || '#10b981' } : {}"
    @click="$emit('click')"
  >
    <span v-if="emoji" class="mr-1">{{ emoji }}</span>{{ label }}
  </button>
</template>
