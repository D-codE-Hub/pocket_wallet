<template>
  <div :class="{ dark: isDark }" class="transition-colors duration-300">
    <div class="min-h-screen bg-[#f8fafb] dark:bg-[#0c0f14] text-gray-900 dark:text-gray-100 transition-colors duration-300">

      <!-- ═══════════════ NAVBAR ═══════════════ -->
      <nav class="sticky top-0 z-40 bg-white/70 dark:bg-[#0c0f14]/70 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/[0.06] pt-[env(safe-area-inset-top)]">
        <div class="max-w-6xl mx-auto px-5 sm:px-6 flex items-center justify-between h-14">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-[10px] bg-emerald-500 flex items-center justify-center">
              <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <span class="text-[15px] font-semibold tracking-[-0.01em]">Pocket Wallet</span>
          </div>
          <div class="flex items-center gap-1">
            <button @click="toggleDark" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all" aria-label="Toggle dark mode">
              <svg v-if="isDark" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <svg v-else class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.005 9.005 0 0012 21a9.005 9.005 0 008.354-5.646z"/></svg>
            </button>
            <button @click="$auth.logout()" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Logout">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <main class="max-w-6xl mx-auto px-5 sm:px-6 py-6 space-y-5">

        <!-- ═══════════════ BALANCE HERO ═══════════════ -->
        <section class="relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-7">
          <!-- Subtle animated gradient blob -->
          <div class="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl"></div>
          <div class="absolute -left-10 -bottom-16 h-48 w-48 rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-3xl"></div>

          <div class="relative">
            <p class="text-[13px] font-medium text-gray-400 dark:text-gray-500 mb-1">{{ greeting }}</p>
            <p class="text-[28px] xs:text-[36px] sm:text-[48px] font-bold tracking-[-0.03em] leading-none text-gray-900 dark:text-gray-100">
              {{ currency(totalBalance) }}
            </p>
            <p class="mt-2 text-[13px] text-gray-500 dark:text-gray-500">
              {{ accounts.length }} account{{ accounts.length !== 1 ? "s" : "" }} · {{ currentMonthName }}
            </p>

            <!-- Quick action -->
            <div class="mt-5 flex justify-end">
              <button @click="openFormModal('Expense')" class="h-9 px-5 rounded-full text-[13px] font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5">
                <svg class="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                New Transaction
              </button>
            </div>
          </div>
        </section>

        <!-- ═══════════════ STAT CARDS ROW ═══════════════ -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div class="card-base px-3 sm:px-4 py-3 sm:py-3.5">
            <div class="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
              <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span class="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">Income</span>
            </div>
            <p class="text-[14px] sm:text-lg md:text-xl font-semibold tracking-[-0.02em] text-emerald-600 dark:text-emerald-400 truncate">{{ currency(monthlyIncome) }}</p>
          </div>
          <div class="card-base px-3 sm:px-4 py-3 sm:py-3.5">
            <div class="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
              <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 flex-shrink-0"></span>
              <span class="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">Expense</span>
            </div>
            <p class="text-[14px] sm:text-lg md:text-xl font-semibold tracking-[-0.02em] text-red-500 dark:text-red-400 truncate">{{ currency(monthlyExpense) }}</p>
          </div>
          <div class="card-base px-3 sm:px-4 py-3 sm:py-3.5">
            <div class="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
              <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0" :class="monthlySavings >= 0 ? 'bg-emerald-500' : 'bg-red-500'"></span>
              <span class="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">Net</span>
            </div>
            <p class="text-[14px] sm:text-lg md:text-xl font-semibold tracking-[-0.02em] truncate" :class="monthlySavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">
              {{ monthlySavings >= 0 ? '+' : '' }}{{ currency(monthlySavings) }}
            </p>
          </div>
        </div>

        <!-- ═══════════════ BENTO GRID ═══════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

          <!-- ── ACCOUNTS (lg:4 cols) ── -->
          <div class="lg:col-span-4 card-base p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-[13px] font-semibold text-gray-800 dark:text-gray-200">Accounts</h2>
              <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ accounts.length }}</span>
            </div>
            <div v-if="accounts.length === 0" class="py-6 text-center text-[13px] text-gray-400 dark:text-gray-600">No accounts yet.</div>
            <div v-else class="space-y-1">
              <div v-for="acc in accounts" :key="acc.name" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                <span class="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-bold flex-shrink-0" :class="accountColor(acc.account_type)">
                  {{ (acc.account_name || "A").charAt(0).toUpperCase() }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-medium truncate">{{ acc.account_name }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ acc.account_type || "General" }}</p>
                </div>
                <p class="text-[12px] sm:text-[13px] font-semibold tabular-nums flex-shrink-0 ml-1" :class="acc.account_balance >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-red-500 dark:text-red-400'">
                  {{ currency(acc.account_balance) }}
                </p>
              </div>
            </div>
          </div>

          <!-- ── SPENDING BY CATEGORY (lg:4 cols) ── -->
          <div class="lg:col-span-4 card-base p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-[13px] font-semibold text-gray-800 dark:text-gray-200">Spending</h2>
              <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ currentMonthName }}</span>
            </div>
            <div v-if="categoryBreakdown.length === 0" class="py-6 text-center text-[13px] text-gray-400 dark:text-gray-600">No expenses this month.</div>
            <div v-else class="space-y-3">
              <div v-for="cat in categoryBreakdown" :key="cat.category">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="text-[12px] sm:text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate">{{ cat.category }}</span>
                  <span class="text-[11px] sm:text-[12px] font-semibold tabular-nums text-red-500 dark:text-red-400 flex-shrink-0">{{ currency(cat.total) }}</span>
                </div>
                <div class="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-700 ease-out" :style="{width: catPercent(cat.total) + '%'}"></div>
                </div>
                <p class="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">{{ cat.count }} txn{{ cat.count !== 1 ? 's' : '' }} · {{ catPercent(cat.total).toFixed(0) }}%</p>
              </div>
            </div>
          </div>

          <!-- ── INCOME BY CATEGORY (lg:4 cols) ── -->
          <div class="lg:col-span-4 card-base p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-[13px] font-semibold text-gray-800 dark:text-gray-200">Income</h2>
              <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ currentMonthName }}</span>
            </div>
            <div v-if="incomeCategoryBreakdown.length === 0" class="py-6 text-center text-[13px] text-gray-400 dark:text-gray-600">No income this month.</div>
            <div v-else class="space-y-3">
              <div v-for="cat in incomeCategoryBreakdown" :key="cat.category">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="text-[12px] sm:text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate">{{ cat.category }}</span>
                  <span class="text-[11px] sm:text-[12px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 flex-shrink-0">{{ currency(cat.total) }}</span>
                </div>
                <div class="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out" :style="{width: incCatPercent(cat.total) + '%'}"></div>
                </div>
                <p class="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">{{ cat.count }} txn{{ cat.count !== 1 ? 's' : '' }} · {{ incCatPercent(cat.total).toFixed(0) }}%</p>
              </div>
            </div>
          </div>

          <!-- ── MONTHLY BY ACCOUNT (full width) ── -->
          <div class="lg:col-span-12 card-base p-5">
            <h2 class="text-[13px] font-semibold text-gray-800 dark:text-gray-200 mb-3">Monthly by Account</h2>
            <div v-if="accountSummary.length === 0" class="py-6 text-center text-[13px] text-gray-400 dark:text-gray-600">No data this month.</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div v-for="row in accountSummary" :key="row.account" class="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] px-4 py-3">
                <p class="text-[13px] font-medium text-gray-800 dark:text-gray-200 mb-2">{{ row.account }}</p>
                <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div class="min-w-0">
                    <p class="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">In</p>
                    <p class="text-[11px] sm:text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 truncate">{{ currency(row.income) }}</p>
                  </div>
                  <div class="min-w-0">
                    <p class="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">Out</p>
                    <p class="text-[11px] sm:text-[13px] font-semibold tabular-nums text-red-500 dark:text-red-400 truncate">{{ currency(row.expense) }}</p>
                  </div>
                  <div class="min-w-0">
                    <p class="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">Net</p>
                    <p class="text-[11px] sm:text-[13px] font-semibold tabular-nums truncate" :class="row.income - row.expense >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">{{ currency(row.income - row.expense) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════ TRANSACTIONS ═══════════════ -->
        <section class="card-base overflow-hidden">
          <!-- Filters -->
          <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <h2 class="text-[15px] font-semibold text-gray-800 dark:text-gray-200">Transactions</h2>
              <span class="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 tabular-nums">{{ totalTransactions }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-end gap-2">
              <select v-model="filter.type" @change="applyFilters" class="filter-select">
                <option value="">All Types</option>
                <option>Expense</option><option>Income</option><option>Transfer</option>
              </select>
              <select v-model="filter.account" @change="applyFilters" class="filter-select">
                <option value="">All Accounts</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
              <select v-model="filter.category" @change="applyFilters" class="filter-select">
                <option value="">All Categories</option>
                <option v-for="c in categories" :key="c.name" :value="c.name">{{ c.category }}</option>
              </select>
              <button v-if="filter.type || filter.account || filter.category" @click="clearFilters"
                class="h-8 px-2.5 rounded-lg text-[12px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                Reset
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="transactions.length === 0" class="px-5 py-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
              <svg class="h-6 w-6 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>
            </div>
            <p class="text-[14px] font-medium text-gray-500 dark:text-gray-400">No transactions yet</p>
            <p class="text-[13px] text-gray-400 dark:text-gray-600 mt-1">Start tracking your finances</p>
            <button @click="openFormModal('Expense')" class="mt-4 h-9 px-4 rounded-full text-[13px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">Add transaction</button>
          </div>

          <!-- Transaction feed -->
          <div v-else>
            <!-- Mobile card view -->
            <div class="md:hidden divide-y divide-gray-100 dark:divide-white/[0.04]">
              <div v-for="txn in transactions" :key="txn.name" class="px-4 py-3 flex items-center gap-3 active:bg-gray-50 dark:active:bg-white/[0.02] transition-colors">
                <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" :class="typeIconBg(txn.type)">
                  <svg v-if="txn.type === 'Expense'" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                  <svg v-else-if="txn.type === 'Income'" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                  <svg v-else class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-[14px] font-medium truncate">{{ txn.category || (txn.type === "Transfer" ? "Transfer" : txn.type) }}</p>
                    <p class="text-[14px] font-semibold tabular-nums flex-shrink-0 ml-2" :class="amountColor(txn.type)">
                      {{ txn.type === "Expense" ? "−" : txn.type === "Income" ? "+" : "" }}{{ currency(txn.amount) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ formatDate(txn.date) }}</span>
                    <span class="text-[11px] text-gray-300 dark:text-gray-700">·</span>
                    <span class="text-[11px] text-gray-400 dark:text-gray-500 truncate">{{ txn.account }}{{ txn.type === "Transfer" ? " → " + txn.to_account : "" }}</span>
                  </div>
                  <p v-if="txn.note" class="text-[11px] text-gray-400 dark:text-gray-600 truncate mt-0.5">{{ txn.note }}</p>
                </div>
                <button @click.stop="deleteTransaction(txn.name)" class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Delete">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                </button>
              </div>
            </div>

            <!-- Desktop table view -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-white/[0.06]">
                    <th class="text-left pl-5 pr-3 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="text-left px-3 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="text-left px-3 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="text-left px-3 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account</th>
                    <th class="text-left px-3 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Note</th>
                    <th class="text-right px-3 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="w-12 pl-3 pr-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="txn in transactions" :key="txn.name" class="border-b border-gray-50 dark:border-white/[0.03] hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors group">
                    <td class="pl-5 pr-3 py-3 whitespace-nowrap text-[13px] text-gray-500 dark:text-gray-400 tabular-nums">{{ formatDate(txn.date) }}</td>
                    <td class="px-3 py-3">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium" :class="typeBadge(txn.type)">
                        <span class="w-1.5 h-1.5 rounded-full" :class="typeDot(txn.type)"></span>{{ txn.type }}
                      </span>
                    </td>
                    <td class="px-3 py-3 text-[13px] text-gray-600 dark:text-gray-300">{{ txn.category || (txn.type === "Transfer" ? "→ " + txn.to_account : "—") }}</td>
                    <td class="px-3 py-3 text-[13px] text-gray-500 dark:text-gray-400">{{ txn.account }}</td>
                    <td class="px-3 py-3 text-[13px] text-gray-400 dark:text-gray-500 max-w-[200px] truncate">{{ txn.note || "—" }}</td>
                    <td class="px-3 py-3 text-right text-[13px] font-semibold tabular-nums whitespace-nowrap" :class="amountColor(txn.type)">
                      {{ txn.type === "Expense" ? "−" : txn.type === "Income" ? "+" : "" }}{{ currency(txn.amount) }}
                    </td>
                    <td class="pl-3 pr-5 py-3">
                      <button @click.stop="deleteTransaction(txn.name)" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Delete">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Load more -->
            <div v-if="hasMoreTransactions" class="px-5 py-3 border-t border-gray-100 dark:border-white/[0.06] text-center">
              <button @click="loadMore" class="text-[13px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Load more</button>
            </div>
          </div>
        </section>

      </main>

      <!-- ═══════════════ ADD TRANSACTION MODAL ═══════════════ -->
      <Transition name="modal">
        <div v-if="form.show" class="fixed inset-0 z-50 flex items-start sm:items-center justify-center pt-12 sm:pt-0">
          <div class="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" @click="form.show = false"></div>
          <div class="modal-content modal-sheet relative bg-white dark:bg-[#171b23] rounded-[20px] sm:rounded-[20px] shadow-2xl w-[calc(100%-1.5rem)] sm:w-full sm:max-w-[440px] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">

            <!-- Drag handle (mobile) -->
            <div class="sm:hidden flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#171b23] z-10">
              <div class="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            </div>

            <div class="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <!-- Header -->
              <div class="flex items-center justify-between">
                <h3 class="text-[17px] font-semibold tracking-[-0.01em]">New Transaction</h3>
                <button @click="form.show = false" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <!-- Alerts -->
              <div v-if="form.success" class="flex items-center gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-3.5 py-2.5 text-[13px] text-emerald-700 dark:text-emerald-400 font-medium">
                <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                Transaction created!
              </div>
              <div v-if="form.error" class="flex items-center gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 px-3.5 py-2.5 text-[13px] text-red-600 dark:text-red-400">
                <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ form.error }}
              </div>

              <!-- Type segmented control -->
              <div class="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.06]">
                <button v-for="t in ['Expense','Income','Transfer']" :key="t" @click="setFormType(t)"
                  class="flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-200"
                  :class="form.type === t ? typeActiveClassNew(t) : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
                  {{ t }}
                </button>
              </div>

              <!-- Amount -->
              <div>
                <label class="form-label">Amount</label>
                <input ref="amountInput" type="number" v-model.number="form.amount" min="0.01" step="0.01" placeholder="0.00"
                  class="form-input text-[20px] font-semibold tracking-[-0.02em] py-3" />
              </div>

              <!-- Account + Category -->
              <div class="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Account</label>
                  <select v-model="form.account" class="form-input">
                    <option value="">Select</option>
                    <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
                  </select>
                </div>
                <div v-if="form.type === 'Transfer'">
                  <label class="form-label">To Account</label>
                  <select v-model="form.to_account" class="form-input">
                    <option value="">Select</option>
                    <option v-for="a in accounts.filter(x => x.name !== form.account)" :key="a.name" :value="a.name">{{ a.account_name }}</option>
                  </select>
                </div>
                <div v-if="form.type !== 'Transfer'">
                  <label class="form-label">Category</label>
                  <select v-model="form.category" class="form-input">
                    <option value="">Select</option>
                    <option v-for="c in filteredCategories" :key="c.name" :value="c.name">{{ c.category }}</option>
                  </select>
                </div>
              </div>

              <!-- Date -->
              <div class="min-w-0">
                <label class="form-label">Date</label>
                <input type="date" v-model="form.date" class="form-input form-input-date" />
              </div>

              <!-- Note -->
              <div>
                <label class="form-label">Note <span class="normal-case text-gray-300 dark:text-gray-600">(optional)</span></label>
                <input type="text" v-model="form.note" placeholder="What's this for?" @keyup.enter="createTransaction" class="form-input" />
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-1 sticky bottom-0 bg-white dark:bg-[#171b23] pb-1">
                <button @click="form.show = false" class="flex-1 h-11 rounded-xl text-[14px] font-medium border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">Cancel</button>
                <button @click="createTransaction" :disabled="form.saving"
                  class="flex-[2] h-11 rounded-xl text-[14px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  <svg v-if="form.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {{ form.saving ? "Saving..." : "Add Transaction" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ═══════════════ DELETE MODAL ═══════════════ -->
      <Transition name="modal">
        <div v-if="deleteModal.show" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" @click="deleteModal.show = false"></div>
          <div class="modal-content relative bg-white dark:bg-[#171b23] rounded-[20px] shadow-2xl p-6 max-w-sm w-full space-y-5">
            <div class="flex items-center gap-3.5">
              <span class="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
              </span>
              <div>
                <h3 class="text-[15px] font-semibold">Delete Transaction?</h3>
                <p class="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button @click="deleteModal.show = false" class="h-10 px-4 rounded-xl text-[14px] font-medium border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">Cancel</button>
              <button @click="confirmDelete" :disabled="deleteModal.deleting"
                class="h-10 px-4 rounded-xl text-[14px] font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2">
                <svg v-if="deleteModal.deleting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ deleteModal.deleting ? "Deleting..." : "Delete" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ═══════════════ FAB (mobile) ═══════════════ -->
      <button @click="openFormModal('Expense')" class="sm:hidden fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-30 w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center" aria-label="New transaction">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
      </button>

    </div>
  </div>
</template>

<script>
export default {
  inject: ["$auth", "$call"],
  data() {
    return {
      isDark: false,
      // Data
      accounts: [],
      categories: [],
      transactions: [],
      monthlyIncome: 0,
      monthlyExpense: 0,
      categoryBreakdown: [],
      incomeCategoryBreakdown: [],
      accountSummary: [],
      totalTransactions: 0,
      pageLength: 20,
      // Transaction form (modal)
      form: {
        show: false,
        type: "Expense",
        amount: null,
        account: "",
        to_account: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
        saving: false,
        success: false,
        error: null,
      },
      // Filters
      filter: { type: "", account: "", category: "" },
      // Delete modal
      deleteModal: { show: false, name: null, deleting: false },
    };
  },
  computed: {
    totalBalance() {
      return this.accounts.reduce((s, a) => s + (a.account_balance || 0), 0);
    },
    monthlySavings() {
      return this.monthlyIncome - this.monthlyExpense;
    },
    hasMoreTransactions() {
      return this.transactions.length < this.totalTransactions;
    },
    filteredCategories() {
      return this.categories.filter((c) => c.category_type === this.form.type);
    },
    greeting() {
      const h = new Date().getHours();
      if (h < 12) return "Good Morning";
      if (h < 17) return "Good Afternoon";
      return "Good Evening";
    },
    currentMonthName() {
      return new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });
    },
  },
  async mounted() {
    const saved = localStorage.getItem("pw-theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      this.isDark = true;
    }
    await this.fetchAll();

    // Scroll focused input into view when mobile keyboard opens (iOS compatible)
    this._handleFocusIn = (e) => {
      if (!this.form.show) return;
      const el = e.target;
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
        // Use longer delay for iOS keyboard animation
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 350);
      }
    };
    document.addEventListener('focusin', this._handleFocusIn);

    // iOS Visual Viewport resize handler — adjust modal when keyboard opens
    if (window.visualViewport) {
      this._handleViewportResize = () => {
        if (!this.form.show) return;
        const modalSheet = document.querySelector('.modal-sheet');
        if (modalSheet) {
          modalSheet.style.maxHeight = `${window.visualViewport.height}px`;
        }
      };
      window.visualViewport.addEventListener('resize', this._handleViewportResize);
    }
  },
  beforeUnmount() {
    if (this._handleFocusIn) {
      document.removeEventListener('focusin', this._handleFocusIn);
    }
    if (this._handleViewportResize && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this._handleViewportResize);
    }
  },
  methods: {
    toggleDark() {
      this.isDark = !this.isDark;
      localStorage.setItem("pw-theme", this.isDark ? "dark" : "light");
    },

    // ── Data fetching ─────────────────────────────────
    async fetchAll() {
      await Promise.all([
        this.fetchAccounts(),
        this.fetchCategories(),
      ]);
      await Promise.all([
        this.fetchTransactions(),
        this.fetchMonthlyTotals(),
        this.fetchCategoryBreakdown(),
        this.fetchIncomeCategoryBreakdown(),
        this.fetchAccountSummary(),
      ]);
    },

    async fetchAccounts() {
      try {
        const d = await this.$call("frappe.client.get_list", {
          doctype: "Wallet Account",
          fields: ["name", "account_name", "account_type", "account_balance"],
          order_by: "account_name asc",
          limit_page_length: 0,
        });
        this.accounts = d || [];
      } catch (e) { console.error(e); }
    },

    async fetchCategories() {
      try {
        const d = await this.$call("frappe.client.get_list", {
          doctype: "Wallet Category",
          fields: ["name", "category", "category_type"],
          order_by: "category asc",
          limit_page_length: 0,
        });
        this.categories = d || [];
      } catch (e) { console.error(e); }
    },

    async fetchTransactions() {
      try {
        const filters = {};
        if (this.filter.type) filters.type = this.filter.type;
        if (this.filter.account) filters.account = this.filter.account;
        if (this.filter.category) filters.category = this.filter.category;

        const d = await this.$call("frappe.client.get_list", {
          doctype: "My Wallet",
          fields: ["name","type","amount","category","account","to_account","date","time","note","status"],
          filters,
          order_by: "date desc, time desc",
          limit_page_length: this.pageLength,
        });
        this.transactions = d || [];

        const count = await this.$call("frappe.client.get_count", {
          doctype: "My Wallet",
          filters,
        });
        this.totalTransactions = count || 0;
      } catch (e) { console.error(e); }
    },

    async fetchMonthlyTotals() {
      try {
        const firstDay = this.monthStart();
        const inc = await this.$call("frappe.client.get_list", {
          doctype: "My Wallet",
          filters: { type: "Income", date: [">=", firstDay] },
          fields: ["sum(amount) as total"],
          limit_page_length: 1,
        });
        this.monthlyIncome = inc?.[0]?.total || 0;

        const exp = await this.$call("frappe.client.get_list", {
          doctype: "My Wallet",
          filters: { type: "Expense", date: [">=", firstDay] },
          fields: ["sum(amount) as total"],
          limit_page_length: 1,
        });
        this.monthlyExpense = exp?.[0]?.total || 0;
      } catch (e) { console.error(e); }
    },

    async fetchCategoryBreakdown() {
      try {
        const firstDay = this.monthStart();
        const d = await this.$call("frappe.client.get_list", {
          doctype: "My Wallet",
          filters: { type: "Expense", date: [">=", firstDay] },
          fields: ["category", "sum(amount) as total", "count(name) as count"],
          group_by: "category",
          order_by: "total desc",
          limit_page_length: 0,
        });
        this.categoryBreakdown = (d || []).filter((r) => r.category);
      } catch (e) { console.error(e); }
    },

    async fetchIncomeCategoryBreakdown() {
      try {
        const firstDay = this.monthStart();
        const d = await this.$call("frappe.client.get_list", {
          doctype: "My Wallet",
          filters: { type: "Income", date: [">=", firstDay] },
          fields: ["category", "sum(amount) as total", "count(name) as count"],
          group_by: "category",
          order_by: "total desc",
          limit_page_length: 0,
        });
        this.incomeCategoryBreakdown = (d || []).filter((r) => r.category);
      } catch (e) { console.error(e); }
    },

    async fetchAccountSummary() {
      try {
        const firstDay = this.monthStart();
        if (!this.accounts.length) {
          try {
            await this.fetchAccounts();
          } catch (e) {
            console.error("Failed to fetch accounts for summary:", e);
            this.accountSummary = [];
            return;
          }
        }
        if (!this.accounts.length) {
          this.accountSummary = [];
          return;
        }
        const summary = [];
        const incomeData = await this.$call("frappe.client.get_list", {
          doctype: "My Wallet",
          filters: { type: "Income", date: [">=", firstDay] },
          fields: ["account", "sum(amount) as total"],
          group_by: "account",
          limit_page_length: 0,
        });
        const expenseData = await this.$call("frappe.client.get_list", {
          doctype: "My Wallet",
          filters: { type: "Expense", date: [">=", firstDay] },
          fields: ["account", "sum(amount) as total"],
          group_by: "account",
          limit_page_length: 0,
        });
        const incomeMap = Object.fromEntries((incomeData || []).map(r => [r.account, r.total || 0]));
        const expenseMap = Object.fromEntries((expenseData || []).map(r => [r.account, r.total || 0]));
        for (const acc of this.accounts) {
          summary.push({
            account: acc.account_name,
            income: incomeMap[acc.name] || 0,
            expense: expenseMap[acc.name] || 0,
            balance: acc.account_balance || 0,
          });
        }
        this.accountSummary = summary;
      } catch (e) { console.error(e); }
    },

    // ── Modal openers ─────────────────────────────────
    openFormModal(type = "Expense") {
      this.form.type = type;
      this.form.amount = null;
      this.form.account = "";
      this.form.to_account = "";
      this.form.category = "";
      this.form.date = new Date().toISOString().split("T")[0];
      this.form.note = "";
      this.form.error = null;
      this.form.success = false;
      this.form.saving = false;
      this.form.show = true;
      this.$nextTick(() => { this.$refs.amountInput?.focus(); });
    },

    // ── Create transaction ────────────────────────────
    async createTransaction() {
      this.form.error = null;
      this.form.success = false;

      if (!this.form.amount || this.form.amount <= 0) {
        this.form.error = "Amount must be greater than 0.";
        return;
      }
      if (!this.form.account) {
        this.form.error = "Please select an account.";
        return;
      }
      if (this.form.type === "Transfer" && !this.form.to_account) {
        this.form.error = "Please select a destination account.";
        return;
      }
      if (this.form.type !== "Transfer" && !this.form.category) {
        this.form.error = "Please select a category.";
        return;
      }

      this.form.saving = true;
      try {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

        await this.$call("frappe.client.insert", {
          doc: {
            doctype: "My Wallet",
            type: this.form.type,
            amount: this.form.amount,
            account: this.form.account,
            to_account: this.form.type === "Transfer" ? this.form.to_account : undefined,
            category: this.form.type !== "Transfer" ? this.form.category : undefined,
            date: this.form.date,
            time: time,
            note: this.form.note || undefined,
            status: "Done",
          },
        });
        this.form.success = true;
        // Refresh data
        await this.fetchAll();
        // Auto-close modal after brief success flash
        setTimeout(() => { this.form.show = false; this.form.success = false; }, 1200);
      } catch (e) {
        this.form.error = e?.message || e?._server_messages || "Failed to create transaction.";
        try {
          const msgs = JSON.parse(this.form.error);
          if (Array.isArray(msgs)) this.form.error = JSON.parse(msgs[0]).message;
        } catch (_) {}
      } finally {
        this.form.saving = false;
      }
    },

    // ── Delete ────────────────────────────────────────
    deleteTransaction(name) {
      this.deleteModal = { show: true, name, deleting: false };
    },
    async confirmDelete() {
      this.deleteModal.deleting = true;
      try {
        await this.$call("frappe.client.delete", {
          doctype: "My Wallet",
          name: this.deleteModal.name,
        });
        this.deleteModal.show = false;
        await this.fetchAll();
      } catch (e) {
        console.error(e);
        this.deleteModal.deleting = false;
      }
    },

    // ── Filters ───────────────────────────────────────
    async applyFilters() {
      this.pageLength = 20;
      await this.fetchTransactions();
    },
    async clearFilters() {
      this.filter = { type: "", account: "", category: "" };
      this.pageLength = 20;
      await this.fetchTransactions();
    },
    async loadMore() {
      this.pageLength += 20;
      await this.fetchTransactions();
    },

    // ── Form helpers ──────────────────────────────────
    setFormType(t) {
      this.form.type = t;
      this.form.category = "";
      this.form.to_account = "";
    },
    typeActiveClassNew(t) {
      return {
        Expense: "bg-white dark:bg-white/[0.08] text-red-500 dark:text-red-400 shadow-sm",
        Income: "bg-white dark:bg-white/[0.08] text-emerald-600 dark:text-emerald-400 shadow-sm",
        Transfer: "bg-white dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 shadow-sm",
      }[t];
    },

    // ── Display helpers ───────────────────────────────
    monthStart() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    },
    currency(val) {
      return (parseFloat(val) || 0).toLocaleString(undefined, { style: "currency", currency: "INR", minimumFractionDigits: 2 });
    },
    formatDate(d) {
      if (!d) return "—";
      return new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
    },
    catPercent(total) {
      return this.monthlyExpense > 0 ? (total / this.monthlyExpense) * 100 : 0;
    },
    incCatPercent(total) {
      return this.monthlyIncome > 0 ? (total / this.monthlyIncome) * 100 : 0;
    },
    typeBadge(type) {
      return {
        Expense: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
        Income: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        Transfer: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
      }[type];
    },
    typeIconBg(type) {
      return {
        Expense: "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400",
        Income: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        Transfer: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
      }[type];
    },
    typeDot(type) {
      return { Expense: "bg-red-500", Income: "bg-emerald-500", Transfer: "bg-blue-500" }[type];
    },
    amountColor(type) {
      return {
        Expense: "text-red-500 dark:text-red-400",
        Income: "text-emerald-600 dark:text-emerald-400",
        Transfer: "text-blue-600 dark:text-blue-400",
      }[type];
    },
    accountColor(type) {
      const t = (type || "").toLowerCase();
      if (t.includes("cash")) return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400";
      if (t.includes("saving")) return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      if (t.includes("bank")) return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400";
      if (t.includes("credit")) return "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400";
      return "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400";
    },
  },
};
</script>

<style scoped>
/* ── Card base ── */
.card-base {
  @apply rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06];
}

/* ── Filter selects ── */
.filter-select {
  @apply h-8 px-2.5 rounded-lg text-[12px] border border-gray-200 dark:border-white/[0.08] bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
}

/* ── Form inputs ── */
.form-label {
  @apply block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider;
}
.form-input {
  @apply w-full px-3 py-2.5 rounded-xl text-[13px] border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all;
  display: block;
  min-width: 0;
  box-sizing: border-box;
}
select.form-input {
  @apply appearance-none cursor-pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
}

/* ── Date input (iOS fix) ── */
.form-input-date {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  min-height: 44px; /* iOS tap target */
  position: relative;
  overflow: hidden;
}
.form-input-date::-webkit-date-and-time-value {
  text-align: left;
}

/* ── Modal sheet (mobile) ── */
.modal-sheet {
  max-height: 90vh;
  max-height: 90dvh;
  -webkit-overflow-scrolling: touch;
}
@supports (height: 100dvh) {
  .modal-sheet {
    max-height: 90dvh;
  }
}
@media (max-width: 639px) {
  .modal-sheet {
    max-height: 95vh;
    max-height: 95dvh;
  }
}

/* ── Modal transitions ── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content {
  transform: translateY(16px) scale(0.98);
  opacity: 0;
}
.modal-leave-to .modal-content {
  transform: translateY(16px) scale(0.98);
  opacity: 0;
}

/* ── Scrollbar ── */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
}
.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
}
</style>
