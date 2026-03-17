"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateInvoiceTotals,
  formatCurrency,
  getMonthToDateRevenue,
  readSavedInvoices,
  type InvoiceRecord,
} from "@/lib/ltbInvoices";
import { ltbBrand } from "@/lib/ltbBrand";

const card = {
  background: "#13151A",
  border: "1px solid rgba(255,255,255,0.04)",
  borderRadius: 16,
  padding: 32,
} as const;

export default function FinancesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  useEffect(() => {
    setInvoices(readSavedInvoices());
  }, []);

  const primaryCurrency = invoices[0]?.currency || "EUR";

  const stats = useMemo(() => {
    const revenue = getMonthToDateRevenue(invoices);
    const outstanding = invoices.reduce((sum, invoice) => {
      if (invoice.status === "paid") return sum;
      return sum + calculateInvoiceTotals(invoice).total;
    }, 0);
    const overdue = invoices.reduce((sum, invoice) => {
      if (invoice.status !== "overdue") return sum;
      return sum + calculateInvoiceTotals(invoice).total;
    }, 0);

    return [
      { label: "Revenue (MTD)", value: formatCurrency(revenue, primaryCurrency), color: ltbBrand.revenue },
      { label: "Outstanding", value: formatCurrency(outstanding, primaryCurrency), color: ltbBrand.primary },
      { label: "Overdue", value: formatCurrency(overdue, primaryCurrency), color: ltbBrand.danger },
    ];
  }, [invoices, primaryCurrency]);

  const pipeline = useMemo(() => {
    return invoices
      .map((invoice) => ({ invoice, total: calculateInvoiceTotals(invoice).total }))
      .sort((a, b) => +new Date(b.invoice.updatedAt) - +new Date(a.invoice.updatedAt));
  }, [invoices]);

  return (
    <div className="max-w-5xl mx-auto" style={{ paddingBottom: "4rem" }}>
      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "1.75rem",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        marginBottom: 32,
      }}>
        <span style={{ color: ltbBrand.primary }}>Finances</span>{" "}
        <span style={{ color: "#6B7280" }}>Overview</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...card, padding: 24 }}>
            <div style={{ fontSize: "0.6875rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2rem", fontWeight: 700, color: s.color, marginTop: 8 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ fontSize: "0.6875rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Invoice Pipeline
        </div>

        {pipeline.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>△</div>
            <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.92)", fontWeight: 600, marginBottom: 6 }}>
              Financial data will populate here
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#6B7280" }}>
              Save invoices and update their statuses to track cash flow
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pipeline.map(({ invoice, total }) => (
              <div key={invoice.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ color: "#F3F4F6", fontWeight: 700 }}>{invoice.invoiceNumber}</div>
                  <div style={{ color: "#9CA3AF", fontSize: "0.78rem", marginTop: 3 }}>{invoice.toName || "No client"} • due {invoice.dueDate}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#E5E7EB", fontWeight: 700 }}>{formatCurrency(total, invoice.currency)}</div>
                  <div style={{ fontSize: "0.72rem", color: invoice.status === "paid" ? ltbBrand.revenue : invoice.status === "overdue" ? ltbBrand.danger : ltbBrand.primary, textTransform: "uppercase", marginTop: 3 }}>
                    {invoice.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
