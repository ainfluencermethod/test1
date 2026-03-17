"use client";

import { useState, useCallback, useRef, memo, useEffect } from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import {
  type InvoiceRecord,
  type InvoiceStatus,
  calculateInvoiceTotals,
  deleteInvoiceRecord,
  formatCurrency,
  readInvoiceDraft,
  readSavedInvoices,
  upsertInvoiceRecord,
  writeInvoiceDraft,
} from "@/lib/ltbInvoices";
import { ltbBrand } from "@/lib/ltbBrand";

/* ─── TYPES ─── */
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
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
  items: LineItem[];
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

/* ─── STYLES ─── */
const card = {
  background: "#13151A",
  border: "1px solid rgba(255,255,255,0.04)",
  borderRadius: 16,
  padding: 32,
} as const;

const labelStyle = {
  fontSize: "0.6875rem",
  color: "#6B7280",
  fontWeight: 500 as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  marginBottom: 6,
  display: "block" as const,
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.92)",
  fontSize: "0.875rem",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  transition: "border-color 0.15s",
} as const;

const monoNumber = {
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700 as const,
  color: "rgba(255,255,255,0.92)",
};

const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
    fontSize: 10,
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    marginBottom: 30,
  },
  brandBlock: {
    width: "58%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  logo: {
    width: 96,
    height: 96,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: ltbBrand.primaryStrong,
  },
  companyMeta: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
  },
  invoiceBlock: {
    width: "38%",
    alignItems: "flex-end",
  },
  invoiceLabel: {
    fontSize: 24,
    fontWeight: 300,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 4,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 26,
  },
  billTo: {
    width: "52%",
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  billToName: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1A1A1A",
    marginBottom: 2,
  },
  billToMeta: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
    marginTop: 2,
  },
  detailPills: {
    width: "40%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
  },
  detailPill: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 8,
  },
  detailPillLabel: {
    color: "#9CA3AF",
    fontSize: 9,
  },
  detailPillValue: {
    color: "#1A1A1A",
    fontSize: 9,
    fontWeight: 700,
  },
  table: {
    width: "100%",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FCFCFD",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  colDescription: {
    width: "46%",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  colQty: {
    width: "14%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: "right",
  },
  colRate: {
    width: "20%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: "right",
  },
  colAmount: {
    width: "20%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: "right",
  },
  headerCell: {
    fontSize: 8,
    fontWeight: 700,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  rowCell: {
    fontSize: 9.5,
    color: "#374151",
  },
  rowAmount: {
    fontSize: 9.5,
    color: "#1A1A1A",
    fontWeight: 700,
  },
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  totalsBox: {
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalsLabel: {
    fontSize: 9,
    color: "#6B7280",
  },
  totalsValue: {
    fontSize: 9,
    color: "#1A1A1A",
  },
  totalDivider: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#1A1A1A",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  bankCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  bankItem: {
    width: "50%",
    paddingRight: 8,
    marginBottom: 6,
  },
  bankItemLabel: {
    fontSize: 8.5,
    color: "#9CA3AF",
  },
  bankItemValue: {
    fontSize: 9,
    color: "#374151",
    fontWeight: 700,
  },
  notes: {
    fontSize: 9,
    color: "#9CA3AF",
    fontStyle: "italic",
    lineHeight: 1.5,
  },
});

const statusColors: Record<InvoiceStatus, string> = {
  draft: "#6B7280",
  sent: ltbBrand.primary,
  paid: ltbBrand.revenue,
  overdue: ltbBrand.danger,
};

/* ─── HELPERS ─── */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `LTB-${y}${m}-${seq}`;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function dueDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to convert image to data URL"));
    reader.readAsDataURL(blob);
  });
}

function createFreshInvoice(): InvoiceData {
  const now = new Date().toISOString();
  const invoiceNumber = generateInvoiceNumber();

  return {
    id: generateId(),
    invoiceNumber,
    issueDate: todayStr(),
    dueDate: dueDateStr(),
    fromName: "L.T.B LTD",
    fromAddress: "28ths Oktovriou, 261, VIEW POINT TOWER, 8th floor, Limassol, 3035, Limassol, Cyprus",
    fromEmail: "",
    fromVat: "",
    toName: "",
    toAddress: "",
    toEmail: "",
    toVat: "",
    items: [{ id: generateId(), description: "", quantity: 1, rate: 0 }],
    notes: "",
    currency: "EUR",
    taxRate: 0,
    bankName: "Revolut",
    iban: "LT843250085842336877",
    swift: "REVOLT21",
    reference: invoiceNumber,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

function invoiceToRecord(invoice: InvoiceData): InvoiceRecord {
  return { ...invoice, updatedAt: new Date().toISOString() };
}

function recordToInvoice(invoice: InvoiceRecord): InvoiceData {
  return {
    ...invoice,
    reference: invoice.reference?.trim() || invoice.invoiceNumber,
  };
}

function syncReferenceWithInvoiceNumber(invoice: InvoiceData, nextInvoiceNumber: string): InvoiceData {
  const currentReference = invoice.reference?.trim() || "";
  const currentInvoiceNumber = invoice.invoiceNumber?.trim() || "";
  const shouldFollowInvoiceNumber = !currentReference || currentReference === currentInvoiceNumber;

  return {
    ...invoice,
    invoiceNumber: nextInvoiceNumber,
    reference: shouldFollowInvoiceNumber ? nextInvoiceNumber : invoice.reference,
    updatedAt: new Date().toISOString(),
  };
}

/* ─── Input Field Component ─── */
const Field = memo(function Field({ label, value, onChange, type = "text", placeholder = "", mono = false, half = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean; half?: boolean;
}) {
  return (
    <div style={{ flex: half ? "0 0 48%" : 1 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          ...(mono ? { fontFamily: "'JetBrains Mono', monospace" } : {}),
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ltbBrand.borderStrong; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
      />
    </div>
  );
});

function InvoicePdfDocument({
  invoice,
  subtotal,
  taxAmount,
  total,
  logoSrc,
}: {
  invoice: InvoiceData;
  subtotal: number;
  taxAmount: number;
  total: number;
  logoSrc?: string | null;
}) {
  const visibleItems = invoice.items.filter((item) => item.description || item.rate > 0);

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`} author="L.T.B LTD" creator="LTB Invoice Builder">
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.brandBlock}>
            {logoSrc ? <Image src={logoSrc} style={pdfStyles.logo} /> : null}
            <View>
              <Text style={pdfStyles.companyName}>{invoice.fromName || "L.T.B LTD"}</Text>
              {invoice.fromAddress ? <Text style={pdfStyles.companyMeta}>{invoice.fromAddress}</Text> : null}
              {invoice.fromEmail ? <Text style={pdfStyles.companyMeta}>{invoice.fromEmail}</Text> : null}
              {invoice.fromVat ? <Text style={pdfStyles.companyMeta}>VAT: {invoice.fromVat}</Text> : null}
            </View>
          </View>

          <View style={pdfStyles.invoiceBlock}>
            <Text style={pdfStyles.invoiceLabel}>Invoice</Text>
            <Text style={pdfStyles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={pdfStyles.metaGrid}>
          <View style={pdfStyles.billTo}>
            <Text style={pdfStyles.sectionLabel}>Bill To</Text>
            <Text style={pdfStyles.billToName}>{invoice.toName || "—"}</Text>
            {invoice.toAddress ? <Text style={pdfStyles.billToMeta}>{invoice.toAddress}</Text> : null}
            {invoice.toEmail ? <Text style={pdfStyles.billToMeta}>{invoice.toEmail}</Text> : null}
            {invoice.toVat ? <Text style={pdfStyles.billToMeta}>VAT: {invoice.toVat}</Text> : null}
          </View>

          <View style={pdfStyles.detailPills}>
            {[
              { label: "Issue Date", value: invoice.issueDate },
              { label: "Due Date", value: invoice.dueDate },
              { label: "Currency", value: invoice.currency },
            ].map((detail) => (
              <View key={detail.label} style={pdfStyles.detailPill}>
                <Text style={pdfStyles.detailPillLabel}>{detail.label}</Text>
                <Text style={pdfStyles.detailPillValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.colDescription, pdfStyles.headerCell]}>Description</Text>
            <Text style={[pdfStyles.colQty, pdfStyles.headerCell]}>Qty</Text>
            <Text style={[pdfStyles.colRate, pdfStyles.headerCell]}>Rate</Text>
            <Text style={[pdfStyles.colAmount, pdfStyles.headerCell]}>Amount</Text>
          </View>

          {(visibleItems.length ? visibleItems : [{ id: "empty", description: "—", quantity: 1, rate: 0 }]).map((item, index, arr) => (
            <View
              key={item.id}
              style={index === arr.length - 1 ? [pdfStyles.tableRow, pdfStyles.tableRowLast] : pdfStyles.tableRow}
            >
              <Text style={[pdfStyles.colDescription, pdfStyles.rowCell]}>{item.description || "—"}</Text>
              <Text style={[pdfStyles.colQty, pdfStyles.rowCell]}>{item.quantity}</Text>
              <Text style={[pdfStyles.colRate, pdfStyles.rowCell]}>{formatCurrency(item.rate, invoice.currency)}</Text>
              <Text style={[pdfStyles.colAmount, pdfStyles.rowAmount]}>{formatCurrency(item.quantity * item.rate, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totalsWrap}>
          <View style={pdfStyles.totalsBox}>
            <View style={pdfStyles.totalsRow}>
              <Text style={pdfStyles.totalsLabel}>Subtotal</Text>
              <Text style={pdfStyles.totalsValue}>{formatCurrency(subtotal, invoice.currency)}</Text>
            </View>
            <View style={pdfStyles.totalsRow}>
              <Text style={pdfStyles.totalsLabel}>Tax ({invoice.taxRate}%)</Text>
              <Text style={pdfStyles.totalsValue}>{formatCurrency(taxAmount, invoice.currency)}</Text>
            </View>
            <View style={[pdfStyles.totalsRow, pdfStyles.totalDivider]}>
              <Text style={pdfStyles.totalLabel}>Total</Text>
              <Text style={pdfStyles.totalValue}>{formatCurrency(total, invoice.currency)}</Text>
            </View>
          </View>
        </View>

        {(invoice.bankName || invoice.iban || invoice.swift || invoice.reference) ? (
          <View style={pdfStyles.bankCard}>
            <Text style={pdfStyles.sectionLabel}>Bank Details</Text>
            <View style={pdfStyles.bankGrid}>
              {invoice.bankName ? (
                <View style={pdfStyles.bankItem}>
                  <Text style={pdfStyles.bankItemLabel}>Bank</Text>
                  <Text style={pdfStyles.bankItemValue}>{invoice.bankName}</Text>
                </View>
              ) : null}
              {invoice.iban ? (
                <View style={pdfStyles.bankItem}>
                  <Text style={pdfStyles.bankItemLabel}>IBAN</Text>
                  <Text style={pdfStyles.bankItemValue}>{invoice.iban}</Text>
                </View>
              ) : null}
              {invoice.swift ? (
                <View style={pdfStyles.bankItem}>
                  <Text style={pdfStyles.bankItemLabel}>SWIFT</Text>
                  <Text style={pdfStyles.bankItemValue}>{invoice.swift}</Text>
                </View>
              ) : null}
              {invoice.reference ? (
                <View style={pdfStyles.bankItem}>
                  <Text style={pdfStyles.bankItemLabel}>Reference</Text>
                  <Text style={pdfStyles.bankItemValue}>{invoice.reference}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {invoice.notes ? <Text style={pdfStyles.notes}>{invoice.notes}</Text> : null}
      </Page>
    </Document>
  );
}

export default function InvoiceBuilderPage() {
  const [invoice, setInvoice] = useState<InvoiceData>(createFreshInvoice);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = readInvoiceDraft<InvoiceData | null>(null);
    const nextInvoice = draft ? recordToInvoice(draft) : createFreshInvoice();
    setInvoice(nextInvoice);
    setSavedInvoices(readSavedInvoices());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (typeof window === "undefined") return;

    imageUrlToDataUrl(`${window.location.origin}/ltb-logo.jpeg`)
      .then((dataUrl) => {
        if (!cancelled) {
          setLogoDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLogoDataUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeInvoiceDraft(invoiceToRecord(invoice));
  }, [invoice, isHydrated]);

  useEffect(() => {
    if (!saveMessage) return;
    const timeout = window.setTimeout(() => setSaveMessage(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  const update = useCallback((field: keyof InvoiceData, value: unknown) => {
    setInvoice((prev) => {
      if (field === "invoiceNumber") {
        return syncReferenceWithInvoiceNumber(prev, String(value));
      }

      return { ...prev, [field]: value, updatedAt: new Date().toISOString() };
    });
  }, []);

  const updateItem = useCallback((id: string, field: keyof LineItem, value: unknown) => {
    setInvoice((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  }, []);

  const addItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      items: [...prev.items, { id: generateId(), description: "", quantity: 1, rate: 0 }],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : prev.items,
    }));
  }, []);

  const { subtotal, taxAmount, total } = calculateInvoiceTotals(invoiceToRecord(invoice));

  const handleNewInvoice = useCallback(() => {
    setInvoice(createFreshInvoice());
    setActiveTab("edit");
    setSaveMessage("Fresh invoice ready");
  }, []);

  const handleSaveInvoice = useCallback(() => {
    const saved = upsertInvoiceRecord(invoiceToRecord(invoice));
    setSavedInvoices(saved);
    setInvoice((prev) => ({ ...prev, updatedAt: new Date().toISOString() }));
    setSaveMessage("Invoice saved");
  }, [invoice]);

  const handleLoadInvoice = useCallback((selected: InvoiceRecord) => {
    setInvoice(recordToInvoice(selected));
    setActiveTab("edit");
    setSaveMessage(`Loaded ${selected.invoiceNumber}`);
  }, []);

  const handleDeleteInvoice = useCallback((id: string) => {
    const next = deleteInvoiceRecord(id);
    setSavedInvoices(next);

    if (invoice.id === id) {
      setInvoice(createFreshInvoice());
      setActiveTab("edit");
    }

    setSaveMessage("Invoice deleted");
  }, [invoice.id]);

  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const printStyles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a1a; padding: 48px; max-width: 800px; margin: 0 auto; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
      th { font-size: 0.625rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 16px; border-bottom: 2px solid #f3f4f6; text-align: left; }
      th:last-child { text-align: right; }
      td { font-size: 0.8125rem; color: #374151; padding: 14px 16px; border-bottom: 1px solid #f3f4f6; }
      td:last-child { text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
      @media print { body { padding: 24px; } @page { margin: 0.5in; } }
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        document.body.removeChild(iframe);
        return;
      }
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title><style>${printStyles}</style></head><body>${html}</body></html>`);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 300);
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title><style>${printStyles}</style></head><body>${html}</body></html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => { document.body.removeChild(iframe); }, 1000);
    }, 300);
  }, [invoice.invoiceNumber]);

  const handleExportPdf = useCallback(async () => {
    try {
      setIsExportingPdf(true);

      const blob = await pdf(
        <InvoicePdfDocument
          invoice={invoice}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          logoSrc={logoDataUrl}
        />,
      ).toBlob();

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${invoice.invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to export PDF", error);
      window.alert("PDF export failed. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  }, [invoice, subtotal, taxAmount, total, logoDataUrl]);

  const editView = (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={card}>
        <div style={{ ...labelStyle, fontSize: "0.75rem", marginBottom: 20 }}>
          <span style={{ marginRight: 6 }}>📋</span> Invoice Details
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Field label="Invoice #" value={invoice.invoiceNumber} onChange={(v) => update("invoiceNumber", v)} mono half />
          <Field label="Currency" value={invoice.currency} onChange={(v) => update("currency", v.toUpperCase())} half />
          <Field label="Issue Date" value={invoice.issueDate} onChange={(v) => update("issueDate", v)} type="date" half />
          <Field label="Due Date" value={invoice.dueDate} onChange={(v) => update("dueDate", v)} type="date" half />
          <Field label="Tax Rate (%)" value={invoice.taxRate} onChange={(v) => update("taxRate", parseFloat(v) || 0)} type="number" half />
          <div style={{ flex: "0 0 48%" }}>
            <label style={labelStyle}>Status</label>
            <select
              value={invoice.status}
              onChange={(e) => update("status", e.target.value as InvoiceStatus)}
              style={{ ...inputStyle, appearance: "none" as const }}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div style={card}>
          <div style={{ ...labelStyle, fontSize: "0.75rem", marginBottom: 20 }}>
            <span style={{ marginRight: 6 }}>🏢</span> From
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <img
              src="/ltb-logo.jpeg"
              alt="L.T.B LTD logo"
              style={{ width: 96, height: "auto", objectFit: "contain" }}
            />
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "#EDEDED", fontWeight: 600 }}>{invoice.fromName}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#888", lineHeight: 1.5, whiteSpace: "pre-line" }}>{invoice.fromAddress}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem", color: "#666", marginTop: 4 }}>IBAN: {invoice.iban} · Bank: {invoice.bankName} · BIC: {invoice.swift}</div>
          </div>
        </div>

        <div style={card}>
          <div style={{ ...labelStyle, fontSize: "0.75rem", marginBottom: 20 }}>
            <span style={{ marginRight: 6 }}>👤</span> Bill To
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Client Name" value={invoice.toName} onChange={(v) => update("toName", v)} placeholder="Client Company" />
            <Field label="Address" value={invoice.toAddress} onChange={(v) => update("toAddress", v)} placeholder="Street, City, Country" />
            <Field label="Email" value={invoice.toEmail} onChange={(v) => update("toEmail", v)} placeholder="client@example.com" />
            <Field label="VAT Number" value={invoice.toVat} onChange={(v) => update("toVat", v)} placeholder="XX12345678" mono />
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ ...labelStyle, fontSize: "0.75rem", marginBottom: 0 }}>
            <span style={{ marginRight: 6 }}>📝</span> Line Items
          </div>
          <button
            onClick={addItem}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: ltbBrand.primarySoft,
              border: `1px solid ${ltbBrand.border}`,
              color: ltbBrand.primary,
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = ltbBrand.surface; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ltbBrand.primarySoft; }}
          >
            + Add Item
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 120px 120px 40px",
          gap: 12,
          padding: "0 0 10px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 8,
        }}>
          {["Description", "Qty", "Rate", "Amount", ""].map((h) => (
            <span key={h} style={{ ...labelStyle, marginBottom: 0 }}>{h}</span>
          ))}
        </div>

        {invoice.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 120px 120px 40px",
              gap: 12,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,255,255,0.02)",
            }}
          >
            <input
              value={item.description}
              onChange={(e) => updateItem(item.id, "description", e.target.value)}
              placeholder="Service description"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = ltbBrand.borderStrong; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", textAlign: "right" as const }}
              onFocus={(e) => { e.currentTarget.style.borderColor = ltbBrand.borderStrong; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            />
            <input
              type="number"
              value={item.rate}
              onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", textAlign: "right" as const }}
              onFocus={(e) => { e.currentTarget.style.borderColor = ltbBrand.borderStrong; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            />
            <div style={{
              ...monoNumber,
              fontSize: "0.875rem",
              textAlign: "right",
              padding: "10px 14px",
              color: item.quantity * item.rate > 0 ? ltbBrand.primary : ltbBrand.textDim,
            }}>
              {formatCurrency(item.quantity * item.rate, invoice.currency)}
            </div>
            <button
              onClick={() => removeItem(item.id)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.04)",
                color: "#6B7280",
                fontSize: "0.75rem",
                cursor: invoice.items.length > 1 ? "pointer" : "not-allowed",
                opacity: invoice.items.length > 1 ? 1 : 0.3,
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (invoice.items.length > 1) {
                  e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                  e.currentTarget.style.color = "#EF4444";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "#6B7280";
              }}
              disabled={invoice.items.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ minWidth: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Subtotal</span>
              <span style={{ ...monoNumber, fontSize: "0.875rem", color: "#6B7280" }}>
                {formatCurrency(subtotal, invoice.currency)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Tax ({invoice.taxRate}%)</span>
              <span style={{ ...monoNumber, fontSize: "0.875rem", color: "#6B7280" }}>
                {formatCurrency(taxAmount, invoice.currency)}
              </span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", padding: "12px 0 0",
              borderTop: `2px solid ${ltbBrand.borderStrong}`, marginTop: 8,
            }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>Total</span>
              <span style={{ ...monoNumber, fontSize: "1.25rem", color: "#F59E0B" }}>
                {formatCurrency(total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ ...labelStyle, fontSize: "0.75rem", marginBottom: 20 }}>
          <span style={{ marginRight: 6 }}>🏦</span> Bank Details
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Field label="Bank Name" value={invoice.bankName} onChange={(v) => update("bankName", v)} placeholder="Bank name" half />
          <Field label="IBAN" value={invoice.iban} onChange={(v) => update("iban", v)} placeholder="SI56 ..." mono half />
          <Field label="SWIFT/BIC" value={invoice.swift} onChange={(v) => update("swift", v)} placeholder="LJBASI2X" mono half />
          <Field label="Reference" value={invoice.reference} onChange={(v) => update("reference", v)} placeholder={invoice.invoiceNumber} mono half />
        </div>
      </div>

      <div style={card}>
        <div style={{ ...labelStyle, fontSize: "0.75rem", marginBottom: 12 }}>
          <span style={{ marginRight: 6 }}>💬</span> Notes
        </div>
        <textarea
          value={invoice.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Payment terms, additional notes..."
          rows={3}
          style={{
            ...inputStyle,
            resize: "vertical" as const,
            minHeight: 80,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = ltbBrand.borderStrong; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
        />
      </div>
    </div>
  );

  const previewView = (
    <div ref={printRef} style={{
      background: "#fff",
      color: "#1a1a1a",
      borderRadius: 16,
      padding: 48,
      maxWidth: 800,
      margin: "0 auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <img
            src="/ltb-logo.jpeg"
            alt="L.T.B LTD logo"
            style={{ width: 120, height: "auto", objectFit: "contain" }}
          />
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D97706" }}>
              {invoice.fromName || "L.T.B LTD"}
            </div>
            {invoice.fromAddress && (
              <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 4, whiteSpace: "pre-line" }}>
                {invoice.fromAddress}
              </div>
            )}
            {invoice.fromEmail && (
              <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }}>{invoice.fromEmail}</div>
            )}
            {invoice.fromVat && (
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                VAT: {invoice.fromVat}
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2rem", fontWeight: 300, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Invoice
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: 600, color: "#1a1a1a", marginTop: 4 }}>
            {invoice.invoiceNumber}
          </div>
          <div style={{ marginTop: 10, display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: `${statusColors[invoice.status]}18`, color: statusColors[invoice.status], fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {invoice.status}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: "0.625rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Bill To
          </div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#1a1a1a" }}>{invoice.toName || "—"}</div>
          {invoice.toAddress && (
            <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 4, whiteSpace: "pre-line" }}>{invoice.toAddress}</div>
          )}
          {invoice.toEmail && (
            <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }}>{invoice.toEmail}</div>
          )}
          {invoice.toVat && (
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              VAT: {invoice.toVat}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          {[
            { label: "Issue Date", value: invoice.issueDate },
            { label: "Due Date", value: invoice.dueDate },
            { label: "Currency", value: invoice.currency },
          ].map((d) => (
            <div key={d.label} style={{
              padding: "6px 14px",
              background: "#f9fafb",
              borderRadius: 8,
              fontSize: "0.75rem",
              display: "flex",
              gap: 8,
            }}>
              <span style={{ color: "#9ca3af" }}>{d.label}</span>
              <strong style={{ color: "#1a1a1a", fontFamily: "'JetBrains Mono', monospace" }}>{d.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr>
            {["Description", "Qty", "Rate", "Amount"].map((h, i) => (
              <th key={h} style={{
                fontSize: "0.625rem", fontWeight: 600, color: "#9ca3af",
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "12px 16px",
                borderBottom: "2px solid #f3f4f6",
                textAlign: i === 0 ? "left" : "right",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(invoice.items.filter((item) => item.description || item.rate > 0).length ? invoice.items.filter((item) => item.description || item.rate > 0) : [{ id: "empty", description: "—", quantity: 1, rate: 0 }]).map((item) => (
            <tr key={item.id}>
              <td style={{ fontSize: "0.8125rem", color: "#374151", padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                {item.description || "—"}
              </td>
              <td style={{ fontSize: "0.8125rem", color: "#374151", padding: "14px 16px", borderBottom: "1px solid #f3f4f6", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
                {item.quantity}
              </td>
              <td style={{ fontSize: "0.8125rem", color: "#374151", padding: "14px 16px", borderBottom: "1px solid #f3f4f6", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
                {formatCurrency(item.rate, invoice.currency)}
              </td>
              <td style={{ fontSize: "0.8125rem", color: "#1a1a1a", padding: "14px 16px", borderBottom: "1px solid #f3f4f6", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                {formatCurrency(item.quantity * item.rate, invoice.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
        <div style={{ minWidth: 280 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "0.8125rem", color: "#6b7280" }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "0.8125rem", color: "#6b7280" }}>
            <span>Tax ({invoice.taxRate}%)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(taxAmount, invoice.currency)}</span>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", padding: "12px 0 0",
            borderTop: "2px solid #1a1a1a", marginTop: 4,
            fontSize: "1.125rem", fontWeight: 700, color: "#1a1a1a",
          }}>
            <span>Total</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {(invoice.bankName || invoice.iban) && (
        <div style={{ padding: 24, background: "#f9fafb", borderRadius: 12, marginBottom: 32 }}>
          <div style={{ fontSize: "0.625rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Bank Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {invoice.bankName && (
              <div style={{ fontSize: "0.75rem" }}>
                <span style={{ color: "#9ca3af" }}>Bank:</span>
                <strong style={{ color: "#374151", marginLeft: 4 }}>{invoice.bankName}</strong>
              </div>
            )}
            {invoice.iban && (
              <div style={{ fontSize: "0.75rem" }}>
                <span style={{ color: "#9ca3af" }}>IBAN:</span>
                <strong style={{ color: "#374151", marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>{invoice.iban}</strong>
              </div>
            )}
            {invoice.swift && (
              <div style={{ fontSize: "0.75rem" }}>
                <span style={{ color: "#9ca3af" }}>SWIFT:</span>
                <strong style={{ color: "#374151", marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>{invoice.swift}</strong>
              </div>
            )}
            {invoice.reference && (
              <div style={{ fontSize: "0.75rem" }}>
                <span style={{ color: "#9ca3af" }}>Reference:</span>
                <strong style={{ color: "#374151", marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>{invoice.reference}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {invoice.notes && (
        <div style={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
          {invoice.notes}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto" style={{ paddingBottom: "4rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/ltb-logo.jpeg"
            alt="L.T.B LTD logo"
            style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 12 }}
          />
          <div>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1.75rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              <span style={{ color: "#F59E0B" }}>Invoice</span>{" "}
              <span style={{ color: "#6B7280" }}>Builder</span>
            </h1>
            <div style={{ fontSize: "0.75rem", color: "#4A4D5C", marginTop: 4 }}>
              L.T.B LTD • {invoice.invoiceNumber}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {saveMessage ? <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{saveMessage}</div> : null}

          <button
            onClick={handleNewInvoice}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              color: "#E5E7EB",
              fontSize: "0.8125rem",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}
          >
            ＋ New
          </button>

          <button
            onClick={handleSaveInvoice}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: ltbBrand.primarySoft,
              color: ltbBrand.primary,
              fontSize: "0.8125rem",
              fontWeight: 700,
              border: `1px solid ${ltbBrand.border}`,
              cursor: "pointer",
            }}
          >
            💾 Save Invoice
          </button>

          <div style={{
            display: "flex",
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}>
            {(["edit", "preview"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 18px",
                  fontSize: "0.8125rem",
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#F59E0B" : "#6B7280",
                  background: activeTab === tab ? ltbBrand.primaryMuted : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {tab === "edit" ? "✏️ Edit" : "👁 Preview"}
              </button>
            ))}
          </div>

          {activeTab === "preview" && (
            <>
              <button
                onClick={handlePrint}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  color: "#E5E7EB",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                🖨 Print
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  background: ltbBrand.gradient,
                  color: "#000",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: isExportingPdf ? "wait" : "pointer",
                  transition: "opacity 0.15s",
                  opacity: isExportingPdf ? 0.7 : 1,
                }}
              >
                {isExportingPdf ? "⏳ Generating PDF..." : "⬇ Export PDF"}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{
        ...card,
        padding: "16px 32px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderLeft: `3px solid ${ltbBrand.primary}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: 2 }}>Subtotal</div>
            <div style={{ ...monoNumber, fontSize: "1rem", color: "#6B7280" }}>
              {formatCurrency(subtotal, invoice.currency)}
            </div>
          </div>
          <div style={{ color: "#4A4D5C", fontSize: "1.25rem" }}>+</div>
          <div>
            <div style={{ ...labelStyle, marginBottom: 2 }}>Tax</div>
            <div style={{ ...monoNumber, fontSize: "1rem", color: "#6B7280" }}>
              {formatCurrency(taxAmount, invoice.currency)}
            </div>
          </div>
          <div style={{ color: "#4A4D5C", fontSize: "1.25rem" }}>=</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...labelStyle, marginBottom: 2 }}>Total Due</div>
          <div style={{ ...monoNumber, fontSize: "1.75rem", color: "#F59E0B" }}>
            {formatCurrency(total, invoice.currency)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div>{activeTab === "edit" ? editView : previewView}</div>

        <aside style={{ ...card, padding: 24, position: "sticky", top: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>Saved Invoices</div>

          {savedInvoices.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.6 }}>
              No invoices saved yet. Drafts autosave locally, but hit <strong style={{ color: "#E5E7EB" }}>Save Invoice</strong> to build your invoice list, client DB, and finance stats.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedInvoices.map((entry) => {
                const totals = calculateInvoiceTotals(entry);
                const isActive = entry.id === invoice.id;

                return (
                  <div
                    key={entry.id}
                    style={{
                      border: isActive ? `1px solid ${ltbBrand.borderStrong}` : "1px solid rgba(255,255,255,0.06)",
                      background: isActive ? ltbBrand.surface : "rgba(255,255,255,0.02)",
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#F3F4F6" }}>{entry.invoiceNumber}</div>
                        <div style={{ fontSize: "0.76rem", color: "#9CA3AF", marginTop: 3 }}>
                          {entry.toName || "No client yet"}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.68rem", padding: "4px 8px", borderRadius: 999, background: `${statusColors[entry.status]}18`, color: statusColors[entry.status], textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em" }}>
                        {entry.status}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: "0.74rem", color: "#9CA3AF" }}>
                      <span>{entry.issueDate}</span>
                      <span style={{ ...monoNumber, color: "#E5E7EB", fontSize: "0.8rem" }}>{formatCurrency(totals.total, entry.currency)}</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => handleLoadInvoice(entry)}
                        style={{ flex: 1, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#E5E7EB", padding: "8px 10px", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(entry.id)}
                        style={{ borderRadius: 8, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.08)", color: "#FCA5A5", padding: "8px 10px", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
