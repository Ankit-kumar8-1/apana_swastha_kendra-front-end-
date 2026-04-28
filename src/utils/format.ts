// src/utils/format.ts

/**
 * Safely parse date
 */
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/* ================= DATE ================= */

export function formatDate(
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseDate(dateString);
  if (!date) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatDateTime(dateString: string | null | undefined): string {
  const date = parseDate(dateString);
  if (!date) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ================= RELATIVE TIME ================= */

export function formatRelativeTime(
  dateString: string | null | undefined,
): string {
  const date = parseDate(dateString);
  if (!date) return "—";

  const now = Date.now();
  const diffMs = now - date.getTime();

  // future date handling
  if (diffMs < 0) return formatDate(dateString);

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;

  return formatDate(dateString);
}

/* ================= CURRENCY ================= */

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "INR",
): string {
  if (amount == null || isNaN(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ================= NUMBER ================= */

export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";

  return new Intl.NumberFormat("en-IN").format(value);
}

/* ================= PHONE ================= */

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";

  const cleaned = phone.replace(/\D/g, "");

  // Indian 10-digit number
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  // already with country code (e.g., 919876543210)
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/* ================= ROLE NAME ================= */

export function formatRoleName(role: string): string {
  if (!role) return "—";

  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
