import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// All primary screens live under the MobileLayout (bottom nav + FAB). They are
// lazy-loaded so the initial bundle stays light.
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import("@/pages/Dashboard.vue"),
    meta: { title: "Home", tab: "dashboard" },
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: () => import("@/pages/Transactions.vue"),
    meta: { title: "Transactions", tab: "transactions" },
  },
  {
    path: "/budget",
    name: "Budget",
    component: () => import("@/pages/Budget.vue"),
    meta: { title: "Budget", tab: "budget" },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: () => import("@/pages/Analytics.vue"),
    meta: { title: "Analytics", tab: "analytics" },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/pages/Profile.vue"),
    meta: { title: "Profile", tab: "profile" },
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

export default router;
