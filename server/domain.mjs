import { z } from "zod";
export const currencies = ["IDR", "USD", "SGD"];
const text = (max = 500) => z.string().trim().max(max).default("");
const email = z.union([z.literal(""), z.string().email().max(254)]).default("");
const decimal = (max) => z.number().finite().min(0).max(max);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(s + "T00:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Invalid calendar date");
export const clientSchema = z.object({
  name: text(150).refine(Boolean, "Client name is required"),
  company: text(150),
  email,
  phone: text(80),
  address: text(2000),
  taxId: text(100),
  notes: text(2000),
});
export const serviceSchema = z.object({
  name: text(150).refine(Boolean, "Service name is required"),
  description: text(2000).refine(Boolean, "Description is required"),
  price: decimal(1e10),
  unit: text(50),
});
export const businessSchema = z.object({
  name: text(150).refine(Boolean, "Business name is required"),
  address: text(2000),
  email,
  phone: text(80),
  website: text(200),
  taxId: text(100),
  logo: z
    .string()
    .max(700000)
    .refine(
      (s) => !s || /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(s),
      "Use a PNG or JPEG logo",
    )
    .default(""),
});
export const paymentSchema = z.object({
  bank: text(150),
  accountName: text(150),
  accountNumber: text(150),
});
export const settingsSchema = z.object({
  business: businessSchema,
  payment: paymentSchema,
  prefix: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{1,20}$/),
  nextNumber: z.number().int().min(1).max(999999999),
  numberFormat: z.enum(["year", "simple"]),
  currency: z.enum(currencies),
  paymentDays: z.number().int().min(0).max(365),
  tax: decimal(100),
  notes: text(4000),
});
export const invoiceSchema = z
  .object({
    number: z.string().trim().max(100).optional(),
    date,
    dueDate: date,
    confirmEarlyDue: z.boolean().default(false),
    clientId: z.number().int().positive().nullable(),
    client: clientSchema,
    business: businessSchema,
    payment: paymentSchema,
    currency: z.enum(currencies),
    paymentDays: z.number().int().min(0).max(365),
    status: z.enum(["Draft", "Sent", "Paid", "Cancelled"]).default("Draft"),
    items: z
      .array(
        z.object({
          description: text(2000).refine(
            Boolean,
            "Item description is required",
          ),
          quantity: z
            .number()
            .finite()
            .positive()
            .max(100000)
            .refine(
              (n) => Math.abs(n * 10000 - Math.round(n * 10000)) < 0.00001,
              "Use up to four quantity decimals",
            ),
          unit: text(50),
          price: decimal(1e10),
        }),
      )
      .min(1)
      .max(100),
    discountType: z.enum(["percent", "fixed"]),
    discount: decimal(1e10),
    tax: decimal(100),
    notes: text(4000),
  })
  .superRefine((v, ctx) => {
    if (v.dueDate < v.date && !v.confirmEarlyDue)
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Confirm a due date earlier than the invoice date",
      });
    if (v.discountType === "percent" && v.discount > 100)
      ctx.addIssue({
        code: "custom",
        path: ["discount"],
        message: "Percentage discount cannot exceed 100%",
      });
    const precision = v.currency === "IDR" ? 1 : 100;
    for (const [i, item] of v.items.entries())
      if (
        Math.abs(item.price * precision - Math.round(item.price * precision)) >
        0.00001
      )
        ctx.addIssue({
          code: "custom",
          path: ["items", i, "price"],
          message:
            v.currency === "IDR"
              ? "IDR prices must be whole rupiah"
              : "Prices can have at most two decimals",
        });
  });
export function calculate(v) {
  const factor = v.currency === "IDR" ? 1 : 100;
  const amountsMinor = v.items.map((i) =>
    Math.round(
      (Math.round(i.price * factor) * Math.round(i.quantity * 10000)) / 10000,
    ),
  );
  const subtotal = amountsMinor.reduce((s, a) => s + a, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal > 1e14)
    throw new Error("Invoice amount is too large");
  const discount =
    v.discountType === "percent"
      ? Math.round((subtotal * v.discount) / 100)
      : Math.round(v.discount * factor);
  if (discount > subtotal) throw new Error("Discount cannot exceed subtotal");
  const tax = Math.round(((subtotal - discount) * v.tax) / 100);
  return {
    amounts: amountsMinor.map((a) => a / factor),
    subtotal: subtotal / factor,
    discount: discount / factor,
    tax: tax / factor,
    total: (subtotal - discount + tax) / factor,
  };
}
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );
export function dueDate(dateValue, days) {
  const d = new Date(dateValue + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export const defaults = {
  business: {
    name: "TuruDev",
    address: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    logo: "",
  },
  payment: { bank: "", accountName: "", accountNumber: "" },
  prefix: "INV",
  nextNumber: 1,
  numberFormat: "year",
  currency: "IDR",
  paymentDays: 14,
  tax: 0,
  notes: "Thank you for your business.",
};
