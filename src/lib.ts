import type { Invoice, Totals, Client } from "./types";
let csrf = "";
export const setCsrf = (value: string) => {
  csrf = value;
};
export async function api<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    if (response.status === 401 && path !== "/auth/login")
      window.dispatchEvent(new Event("session-expired"));
    throw new Error(payload.error || "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
export const money = (value: number, currency = "IDR") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "IDR" ? 0 : 2,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  })
    .format(value)
    .replace("IDR", "Rp");
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );
export function addDays(value: string, days: number) {
  const d = new Date(value + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}
export const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
export function calculate(v: Invoice): Totals {
  const factor = v.currency === "IDR" ? 1 : 100;
  const amounts = v.items.map((i) =>
    Math.round(
      (Math.round(i.price * factor) * Math.round(i.quantity * 10000)) / 10000,
    ),
  );
  const subtotal = amounts.reduce((a, b) => a + b, 0);
  const discount =
    v.discountType === "percent"
      ? Math.round((subtotal * v.discount) / 100)
      : Math.round(v.discount * factor);
  const tax = Math.round(((subtotal - discount) * v.tax) / 100);
  return {
    amounts: amounts.map((a) => a / factor),
    subtotal: subtotal / factor,
    discount: discount / factor,
    tax: tax / factor,
    total: (subtotal - discount + tax) / factor,
  };
}
export const blankClient: Client = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  taxId: "",
  notes: "",
};
export async function downloadPdf(invoice: Invoice) {
  const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
  if (!response.ok)
    throw new Error("Unable to generate PDF. Please sign in and try again.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoice.number}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
