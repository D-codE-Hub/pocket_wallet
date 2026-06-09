// Formatting helpers shared across screens. Currency is read reactively from
// the UI store so changing it in Settings re-formats every amount on screen.
import { computed } from "vue";
import { useUiStore } from "@/stores/useUiStore";

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  INR: "en-IN",
  AED: "en-AE",
};

export function useFormat() {
  const ui = useUiStore();

  const currency = computed(() => ui.currency);

  function formatMoney(value: number, opts: { sign?: boolean } = {}): string {
    const locale = CURRENCY_LOCALE[currency.value] ?? "en-US";
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.value,
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(Math.abs(value));
    if (opts.sign && value !== 0) return (value > 0 ? "+" : "−") + formatted;
    return formatted;
  }

  /** Compact form for big balances, e.g. 12.4K. */
  function formatCompact(value: number): string {
    const locale = CURRENCY_LOCALE[currency.value] ?? "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.value,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return { currency, formatMoney, formatCompact };
}

// --- Date helpers (no store dependency, safe to import anywhere) -------------

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
  if (!withTime) return date;
  return `${date} · ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/** "Today", "Yesterday" or a short date — used for grouping headers. */
export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
