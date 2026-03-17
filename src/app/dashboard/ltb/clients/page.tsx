"use client";

import { useEffect, useMemo, useState } from "react";
import { buildClientSummaries, formatCurrency, readSavedInvoices, type ClientSummary, type InvoiceRecord } from "@/lib/ltbInvoices";
import { ltbBrand } from "@/lib/ltbBrand";

const card = {
  background: "#13151A",
  border: "1px solid rgba(255,255,255,0.04)",
  borderRadius: 16,
  padding: 32,
} as const;

export default function ClientsPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  useEffect(() => {
    setInvoices(readSavedInvoices());
  }, []);

  const clients = useMemo<ClientSummary[]>(() => buildClientSummaries(invoices), [invoices]);

  return (
    <div className="max-w-5xl mx-auto" style={{ paddingBottom: "4rem" }}>
      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "1.75rem",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        marginBottom: 32,
      }}>
        <span style={{ color: ltbBrand.primary }}>Clients</span>{" "}
        <span style={{ color: "#6B7280" }}>Database</span>
      </h1>

      {clients.length === 0 ? (
        <div style={card}>
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.92)", fontWeight: 600, marginBottom: 6 }}>
              No clients yet
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#6B7280" }}>
              Save invoices with client details and they’ll appear here automatically
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {clients.map((client) => (
            <div key={`${client.name}-${client.email}`} style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 20, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.95)", fontWeight: 700 }}>{client.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginTop: 4 }}>{client.email || "No email saved"}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 8 }}>
                    Last invoice: {client.lastInvoiceDate}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(120px, 1fr))", gap: 12, minWidth: "min(100%, 420px)" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Invoices</div>
                    <div style={{ marginTop: 8, fontSize: "1.2rem", color: "#F3F4F6", fontWeight: 700 }}>{client.invoiceCount}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Billed</div>
                    <div style={{ marginTop: 8, fontSize: "1.05rem", color: ltbBrand.revenue, fontWeight: 700 }}>{formatCurrency(client.totalBilled, client.currency)}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Outstanding</div>
                    <div style={{ marginTop: 8, fontSize: "1.05rem", color: client.outstanding > 0 ? ltbBrand.primary : ltbBrand.neutral, fontWeight: 700 }}>{formatCurrency(client.outstanding, client.currency)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
