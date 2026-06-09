<script setup lang="ts">
// Hero total-balance card with a soft emerald→blue gradient, decorative blobs,
// and three inline stats (income / expense / savings).
import Icon from "@/components/ui/Icon.vue";
import { useFormat } from "@/composables/useFormat";

defineProps<{
  balance: number;
  income: number;
  expense: number;
  savings: number;
}>();

const { formatMoney } = useFormat();
</script>

<template>
  <div
    class="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 p-6 text-white shadow-glow animate-scale-in"
  >
    <!-- decorative blobs -->
    <div class="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
    <div class="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-accent-300/20 blur-2xl" />

    <div class="relative">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-white/80">Total Balance</p>
        <span class="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
          <Icon name="wallet" :size="14" /> All wallets
        </span>
      </div>

      <p class="mt-1.5 text-4xl font-extrabold tracking-tight animate-count-pop">
        {{ formatMoney(balance) }}
      </p>

      <div class="mt-6 grid grid-cols-3 gap-2">
        <div class="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <div class="flex items-center gap-1 text-[11px] font-medium text-white/75">
            <Icon name="arrow-down" :size="13" /> Income
          </div>
          <p class="mt-1 text-sm font-bold">{{ formatMoney(income) }}</p>
        </div>
        <div class="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <div class="flex items-center gap-1 text-[11px] font-medium text-white/75">
            <Icon name="arrow-up" :size="13" /> Expense
          </div>
          <p class="mt-1 text-sm font-bold">{{ formatMoney(expense) }}</p>
        </div>
        <div class="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <div class="flex items-center gap-1 text-[11px] font-medium text-white/75">
            <Icon name="trending-up" :size="13" /> Savings
          </div>
          <p class="mt-1 text-sm font-bold">{{ formatMoney(savings) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
