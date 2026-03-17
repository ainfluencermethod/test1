"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ─── CONSTANTS ─── */
const LIVE_EVENT_DATE = new Date("2026-04-15T00:00:00+02:00");
const REVENUE_GOAL = 1_000_000;
const CURRENT_REVENUE = 0;

/* ─── HELPERS ─── */
function daysUntil(target: Date): number {
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

/* ─── LAUNCH READINESS DATA ─── */
const categories = [
  {
    name: "Content",
    pct: 68,
    color: "#00D4AA",
    items: [
      { label: "Ad creatives", done: 6, total: 12 },
      { label: "VSL scripts", done: 3, total: 3 },
      { label: "Email sequences", done: 1, total: 1 },
      { label: "Workbooks", done: 3, total: 3 },
    ],
  },
  {
    name: "Tech",
    pct: 38,
    color: "#7C5CFC",
    items: [
      { label: "Landing page", done: 1, total: 2 },
      { label: "Offer page", done: 1, total: 1 },
      { label: "Profit Calculator", done: 1, total: 1 },
      { label: "Tracking setup", done: 0, total: 3 },
      { label: "Payment system", done: 0, total: 1 },
      { label: "Email platform", done: 0, total: 1 },
    ],
  },
  {
    name: "Marketing",
    pct: 13,
    color: "#F59E0B",
    items: [
      { label: "WhatsApp sequences", done: 1, total: 1 },
      { label: "Email list warmed", done: 0, total: 1 },
      { label: "Social channels", done: 0, total: 3 },
      { label: "Ad campaigns", done: 0, total: 3 },
    ],
  },
  {
    name: "Operations",
    pct: 40,
    color: "#10B981",
    items: [
      { label: "Team setup", done: 1, total: 1 },
      { label: "Calendar", done: 1, total: 1 },
      { label: "Task system", done: 1, total: 1 },
      { label: "Brand guide", done: 1, total: 1 },
    ],
  },
];

const overallReadiness = Math.round(
  categories.reduce((sum, c) => sum + c.pct, 0) / categories.length
);

/* ─── SPRINT ITEMS ─── */
const sprintItems = [
  { title: "Ad Creatives", detail: "12 variants", status: "done" as const, icon: "🎨" },
  { title: "VSL Scripts", detail: "3 angles", status: "done" as const, icon: "🎬" },
  { title: "Workbooks", detail: "3 delivered", status: "done" as const, icon: "📘" },
  { title: "Offer Page", detail: "Normal + VIP", status: "done" as const, icon: "🛍️" },
  { title: "Profit Calculator", detail: "Integration pending", status: "in-progress" as const, icon: "🧮" },
  { title: "Landing Page", detail: "Deployment", status: "blocked" as const, icon: "🌐" },
  { title: "Meta Pixel", detail: "Setup", status: "blocked" as const, icon: "📍" },
];

/* ─── BUILT ASSETS ─── */
const builtAssets = [
  {
    category: "Landing Pages",
    items: [
      {
        icon: "🌐",
        title: "Registration LP",
        href: "/lp/ai-universa",
        description: "Lead capture page for workshop signups",
        status: "live" as const,
      },
      {
        icon: "💰",
        title: "Offer Page",
        href: "/lp/ai-universa-offer",
        description: "Sales page: Normal €899.99 / VIP €2,499.99",
        status: "live" as const,
      },
    ],
  },
  {
    category: "Workbooks",
    items: [
      {
        icon: "📖",
        title: "Delovni Zvezek #1",
        href: "/pdfs/ai-universa-workbook-1.html",
        description: "Kaj te čaka (What to Expect) — 12 pages",
        status: "live" as const,
      },
      {
        icon: "📖",
        title: "Delovni Zvezek #2",
        href: "/pdfs/ai-universa-workbook-2.html",
        description: "Prompt Pack — 15 pages",
        status: "live" as const,
      },
      {
        icon: "📖",
        title: "Delovni Zvezek #3",
        href: "/pdfs/ai-universa-workbook-3.html",
        description: "Ustvari vrednost & pridobi stranke — 15 pages",
        status: "live" as const,
      },
    ],
  },
  {
    category: "Tools",
    items: [
      {
        icon: "🧮",
        title: "Profit Calculator",
        href: "/ai-universa-calculator.html",
        description: "Interactive Kalkulator Dobička",
        status: "live" as const,
      },
      {
        icon: "🗺️",
        title: "Launch Mind Map",
        href: "/ai-universa-launch-map.html",
        description: "Arcade/heist-style launch flow overview",
        status: "live" as const,
      },
    ],
  },
  {
    category: "Platform",
    items: [
      {
        icon: "🚀",
        title: "app.aiuniversa.si",
        href: "/dashboard/aib/analytics",
        description: "Full platform (password-gated, setting up...)",
        status: "in-progress" as const,
      },
    ],
  },
];

/* ─── DEADLINES ─── */
const deadlines = [
  { task: "Meta Pixel installation", date: "2026-03-14" },
  { task: "Legal review", date: "2026-03-16" },
  { task: "Stripe payment setup", date: "2026-03-18" },
  { task: "Email platform config", date: "2026-03-20" },
  { task: "VSL script final", date: "2026-03-22" },
];

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
};

const monoNumber = {
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700 as const,
  color: "rgba(255,255,255,0.92)",
};

/* ─── CIRCULAR PROGRESS GAUGE ─── */
function CircularGauge({ pct, size = 160 }: { pct: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4AA" />
            <stop offset="100%" stopColor="#7C5CFC" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      {/* Center text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ ...monoNumber, fontSize: "2.5rem", lineHeight: 1 }}>{pct}</span>
        <span style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 4 }}>% ready</span>
      </div>
    </div>
  );
}

/* ─── MINI PROGRESS BAR ─── */
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 3, width: `${Math.max(2, pct)}%`,
        background: color,
        boxShadow: pct > 0 ? `0 0 8px ${color}40` : "none",
        transition: "width 0.8s ease",
      }} />
    </div>
  );
}

/* ─── STATUS CHIP ─── */
function StatusChip({ status }: { status: "in-progress" | "blocked" | "done" }) {
  const config = {
    "in-progress": { bg: "rgba(0,212,170,0.1)", border: "rgba(0,212,170,0.2)", color: "#00D4AA", label: "In Progress" },
    "blocked": { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", color: "#EF4444", label: "Blocked" },
    "done": { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", color: "#10B981", label: "Done" },
  }[status];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 9999,
      background: config.bg, border: `1px solid ${config.border}`,
      fontSize: "0.6875rem", fontWeight: 600, color: config.color,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: config.color,
        boxShadow: `0 0 6px ${config.color}60`,
      }} />
      {config.label}
    </span>
  );
}

/* ─── DELIVERABLES TYPES & HELPERS ─── */
interface CompletedTask {
  index: number;
  runId: string;
  label: string;
  task: string;
  status: "done" | "error";
  runtime: string;
  runtimeMs: number;
  model: string;
  totalTokens?: number;
  startedAt: number;
  endedAt?: number;
}

interface Deliverable extends CompletedTask {
  category: string;
  categoryIcon: string;
  categoryColor: string;
}

function categorizeTask(label: string): { category: string; icon: string; color: string } {
  const l = label.toLowerCase();
  if (/design|creative|ad[s]?$|landing|lp|office|sidebar/.test(l))
    return { category: "Design", icon: "🎨", color: "#E040FB" };
  if (/copy|vsl|email|script|pdf|guide|video-ads/.test(l))
    return { category: "Content", icon: "✍️", color: "#3B82F6" };
  if (/dev|build|dashboard|page|feed|orb|chat/.test(l))
    return { category: "Engineering", icon: "⚡", color: "#10B981" };
  if (/research|scrape|analysis|audit/.test(l))
    return { category: "Research", icon: "🔍", color: "#F59E0B" };
  return { category: "Other", icon: "📋", color: "#6B7280" };
}

function formatLabel(label: string): string {
  return label
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function useDeliverables(): Deliverable[] {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    async function fetchDeliverables() {
      try {
        const response = await fetch("/api/subagents", {
          signal: AbortSignal.timeout(10_000),
        });
        const parsed = await response.json();
        if (!parsed) return;
        const recent: CompletedTask[] = parsed.recent || [];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayMs = todayStart.getTime();

        const filtered = recent.filter((t) => {
          if (t.status !== "done") return false;
          if (!t.endedAt || t.endedAt < todayMs) return false;
          if (t.runtimeMs < 30000) return false;
          return true;
        });

        const mapped: Deliverable[] = filtered.map((t) => {
          const cat = categorizeTask(t.label);
          return {
            ...t,
            category: cat.category,
            categoryIcon: cat.icon,
            categoryColor: cat.color,
          };
        });

        // Sort by endedAt descending (most recent first)
        mapped.sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));
        setDeliverables(mapped);
      } catch {
        // Silently fail — don't break the page
      }
    }

    fetchDeliverables();
    const interval = setInterval(fetchDeliverables, 30_000);
    return () => clearInterval(interval);
  }, []);

  return deliverables;
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function AIUniversaPage() {
  const daysLeft = daysUntil(LIVE_EVENT_DATE);
  const revPct = Math.min(100, (CURRENT_REVENUE / REVENUE_GOAL) * 100);
  const deliverables = useDeliverables();

  return (
    <div className="max-w-5xl mx-auto" style={{ paddingBottom: "4rem" }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 32,
      }}>
        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          <span style={{ color: "rgba(255,255,255,0.92)" }}>AI</span>{" "}
          <span style={{ color: "#6B7280" }}>Universa</span>
        </h1>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 16px", borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ ...monoNumber, fontSize: "1.5rem", color: daysLeft <= 14 ? "#F59E0B" : "#00D4AA" }}>
            {daysLeft}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>days to live</span>
        </div>
      </div>

      {/* ═══ REVENUE GOAL ═══ */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>Revenue Goal</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
          <span style={{ ...monoNumber, fontSize: "2.5rem" }}>
            €{CURRENT_REVENUE.toLocaleString()}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.125rem", color: "#4A4D5C" }}>
            / €{REVENUE_GOAL.toLocaleString()}
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 5,
            width: `${Math.max(1, revPct)}%`,
            background: "linear-gradient(90deg, #00D4AA, #7C5CFC)",
            boxShadow: revPct > 0 ? "0 0 16px rgba(0,212,170,0.4)" : "none",
            transition: "width 1s ease",
          }} />
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", marginTop: 8,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#4A4D5C",
        }}>
          <span>{revPct.toFixed(1)}%</span>
          <span>€1,000,000</span>
        </div>
      </div>

      {/* ═══ LAUNCH READINESS ═══ */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ ...labelStyle, marginBottom: 24 }}>Launch Readiness</div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}>
          {/* Gauge */}
          <CircularGauge pct={overallReadiness} />

          {/* Category breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" style={{ width: "100%" }}>
            {categories.map((cat) => (
              <div key={cat.name} style={{
                padding: 20, borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
                    {cat.name}
                  </span>
                  <span style={{ ...monoNumber, fontSize: "0.875rem", color: cat.color }}>
                    {cat.pct}%
                  </span>
                </div>
                <MiniBar pct={cat.pct} color={cat.color} />
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  {cat.items.map((item) => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "0.6875rem",
                    }}>
                      <span style={{ color: "#6B7280" }}>{item.label}</span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: item.done === item.total ? "#00D4AA" : "#4A4D5C",
                        fontWeight: 500,
                      }}>
                        {item.done}/{item.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CURRENT SPRINT ═══ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...labelStyle, marginBottom: 16, paddingLeft: 4 }}>
          <span style={{ marginRight: 6 }}>⚡</span> Current Sprint
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sprintItems.map((item) => (
            <div key={item.title} style={{
              ...card,
              padding: 24,
              display: "flex", alignItems: "flex-start", gap: 16,
              transition: "border-color 0.2s",
              cursor: "default",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; }}
            >
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "0.9375rem", fontWeight: 600,
                  color: "rgba(255,255,255,0.92)", marginBottom: 4,
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: 10 }}>
                  {item.detail}
                </div>
                <StatusChip status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ BUILT ASSETS ═══ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...labelStyle, marginBottom: 16, paddingLeft: 4 }}>
          <span style={{ marginRight: 6 }}>🏗️</span> Built Assets
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {builtAssets.map((group) => (
            <div key={group.category}>
              <div style={{ ...labelStyle, marginBottom: 12, paddingLeft: 4, color: "#4A4D5C" }}>
                {group.category}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.items.map((asset) => {
                  const isLive = asset.status === "live";
                  const accent = isLive ? "#00D4AA" : "#F59E0B";

                  return (
                    <a
                      key={asset.title}
                      href={asset.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...card,
                        padding: 20,
                        textDecoration: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        minHeight: 180,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${accent}33`;
                        e.currentTarget.style.background = "#161820";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.background = "#13151A";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{asset.icon}</span>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: accent,
                          boxShadow: `0 0 8px ${accent}66`,
                          flexShrink: 0,
                          marginTop: 4,
                        }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.92)",
                          marginBottom: 8,
                          lineHeight: 1.3,
                        }}>
                          {asset.title}
                        </div>
                        <div style={{
                          fontSize: "0.75rem",
                          color: "#6B7280",
                          lineHeight: 1.5,
                        }}>
                          {asset.description}
                        </div>
                      </div>

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}>
                        <span style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          color: accent,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}>
                          {isLive ? "Live" : "In Progress"}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          color: "#4A4D5C",
                          fontWeight: 600,
                        }}>
                          Open →
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TODAY'S DELIVERABLES ═══ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, paddingLeft: 4, paddingRight: 4,
        }}>
          <span style={labelStyle}>
            <span style={{ marginRight: 6 }}>📦</span> Today&apos;s Deliverables
          </span>
          {deliverables.length > 0 && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "#00D4AA",
              padding: "4px 10px",
              borderRadius: 9999,
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.15)",
            }}>
              {deliverables.length} completed
            </span>
          )}
        </div>

        {deliverables.length === 0 ? (
          <div style={{
            ...card,
            padding: 32,
            textAlign: "center",
          }}>
            <div style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: 6 }}>
              No deliverables yet today
            </div>
            <div style={{ fontSize: "0.75rem", color: "#4A4D5C" }}>
              Agents are working...
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {deliverables.map((d) => (
              <div
                key={d.runId}
                style={{
                  ...card,
                  padding: "14px 20px",
                  borderLeft: `2px solid ${d.categoryColor}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `rgba(255,255,255,0.08)`;
                  e.currentTarget.style.borderLeftColor = d.categoryColor;
                  e.currentTarget.style.background = "#161820";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderLeftColor = d.categoryColor;
                  e.currentTarget.style.background = "#13151A";
                }}
              >
                {/* Category icon */}
                <span style={{ fontSize: "1.125rem", lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
                  {d.categoryIcon}
                </span>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: d.categoryColor,
                      boxShadow: `0 0 6px ${d.categoryColor}40`,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.92)",
                    }}>
                      {formatLabel(d.label)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "0.6875rem",
                    color: "#6B7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {d.task.length > 80 ? d.task.slice(0, 80) + "…" : d.task}
                  </div>
                </div>

                {/* Runtime + time */}
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-end",
                  gap: 4, flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#4A4D5C",
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                  }}>
                    {d.runtime}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.625rem",
                    color: "#4A4D5C",
                  }}>
                    {d.endedAt ? formatTime(d.endedAt) : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ BLOCKERS & DEADLINES ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: 24 }}>
        {/* Blockers */}
        <div style={card}>
          <div style={{ ...labelStyle, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#EF4444",
              boxShadow: "0 0 8px rgba(239,68,68,0.5)",
            }} />
            Blockers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { text: "Meta Pixel not installed — losing retargeting data", impact: "Every day without pixel costs potential revenue" },
              { text: "Landing page not deployed — UTMs lead to 404", impact: "Zero lead capture happening" },
            ].map((b, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: 10,
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.08)",
              }}>
                <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", fontWeight: 500, marginBottom: 4 }}>
                  {b.text}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#6B7280" }}>{b.impact}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div style={card}>
          <div style={{ ...labelStyle, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.75rem" }}>📅</span>
            Next Deadlines
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {deadlines.map((d, i) => {
              const days = daysUntil(new Date(d.date));
              const overdue = new Date(d.date) < new Date();
              const dotColor = overdue ? "#EF4444" : days <= 3 ? "#EF4444" : days <= 7 ? "#F59E0B" : "#00D4AA";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 8,
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: dotColor,
                    boxShadow: `0 0 6px ${dotColor}50`, flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", fontWeight: 500 }}>
                    {d.task}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.6875rem", color: "#6B7280", flexShrink: 0,
                  }}>
                    {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.625rem", fontWeight: 600,
                    color: dotColor,
                    padding: "2px 8px", borderRadius: 9999,
                    background: `${dotColor}12`,
                    flexShrink: 0,
                  }}>
                    {overdue ? "OVERDUE" : `${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ QUICK NAV ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/dashboard/ai-universa/analytics", icon: "📊", title: "Analytics", desc: "Charts & data" },
          { href: "/dashboard/tasks", icon: "✅", title: "Tasks", desc: "Timeline & sprints" },
          { href: "/dashboard/ai-universa/emails", icon: "📧", title: "Emails", desc: "Sequences & flows" },
          { href: "/dashboard/ai-influencer/emails", icon: "📧", title: "AIB Emails", desc: "Freebie sequence" },
          { href: "/dashboard/ai-universa/whatsapp", icon: "💬", title: "WhatsApp", desc: "Messages & flows" },
          { href: "/dashboard/command", icon: "🎯", title: "Command", desc: "Command Center" },
          { href: "/lp/ai-universa", icon: "🌐", title: "Reg. LP", desc: "Registration page" },
          { href: "/lp/ai-universa-survey", icon: "📋", title: "Survey", desc: "Opt-in survey" },
          { href: "/lp/ai-universa-offer", icon: "💰", title: "Offer Page", desc: "Sales page" },
          { href: "/dashboard/syndicate", icon: "🤖", title: "SaaS MVP", desc: "Agent platform" },
        ].map(nav => (
          <Link key={nav.href} href={nav.href} style={{
            ...card,
            padding: "20px 24px",
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: 14,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(0,212,170,0.2)";
            e.currentTarget.style.background = "#161820";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
            e.currentTarget.style.background = "#13151A";
          }}
          >
            <span style={{ fontSize: "1.5rem" }}>{nav.icon}</span>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
                {nav.title}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#4A4D5C", marginTop: 2 }}>
                {nav.desc}
              </div>
            </div>
            <span style={{ marginLeft: "auto", color: "#4A4D5C", fontSize: "0.75rem" }}>→</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
