<script setup lang="ts">
// Shimmering placeholder block. Use `rounded`/`class` to shape it, or set
// `lines` to render a stack of text-line skeletons.
withDefaults(defineProps<{ lines?: number; class?: string }>(), { lines: 0 });
</script>

<template>
  <div v-if="lines > 0" class="space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      class="shimmer h-3.5 rounded-full"
      :class="i === lines && lines > 1 ? 'w-2/3' : 'w-full'"
    />
  </div>
  <div v-else class="shimmer rounded-2xl" :class="$props.class" />
</template>
