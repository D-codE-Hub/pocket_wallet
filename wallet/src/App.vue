<script setup lang="ts">
// Root just renders the active route. The authed screens mount inside
// MobileLayout (which kicks off data loading); Login renders on its own.
</script>

<template>
  <RouterView />
</template>
