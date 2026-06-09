import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

// The five primary screens render inside MobileLayout (bottom nav + FAB). Login
// sits outside the shell. All are lazy-loaded.
const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/Login.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    component: () => import("@/layouts/MobileLayout.vue"),
    children: [
      { path: "", name: "Dashboard", component: () => import("@/pages/Dashboard.vue"), meta: { tab: "dashboard" } },
      { path: "transactions", name: "Transactions", component: () => import("@/pages/Transactions.vue"), meta: { tab: "transactions" } },
      { path: "budget", name: "Budget", component: () => import("@/pages/Budget.vue"), meta: { tab: "budget" } },
      { path: "analytics", name: "Analytics", component: () => import("@/pages/Analytics.vue"), meta: { tab: "analytics" } },
      { path: "profile", name: "Profile", component: () => import("@/pages/Profile.vue"), meta: { tab: "profile" } },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  // Served by Frappe at /wallet (see website_route_rules in hooks.py).
  history: createWebHistory("/wallet"),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Auth guard. `fetchSession` runs once before mount, so `ready` is set here.
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: "Login" };
  }
  if (to.name === "Login" && auth.isLoggedIn) {
    return { name: "Dashboard" };
  }
  return true;
});

export default router;
