<script setup lang="ts">
// A single transaction row with a category bubble, meta line and signed amount.
// Supports an optional swipe-left gesture (touch) to reveal Edit/Delete actions.
import { ref, computed } from "vue";
import Icon from "@/components/ui/Icon.vue";
import { useFormat, formatDate } from "@/composables/useFormat";
import { useWalletStore } from "@/stores/useWalletStore";
import type { Transaction } from "@/types";

const props = withDefaults(
  defineProps<{ tx: Transaction; swipeable?: boolean }>(),
  { swipeable: false },
);
const emit = defineEmits<{ (e: "edit", tx: Transaction): void; (e: "delete", tx: Transaction): void }>();

const store = useWalletStore();
const { formatMoney } = useFormat();

const category = computed(() =>
  props.tx.categoryId ? store.categoryMap[props.tx.categoryId] : undefined,
);

const isTransfer = computed(() => props.tx.type === "transfer");
const isIncome = computed(() => props.tx.type === "income");

const title = computed(() => {
  if (isTransfer.value) {
    const to = props.tx.toWalletId ? store.walletMap[props.tx.toWalletId]?.name : "—";
    return `Transfer to ${to}`;
  }
  return category.value?.name ?? props.tx.note ?? "Transaction";
});

const bubble = computed(() => {
  if (isTransfer.value) return { emoji: "", icon: "transfer", color: "#6366f1" };
  return {
    emoji: category.value?.emoji ?? "📦",
    icon: category.value?.icon ?? "box",
    color: category.value?.color ?? "#64748b",
  };
});

const amountColor = computed(() =>
  isIncome.value
    ? "text-brand-600 dark:text-brand-400"
    : isTransfer.value
      ? "text-accent-600 dark:text-accent-400"
      : "text-slate-800 dark:text-slate-100",
);
const sign = computed(() => (isIncome.value ? "+" : isTransfer.value ? "" : "−"));

const meta = computed(() => {
  const wallet = store.walletMap[props.tx.walletId]?.name ?? "";
  const parts = [formatDate(props.tx.date), wallet];
  if (props.tx.paymentMethod) parts.push(props.tx.paymentMethod.toUpperCase());
  return parts.filter(Boolean).join(" · ");
});

// --- Swipe-to-reveal (touch only) ------------------------------------------
const offset = ref(0);
let startX = 0;
let dragging = false;
const REVEAL = 132;

function onStart(e: TouchEvent) {
  if (!props.swipeable) return;
  startX = e.touches[0].clientX;
  dragging = true;
}
function onMove(e: TouchEvent) {
  if (!dragging) return;
  const dx = e.touches[0].clientX - startX;
  // Only allow leftward drag; clamp.
  offset.value = Math.max(-REVEAL, Math.min(0, (offset.value < 0 ? -REVEAL : 0) + dx));
}
function onEnd() {
  if (!dragging) return;
  dragging = false;
  offset.value = offset.value < -REVEAL / 2 ? -REVEAL : 0;
}
function reset() {
  offset.value = 0;
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl">
    <!-- swipe action layer -->
    <div v-if="swipeable" class="absolute inset-y-0 right-0 flex items-stretch">
      <button
        type="button"
        class="tap flex w-16 items-center justify-center bg-accent-500 text-white"
        aria-label="Edit"
        @click="reset(); emit('edit', tx)"
      >
        <Icon name="pencil" :size="19" />
      </button>
      <button
        type="button"
        class="tap flex w-16 items-center justify-center rounded-r-2xl bg-red-500 text-white"
        aria-label="Delete"
        @click="reset(); emit('delete', tx)"
      >
        <Icon name="trash" :size="19" />
      </button>
    </div>

    <!-- foreground row -->
    <div
      class="relative flex items-center gap-3 bg-white px-3.5 py-3 transition-transform duration-200 dark:bg-ink-800"
      :style="{ transform: `translateX(${offset}px)` }"
      @touchstart.passive="onStart"
      @touchmove.passive="onMove"
      @touchend="onEnd"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
        :style="{ backgroundColor: bubble.color + '22', color: bubble.color }"
      >
        <span v-if="bubble.emoji">{{ bubble.emoji }}</span>
        <Icon v-else :name="bubble.icon" :size="20" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold">{{ title }}</p>
        <p class="truncate text-xs text-slate-400">{{ meta }}</p>
      </div>

      <p class="shrink-0 text-sm font-bold" :class="amountColor">
        {{ sign }}{{ formatMoney(tx.amount) }}
      </p>
    </div>
  </div>
</template>
