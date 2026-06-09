# Pocket Wallet — Frontend (`wallet`)

A premium, mobile-first SPA for the **Pocket Wallet** personal cash-flow app.
Built with Vue 3 (`<script setup>` + TypeScript), Pinia, Vue Router and Tailwind
CSS. It currently runs entirely on a **mock service layer** so it can be
developed and demoed without the backend.

> Tagline: _"Track your money effortlessly."_

## Run

```bash
yarn install
yarn dev        # Vite dev server on http://localhost:8080 (proxies /api to Frappe)
yarn build      # builds to ../pocket_wallet/public/wallet and copies the www entry
```

Served by Frappe at **`/wallet`** (see `website_route_rules` in `hooks.py`).

## Architecture

- **`src/pages/`** — the five bottom-nav screens: Dashboard, Transactions,
  Budget, Analytics, Profile.
- **`src/layouts/MobileLayout.vue`** — phone-width shell: animated route
  transitions, bottom nav, floating Add button, and the global Add sheet.
- **`src/stores/`** — Pinia stores. `useWalletStore` holds wallets / categories /
  transactions / budgets / notifications and all derived totals;
  `useUiStore` holds theme (dark mode), currency and the Add-sheet state.
- **`src/services/`** — `walletService` is the mock API (Promise + delay, so
  loading/skeleton states are real). `mockData.ts` seeds ~3 months of data.
  **To go live, replace the bodies in `walletService` with Frappe
  `/api/method/*` calls — nothing else needs to change.**
- **`src/components/`** — reusable UI: `ui/` primitives (Icon, AppHeader,
  BottomNavigation, FloatingActionButton, BottomSheet, EmptyState, ProgressBar,
  SkeletonLoader, SearchBar, FilterChip, SettingsItem), `cards/` (Balance,
  Transaction, Wallet, Budget, Category, Stat, Notification) and `charts/`
  (Donut, Line, Bar — pure SVG/CSS, no chart dependency).
- **`src/composables/useFormat.ts`** — currency/date formatting bound to the
  selected currency.

## Notes

- Icons are an inline-SVG set in `components/ui/Icon.vue` (no icon library).
- Dark mode is the Tailwind `class` strategy; the theme is applied pre-paint in
  `index.html` to avoid a flash, and toggled from the Profile screen.
- The `@/` import alias maps to `src/` (configured in both `vite.config.ts` and
  `tsconfig.app.json`).
