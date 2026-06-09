<script setup lang="ts">
// A single settings row: icon bubble, label, optional value/description and a
// trailing chevron, toggle, or custom slot.
import Icon from "./Icon.vue";

withDefaults(
  defineProps<{ icon: string; label: string; value?: string; tint?: string; chevron?: boolean }>(),
  { tint: "#10b981", chevron: true },
);
defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button
    type="button"
    class="tap flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
    @click="$emit('click')"
  >
    <span
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      :style="{ backgroundColor: tint + '1f', color: tint }"
    >
      <Icon :name="icon" :size="18" />
    </span>
    <span class="flex-1 text-sm font-semibold">{{ label }}</span>
    <span v-if="value" class="text-sm font-medium text-slate-400">{{ value }}</span>
    <slot name="trailing">
      <Icon v-if="chevron" name="chevron-right" :size="18" class="text-slate-300" />
    </slot>
  </button>
</template>
