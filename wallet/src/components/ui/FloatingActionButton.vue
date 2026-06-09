<script setup lang="ts">
// Floating "Add" button that sits above the bottom nav and opens the global
// Add-Transaction sheet.
import Icon from "./Icon.vue";
import { useUiStore } from "@/stores/useUiStore";

const ui = useUiStore();
</script>

<template>
  <button
    type="button"
    class="tap fixed bottom-[4.6rem] left-1/2 z-40 h-14 w-14 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow ring-4 ring-white dark:ring-ink-900"
    aria-label="Add transaction"
    @click="ui.openAddSheet()"
  >
    <Icon name="plus" :size="26" :stroke-width="2.6" class="mx-auto" />
  </button>
</template>
