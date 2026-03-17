"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const labelStyle = {
  fontSize: "0.6875rem",
  color: "#6B7280",
  fontWeight: 500 as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const monoNumber = {
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700 as const,
  color: "rgba(255,255,255,0.92)",
};

export default function LTBPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  useEffect(() => {
    setInvoices(readSavedInvoices());
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = getMonthToDateRevenue(invoices);
    const outstanding = invoices.reduce((sum, invoice) => {
      if (invoice.status === "paid") return sum;
      return sum + calculateInvoiceTotals(invoice).total;
    }, 0);
    const clients = new Set(
      invoices
        .map((invoice) => invoice.toName.trim() || invoice.toEmail.trim())
        .filter(Boolean),
    ).size;

    const primaryCurrency = invoices[0]?.currency || "EUR";

    return [
      { label: "Total Revenue", value: formatCurrency(totalRevenue, primaryCurrency), sub: "Paid this month", color: ltbBrand.primary },
      { label: "Outstanding", value: formatCurrency(outstanding, primaryCurrency), sub: "Unpaid invoices", color: ltbBrand.danger },
      { label: "Clients", value: String(clients), sub: "Active database", color: ltbBrand.revenue },
      { label: "Invoices", value: String(invoices.length), sub: "Saved records", color: ltbBrand.primaryStrong },
    ];
  }, [invoices]);

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto" style={{ paddingBottom: "4rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          <span style={{ color: ltbBrand.primary }}>LTB</span>{" "}
          <span style={{ color: "#6B7280" }}>Capital</span>
        </h1>
        <Link
          href="/dashboard/ltb/invoices"
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: ltbBrand.gradient,
            color: "#000",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          + New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...card, padding: 24 }}>
            <div style={labelStyle}>{s.label}</div>
            <div style={{ ...monoNumber, fontSize: "1.75rem", marginTop: 8, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#4A4D5C", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...labelStyle, marginBottom: 16, paddingLeft: 4 }}>Quick Access</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
        {[
          { href: "/dashboard/ltb/invoices", icon: "▤", title: "Invoice Builder", desc: "Create, save, and manage invoices" },
          { href: "/dashboard/ltb/clients", icon: "◎", title: "Clients", desc: "Auto-built from invoice records" },
          { href: "/dashboard/ltb/finances", icon: "△", title: "Finances", desc: "Revenue, overdue, and pipeline" },
        ].map((nav) => (
          <Link
            key={nav.href}
            href={nav.href}
            style={{
              ...card,
              padding: "24px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "1.5rem", color: ltbBrand.primary }}>{nav.icon}</span>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
                {nav.title}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#4A4D5C", marginTop: 2 }}>{nav.desc}</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#4A4D5C", fontSize: "0.75rem" }}>→</span>
          </Link>
        ))}
      </div>

      <div style={card}>
        <div style={{ ...labelStyle, marginBottom: 16 }}>Recent Activity</div>
        {recentInvoices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>No activity yet</div>
            <div style={{ fontSize: "0.75rem", color: "#4A4D5C", marginTop: 4 }}>
              Save your first invoice to activate the LTB dashboard
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentInvoices.map((invoice) => {
              const totals = calculateInvoiceTotals(invoice);
              return (
                <div key={invoice.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontSize: "0.86rem", color: "#F3F4F6", fontWeight: 600 }}>{invoice.invoiceNumber}</div>
                    <div style={{ fontSize: "0.76rem", color: "#9CA3AF", marginTop: 2 }}>{invoice.toName || "No client"} • {invoice.issueDate}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...monoNumber, fontSize: "0.9rem" }}>{formatCurrency(totals.total, invoice.currency)}</div>
                    <div style={{ fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", marginTop: 2 }}>{invoice.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
