export type Client = {
  id?: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes: string;
};
export type Service = {
  id?: number;
  name: string;
  description: string;
  price: number;
  unit: string;
};
export type Business = {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  logo: string;
};
export type Payment = {
  bank: string;
  accountName: string;
  accountNumber: string;
};
export type Settings = {
  business: Business;
  payment: Payment;
  prefix: string;
  nextNumber: number;
  numberFormat: "year" | "simple";
  currency: string;
  paymentDays: number;
  tax: number;
  notes: string;
};
export type Item = {
  description: string;
  quantity: number;
  unit: string;
  price: number;
};
export type Status = "Draft" | "Sent" | "Paid" | "Cancelled";
export type Totals = {
  amounts: number[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};
export type Invoice = {
  id?: number;
  number?: string;
  date: string;
  dueDate: string;
  confirmEarlyDue: boolean;
  clientId: number | null;
  client: Client;
  business: Business;
  payment: Payment;
  currency: string;
  paymentDays: number;
  status: Status;
  items: Item[];
  discountType: "percent" | "fixed";
  discount: number;
  tax: number;
  notes: string;
  totals?: Totals;
  archived?: boolean;
  version?: number;
};
export type DashboardData = {
  total: number;
  status: Record<Status, number>;
  unpaid: number;
  amounts: Record<
    string,
    { invoiced: number; paid: number; outstanding: number }
  >;
  recent: Invoice[];
};
