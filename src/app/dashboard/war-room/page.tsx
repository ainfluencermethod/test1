"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DS, dsCard, dsHeading } from '@/styles/design-system';

// ============================================================================
// Types
// ============================================================================

interface SliderConfig {
  key: string;
  label: string;
  default: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  isLive?: boolean;
}

interface Scenario {
  name: string;
  values: Record<string, number>;
}

interface Metrics {
  newRegistrations: number;
  totalAudience: number;
  emailReactivations: number;
  totalReach: number;
  showUps: number;
  normalBuyers: number;
  vipBuyers: number;
  grossRevenue: number;
  refunds: number;
  netRevenue: number;
  totalAdSpend: number;
  profit: number;
  roi: number;
  roas: number;
}

// ============================================================================
// Constants
// ============================================================================

const TARGET = 1_100_000;
const LAUNCH_DATE = new Date("2026-04-15T00:00:00+02:00");

const SLIDERS: SliderConfig[] = [
  { key: "adSpendPerDay", label: "Ad Spend per Day", default: 860, min: 0, max: 3000, step: 50, prefix: "€" },
  { key: "adDays", label: "Ad Days (pre event)", default: 21, min: 0, max: 30, step: 1 },
  { key: "costPerRegistration", label: "Cost per Registration", default: 3.5, min: 1, max: 15, step: 0.5, prefix: "€" },
  { key: "existingDatabase", label: "Existing Database", default: 21292, min: 0, max: 30000, step: 100, isLive: true },
  { key: "showUpRate", label: "Show Up Rate", default: 40, min: 10, max: 80, step: 5, suffix: "%" },
  { key: "closeRateNormal", label: "Close Rate Normal", default: 5, min: 1, max: 20, step: 0.5, suffix: "%" },
  { key: "closeRateVIP", label: "Close Rate VIP", default: 2, min: 0.5, max: 10, step: 0.5, suffix: "%" },
  { key: "normalPrice", label: "Normal Price", default: 899, min: 497, max: 1499, step: 50, prefix: "€" },
  { key: "vipPrice", label: "VIP Price", default: 2499, min: 1499, max: 4999, step: 100, prefix: "€" },
  { key: "refundRate", label: "Refund Rate", default: 5, min: 0, max: 15, step: 1, suffix: "%" },
  { key: "emailReactivationRate", label: "Email Reactivation Rate", default: 3, min: 0, max: 10, step: 0.5, suffix: "%" },
];

const DEFAULT_VALUES: Record<string, number> = {};
SLIDERS.forEach((s) => { DEFAULT_VALUES[s.key] = s.default; });

const PRESET_SCENARIOS: Scenario[] = [
  {
    name: "Conservative",
    values: { ...DEFAULT_VALUES, showUpRate: 30, closeRateNormal: 3, closeRateVIP: 1.5 },
  },
  {
    name: "Base Case",
    values: { ...DEFAULT_VALUES },
  },
  {
    name: "Optimistic",
    values: { ...DEFAULT_VALUES, showUpRate: 55, closeRateNormal: 7, closeRateVIP: 3.5, normalPrice: 999, vipPrice: 2999 },
  },
  {
    name: "Moonshot",
    values: { ...DEFAULT_VALUES, adSpendPerDay: 1500, adDays: 28, costPerRegistration: 2.5, showUpRate: 65, closeRateNormal: 10, closeRateVIP: 5, normalPrice: 1199, vipPrice: 3499, refundRate: 3, emailReactivationRate: 6 },
  },
];

// ============================================================================
// Calculation Engine
// ============================================================================

function calculate(v: Record<string, number>): Metrics {
  const newRegistrations = v.adDays > 0 && v.costPerRegistration > 0
    ? (v.adSpendPerDay * v.adDays) / v.costPerRegistration
    : 0;
  const totalAudience = newRegistrations + v.existingDatabase;
  const emailReactivations = v.existingDatabase * (v.emailReactivationRate / 100);
  const totalReach = newRegistrations + emailReactivations;
  const showUps = totalReach * (v.showUpRate / 100);
  const normalBuyers = showUps * (v.closeRateNormal / 100);
  const vipBuyers = showUps * (v.closeRateVIP / 100);
  const grossRevenue = (normalBuyers * v.normalPrice) + (vipBuyers * v.vipPrice);
  const refunds = grossRevenue * (v.refundRate / 100);
  const netRevenue = grossRevenue - refunds;
  const totalAdSpend = v.adSpendPerDay * v.adDays;
  const profit = netRevenue - totalAdSpend;
  const roi = totalAdSpend > 0 ? (profit / totalAdSpend) * 100 : 0;
  const roas = totalAdSpend > 0 ? netRevenue / totalAdSpend : 0;

  return {
    newRegistrations, totalAudience, emailReactivations, totalReach,
    showUps, normalBuyers, vipBuyers, grossRevenue, refunds,
    netRevenue, totalAdSpend, profit, roi, roas,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtEuro(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `€${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `€${(n / 1_000).toFixed(1)}K`;
  return `€${fmt(n)}`;
}

function getRevenueColor(net: number): string {
  if (net >= TARGET) return DS.colors.accent;
  if (net >= TARGET * 0.9) return DS.colors.warning;
  return DS.colors.error;
}

function getDaysUntilLaunch(): number {
  const now = new Date();
  const diff = LAUNCH_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ============================================================================
// Sensitivity Analysis
// ============================================================================

function computeSensitivity(baseValues: Record<string, number>): { key: string; label: string; impact: number }[] {
  const baseMetrics = calculate(baseValues);
  const results: { key: string; label: string; impact: number }[] = [];

  for (const slider of SLIDERS) {
    const range = slider.max - slider.min;
    if (range === 0) continue;

    // Nudge by 10% of range
    const nudge = range * 0.1;
    const upValues = { ...baseValues, [slider.key]: Math.min(slider.max, baseValues[slider.key] + nudge) };
    const downValues = { ...baseValues, [slider.key]: Math.max(slider.min, baseValues[slider.key] - nudge) };

    const upMetrics = calculate(upValues);
    const downMetrics = calculate(downValues);

    const impact = Math.abs(upMetrics.netRevenue - downMetrics.netRevenue);
    results.push({ key: slider.key, label: slider.label, impact });
  }

  results.sort((a, b) => b.impact - a.impact);
  return results;
}

// ============================================================================
// Components
// ============================================================================

function CustomSlider({ config, value, onChange }: {
  config: SliderConfig;
  value: number;
  onChange: (val: number) => void;
}) {
  const pct = ((value - config.min) / (config.max - config.min)) * 100;

  const displayValue = config.prefix
    ? `${config.prefix}${fmt(value, value % 1 !== 0 ? 2 : 0)}`
    : `${fmt(value, value % 1 !== 0 ? 1 : 0)}${config.suffix || ""}`;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: "0.8125rem", color: DS.colors.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
          {config.label}
          {config.isLive && (
            <span style={{
              fontSize: "0.5625rem", padding: "1px 5px", borderRadius: 4,
              background: `${DS.colors.accent}15`, color: DS.colors.accent, fontWeight: 600,
            }}>LIVE</span>
          )}
          {!config.isLive && (
            <span style={{
              fontSize: "0.5625rem", padding: "1px 5px", borderRadius: 4,
              background: `${DS.colors.warning}15`, color: DS.colors.warning, fontWeight: 600,
            }}>ESTIMATE</span>
          )}
        </span>
        <span style={{
          fontFamily: DS.fonts.mono, fontSize: "0.875rem",
          fontWeight: 600, color: DS.colors.text,
        }}>
          {displayValue}
        </span>
      </div>
      <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2,
          background: DS.colors.border,
        }}>
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: 2,
            background: DS.colors.accent,
            transition: "width 0.05s ease-out",
          }} />
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", width: "100%", height: 28,
            opacity: 0, cursor: "pointer", zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute", left: `${pct}%`, transform: "translateX(-50%)",
            width: 16, height: 16, borderRadius: "50%",
            background: DS.colors.accent, boxShadow: `0 0 6px ${DS.colors.accent}60`,
            pointerEvents: "none", zIndex: 1,
            transition: "left 0.05s ease-out",
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, large }: {
  label: string;
  value: string;
  color?: string;
  large?: boolean;
}) {
  return (
    <div style={{
      background: DS.colors.bgCard, borderRadius: DS.radius.card,
      border: `1px solid ${DS.colors.border}`,
      padding: large ? "20px 24px" : "16px 20px",
    }}>
      <div style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary, marginBottom: 6, letterSpacing: "0.02em" }}>
        {label}
      </div>
      <div style={{
        fontFamily: DS.fonts.mono,
        fontSize: large ? "1.5rem" : "1.125rem",
        fontWeight: 700,
        color: color || DS.colors.text,
      }}>
        {value}
      </div>
    </div>
  );
}

function Badge({ type }: { type: "live" | "estimate" }) {
  const isLive = type === "live";
  return (
    <span style={{
      fontSize: "0.5625rem", padding: "1px 5px", borderRadius: 4,
      background: isLive ? `${DS.colors.accent}15` : `${DS.colors.warning}15`,
      color: isLive ? DS.colors.accent : DS.colors.warning,
      fontWeight: 600, marginLeft: 6,
    }}>
      {isLive ? "LIVE DATA" : "ESTIMATE"}
    </span>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function WarRoomPage() {
  const [values, setValues] = useState<Record<string, number>>({ ...DEFAULT_VALUES });
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([...PRESET_SCENARIOS]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [liveData, setLiveData] = useState<{ registrations?: number; traffic?: number }>({});

  // Fetch live data on mount
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const [regRes, gaRes] = await Promise.allSettled([
          fetch("/api/ai-universa/registrations"),
          fetch("/api/ga4?property=aiuniversa"),
        ]);

        if (regRes.status === "fulfilled" && regRes.value.ok) {
          const data = await regRes.value.json();
          if (data.count) {
            setLiveData((prev) => ({ ...prev, registrations: data.count }));
          }
        }

        if (gaRes.status === "fulfilled" && gaRes.value.ok) {
          const data = await gaRes.value.json();
          if (data.totalUsers) {
            setLiveData((prev) => ({ ...prev, traffic: data.totalUsers }));
          }
        }
      } catch {
        // Silently fail, estimates remain
      }
    };
    fetchLive();
  }, []);

  const metrics = useMemo(() => calculate(values), [values]);
  const daysLeft = useMemo(() => getDaysUntilLaunch(), []);
  const sensitivity = useMemo(() => computeSensitivity(values), [values]);

  const revenueColor = getRevenueColor(metrics.netRevenue);
  const targetPct = Math.min(100, (metrics.netRevenue / TARGET) * 100);

  const updateSlider = useCallback((key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const loadScenario = (scenario: Scenario) => {
    setValues({ ...scenario.values });
  };

  const saveScenario = () => {
    if (!saveName.trim()) return;
    setSavedScenarios((prev) => [...prev, { name: saveName.trim(), values: { ...values } }]);
    setSaveName("");
    setShowSaveInput(false);
  };

  const toggleCompareItem = (name: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  };

  // Break even: find min total registrations where net revenue >= total ad spend
  const breakEvenRegs = useMemo(() => {
    const v = values;
    if (v.costPerRegistration <= 0) return 0;
    // Net revenue per show-up
    const revenuePerShowUp =
      ((v.closeRateNormal / 100) * v.normalPrice + (v.closeRateVIP / 100) * v.vipPrice) * (1 - v.refundRate / 100);
    if (revenuePerShowUp <= 0) return Infinity;
    const costPerReg = v.costPerRegistration;
    // Each paid registration costs costPerReg in ads, and generates showUpRate% chance of attending
    const netPerPaidReg = (v.showUpRate / 100) * revenuePerShowUp - costPerReg;
    if (netPerPaidReg <= 0) return Infinity;
    // We need enough paid regs to cover the total ad spend — but actually, break even is when profit >= 0
    // profit = netRevenue - totalAdSpend >= 0
    // With email reactivations providing free reach, break even for ads is:
    const emailFreeRevenue = (v.existingDatabase * (v.emailReactivationRate / 100)) * (v.showUpRate / 100) * revenuePerShowUp;
    const adSpendTotal = v.adSpendPerDay * v.adDays;
    const needed = adSpendTotal - emailFreeRevenue;
    if (needed <= 0) return 0;
    return Math.ceil(needed / ((v.showUpRate / 100) * revenuePerShowUp));
  }, [values]);

  const dailyPace = useMemo(() => {
    if (daysLeft <= 0) return 0;
    // How many registrations per day to hit target revenue
    const v = values;
    const revenuePerShowUp =
      ((v.closeRateNormal / 100) * v.normalPrice + (v.closeRateVIP / 100) * v.vipPrice) * (1 - v.refundRate / 100);
    if (revenuePerShowUp <= 0) return Infinity;
    const emailRevenue = (v.existingDatabase * (v.emailReactivationRate / 100)) * (v.showUpRate / 100) * revenuePerShowUp;
    const needed = TARGET - emailRevenue;
    if (needed <= 0) return 0;
    const regsForTarget = needed / ((v.showUpRate / 100) * revenuePerShowUp);
    return Math.ceil(regsForTarget / daysLeft);
  }, [values, daysLeft]);

  return (
    <div style={{ minHeight: "100vh", color: DS.colors.text }}>
      {/* Header */}
      <div style={{ padding: "0 0 32px 0" }}>
        <h1 style={{
          ...dsHeading,
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 400,
          marginBottom: 8,
        }}>
          Revenue War Room
        </h1>
        <p style={{ fontSize: "0.8125rem", color: DS.colors.textSecondary, fontFamily: DS.fonts.body }}>
          AI Universa Launch · Interactive Revenue Simulator
        </p>
      </div>

      {/* BIG Revenue Number */}
      <div style={{
        ...dsCard, border: `1px solid ${revenueColor}15`,
        padding: "48px 32px", marginBottom: DS.spacing.elementGap, textAlign: "center",
      }}>
        <div style={{ fontSize: "0.8125rem", color: DS.colors.textSecondary, marginBottom: 12, letterSpacing: "0.02em", fontFamily: DS.fonts.body }}>
          Projected net revenue
        </div>
        <div style={{
          fontFamily: DS.fonts.heading,
          fontSize: "clamp(3rem, 8vw, 4.5rem)",
          fontWeight: 400,
          color: revenueColor,
          lineHeight: 1.1,
          marginBottom: 20,
        }}>
          €{fmt(Math.round(metrics.netRevenue))}
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary }}>{targetPct.toFixed(1)}% of target</span>
            <span style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary, fontFamily: DS.fonts.mono }}>€{fmt(TARGET)} target</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: DS.colors.border, overflow: "hidden" }}>
            <div style={{
              width: `${Math.min(targetPct, 100)}%`,
              height: "100%", borderRadius: 2,
              background: revenueColor,
              transition: "width 0.3s ease-out",
            }} />
          </div>
        </div>
      </div>

      {/* Top Panels: Countdown + Daily Pace */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16, marginBottom: 24,
      }}>
        {/* Countdown */}
        <div style={{
          background: DS.colors.bgCard, borderRadius: parseInt(DS.radius.card),
          border: `1px solid ${DS.colors.border}`,
          padding: "20px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Days Until Launch
          </div>
          <div style={{
            fontFamily: DS.fonts.mono,
            fontSize: "3rem", fontWeight: 900,
            color: daysLeft <= 7 ? DS.colors.error : daysLeft <= 14 ? DS.colors.warning : DS.colors.accentPurple,
          }}>
            {daysLeft}
          </div>
          <div style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, marginTop: 4 }}>
            April 15, 2026
          </div>
          {/* Milestone markers */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
            {[
              { label: "Ads Start", days: 21, color: "#3B82F6" },
              { label: "Warm Up", days: 7, color: DS.colors.warning },
              { label: "Launch", days: 0, color: DS.colors.accent },
            ].map((m) => (
              <div key={m.label} style={{ textAlign: "center" }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", margin: "0 auto 4px",
                  background: daysLeft <= m.days ? m.color : DS.colors.textMuted,
                }} />
                <div style={{ fontSize: "0.5625rem", color: DS.colors.textSecondary }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Required Pace */}
        <div style={{
          background: DS.colors.bgCard, borderRadius: parseInt(DS.radius.card),
          border: `1px solid ${DS.colors.border}`,
          padding: "20px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Daily Required Pace
          </div>
          <div style={{
            fontFamily: DS.fonts.mono,
            fontSize: "2.5rem", fontWeight: 900,
            color: dailyPace > 500 ? DS.colors.error : dailyPace > 300 ? DS.colors.warning : DS.colors.accent,
          }}>
            {dailyPace === Infinity ? "∞" : fmt(dailyPace)}
          </div>
          <div style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, marginTop: 4 }}>
            registrations per day to hit €{fmt(TARGET / 1_000_000, 1)}M
          </div>
        </div>

        {/* Break Even */}
        <div style={{
          background: DS.colors.bgCard, borderRadius: parseInt(DS.radius.card),
          border: `1px solid ${DS.colors.border}`,
          padding: "20px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Break Even Point
          </div>
          <div style={{
            fontFamily: DS.fonts.mono,
            fontSize: "2.5rem", fontWeight: 900,
            color: breakEvenRegs === Infinity ? DS.colors.error : breakEvenRegs <= metrics.newRegistrations ? DS.colors.accent : DS.colors.warning,
          }}>
            {breakEvenRegs === Infinity ? "N/A" : fmt(breakEvenRegs)}
          </div>
          <div style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, marginTop: 4 }}>
            {breakEvenRegs === Infinity
              ? "Unit economics are negative"
              : breakEvenRegs <= metrics.newRegistrations
                ? "Already profitable at current projections!"
                : `paid registrations needed (you project ${fmt(Math.round(metrics.newRegistrations))})`}
          </div>
        </div>
      </div>

      {/* Main Grid: Sliders + Metrics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 24, marginBottom: 24,
      }}>
        {/* Sliders Panel */}
        <div style={{
          background: DS.colors.bgCard, borderRadius: 16,
          border: `1px solid ${DS.colors.border}`,
          padding: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ ...dsHeading, fontSize: "1.25rem", fontWeight: 400 }}>
              Scenario Variables
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              {!showSaveInput ? (
                <button
                  onClick={() => setShowSaveInput(true)}
                  style={{
                    padding: "6px 14px", fontSize: "0.75rem", fontWeight: 600,
                    background: `${DS.colors.accentPurple}20`, color: DS.colors.accentPurple,
                    border: "1px solid rgba(124,92,252,0.3)", borderRadius: 8, cursor: "pointer",
                  }}
                >
                  Save Scenario
                </button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Scenario name..."
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveScenario()}
                    style={{
                      padding: "6px 10px", fontSize: "0.75rem",
                      background: DS.colors.border, color: DS.colors.text,
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
                      outline: "none", width: 150,
                    }}
                    autoFocus
                  />
                  <button
                    onClick={saveScenario}
                    style={{
                      padding: "6px 10px", fontSize: "0.75rem", fontWeight: 600,
                      background: DS.colors.accent, color: DS.colors.bg,
                      border: "none", borderRadius: 6, cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowSaveInput(false); setSaveName(""); }}
                    style={{
                      padding: "6px 10px", fontSize: "0.75rem",
                      background: "transparent", color: DS.colors.textSecondary,
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scenario Quick Load */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {savedScenarios.map((s) => (
              <button
                key={s.name}
                onClick={() => loadScenario(s)}
                style={{
                  padding: "5px 12px", fontSize: "0.6875rem", fontWeight: 500,
                  background: "rgba(255,255,255,0.04)", color: DS.colors.textSecondary,
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${DS.colors.accentPurple}15`;
                  e.currentTarget.style.color = DS.colors.accentPurple;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = DS.colors.textSecondary;
                }}
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={() => setCompareMode(!compareMode)}
              style={{
                padding: "5px 12px", fontSize: "0.6875rem", fontWeight: 600,
                background: compareMode ? `${DS.colors.accent}20` : "rgba(255,255,255,0.04)",
                color: compareMode ? DS.colors.accent : "#6B7280",
                border: `1px solid ${compareMode ? `${DS.colors.accent}30` : "rgba(255,255,255,0.08)"}`,
                borderRadius: 6, cursor: "pointer", marginLeft: "auto",
              }}
            >
              {compareMode ? "✕ Close Compare" : "Compare Scenarios"}
            </button>
          </div>

          {/* Sliders Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "8px 24px",
          }}>
            {SLIDERS.map((s) => (
              <CustomSlider
                key={s.key}
                config={s}
                value={values[s.key]}
                onChange={(val) => updateSlider(s.key, val)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12, marginBottom: 24,
      }}>
        <MetricCard label="New Registrations (Ads)" value={fmt(Math.round(metrics.newRegistrations))} />
        <MetricCard label="Email Reactivations" value={fmt(Math.round(metrics.emailReactivations))} />
        <MetricCard label="Total Show Ups" value={fmt(Math.round(metrics.showUps))} />
        <MetricCard label={`Normal Buyers × €${fmt(values.normalPrice)}`} value={fmt(Math.round(metrics.normalBuyers))} />
        <MetricCard label={`VIP Buyers × €${fmt(values.vipPrice)}`} value={fmt(Math.round(metrics.vipBuyers))} />
        <MetricCard label="Gross Revenue" value={fmtEuro(metrics.grossRevenue)} />
        <MetricCard label="Refunds" value={fmtEuro(metrics.refunds)} color={DS.colors.error} />
        <MetricCard label="Ad Spend" value={fmtEuro(metrics.totalAdSpend)} color={DS.colors.error} />
        <MetricCard label="NET REVENUE" value={fmtEuro(metrics.netRevenue)} color={revenueColor} large />
        <MetricCard label="ROAS" value={`${metrics.roas.toFixed(1)}x`} color={metrics.roas >= 3 ? DS.colors.accent : metrics.roas >= 1 ? DS.colors.warning : DS.colors.error} large />
        <MetricCard label="Profit" value={fmtEuro(metrics.profit)} color={metrics.profit >= 0 ? DS.colors.accent : DS.colors.error} large />
        <MetricCard label="ROI" value={`${fmt(Math.round(metrics.roi))}%`} color={metrics.roi >= 100 ? DS.colors.accent : metrics.roi >= 0 ? DS.colors.warning : DS.colors.error} />
      </div>

      {/* Sensitivity Analysis */}
      <div style={{
        background: DS.colors.bgCard, borderRadius: 16,
        border: `1px solid ${DS.colors.border}`,
        padding: "24px", marginBottom: 24,
      }}>
        <h2 style={{ ...dsHeading, fontSize: "1.25rem", fontWeight: 400, marginBottom: 16 }}>
          Sensitivity Analysis
        </h2>
        <p style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, marginBottom: 16 }}>
          Which variable has the biggest impact on revenue? (±10% of range)
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sensitivity.slice(0, 6).map((s, i) => {
            const maxImpact = sensitivity[0]?.impact || 1;
            const barPct = (s.impact / maxImpact) * 100;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  fontSize: "0.75rem", color: i === 0 ? DS.colors.accent : DS.colors.textSecondary,
                  width: 180, flexShrink: 0, textAlign: "right",
                }}>
                  {s.label}
                </span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: DS.colors.border }}>
                  <div style={{
                    width: `${barPct}%`, height: "100%", borderRadius: 3,
                    background: i === 0 ? DS.colors.accent : i < 3 ? DS.colors.accentPurple : DS.colors.textMuted,
                    transition: "width 0.3s",
                  }} />
                </div>
                <span style={{
                  fontFamily: DS.fonts.mono,
                  fontSize: "0.6875rem", color: DS.colors.textSecondary, width: 80, flexShrink: 0,
                }}>
                  ±€{s.impact >= 1000 ? `${(s.impact / 1000).toFixed(0)}K` : fmt(Math.round(s.impact))}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario Comparison */}
      {compareMode && (
        <div style={{
          background: DS.colors.bgCard, borderRadius: 16,
          border: `1px solid ${DS.colors.border}`,
          padding: "24px", marginBottom: 24,
        }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: DS.colors.text, marginBottom: 16 }}>
            📊 Scenario Comparison (select up to 3)
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {savedScenarios.map((s) => (
              <button
                key={s.name}
                onClick={() => toggleCompareItem(s.name)}
                style={{
                  padding: "6px 14px", fontSize: "0.75rem", fontWeight: 500,
                  background: selectedForCompare.includes(s.name) ? `${DS.colors.accent}20` : "rgba(255,255,255,0.04)",
                  color: selectedForCompare.includes(s.name) ? DS.colors.accent : DS.colors.textSecondary,
                  border: `1px solid ${selectedForCompare.includes(s.name) ? `${DS.colors.accent}30` : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 6, cursor: "pointer",
                }}
              >
                {s.name}
              </button>
            ))}
          </div>

          {selectedForCompare.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${selectedForCompare.length}, 1fr)`,
              gap: 16,
            }}>
              {selectedForCompare.map((name) => {
                const scenario = savedScenarios.find((s) => s.name === name);
                if (!scenario) return null;
                const m = calculate(scenario.values);
                const color = getRevenueColor(m.netRevenue);
                return (
                  <div key={name} style={{
                    background: DS.colors.bgCard, borderRadius: parseInt(DS.radius.card),
                    border: `1px solid ${color}22`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: DS.colors.text, marginBottom: 12 }}>
                      {name}
                    </h3>
                    <div style={{
                      fontFamily: DS.fonts.mono,
                      fontSize: "1.75rem", fontWeight: 900,
                      color, marginBottom: 16,
                    }}>
                      €{fmt(Math.round(m.netRevenue))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        ["Registrations", fmt(Math.round(m.newRegistrations))],
                        ["Show Ups", fmt(Math.round(m.showUps))],
                        ["Gross", fmtEuro(m.grossRevenue)],
                        ["Ad Spend", fmtEuro(m.totalAdSpend)],
                        ["Profit", fmtEuro(m.profit)],
                        ["ROAS", `${m.roas.toFixed(1)}x`],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary }}>{label}</span>
                          <span style={{ fontFamily: DS.fonts.mono, fontSize: "0.6875rem", color: DS.colors.text }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Live Data Info */}
      {(liveData.registrations || liveData.traffic) && (
        <div style={{
          background: DS.colors.bgCard, borderRadius: parseInt(DS.radius.card),
          border: "1px solid rgba(0,255,178,0.15)",
          padding: "16px 20px", marginBottom: 24,
          display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center",
        }}>
          <span style={{ fontSize: "0.75rem", color: DS.colors.accent, fontWeight: 600 }}>📡 Live Data</span>
          {liveData.registrations && (
            <span style={{ fontSize: "0.75rem", color: DS.colors.textSecondary }}>
              Current Registrations: <span style={{ fontFamily: DS.fonts.mono, color: DS.colors.text }}>{fmt(liveData.registrations)}</span>
              <Badge type="live" />
            </span>
          )}
          {liveData.traffic && (
            <span style={{ fontSize: "0.75rem", color: DS.colors.textSecondary }}>
              GA4 Users: <span style={{ fontFamily: DS.fonts.mono, color: DS.colors.text }}>{fmt(liveData.traffic)}</span>
              <Badge type="live" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
