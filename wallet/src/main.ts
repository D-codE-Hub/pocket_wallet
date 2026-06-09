import "./index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useUiStore } from "./stores/useUiStore";
import { useAuthStore } from "./stores/useAuthStore";

async function bootstrap() {
  const app = createApp(App);
  app.use(createPinia());

  // Apply persisted theme to <html> before first paint.
  useUiStore().applyTheme();

  // Resolve auth state before installing the router so the guard can trust it.
  await useAuthStore().fetchSession();

  app.use(router);
  app.mount("#app");
}

bootstrap();
