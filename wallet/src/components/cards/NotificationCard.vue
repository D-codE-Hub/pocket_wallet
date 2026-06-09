<script setup lang="ts">
// Notification row with a kind-specific icon/tint and an unread dot.
import Icon from "@/components/ui/Icon.vue";
import { formatDate } from "@/composables/useFormat";
import type { AppNotification } from "@/types";

const props = defineProps<{ notification: AppNotification }>();
defineEmits<{ (e: "click"): void }>();

const STYLE: Record<AppNotification["kind"], { icon: string; tint: string }> = {
  budget: { icon: "alert-triangle", tint: "#f59e0b" },
  bill: { icon: "calendar", tint: "#ef4444" },
  milestone: { icon: "gift", tint: "#10b981" },
  summary: { icon: "bar-chart", tint: "#3b82f6" },
};
const style = STYLE[props.notification.kind];
</script>

<template>
  <button
    type="button"
    class="tap flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
    @click="$emit('click')"
  >
    <span
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      :style="{ backgroundColor: style.tint + '1f', color: style.tint }"
    >
      <Icon :name="style.icon" :size="18" />
    </span>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="truncate text-sm font-bold">{{ notification.title }}</p>
        <span v-if="!notification.read" class="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
      </div>
      <p class="mt-0.5 text-xs text-slate-400">{{ notification.message }}</p>
      <p class="mt-1 text-[11px] font-medium text-slate-300 dark:text-slate-500">
        {{ formatDate(notification.date, true) }}
      </p>
    </div>
  </button>
</template>
