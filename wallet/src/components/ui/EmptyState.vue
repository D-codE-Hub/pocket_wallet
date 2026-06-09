<script setup lang="ts">
// Friendly empty state with an icon bubble, copy, and an optional CTA.
import Icon from "./Icon.vue";

withDefaults(
  defineProps<{ icon?: string; title: string; message?: string; cta?: string }>(),
  { icon: "inbox" },
);
defineEmits<{ (e: "cta"): void }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center px-8 py-14 text-center animate-fade-in">
    <div
      class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-accent-100 text-brand-600 dark:from-ink-700 dark:to-ink-750 dark:text-brand-400"
    >
      <Icon :name="icon" :size="34" :stroke-width="1.8" />
    </div>
    <h3 class="text-base font-bold text-slate-700 dark:text-slate-200">{{ title }}</h3>
    <p v-if="message" class="mt-1 max-w-[16rem] text-sm text-slate-400">{{ message }}</p>
    <button
      v-if="cta"
      type="button"
      class="tap mt-5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
      @click="$emit('cta')"
    >
      {{ cta }}
    </button>
  </div>
</template>
