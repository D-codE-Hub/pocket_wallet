<script setup lang="ts">
// Wallet management: list the user's wallets (owned + shared-with-me), add/edit
// wallets, choose the default wallet, and share owned wallets with other users.
import { computed, reactive, ref } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import Icon from "@/components/ui/Icon.vue";
import { useWalletStore } from "@/stores/useWalletStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFormat } from "@/composables/useFormat";
import { walletService } from "@/services/walletService";
import type { ShareableUser, Wallet } from "@/types";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const store = useWalletStore();
const auth = useAuthStore();
const { formatMoney } = useFormat();

const isOwner = (w: Wallet) => !w.owner || w.owner === auth.user;

// Backend wallet_type values + their frontend icon + label.
const WALLET_TYPES = [
  { value: "Cash", icon: "wallet" },
  { value: "Bank Account", icon: "bank" },
  { value: "Credit Card", icon: "credit-card" },
  { value: "E-Wallet", icon: "smartphone" },
];
const FE_TO_BE: Record<Wallet["type"], string> = {
  cash: "Cash",
  bank: "Bank Account",
  credit: "Credit Card",
  ewallet: "E-Wallet",
};
const COLORS = ["#10b981", "#2563eb", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#64748b"];

// --- wallet add / edit form ------------------------------------------------
const formOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const formError = ref("");
const form = reactive({
  account_name: "",
  wallet_type: "Cash",
  color: COLORS[0],
  balance: "0",
  is_default: false,
});

const formIcon = computed(
  () => WALLET_TYPES.find((t) => t.value === form.wallet_type)?.icon ?? "wallet",
);
const canSaveForm = computed(() => form.account_name.trim().length > 0);

function openAdd() {
  editingId.value = null;
  formError.value = "";
  Object.assign(form, {
    account_name: "",
    wallet_type: "Cash",
    color: COLORS[0],
    balance: "0",
    is_default: store.wallets.length === 0,
  });
  formOpen.value = true;
}

function openEdit(w: Wallet) {
  editingId.value = w.id;
  formError.value = "";
  Object.assign(form, {
    account_name: w.name,
    wallet_type: FE_TO_BE[w.type],
    color: w.color,
    balance: String(w.balance),
    is_default: !!w.isDefault,
  });
  formOpen.value = true;
}

async function saveWallet() {
  if (!canSaveForm.value || saving.value) return;
  saving.value = true;
  formError.value = "";
  try {
    await store.saveWallet({
      name: editingId.value ?? undefined,
      account_name: form.account_name.trim(),
      wallet_type: form.wallet_type,
      color: form.color,
      icon: formIcon.value,
      account_balance: parseFloat(form.balance) || 0,
      is_default: form.is_default,
    });
    formOpen.value = false;
  } catch (e: any) {
    formError.value = e?.messages?.[0] || "Failed to save wallet";
  } finally {
    saving.value = false;
  }
}

async function makeDefault(w: Wallet) {
  if (w.isDefault) return;
  await store.setDefaultWallet(w.id);
}

// --- share sub-sheet -------------------------------------------------------
const shareTarget = ref<Wallet | null>(null);
const sharedUsers = ref<string[]>([]);
const search = ref("");
const results = ref<ShareableUser[]>([]);
const busy = ref(false);
const shareError = ref("");

async function openShare(w: Wallet) {
  shareTarget.value = w;
  shareError.value = "";
  search.value = "";
  results.value = [];
  sharedUsers.value = [];
  try {
    const s = await walletService.getWalletShares(w.id);
    sharedUsers.value = s.shared_with;
    results.value = await walletService.getShareableUsers("");
  } catch (e: any) {
    shareError.value = e?.messages?.[0] || "Failed to load sharing info";
  }
}

let searchTimer: ReturnType<typeof setTimeout>;
function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    results.value = await walletService.getShareableUsers(search.value.trim());
  }, 250);
}

async function addUser(u: ShareableUser) {
  if (!shareTarget.value || busy.value) return;
  busy.value = true;
  shareError.value = "";
  try {
    const s = await walletService.shareWallet(shareTarget.value.id, u.name);
    sharedUsers.value = s.shared_with;
    search.value = "";
  } catch (e: any) {
    shareError.value = e?.messages?.[0] || "Failed to share wallet";
  } finally {
    busy.value = false;
  }
}

async function removeUser(user: string) {
  if (!shareTarget.value || busy.value) return;
  busy.value = true;
  shareError.value = "";
  try {
    const s = await walletService.unshareWallet(shareTarget.value.id, user);
    sharedUsers.value = s.shared_with;
  } catch (e: any) {
    shareError.value = e?.messages?.[0] || "Failed to update sharing";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <BottomSheet :open="open" title="My Wallets" @close="emit('close')">
    <!-- Add wallet -->
    <button
      class="tap mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-brand-600 dark:border-ink-600 dark:text-brand-400"
      @click="openAdd"
    >
      <Icon name="plus" :size="18" /> Add wallet
    </button>

    <div class="space-y-2.5 pb-3">
      <div
        v-for="w in store.wallets"
        :key="w.id"
        class="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-ink-800"
      >
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
          :style="{ backgroundColor: w.color }"
        >
          <Icon :name="w.icon" :size="20" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-1.5 truncate text-sm font-bold">
            {{ w.name }}
            <span
              v-if="w.isDefault"
              class="rounded-full bg-brand-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-600 dark:text-brand-400"
              >Default</span
            >
          </p>
          <p class="truncate text-xs text-slate-400">{{ formatMoney(w.balance) }}</p>
        </div>

        <!-- Owner controls -->
        <div v-if="isOwner(w)" class="flex shrink-0 items-center gap-1">
          <button
            class="tap h-8 w-8 rounded-full"
            :class="w.isDefault ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'"
            :aria-label="w.isDefault ? 'Default wallet' : 'Set as default'"
            @click="makeDefault(w)"
          >
            <Icon name="target" :size="18" class="mx-auto" />
          </button>
          <button
            class="tap h-8 w-8 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5"
            aria-label="Edit wallet"
            @click="openEdit(w)"
          >
            <Icon name="pencil" :size="16" class="mx-auto" />
          </button>
          <button
            class="tap h-8 w-8 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5"
            aria-label="Share wallet"
            @click="openShare(w)"
          >
            <Icon name="user" :size="16" class="mx-auto" />
          </button>
        </div>
        <span
          v-else
          class="shrink-0 rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-bold text-accent-600 dark:text-accent-400"
          >Shared</span
        >
      </div>

      <p v-if="!store.wallets.length" class="py-6 text-center text-sm text-slate-400">
        No wallets yet — add one above.
      </p>
    </div>

    <!-- Add / edit wallet sub-sheet -->
    <BottomSheet
      :open="formOpen"
      :title="editingId ? 'Edit wallet' : 'Add wallet'"
      @close="formOpen = false"
    >
      <p class="mb-1.5 text-sm font-semibold">Name</p>
      <input v-model="form.account_name" placeholder="e.g. Savings" class="pw-field mb-4" />

      <p class="mb-1.5 text-sm font-semibold">Type</p>
      <div class="mb-4 grid grid-cols-2 gap-2">
        <button
          v-for="t in WALLET_TYPES"
          :key="t.value"
          type="button"
          class="tap flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all"
          :class="
            form.wallet_type === t.value
              ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
              : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'
          "
          @click="form.wallet_type = t.value"
        >
          <Icon :name="t.icon" :size="17" /> {{ t.value }}
        </button>
      </div>

      <p class="mb-1.5 text-sm font-semibold">Color</p>
      <div class="mb-4 flex flex-wrap gap-2.5">
        <button
          v-for="c in COLORS"
          :key="c"
          type="button"
          class="tap h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-ink-850"
          :style="{ backgroundColor: c }"
          :class="form.color === c ? 'ring-slate-400' : 'ring-transparent'"
          :aria-label="`Color ${c}`"
          @click="form.color = c"
        />
      </div>

      <p class="mb-1.5 text-sm font-semibold">{{ editingId ? "Balance" : "Opening balance" }}</p>
      <input v-model="form.balance" type="number" inputmode="decimal" class="pw-field mb-4" />

      <label class="mb-5 flex items-center justify-between">
        <span class="text-sm font-semibold">Set as default wallet</span>
        <button
          type="button"
          class="relative h-7 w-12 rounded-full transition-colors"
          :class="form.is_default ? 'bg-brand-500' : 'bg-slate-300 dark:bg-ink-600'"
          role="switch"
          :aria-checked="form.is_default"
          @click="form.is_default = !form.is_default"
        >
          <span
            class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all"
            :class="form.is_default ? 'left-6' : 'left-1'"
          />
        </button>
      </label>

      <p v-if="formError" class="mb-2 text-sm font-medium text-red-500">{{ formError }}</p>

      <button
        class="tap mb-2 w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 font-bold text-white shadow-glow disabled:opacity-40"
        :disabled="!canSaveForm || saving"
        @click="saveWallet"
      >
        {{ saving ? "Saving…" : editingId ? "Save changes" : "Create wallet" }}
      </button>
    </BottomSheet>

    <!-- Share sub-sheet -->
    <BottomSheet
      :open="!!shareTarget"
      :title="`Share ${shareTarget?.name ?? ''}`"
      @close="shareTarget = null"
    >
      <p class="mb-2 text-xs font-medium text-slate-400">
        People you share this wallet with can view and add transactions on it.
      </p>

      <div v-if="sharedUsers.length" class="mb-4 space-y-2">
        <p class="text-sm font-semibold">Shared with</p>
        <div
          v-for="u in sharedUsers"
          :key="u"
          class="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-ink-800"
        >
          <Icon name="user" :size="16" class="text-slate-400" />
          <span class="flex-1 truncate text-sm font-medium">{{ u }}</span>
          <button class="tap text-red-500" aria-label="Remove access" :disabled="busy" @click="removeUser(u)">
            <Icon name="x" :size="16" />
          </button>
        </div>
      </div>

      <p class="mb-1.5 text-sm font-semibold">Add a person</p>
      <div class="mb-2 flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2.5 dark:bg-ink-800">
        <Icon name="search" :size="17" class="text-slate-400" />
        <input
          v-model="search"
          placeholder="Search users…"
          class="min-w-0 flex-1 bg-transparent text-sm outline-none"
          @input="onSearch"
        />
      </div>

      <p v-if="shareError" class="mb-2 text-sm font-medium text-red-500">{{ shareError }}</p>

      <div class="max-h-56 space-y-1 overflow-y-auto pb-3">
        <button
          v-for="u in results.filter((r) => !sharedUsers.includes(r.name))"
          :key="u.name"
          class="tap flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5"
          :disabled="busy"
          @click="addUser(u)"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/15 text-xs font-bold text-brand-600 dark:text-brand-400"
            >{{ (u.full_name || u.name).slice(0, 1).toUpperCase() }}</span
          >
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold">{{ u.full_name || u.name }}</span>
            <span class="block truncate text-xs text-slate-400">{{ u.name }}</span>
          </span>
          <Icon name="plus" :size="16" class="text-brand-500" />
        </button>
        <p
          v-if="!results.filter((r) => !sharedUsers.includes(r.name)).length"
          class="py-4 text-center text-xs text-slate-400"
        >
          No users found.
        </p>
      </div>
    </BottomSheet>
  </BottomSheet>
</template>

<style scoped>
.pw-field {
  @apply w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-ink-800;
}
</style>
