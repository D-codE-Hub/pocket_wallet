<script setup lang="ts">
import Icon from "./Icon.vue";

withDefaults(defineProps<{ modelValue: string; placeholder?: string }>(), {
  placeholder: "Search…",
});
defineEmits<{ (e: "update:modelValue", v: string): void }>();
</script>

<template>
  <div
    class="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-slate-100 focus-within:ring-2 focus-within:ring-brand-400 dark:bg-ink-800 dark:ring-white/5"
  >
    <Icon name="search" :size="19" class="shrink-0 text-slate-400" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      type="search"
      class="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      type="button"
      class="tap text-slate-400"
      aria-label="Clear search"
      @click="$emit('update:modelValue', '')"
    >
      <Icon name="x" :size="17" />
    </button>
  </div>
</template>
