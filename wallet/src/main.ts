import "./index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useUiStore } from "./stores/useUiStore";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Apply the persisted theme to <html> before the first paint of the SPA.
useUiStore().applyTheme();

app.mount("#app");
