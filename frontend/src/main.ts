import './index.css';
import { createApp, reactive } from "vue";
import App from "./App.vue";

import router from './router';
import call from './controllers/call';
import Auth from './controllers/auth';

// PWA: Register service worker
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
	onNeedRefresh() {
		if (confirm('A new version of Pocket Wallet is available. Reload to update?')) {
			updateSW(true);
		}
	},
	onOfflineReady() {
		console.log('Pocket Wallet is ready for offline use.');
	},
});

const app = createApp(App);
const auth = reactive(new Auth());

// Plugins
app.use(router);

// Global Properties,
// components can inject this
app.provide("$auth", auth);
app.provide("$call", call);


// Configure route guards
router.beforeEach(async (to, from, next) => {
	const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
	const isLoginPage = to.matched.some((record) => record.meta?.isLoginPage);

	if (requiresAuth && !auth.isLoggedIn) {
		next({ name: 'Login', query: { route: to.path } });
	} else if (isLoginPage && auth.isLoggedIn) {
		next({ name: 'Home' });
	} else {
		next();
	}
});

app.mount("#app");
