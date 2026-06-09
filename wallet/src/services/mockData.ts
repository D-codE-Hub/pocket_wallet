// Seed data for the mock backend. Everything the UI renders originates here.
import type {
  AppNotification,
  Budget,
  Category,
  Transaction,
  UserProfile,
  Wallet,
} from "@/types";

export const categories: Category[] = [
  { id: "food", name: "Food", emoji: "🍔", icon: "utensils", color: "#f97316", kind: "expense" },
  { id: "transport", name: "Transport", emoji: "🚕", icon: "car", color: "#3b82f6", kind: "expense" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", icon: "bag", color: "#ec4899", kind: "expense" },
  { id: "bills", name: "Bills", emoji: "🧾", icon: "receipt", color: "#ef4444", kind: "expense" },
  { id: "health", name: "Health", emoji: "💊", icon: "heart", color: "#14b8a6", kind: "expense" },
  { id: "entertainment", name: "Entertainment", emoji: "🎬", icon: "film", color: "#8b5cf6", kind: "expense" },
  { id: "travel", name: "Travel", emoji: "✈️", icon: "plane", color: "#06b6d4", kind: "expense" },
  { id: "education", name: "Education", emoji: "📚", icon: "book", color: "#6366f1", kind: "expense" },
  { id: "others", name: "Others", emoji: "📦", icon: "box", color: "#64748b", kind: "expense" },
  { id: "salary", name: "Salary", emoji: "💼", icon: "briefcase", color: "#10b981", kind: "income" },
  { id: "investment", name: "Investment", emoji: "📈", icon: "trending-up", color: "#22c55e", kind: "income" },
];

export const wallets: Wallet[] = [
  { id: "cash", name: "Cash", type: "cash", balance: 540, color: "#10b981", icon: "wallet" },
  { id: "bank", name: "Bank Account", type: "bank", balance: 8420.5, color: "#2563eb", icon: "bank" },
  { id: "credit", name: "Credit Card", type: "credit", balance: -1240.75, color: "#8b5cf6", icon: "card" },
  { id: "ewallet", name: "E-Wallet", type: "ewallet", balance: 312.2, color: "#f59e0b", icon: "smartphone" },
];

// Build ~3 months of plausible transactions so charts and analytics look real.
function seedTransactions(): Transaction[] {
  const out: Transaction[] = [];
  const now = new Date();
  const expenseCats = categories.filter((c) => c.kind === "expense");
  const payMethods = ["card", "upi", "cash", "wallet"] as const;
  let id = 1;

  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    const d = new Date(now);
    d.setDate(now.getDate() - dayOffset);

    // Salary on the 1st of each month.
    if (d.getDate() === 1) {
      out.push({
        id: `t${id++}`,
        type: "income",
        amount: 4200,
        categoryId: "salary",
        walletId: "bank",
        date: new Date(d.setHours(9, 5)).toISOString(),
        note: "Monthly salary",
        paymentMethod: "bank",
        tags: ["work"],
      });
    }

    // 0–3 expenses per day.
    const count = Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const cat = expenseCats[Math.floor(Math.random() * expenseCats.length)];
      const wallet = wallets[Math.floor(Math.random() * wallets.length)];
      const amount = Math.round((5 + Math.random() * 120) * 100) / 100;
      const dt = new Date(d);
      dt.setHours(8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60));
      out.push({
        id: `t${id++}`,
        type: "expense",
        amount,
        categoryId: cat.id,
        walletId: wallet.id,
        date: dt.toISOString(),
        note: `${cat.name} purchase`,
        paymentMethod: payMethods[Math.floor(Math.random() * payMethods.length)],
        tags: Math.random() > 0.7 ? ["personal"] : [],
      });
    }

    // Occasional transfer.
    if (Math.random() > 0.92) {
      const dt = new Date(d);
      dt.setHours(12);
      out.push({
        id: `t${id++}`,
        type: "transfer",
        amount: Math.round((50 + Math.random() * 200) * 100) / 100,
        categoryId: null,
        walletId: "bank",
        toWalletId: "cash",
        date: dt.toISOString(),
        note: "Transfer to cash",
      });
    }
  }
  return out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const transactions: Transaction[] = seedTransactions();

export const budgets: Budget[] = [
  { id: "b1", categoryId: "food", amount: 600, spent: 0, period: "monthly" },
  { id: "b2", categoryId: "transport", amount: 250, spent: 0, period: "monthly" },
  { id: "b3", categoryId: "shopping", amount: 400, spent: 0, period: "monthly" },
  { id: "b4", categoryId: "entertainment", amount: 150, spent: 0, period: "monthly" },
  { id: "b5", categoryId: "bills", amount: 500, spent: 0, period: "monthly" },
];

export const notifications: AppNotification[] = [
  {
    id: "n1",
    kind: "budget",
    title: "Budget alert",
    message: "You've used 82% of your Food budget this month.",
    date: new Date(Date.now() - 2 * 3600_000).toISOString(),
    read: false,
  },
  {
    id: "n2",
    kind: "bill",
    title: "Upcoming bill",
    message: "Electricity bill of $86 is due in 3 days.",
    date: new Date(Date.now() - 26 * 3600_000).toISOString(),
    read: false,
  },
  {
    id: "n3",
    kind: "milestone",
    title: "Savings milestone 🎉",
    message: "You saved over $1,000 this month. Keep it up!",
    date: new Date(Date.now() - 50 * 3600_000).toISOString(),
    read: true,
  },
  {
    id: "n4",
    kind: "summary",
    title: "Monthly summary ready",
    message: "Your spending report for last month is available.",
    date: new Date(Date.now() - 74 * 3600_000).toISOString(),
    read: true,
  },
];

export const profile: UserProfile = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: null,
  currency: "USD",
};
