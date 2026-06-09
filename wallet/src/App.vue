<script setup lang="ts">
import { onMounted } from "vue";
import MobileLayout from "@/layouts/MobileLayout.vue";
import { useWalletStore } from "@/stores/useWalletStore";

// Kick off the initial data load once; individual screens read from the store
// and show their own skeletons while `loading.*` flags are true.
const store = useWalletStore();
onMounted(() => store.loadAll());
</script>

<template>
  <MobileLayout />
</template>
