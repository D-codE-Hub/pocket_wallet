<template>
  <div :class="{ dark: isDark }" class="transition-colors duration-500">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">

      <!-- ═══════════════════ NAVBAR ═══════════════════ -->
      <nav class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 pt-[env(safe-area-inset-top)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <span class="text-lg font-bold tracking-tight">Pocket Wallet</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openFormModal('Expense')" class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              New Transaction
            </button>
            <button @click="toggleDark" class="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all" aria-label="Toggle dark mode">
              <svg v-if="isDark" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.005 9.005 0 0012 21a9.005 9.005 0 008.354-5.646z"/></svg>
            </button>
            <button @click="$auth.logout()" class="px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 transition-all">Logout</button>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <!-- ═══════════════════ NUMBER CARDS ═══════════════════ -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Balance -->
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/20">
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div class="absolute -right-1 -bottom-6 h-16 w-16 rounded-full bg-white/5"></div>
            <p class="text-sm font-medium text-emerald-100">Total Balance</p>
            <p class="mt-2 text-3xl font-bold tracking-tight">{{ currency(totalBalance) }}</p>
            <p class="mt-1 text-xs text-emerald-200">Across {{ accounts.length }} account{{ accounts.length !== 1 ? "s" : "" }}</p>
          </div>
          <!-- Monthly Income -->
          <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</p>
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
              </span>
            </div>
            <p class="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ currency(monthlyIncome) }}</p>
          </div>
          <!-- Monthly Expense -->
          <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expense</p>
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
              </span>
            </div>
            <p class="mt-3 text-2xl font-bold text-red-500 dark:text-red-400">{{ currency(monthlyExpense) }}</p>
          </div>
          <!-- Net this month -->
          <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Net This Month</p>
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl" :class="monthlySavings >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              </span>
            </div>
            <p class="mt-3 text-2xl font-bold" :class="monthlySavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">{{ currency(monthlySavings) }}</p>
          </div>
        </section>

        <!-- ═══════════════════ ANALYTICS — 2×2 GRID ═══════════════════ -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <!-- Accounts -->
          <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Accounts</h2>
            <div v-if="accounts.length === 0" class="py-6 text-center text-sm text-gray-400 dark:text-gray-600">No accounts yet.</div>
            <div v-else class="space-y-2">
              <div v-for="acc in accounts" :key="acc.name" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold" :class="accountColor(acc.account_type)">{{ (acc.account_name || "A").charAt(0).toUpperCase() }}</span>
                  <div>
                    <p class="text-sm font-medium">{{ acc.account_name }}</p>
                    <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ acc.account_type || "General" }}</p>
                  </div>
                </div>
                <p class="text-sm font-semibold" :class="acc.account_balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">{{ currency(acc.account_balance) }}</p>
              </div>
            </div>
          </div>

          <!-- Monthly by Account -->
          <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Monthly by Account</h2>
            <div v-if="accountSummary.length === 0" class="py-6 text-center text-sm text-gray-400 dark:text-gray-600">No data this month.</div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-wider">
                    <th class="text-left py-2 px-2 font-medium">Account</th>
                    <th class="text-right py-2 px-2 font-medium">Income</th>
                    <th class="text-right py-2 px-2 font-medium">Expense</th>
                    <th class="text-right py-2 px-2 font-medium">Net</th>
                    <th class="text-right py-2 px-2 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in accountSummary" :key="row.account" class="border-b border-gray-50 dark:border-gray-800/50">
                    <td class="py-2 px-2 font-medium">{{ row.account }}</td>
                    <td class="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">{{ currency(row.income) }}</td>
                    <td class="py-2 px-2 text-right text-red-500 dark:text-red-400 font-medium">{{ currency(row.expense) }}</td>
                    <td class="py-2 px-2 text-right font-semibold" :class="row.income - row.expense >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">{{ currency(row.income - row.expense) }}</td>
                    <td class="py-2 px-2 text-right font-semibold" :class="row.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500 dark:text-red-400'">{{ currency(row.balance) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Spending by Category -->
          <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Spending by Category</h2>
            <div v-if="categoryBreakdown.length === 0" class="py-6 text-center text-sm text-gray-400 dark:text-gray-600">No expense data this month.</div>
            <div v-else class="space-y-3">
              <div v-for="cat in categoryBreakdown" :key="cat.category">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium">{{ cat.category }}</span>
                  <span class="text-xs font-semibold text-red-500 dark:text-red-400">{{ currency(cat.total) }}</span>
                </div>
                <div class="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-500" :style="{width: catPercent(cat.total) + '%'}"></div>
                </div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{{ cat.count }} txn{{ cat.count !== 1 ? 's' : '' }} · {{ catPercent(cat.total).toFixed(1) }}%</p>
              </div>
            </div>
          </div>

          <!-- Income by Category -->
          <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Income by Category</h2>
            <div v-if="incomeCategoryBreakdown.length === 0" class="py-6 text-center text-sm text-gray-400 dark:text-gray-600">No income data this month.</div>
            <div v-else class="space-y-3">
              <div v-for="cat in incomeCategoryBreakdown" :key="cat.category">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium">{{ cat.category }}</span>
                  <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{{ currency(cat.total) }}</span>
                </div>
                <div class="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" :style="{width: incCatPercent(cat.total) + '%'}"></div>
                </div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{{ cat.count }} txn{{ cat.count !== 1 ? 's' : '' }} · {{ incCatPercent(cat.total).toFixed(1) }}%</p>
              </div>
            </div>
          </div>

        </section>

        <!-- ═══════════════════ ALL TRANSACTIONS ═══════════════════ -->
        <section class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div class="px-5 pt-5 pb-3 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transactions</h2>
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ totalTransactions }} total</span>
            </div>
            <!-- Filters -->
            <div class="flex flex-wrap gap-2">
              <select v-model="filter.type" @change="applyFilters"
                class="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                <option value="">All Types</option>
                <option>Expense</option><option>Income</option><option>Transfer</option>
              </select>
              <select v-model="filter.account" @change="applyFilters"
                class="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                <option value="">All Accounts</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
              <select v-model="filter.category" @change="applyFilters"
                class="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                <option value="">All Categories</option>
                <option v-for="c in categories" :key="c.name" :value="c.name">{{ c.category }}</option>
              </select>
              <button v-if="filter.type || filter.account || filter.category" @click="clearFilters"
                class="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Clear
              </button>
            </div>
          </div>

          <div v-if="transactions.length === 0" class="px-5 pb-8 pt-2 text-center text-sm text-gray-400 dark:text-gray-600">No transactions found.</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider">
                  <th class="text-left pl-5 pr-2 py-3 font-medium">Date</th>
                  <th class="text-left px-2 py-3 font-medium">Type</th>
                  <th class="text-left px-2 py-3 font-medium">Category</th>
                  <th class="text-left px-2 py-3 font-medium">Account</th>
                  <th class="text-left px-2 py-3 font-medium">Note</th>
                  <th class="text-right px-2 py-3 font-medium">Amount</th>
                  <th class="text-center pl-2 pr-5 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="txn in transactions" :key="txn.name" class="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                  <td class="pl-5 pr-2 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{{ formatDate(txn.date) }}</td>
                  <td class="px-2 py-3">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" :class="typeBadge(txn.type)">
                      <span class="w-1.5 h-1.5 rounded-full" :class="typeDot(txn.type)"></span>{{ txn.type }}
                    </span>
                  </td>
                  <td class="px-2 py-3 text-gray-600 dark:text-gray-300">{{ txn.category || (txn.type === "Transfer" ? "→ " + txn.to_account : "—") }}</td>
                  <td class="px-2 py-3 text-gray-600 dark:text-gray-300">{{ txn.account }}</td>
                  <td class="px-2 py-3 text-gray-400 dark:text-gray-500 max-w-[180px] truncate">{{ txn.note || "—" }}</td>
                  <td class="px-2 py-3 text-right font-semibold whitespace-nowrap" :class="amountColor(txn.type)">
                    {{ txn.type === "Expense" ? "−" : txn.type === "Income" ? "+" : "" }}{{ currency(txn.amount) }}
                  </td>
                  <td class="pl-2 pr-5 py-3 text-center">
                    <button @click.stop="deleteTransaction(txn.name)" class="p-1 rounded-lg text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Load more -->
          <div v-if="transactions.length > 0 && hasMoreTransactions" class="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
            <button @click="loadMore" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Load More</button>
          </div>
        </section>

      </main>

      <!-- ═══════════════════ NEW TRANSACTION MODAL ═══════════════════ -->
      <Transition name="modal">
        <div v-if="form.show" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="form.show = false"></div>
          <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold">New Transaction</h3>
              <button @click="form.show = false" class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Success / Error -->
            <div v-if="form.success" class="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
              <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Transaction created!
            </div>
            <div v-if="form.error" class="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-3 py-2 text-xs text-red-700 dark:text-red-400">
              <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ form.error }}
            </div>

            <!-- Type selector pills -->
            <div class="flex gap-2">
              <button v-for="t in ['Expense','Income','Transfer']" :key="t" @click="setFormType(t)"
                class="flex-1 py-2 rounded-xl text-xs font-semibold transition-all border"
                :class="form.type === t ? typeActiveClass(t) : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'">
                {{ t }}
              </button>
            </div>

            <!-- Amount -->
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount</label>
              <input ref="amountInput" type="number" v-model.number="form.amount" min="0.01" step="0.01" placeholder="0.00"
                class="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
            </div>

            <!-- Account -->
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account</label>
              <select v-model="form.account"
                class="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all">
                <option value="">Select account</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>

            <!-- To Account (Transfer only) -->
            <div v-if="form.type === 'Transfer'">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Account</label>
              <select v-model="form.to_account"
                class="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all">
                <option value="">Select destination</option>
                <option v-for="a in accounts.filter(x => x.name !== form.account)" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>

            <!-- Category (Expense / Income) -->
            <div v-if="form.type !== 'Transfer'">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select v-model="form.category"
                class="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all">
                <option value="">Select category</option>
                <option v-for="c in filteredCategories" :key="c.name" :value="c.name">{{ c.category }}</option>
              </select>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
              <input type="date" v-model="form.date"
                class="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
            </div>

            <!-- Note -->
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Note <span class="text-gray-400">(optional)</span></label>
              <input type="text" v-model="form.note" placeholder="What's this for?" @keyup.enter="createTransaction"
                class="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button @click="form.show = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button @click="createTransaction" :disabled="form.saving"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                <svg v-if="form.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ form.saving ? "Saving..." : "Add Transaction" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ═══════════════════ DELETE CONFIRM MODAL ═══════════════════ -->
      <Transition name="modal">
        <div v-if="deleteModal.show" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="deleteModal.show = false"></div>
          <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 max-w-sm w-full space-y-4">
            <h3 class="text-lg font-bold">Delete Transaction?</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">This will reverse the balance changes and permanently remove the transaction. This cannot be undone.</p>
            <div class="flex gap-3 justify-end">
              <button @click="deleteModal.show = false" class="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button @click="confirmDelete" :disabled="deleteModal.deleting"
                class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-60 transition-all flex items-center gap-2">
                <svg v-if="deleteModal.deleting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ deleteModal.deleting ? "Deleting..." : "Delete" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ═══════════════════ FAB — New Transaction ═══════════════════ -->
      <button @click="openFormModal('Expense')" class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center" aria-label="New transaction">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
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
  },
  async mounted() {
    const saved = localStorage.getItem("pw-theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      this.isDark = true;
    }
    await this.fetchAll();
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
        const summary = [];
        for (const acc of this.accounts.length ? this.accounts : await this.fetchAccounts() || []) {
          const inc = await this.$call("frappe.client.get_list", {
            doctype: "My Wallet",
            filters: { type: "Income", account: acc.name, date: [">=", firstDay] },
            fields: ["sum(amount) as total"],
            limit_page_length: 1,
          });
          const exp = await this.$call("frappe.client.get_list", {
            doctype: "My Wallet",
            filters: { type: "Expense", account: acc.name, date: [">=", firstDay] },
            fields: ["sum(amount) as total"],
            limit_page_length: 1,
          });
          summary.push({
            account: acc.account_name,
            income: inc?.[0]?.total || 0,
            expense: exp?.[0]?.total || 0,
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
    typeActiveClass(t) {
      return {
        Expense: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
        Income: "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        Transfer: "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
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
      return { Expense: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400", Income: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400", Transfer: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" }[type];
    },
    typeDot(type) {
      return { Expense: "bg-red-500", Income: "bg-emerald-500", Transfer: "bg-blue-500" }[type];
    },
    amountColor(type) {
      return { Expense: "text-red-500 dark:text-red-400", Income: "text-emerald-600 dark:text-emerald-400", Transfer: "text-blue-600 dark:text-blue-400" }[type];
    },
    accountColor(type) {
      const t = (type || "").toLowerCase();
      if (t.includes("cash")) return "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
      if (t.includes("saving")) return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      if (t.includes("bank")) return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      if (t.includes("credit")) return "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    },
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
