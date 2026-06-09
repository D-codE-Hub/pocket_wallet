<script setup lang="ts">
// Reusable slide-up bottom sheet with a dimmed backdrop, drag handle, optional
// title, and a scrollable body. Closes on backdrop tap or Escape.
import { watch, onUnmounted } from "vue";
import Icon from "./Icon.vue";

const props = defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ (e: "close"): void }>();

// Lock background scroll while the sheet is open.
watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
  },
);
onUnmounted(() => (document.body.style.overflow = ""));

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
        @click.self="emit('close')"
        @keydown="onKey"
      >
        <Transition
          enter-active-class="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          enter-from-class="translate-y-full"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-to-class="translate-y-full"
          appear
        >
          <div
            v-if="open"
            class="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92vh] max-w-md flex-col rounded-t-4xl bg-white shadow-2xl dark:bg-ink-850"
            role="dialog"
            aria-modal="true"
          >
            <!-- Drag handle -->
            <div class="flex justify-center pb-1 pt-3">
              <div class="h-1.5 w-11 rounded-full bg-slate-300 dark:bg-ink-600" />
            </div>

            <div v-if="title" class="flex items-center justify-between px-6 pb-2 pt-2">
              <h2 class="text-lg font-extrabold tracking-tight">{{ title }}</h2>
              <button
                type="button"
                class="tap h-8 w-8 rounded-full bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-300"
                aria-label="Close"
                @click="emit('close')"
              >
                <Icon name="x" :size="18" class="mx-auto" />
              </button>
            </div>

            <div class="overflow-y-auto px-6 pb-safe pt-1">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
