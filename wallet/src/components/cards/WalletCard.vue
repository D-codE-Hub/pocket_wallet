<script setup lang="ts">
// Coloured wallet tile used in the horizontal carousel. Gradient is derived
// from the wallet's own colour so each one is visually distinct.
import Icon from "@/components/ui/Icon.vue";
import { useFormat } from "@/composables/useFormat";
import type { Wallet } from "@/types";

const props = defineProps<{ wallet: Wallet }>();
const { formatMoney } = useFormat();

const typeLabel: Record<Wallet["type"], string> = {
  cash: "Cash",
  bank: "Bank Account",
  credit: "Credit Card",
  ewallet: "E-Wallet",
};
</script>

<template>
  <div
    class="relative h-40 w-64 shrink-0 overflow-hidden rounded-3xl p-5 text-white shadow-card"
    :style="{
      backgroundImage: `linear-gradient(135deg, ${props.wallet.color}, ${props.wallet.color}cc 60%, #0b0f14aa)`,
    }"
  >
    <div class="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-xl" />
    <div class="relative flex h-full flex-col justify-between">
      <div class="flex items-center justify-between">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <Icon :name="wallet.icon" :size="20" />
        </div>
        <span class="text-xs font-semibold text-white/80">{{ typeLabel[wallet.type] }}</span>
      </div>
      <div>
        <p class="text-sm font-medium text-white/80">{{ wallet.name }}</p>
        <p class="text-2xl font-extrabold tracking-tight">{{ formatMoney(wallet.balance) }}</p>
      </div>
    </div>
  </div>
</template>
