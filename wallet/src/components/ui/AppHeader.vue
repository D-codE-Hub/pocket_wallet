<script setup lang="ts">
// Reusable screen header. Optional back button, subtitle, and a right-hand
// actions slot. Sticky so it stays put while the page scrolls.
import Icon from "./Icon.vue";
import { useRouter } from "vue-router";

withDefaults(
  defineProps<{ title: string; subtitle?: string; back?: boolean }>(),
  { back: false },
);

const router = useRouter();
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center gap-3 bg-slate-50/80 px-5 pb-3 pt-safe backdrop-blur-xl dark:bg-ink-900/80"
  >
    <button
      v-if="back"
      type="button"
      class="tap -ml-1 h-9 w-9 rounded-full text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-white/5"
      aria-label="Go back"
      @click="router.back()"
    >
      <Icon name="chevron-left" :size="22" class="mx-auto" />
    </button>

    <div class="min-w-0 flex-1">
      <h1 class="truncate text-xl font-extrabold tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="truncate text-xs font-medium text-slate-400">
        {{ subtitle }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-1.5">
      <slot name="actions" />
    </div>
  </header>
</template>
