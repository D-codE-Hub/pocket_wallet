<script setup lang="ts">
// App shell for the authenticated screens: centered phone-width column,
// animated route transitions, fixed bottom nav, FAB, and the global Add sheet.
// Triggers the initial data load once mounted (i.e. once authenticated).
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import BottomNavigation from "@/components/ui/BottomNavigation.vue";
import FloatingActionButton from "@/components/ui/FloatingActionButton.vue";
import AddTransactionSheet from "@/components/AddTransactionSheet.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import { useWalletStore } from "@/stores/useWalletStore";

const route = useRoute();
const store = useWalletStore();

onMounted(() => store.loadAll());
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 dark:bg-ink-900">
    <main class="flex-1 pb-28">
      <RouterView v-slot="{ Component }">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="opacity-0"
        >
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <FloatingActionButton />
    <BottomNavigation />
    <AddTransactionSheet />
    <ConfirmDialog />
  </div>
</template>
