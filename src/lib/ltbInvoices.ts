export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface LineItemRecord {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromVat: string;
  toName: string;
  toAddress: string;
  toEmail: string;
  toVat: string;
  items: LineItemRecord[];
  notes: string;
  currency: string;
  taxRate: number;
  bankName: string;
  iban: string;
  swift: string;
  reference: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface ClientSummary {
  name: string;
  email: string;
  invoiceCount: number;
  totalBilled: number;
  outstanding: number;
  lastInvoiceDate: string;
  currency: string;
}

export const LTB_INVOICES_STORAGE_KEY = "ltb-saved-invoices-v1";
export const LTB_DRAFT_STORAGE_KEY = "ltb-invoice-draft-v1";

function parseStored<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function calculateInvoiceTotals(invoice: Pick<InvoiceRecord, "items" | "taxRate">): InvoiceTotals {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function readSavedInvoices(): InvoiceRecord[] {
  if (typeof window === "undefined") return [];

  const invoices = parseStored<InvoiceRecord[]>(window.localStorage.getItem(LTB_INVOICES_STORAGE_KEY), []);
  return invoices.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function writeSavedInvoices(invoices: InvoiceRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LTB_INVOICES_STORAGE_KEY, JSON.stringify(invoices));
}

export function readInvoiceDraft<T>(fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return parseStored<T>(window.localStorage.getItem(LTB_DRAFT_STORAGE_KEY), fallback);
}

export function writeInvoiceDraft<T>(draft: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LTB_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function upsertInvoiceRecord(invoice: InvoiceRecord): InvoiceRecord[] {
  const invoices = readSavedInvoices();
  const next = [invoice, ...invoices.filter((entry) => entry.id !== invoice.id)];
  writeSavedInvoices(next);
  return next;
}

export function deleteInvoiceRecord(id: string): InvoiceRecord[] {
  const next = readSavedInvoices().filter((invoice) => invoice.id !== id);
  writeSavedInvoices(next);
  return next;
}

export function buildClientSummaries(invoices: InvoiceRecord[]): ClientSummary[] {
  const map = new Map<string, ClientSummary>();

  for (const invoice of invoices) {
    const key = `${invoice.toName.trim().toLowerCase()}|${invoice.toEmail.trim().toLowerCase()}`;
    if (!invoice.toName.trim() && !invoice.toEmail.trim()) continue;

    const totals = calculateInvoiceTotals(invoice);
    const outstanding = invoice.status === "paid" ? 0 : totals.total;
    const current = map.get(key);

    if (!current) {
      map.set(key, {
        name: invoice.toName || "Unnamed client",
        email: invoice.toEmail,
        invoiceCount: 1,
        totalBilled: totals.total,
        outstanding,
        lastInvoiceDate: invoice.issueDate,
        currency: invoice.currency,
      });
      continue;
    }

    current.invoiceCount += 1;
    current.totalBilled += totals.total;
    current.outstanding += outstanding;
    if (+new Date(invoice.issueDate) > +new Date(current.lastInvoiceDate)) {
      current.lastInvoiceDate = invoice.issueDate;
    }
  }

  return [...map.values()].sort((a, b) => b.totalBilled - a.totalBilled);
}

export function getMonthToDateRevenue(invoices: InvoiceRecord[], now = new Date()): number {
  const year = now.getFullYear();
  const month = now.getMonth();

  return invoices.reduce((sum, invoice) => {
    if (invoice.status !== "paid") return sum;

    const date = new Date(invoice.issueDate);
    if (date.getFullYear() !== year || date.getMonth() !== month) return sum;

    return sum + calculateInvoiceTotals(invoice).total;
  }, 0);
}
