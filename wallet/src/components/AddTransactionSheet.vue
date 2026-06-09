<script setup lang="ts">
// Global Add-Transaction bottom sheet. Driven by the UI store so the FAB on any
// screen can open it. Builds a Transaction and hands it to the wallet store.
import { computed, reactive, ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import CategoryCard from "@/components/cards/CategoryCard.vue";
import Icon from "@/components/ui/Icon.vue";
import { useUiStore } from "@/stores/useUiStore";
import { useWalletStore } from "@/stores/useWalletStore";
import { useFormat } from "@/composables/useFormat";
import type { PaymentMethod, TransactionType } from "@/types";

const ui = useUiStore();
const store = useWalletStore();
const { currencySymbol } = useFormat();

const types: { key: TransactionType; label: string; icon: string }[] = [
  { key: "expense", label: "Expense", icon: "arrow-up" },
  { key: "income", label: "Income", icon: "arrow-down" },
  { key: "transfer", label: "Transfer", icon: "transfer" },
];
const methods: { key: PaymentMethod; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "card", label: "Card" },
  { key: "upi", label: "UPI" },
  { key: "bank", label: "Bank" },
  { key: "wallet", label: "Wallet" },
];

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  type: "expense" as TransactionType,
  amount: "",
  categoryId: "" as string,
  walletId: "cash",
  toWalletId: "bank",
  date: today,
  paymentMethod: "card" as PaymentMethod,
  note: "",
  tags: [] as string[],
  receipt: null as string | null,
});

const tagInput = ref("");
const saving = ref(false);

// Categories filtered to match the chosen direction.
const visibleCategories = computed(() =>
  store.categories.filter((c) =>
    form.type === "income" ? c.kind === "income" : c.kind === "expense",
  ),
);

const canSave = computed(() => {
  const amt = parseFloat(form.amount);
  if (!amt || amt <= 0) return false;
  if (form.type === "transfer") return form.walletId !== form.toWalletId;
  return !!form.categoryId;
});

// Reset the form each time the sheet opens.
watch(
  () => ui.addSheetOpen,
  (open) => {
    if (open) Object.assign(form, {
      type: "expense", amount: "", categoryId: "", walletId: "cash",
      toWalletId: "bank", date: today, paymentMethod: "card", note: "", tags: [], receipt: null,
    });
  },
);

function addTag() {
  const t = tagInput.value.trim();
  if (t && !form.tags.includes(t)) form.tags.push(t);
  tagInput.value = "";
}
function removeTag(t: string) {
  form.tags = form.tags.filter((x) => x !== t);
}
function attachReceipt() {
  // Mock attachment — a real build would open a file picker / camera.
  form.receipt = `receipt-${Date.now().toString(36)}.jpg`;
}

async function save() {
  if (!canSave.value || saving.value) return;
  saving.value = true;
  try {
    await store.addTransaction({
      type: form.type,
      amount: parseFloat(form.amount),
      categoryId: form.type === "transfer" ? null : form.categoryId,
      walletId: form.walletId,
      toWalletId: form.type === "transfer" ? form.toWalletId : null,
      date: new Date(`${form.date}T${new Date().toTimeString().slice(0, 8)}`).toISOString(),
      note: form.note,
      paymentMethod: form.paymentMethod,
      tags: form.tags,
      receipt: form.receipt,
    });
    ui.closeAddSheet();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BottomSheet :open="ui.addSheetOpen" title="Add Transaction" @close="ui.closeAddSheet()">
    <!-- Type selector -->
    <div class="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-ink-800">
      <button
        v-for="t in types"
        :key="t.key"
        type="button"
        class="tap flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all"
        :class="
          form.type === t.key
            ? 'bg-white text-brand-600 shadow-sm dark:bg-ink-700 dark:text-brand-400'
            : 'text-slate-500'
        "
        @click="form.type = t.key; form.categoryId = ''"
      >
        <Icon :name="t.icon" :size="15" /> {{ t.label }}
      </button>
    </div>

    <!-- Amount -->
    <div class="my-6 text-center">
      <p class="text-xs font-medium text-slate-400">Amount</p>
      <div class="mt-1 flex items-center justify-center gap-1">
        <span class="text-3xl font-bold text-slate-400">{{ currencySymbol }}</span>
        <input
          v-model="form.amount"
          type="number"
          inputmode="decimal"
          placeholder="0"
          class="w-44 bg-transparent text-center text-5xl font-extrabold tracking-tight outline-none placeholder:text-slate-300 dark:placeholder:text-ink-600"
        />
      </div>
    </div>

    <!-- Category (not for transfers) -->
    <div v-if="form.type !== 'transfer'" class="mb-5">
      <p class="mb-2 text-sm font-semibold">Category</p>
      <div class="grid grid-cols-4 gap-2">
        <CategoryCard
          v-for="c in visibleCategories"
          :key="c.id"
          :category="c"
          selectable
          :selected="form.categoryId === c.id"
          @click="form.categoryId = c.id"
        />
      </div>
    </div>

    <!-- Wallet / transfer wallets -->
    <div class="mb-5 space-y-3">
      <div>
        <p class="mb-1.5 text-sm font-semibold">{{ form.type === "transfer" ? "From wallet" : "Wallet" }}</p>
        <select v-model="form.walletId" class="pw-input">
          <option v-for="w in store.wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>
      <div v-if="form.type === 'transfer'">
        <p class="mb-1.5 text-sm font-semibold">To wallet</p>
        <select v-model="form.toWalletId" class="pw-input">
          <option v-for="w in store.wallets" :key="w.id" :value="w.id" :disabled="w.id === form.walletId">
            {{ w.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Date + payment method -->
    <div class="mb-5 grid grid-cols-2 gap-3">
      <div>
        <p class="mb-1.5 text-sm font-semibold">Date</p>
        <input v-model="form.date" type="date" class="pw-input" />
      </div>
      <div v-if="form.type !== 'transfer'">
        <p class="mb-1.5 text-sm font-semibold">Payment</p>
        <select v-model="form.paymentMethod" class="pw-input">
          <option v-for="m in methods" :key="m.key" :value="m.key">{{ m.label }}</option>
        </select>
      </div>
    </div>

    <!-- Notes -->
    <div class="mb-5">
      <p class="mb-1.5 text-sm font-semibold">Notes</p>
      <textarea v-model="form.note" rows="2" placeholder="Add a note…" class="pw-input resize-none" />
    </div>

    <!-- Tags -->
    <div class="mb-5">
      <p class="mb-1.5 text-sm font-semibold">Tags</p>
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-for="t in form.tags"
          :key="t"
          class="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400"
        >
          {{ t }}
          <button type="button" aria-label="Remove tag" @click="removeTag(t)"><Icon name="x" :size="12" /></button>
        </span>
        <input
          v-model="tagInput"
          placeholder="Add tag…"
          class="min-w-[6rem] flex-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs outline-none dark:bg-ink-800"
          @keydown.enter.prevent="addTag"
        />
      </div>
    </div>

    <!-- Receipt -->
    <button
      type="button"
      class="tap mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-500 dark:border-ink-600"
      @click="attachReceipt"
    >
      <Icon name="paperclip" :size="17" />
      {{ form.receipt ? form.receipt : "Attach receipt" }}
    </button>

    <!-- Save -->
    <button
      type="button"
      class="tap sticky bottom-2 mb-2 w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 text-base font-bold text-white shadow-glow disabled:opacity-40"
      :disabled="!canSave || saving"
      @click="save"
    >
      {{ saving ? "Saving…" : "Save Transaction" }}
    </button>
  </BottomSheet>
</template>

<style scoped>
.pw-input {
  @apply w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-ink-800;
}
</style>
