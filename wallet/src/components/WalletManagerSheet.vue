<script setup lang="ts">
// Wallet management + sharing. Lists the user's wallets (owned + shared-with-me)
// and lets an owner share/unshare a wallet with other users. Shared participants
// see and can post transactions on that wallet.
import { ref } from "vue";
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

const typeLabel: Record<Wallet["type"], string> = {
  cash: "Cash",
  bank: "Bank Account",
  credit: "Credit Card",
  ewallet: "E-Wallet",
};

const isOwner = (w: Wallet) => !w.owner || w.owner === auth.user;

// --- share sub-sheet state -------------------------------------------------
const shareTarget = ref<Wallet | null>(null);
const sharedUsers = ref<string[]>([]);
const search = ref("");
const results = ref<ShareableUser[]>([]);
const busy = ref(false);
const error = ref("");

async function openShare(w: Wallet) {
  shareTarget.value = w;
  error.value = "";
  search.value = "";
  results.value = [];
  sharedUsers.value = [];
  try {
    const s = await walletService.getWalletShares(w.id);
    sharedUsers.value = s.shared_with;
    results.value = await walletService.getShareableUsers("");
  } catch (e: any) {
    error.value = e?.messages?.[0] || "Failed to load sharing info";
  }
}

let searchTimer: ReturnType<typeof setTimeout>;
function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    results.value = await walletService.getShareableUsers(search.value.trim());
  }, 250);
}

async function add(u: ShareableUser) {
  if (!shareTarget.value || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    const s = await walletService.shareWallet(shareTarget.value.id, u.name);
    sharedUsers.value = s.shared_with;
    search.value = "";
  } catch (e: any) {
    error.value = e?.messages?.[0] || "Failed to share wallet";
  } finally {
    busy.value = false;
  }
}

async function remove(user: string) {
  if (!shareTarget.value || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    const s = await walletService.unshareWallet(shareTarget.value.id, user);
    sharedUsers.value = s.shared_with;
  } catch (e: any) {
    error.value = e?.messages?.[0] || "Failed to update sharing";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <BottomSheet :open="open" title="My Wallets" @close="emit('close')">
    <div class="space-y-2.5 pb-3">
      <div
        v-for="w in store.wallets"
        :key="w.id"
        class="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-ink-800"
      >
        <span
          class="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
          :style="{ backgroundColor: w.color }"
        >
          <Icon :name="w.icon" :size="20" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold">{{ w.name }}</p>
          <p class="truncate text-xs text-slate-400">
            {{ typeLabel[w.type] }} · {{ formatMoney(w.balance) }}
          </p>
        </div>
        <span
          v-if="!isOwner(w)"
          class="rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-bold text-accent-600 dark:text-accent-400"
          >Shared</span
        >
        <button
          v-else
          class="tap flex items-center gap-1 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400"
          @click="openShare(w)"
        >
          <Icon name="user" :size="14" /> Share
        </button>
      </div>

      <p v-if="!store.wallets.length" class="py-6 text-center text-sm text-slate-400">
        No wallets yet.
      </p>
    </div>

    <!-- Share sub-sheet -->
    <BottomSheet
      :open="!!shareTarget"
      :title="`Share ${shareTarget?.name ?? ''}`"
      @close="shareTarget = null"
    >
      <p class="mb-2 text-xs font-medium text-slate-400">
        People you share this wallet with can view and add transactions on it.
      </p>

      <!-- Current participants -->
      <div v-if="sharedUsers.length" class="mb-4 space-y-2">
        <p class="text-sm font-semibold">Shared with</p>
        <div
          v-for="u in sharedUsers"
          :key="u"
          class="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-ink-800"
        >
          <Icon name="user" :size="16" class="text-slate-400" />
          <span class="flex-1 truncate text-sm font-medium">{{ u }}</span>
          <button
            class="tap text-red-500"
            aria-label="Remove access"
            :disabled="busy"
            @click="remove(u)"
          >
            <Icon name="x" :size="16" />
          </button>
        </div>
      </div>

      <!-- Add people -->
      <p class="mb-1.5 text-sm font-semibold">Add a person</p>
      <div
        class="mb-2 flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2.5 dark:bg-ink-800"
      >
        <Icon name="search" :size="17" class="text-slate-400" />
        <input
          v-model="search"
          placeholder="Search users…"
          class="min-w-0 flex-1 bg-transparent text-sm outline-none"
          @input="onSearch"
        />
      </div>

      <p v-if="error" class="mb-2 text-sm font-medium text-red-500">{{ error }}</p>

      <div class="max-h-56 space-y-1 overflow-y-auto pb-3">
        <button
          v-for="u in results.filter((r) => !sharedUsers.includes(r.name))"
          :key="u.name"
          class="tap flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5"
          :disabled="busy"
          @click="add(u)"
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
