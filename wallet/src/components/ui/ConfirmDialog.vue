<script setup lang="ts">
// Global confirmation modal driven by the UI store's `confirm()` action.
// Rendered once in the layout; any screen can `await ui.confirm({ ... })`.
import Icon from "./Icon.vue";
import { useUiStore } from "@/stores/useUiStore";

const ui = useUiStore();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="ui.confirmDialog.open"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-8 backdrop-blur-sm"
        @click.self="ui.resolveConfirm(false)"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          appear
        >
          <div
            v-if="ui.confirmDialog.open"
            class="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-ink-800"
            role="alertdialog"
            aria-modal="true"
          >
            <div
              class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              :class="
                ui.confirmDialog.danger
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
              "
            >
              <Icon :name="ui.confirmDialog.danger ? 'trash' : 'alert-triangle'" :size="26" />
            </div>

            <h2 class="text-base font-extrabold">{{ ui.confirmDialog.title }}</h2>
            <p v-if="ui.confirmDialog.message" class="mt-1.5 text-sm text-slate-400">
              {{ ui.confirmDialog.message }}
            </p>

            <div class="mt-6 flex gap-3">
              <button
                type="button"
                class="tap flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 dark:bg-ink-700 dark:text-slate-200"
                @click="ui.resolveConfirm(false)"
              >
                Cancel
              </button>
              <button
                type="button"
                class="tap flex-1 rounded-2xl py-3 text-sm font-bold text-white"
                :class="ui.confirmDialog.danger ? 'bg-red-500' : 'bg-brand-500'"
                @click="ui.resolveConfirm(true)"
              >
                {{ ui.confirmDialog.confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
