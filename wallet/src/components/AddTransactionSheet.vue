<script setup lang="ts">
// Global Add-Transaction bottom sheet. Driven by the UI store so the FAB on any
// screen can open it. Builds a Transaction and hands it to the wallet store.
import { computed, nextTick, reactive, ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import CategoryCard from "@/components/cards/CategoryCard.vue";
import Icon from "@/components/ui/Icon.vue";
import { useUiStore } from "@/stores/useUiStore";
import { useWalletStore } from "@/stores/useWalletStore";
import { useFormat } from "@/composables/useFormat";
import type { PaymentMethod, TransactionType, WalletType } from "@/types";

const ui = useUiStore();
const store = useWalletStore();
const { currencySymbol } = useFormat();

const types: { key: TransactionType; label: string; icon: string }[] = [
  { key: "expense", label: "Expense", icon: "arrow-up" },
  { key: "income", label: "Income", icon: "arrow-down" },
  { key: "transfer", label: "Transfer", icon: "transfer" },
];
const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank: "Bank",
  wallet: "Wallet",
};

// Payment method is derived from the chosen wallet's type — not entered by hand.
const WALLET_TO_PAYMENT: Record<WalletType, PaymentMethod> = {
  cash: "cash",
  bank: "bank",
  credit: "card",
  ewallet: "wallet",
};

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  type: "expense" as TransactionType,
  amount: "",
  categoryId: "" as string,
  walletId: "cash",
  toWalletId: "bank",
  date: today,
  note: "",
  tags: [] as string[],
  receipt: null as string | null,
});

// Auto payment method from the selected wallet's type.
const paymentMethod = computed<PaymentMethod>(() => {
  const w = store.walletMap[form.walletId];
  return w ? WALLET_TO_PAYMENT[w.type] : "cash";
});
const paymentLabel = computed(() => PAYMENT_LABEL[paymentMethod.value]);

const tagInput = ref("");
const saving = ref(false);
const amountInput = ref<HTMLInputElement | null>(null);
// Count + flash for the "Save & add another" batch flow.
const addedCount = ref(0);
const justAdded = ref(false);

// True when the sheet was opened to edit an existing transaction.
const isEdit = computed(() => !!ui.editingTransaction);

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

/** ISO date-time → local YYYY-MM-DD (avoids a UTC day-shift). */
function localDate(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function resetForm() {
  const preferred = store.defaultWalletId || store.wallets[0]?.id || "";
  const second = store.wallets.find((w) => w.id !== preferred)?.id ?? preferred;
  Object.assign(form, {
    type: "expense", amount: "", categoryId: "", walletId: preferred,
    toWalletId: second, date: today, note: "", tags: [], receipt: null,
  });
}

function prefillFrom(tx: NonNullable<typeof ui.editingTransaction>) {
  Object.assign(form, {
    type: tx.type,
    amount: String(tx.amount),
    categoryId: tx.categoryId ?? "",
    walletId: tx.walletId,
    toWalletId: tx.toWalletId ?? store.wallets.find((w) => w.id !== tx.walletId)?.id ?? "",
    date: localDate(tx.date),
    note: tx.note ?? "",
    tags: [...(tx.tags ?? [])],
    receipt: tx.receipt ?? null,
  });
}

// Populate the form each time the sheet opens — prefilled in edit mode.
watch(
  () => ui.addSheetOpen,
  (open) => {
    if (!open) return;
    addedCount.value = 0;
    if (ui.editingTransaction) {
      prefillFrom(ui.editingTransaction);
    } else {
      resetForm();
      if (ui.addPresetType) form.type = ui.addPresetType;
    }
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

async function save(addAnother = false) {
  if (!canSave.value || saving.value) return;
  saving.value = true;

  // Keep the original time on edit; stamp the current time on a new entry.
  const baseTime = ui.editingTransaction ? new Date(ui.editingTransaction.date) : new Date();
  const payload = {
    type: form.type,
    amount: parseFloat(form.amount),
    categoryId: form.type === "transfer" ? null : form.categoryId,
    walletId: form.walletId,
    toWalletId: form.type === "transfer" ? form.toWalletId : null,
    date: new Date(`${form.date}T${baseTime.toTimeString().slice(0, 8)}`).toISOString(),
    note: form.note,
    paymentMethod: form.type === "transfer" ? undefined : paymentMethod.value,
    tags: form.tags,
    receipt: form.receipt,
  };

  try {
    if (ui.editingTransaction) {
      await store.updateTransaction(ui.editingTransaction.id, payload);
    } else {
      await store.addTransaction(payload);
    }

    if (addAnother && !ui.editingTransaction) {
      // Keep type / wallet / date / category for fast repeat entry; clear the
      // bits that change each time and refocus the amount.
      addedCount.value += 1;
      form.amount = "";
      form.note = "";
      form.tags = [];
      form.receipt = null;
      justAdded.value = true;
      setTimeout(() => (justAdded.value = false), 1400);
      await nextTick();
      amountInput.value?.focus();
    } else {
      ui.closeAddSheet();
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BottomSheet
    :open="ui.addSheetOpen"
    :title="isEdit ? 'Edit Transaction' : 'Add Transaction'"
    @close="ui.closeAddSheet()"
  >
    <!-- Type selector (locked when editing — type can't change after creation) -->
    <div class="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-ink-800">
      <button
        v-for="t in types"
        :key="t.key"
        type="button"
        :disabled="isEdit"
        class="tap flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed"
        :class="[
          form.type === t.key
            ? 'bg-white text-brand-600 shadow-sm dark:bg-ink-700 dark:text-brand-400'
            : 'text-slate-500',
          isEdit && form.type !== t.key ? 'opacity-40' : '',
        ]"
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
          ref="amountInput"
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
      <!-- Show ~2 rows; the rest scroll within this area. -->
      <div class="grid max-h-52 grid-cols-4 gap-2 overflow-y-auto pr-1">
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
      <div class="min-w-0">
        <p class="mb-1.5 text-sm font-semibold">Date</p>
        <input v-model="form.date" type="date" class="pw-input appearance-none" />
      </div>
      <div v-if="form.type !== 'transfer'" class="min-w-0">
        <p class="mb-1.5 text-sm font-semibold">Payment</p>
        <div class="pw-input flex items-center justify-between gap-2 text-slate-500">
          <span class="truncate">{{ paymentLabel }}</span>
          <span
            class="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500 dark:bg-ink-700"
            >Auto</span
          >
        </div>
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

    <!-- "Added" flash + running count for batch entry -->
    <p
      v-if="!isEdit && (justAdded || addedCount)"
      class="mb-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400"
    >
      <Icon v-if="justAdded" name="check" :size="16" />
      <span>{{ addedCount }} added this session</span>
    </p>

    <!-- Save -->
    <div class="sticky bottom-2 mb-2 space-y-2">
      <button
        v-if="!isEdit"
        type="button"
        class="tap w-full rounded-2xl border-2 border-brand-500 py-3 text-sm font-bold text-brand-600 disabled:opacity-40 dark:text-brand-400"
        :disabled="!canSave || saving"
        @click="save(true)"
      >
        Save &amp; add another
      </button>
      <button
        type="button"
        class="tap w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 text-base font-bold text-white shadow-glow disabled:opacity-40"
        :disabled="!canSave || saving"
        @click="save(false)"
      >
        {{
          saving
            ? isEdit
              ? "Updating…"
              : "Saving…"
            : isEdit
              ? "Update Transaction"
              : addedCount
                ? "Save & close"
                : "Save Transaction"
        }}
      </button>
    </div>
  </BottomSheet>
</template>

<style scoped>
.pw-input {
  @apply w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-ink-800;
}
</style>
