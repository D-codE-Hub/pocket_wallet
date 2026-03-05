<template>
  <Transition name="slide-up">
    <div v-if="showInstallPrompt" class="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Install Pocket Wallet</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5" v-if="isIOS">
              Tap <svg class="inline h-4 w-4 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> then <strong>"Add to Home Screen"</strong>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5" v-else>
              Add to your home screen for quick access &amp; offline use.
            </p>
          </div>
          <button @click="dismiss" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 -mt-1 -mr-1" aria-label="Dismiss">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="flex gap-2 mt-3" v-if="!isIOS">
          <button @click="install" class="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 transition-all">
            Install
          </button>
          <button @click="dismiss" class="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all">
            Not now
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const showInstallPrompt = ref(false);
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isIOS = ref(false);
let installPromptTimer: ReturnType<typeof setTimeout> | null = null;

function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

function handleBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  deferredPrompt.value = e as BeforeInstallPromptEvent;

  // Don't show if user dismissed recently (within 7 days)
  const dismissedAt = localStorage.getItem('pwa-install-dismissed');
  if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
    return;
  }

  showInstallPrompt.value = true;
}

async function install() {
  if (!deferredPrompt.value) return;

  deferredPrompt.value.prompt();
  await deferredPrompt.value.userChoice;

  showInstallPrompt.value = false;
  deferredPrompt.value = null;
}

function dismiss() {
  showInstallPrompt.value = false;
  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
}

onMounted(() => {
  if (isInStandaloneMode()) return;

  isIOS.value = isIOSDevice();

  if (isIOS.value) {
    // On iOS, show the manual install hint
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (!dismissedAt || Date.now() - parseInt(dismissedAt) > 7 * 24 * 60 * 60 * 1000) {
      // Show after a short delay for better UX
      installPromptTimer = setTimeout(() => {
        showInstallPrompt.value = true;
      }, 3000);
    }
  } else {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  if (installPromptTimer) {
    clearTimeout(installPromptTimer);
    installPromptTimer = null;
  }
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
