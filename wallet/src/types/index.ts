// Domain types for Pocket Wallet.
// These intentionally mirror the Frappe backend (My Wallet / Wallet Account /
// Wallet Category) but are enriched with UI-only fields (tags, payment method,
// budgets) that the mock layer provides. When wiring real APIs, map these to
// the `/api/resource/*` payloads.

export type TransactionType = "income" | "expense" | "transfer";

export type WalletType = "cash" | "bank" | "credit" | "ewallet";

export type PaymentMethod = "cash" | "card" | "upi" | "bank" | "wallet";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  /** Icon name understood by the <Icon> component. */
  icon: string;
  /** Tailwind-ish hex used for tints, chips and chart slices. */
  color: string;
  kind: "expense" | "income";
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  icon: string;
  /** User id that owns this wallet (creator). */
  owner?: string;
}

export interface WalletShares {
  wallet: string;
  owner: string;
  shared_with: string[];
}

export interface ShareableUser {
  name: string;
  full_name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  walletId: string;
  /** Destination wallet, only for `transfer`. */
  toWalletId?: string | null;
  /** ISO date-time string. */
  date: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  tags?: string[];
  /** Mock receipt file name, if attached. */
  receipt?: string | null;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  /** Computed from this month's spend, kept on the record for the mock. */
  spent: number;
  period: "monthly";
}

export type NotificationKind =
  | "budget"
  | "bill"
  | "milestone"
  | "summary";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string | null;
  currency: string;
}
