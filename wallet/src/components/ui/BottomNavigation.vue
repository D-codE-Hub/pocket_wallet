<script setup lang="ts">
// Thumb-friendly bottom tab bar with a center notch for the FAB.
import { useRoute } from "vue-router";
import Icon from "./Icon.vue";

const route = useRoute();

const tabs = [
  { tab: "dashboard", to: "/", label: "Home", icon: "home" },
  { tab: "transactions", to: "/transactions", label: "Activity", icon: "receipt" },
  { tab: "budget", to: "/budget", label: "Budget", icon: "wallet" },
  { tab: "analytics", to: "/analytics", label: "Stats", icon: "bar-chart" },
  { tab: "profile", to: "/profile", label: "Profile", icon: "user" },
];
</script>

<template>
  <nav
    class="glass fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch justify-around border-t border-slate-200/70 px-2 pb-safe pt-1.5 dark:border-white/5"
    aria-label="Primary"
  >
    <RouterLink
      v-for="t in tabs"
      :key="t.tab"
      :to="t.to"
      class="tap group relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5"
      :aria-current="route.meta.tab === t.tab ? 'page' : undefined"
    >
      <span
        class="flex h-8 w-12 items-center justify-center rounded-full transition-all duration-300"
        :class="
          route.meta.tab === t.tab
            ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
            : 'text-slate-400 group-active:text-slate-600 dark:text-slate-500'
        "
      >
        <Icon :name="t.icon" :size="22" :stroke-width="route.meta.tab === t.tab ? 2.4 : 2" />
      </span>
      <span
        class="text-[10px] font-semibold tracking-wide transition-colors"
        :class="
          route.meta.tab === t.tab
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-slate-400 dark:text-slate-500'
        "
        >{{ t.label }}</span
      >
    </RouterLink>
  </nav>
</template>
