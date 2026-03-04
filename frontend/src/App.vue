<template>
	<router-view />
	<PWAInstallPrompt />
</template>

<script>
import PWAInstallPrompt from './components/PWAInstallPrompt.vue';

export default {
	inject: ['$auth'],
	components: { PWAInstallPrompt },
};
</script>
