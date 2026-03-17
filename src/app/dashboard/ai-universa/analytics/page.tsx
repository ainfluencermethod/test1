"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import LaunchTimeline from '@/components/LaunchTimeline';
import { AI_UNIVERSA_READINESS_ITEMS } from '@/lib/aiuniversa-readiness-data';

/* ═══════════════════════════════════════════════════════════
   AI Universa – Analytics Dashboard (Pre-Event Command Center)
   ═══════════════════════════════════════════════════════════ */

const BASE_URL = "https://aiuniversa.si";
const EVENT_DATE = new Date("2026-04-15T09:00:00+02:00");
const REGISTRATION_TARGET = 5000;
const REVENUE_TARGET = 1100000;
const NORMAL_TICKET = 899;
const VIP_TICKET = 2499;
const VIP_RATE = 0.15;
const CONVERSION_RATE = 0.05;
const DAILY_AD_BUDGET = 860;

/* ─── Traffic Sources ─── */
interface TrafficSource {
  id: number;
  name: string;
  icon: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  leads: number;
  visitors: number;
  revenue: number;
  active: boolean;
}

const initialSources: TrafficSource[] = [
  { id: 1, name: "Instagram Story", icon: "📸", utmSource: "instagram", utmMedium: "story", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
  { id: 2, name: "YouTube Organic", icon: "🎥", utmSource: "youtube", utmMedium: "organic", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
  { id: 3, name: "YouTube Trailer", icon: "🎥", utmSource: "youtube", utmMedium: "trailer", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
  { id: 4, name: "Instagram Bio", icon: "📸", utmSource: "instagram", utmMedium: "bio", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
  { id: 5, name: "YouTube LIVE", icon: "🎥", utmSource: "youtube", utmMedium: "live", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: false },
  { id: 6, name: "Old Email List", icon: "📧", utmSource: "email", utmMedium: "old-list", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
  { id: 7, name: "WhatsApp Numbers", icon: "💬", utmSource: "whatsapp", utmMedium: "direct", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
  { id: 8, name: "Ads Prospecting", icon: "📢", utmSource: "facebook", utmMedium: "ads-prospecting", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
  { id: 9, name: "Ads Retargeting", icon: "📢", utmSource: "facebook", utmMedium: "ads-retargeting", utmCampaign: "ai-universa-apr26", leads: 0, visitors: 0, revenue: 0, active: true },
];

/* ─── Funnel Steps ─── */
const funnelSteps = [
  { label: "Visitors", count: 0 },
  { label: "Leads", count: 0 },
  { label: "Registered", count: 0 },
  { label: "Attended D1", count: 0 },
  { label: "Attended D3", count: 0 },
  { label: "Cart Views", count: 0 },
  { label: "Purchases", count: 0 },
]; // Will populate with real data once campaign starts

/* ─── Ad Metrics ─── */
const totalBudget = 860 * 28;
const totalSpent = 0; // Ads not started yet — starts March 25

/* ─── Helpers ─── */
function copyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}
function utmUrl(src: TrafficSource) {
  return `${BASE_URL}?utm_source=${src.utmSource}&utm_medium=${src.utmMedium}&utm_campaign=${src.utmCampaign}`;
}
function formatEuro(n: number): string {
  return `€${n.toLocaleString("de-DE")}`;
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN TIMER
   ═══════════════════════════════════════════════════════════ */

function CountdownTimer() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = EVENT_DATE.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      {units.map((u) => (
        <div key={u.label} style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.25)",
          borderRadius: 12, padding: "12px 16px", minWidth: 72,
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "1.75rem",
            fontWeight: 700, color: "#8B5CF6",
          }}>
            {String(u.value).padStart(2, "0")}
          </span>
          <span style={{ fontSize: "0.625rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REGISTRATION TRACKER (Live from API)
   ═══════════════════════════════════════════════════════════ */

interface RegistrationData {
  totalRegistrations: number;
  previousDatabase: number;
  combinedTotal: number;
  target: number;
  progressPercent: number;
  dailyBreakdown: { date: string; count: number }[];
  recentSignups: { id: string; name: string; email: string; date: string; source: string }[];
  lastUpdated: string;
}

function RegistrationTracker() {
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ai-universa/registrations");
        const json = await res.json();
        if (json.data) setData(json.data);
        if (!json.success) setError(json.error || "API error");
      } catch (err) {
        setError("Failed to connect to registration API");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const registrations = data?.totalRegistrations ?? 0;
  const progress = data?.progressPercent ?? 0;

  return (
    <div style={{
      background: "#1A1D23", border: "1px solid rgba(139, 92, 246, 0.15)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Registrations
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "2rem",
            fontWeight: 700, color: "#8B5CF6", marginTop: 4,
          }}>
            {loading ? "..." : registrations.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280" }}>Target: {REGISTRATION_TARGET.toLocaleString()}</div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>
            Previous DB: {(data?.previousDatabase ?? 21292).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "0.6875rem", color: "#9CA3AF" }}>Progress</span>
          <span style={{ fontSize: "0.6875rem", color: "#8B5CF6", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            background: "linear-gradient(90deg, #8B5CF6, #A78BFA)",
            width: `${Math.min(100, progress)}%`,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {error && (
        <div style={{ fontSize: "0.6875rem", color: "#F59E0B", marginTop: 8 }}>
          ⚠ {error}
        </div>
      )}

      {/* Daily Registration Chart (mini bar chart) */}
      {data?.dailyBreakdown && data.dailyBreakdown.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginBottom: 8 }}>Daily Trend</div>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 40 }}>
            {data.dailyBreakdown.slice(-14).map((day) => {
              const maxCount = Math.max(...data.dailyBreakdown.map((d) => d.count), 1);
              const height = Math.max(2, (day.count / maxCount) * 40);
              return (
                <div key={day.date} title={`${day.date}: ${day.count}`} style={{
                  flex: 1, height, borderRadius: 2,
                  background: "linear-gradient(180deg, #8B5CF6, rgba(139, 92, 246, 0.4))",
                }} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   READINESS CHECKLIST
   ═══════════════════════════════════════════════════════════ */

function ReadinessChecklist() {
  const doneCount = AI_UNIVERSA_READINESS_ITEMS.filter((i) => i.done).length;
  const totalCount = AI_UNIVERSA_READINESS_ITEMS.length;
  const pct = Math.round((doneCount / totalCount) * 100);

  return (
    <div style={{
      background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
          Launch Readiness
        </div>
        <div style={{
          fontSize: "0.75rem", fontWeight: 600, color: pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {doneCount}/{totalCount} ({pct}%)
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {AI_UNIVERSA_READINESS_ITEMS.map((item) => (
          <div key={item.label} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "6px 8px", borderRadius: 8,
            background: item.done ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
          }}>
            <span style={{ fontSize: "0.875rem" }}>
              {item.done ? "✅" : "⬜"}
            </span>
            <span style={{
              fontSize: "0.8125rem",
              color: item.done ? "#9CA3AF" : "rgba(255,255,255,0.92)",
              textDecoration: item.done ? "line-through" : "none",
            }}>
              {item.label}
            </span>
            {item.detail && (
              <span style={{
                marginLeft: "auto", fontSize: "0.6875rem",
                color: "#6B7280", fontFamily: "'JetBrains Mono', monospace",
              }}>
                {item.detail}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVENUE PROJECTION MODEL
   ═══════════════════════════════════════════════════════════ */

function RevenueProjectionModel() {
  const [regInput, setRegInput] = useState(5000);

  const buyers = regInput * CONVERSION_RATE;
  const normalBuyers = buyers * (1 - VIP_RATE);
  const vipBuyers = buyers * VIP_RATE;
  const projected = normalBuyers * NORMAL_TICKET + vipBuyers * VIP_TICKET;
  const avgTicket = normalBuyers * NORMAL_TICKET / buyers + vipBuyers * VIP_TICKET / buyers;
  const progressToTarget = (projected / REVENUE_TARGET) * 100;

  const scenarios = [
    { label: "Conservative", regs: 3000 },
    { label: "Base", regs: 5000 },
    { label: "Aggressive", regs: 8000 },
    { label: "Moonshot", regs: 12000 },
  ];

  return (
    <div style={{
      background: "#1A1D23", border: "1px solid rgba(139, 92, 246, 0.15)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 4 }}>
        Revenue Projection
      </div>
      <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginBottom: 16 }}>
        {CONVERSION_RATE * 100}% conversion · {(1 - VIP_RATE) * 100}% normal ({formatEuro(NORMAL_TICKET)}) + {VIP_RATE * 100}% VIP ({formatEuro(VIP_TICKET)})
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Registrations</span>
          <span style={{ fontSize: "0.75rem", color: "#8B5CF6", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {regInput.toLocaleString()}
          </span>
        </div>
        <input
          type="range" min={1000} max={20000} step={500} value={regInput}
          onChange={(e) => setRegInput(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#8B5CF6" }}
        />
      </div>

      {/* Projection result */}
      <div style={{
        background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.2)",
        borderRadius: 12, padding: "16px 20px", textAlign: "center", marginBottom: 16,
      }}>
        <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: 4 }}>
          If {regInput.toLocaleString()} people register, projected revenue =
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: "2rem",
          fontWeight: 700, color: projected >= REVENUE_TARGET ? "#10B981" : "#8B5CF6",
        }}>
          {formatEuro(Math.round(projected))}
        </div>
        <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 4 }}>
          {Math.round(buyers)} buyers · Avg ticket {formatEuro(Math.round(avgTicket))} · Target: {formatEuro(REVENUE_TARGET)}
        </div>
      </div>

      {/* Target progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "0.6875rem", color: "#9CA3AF" }}>Target Progress</span>
          <span style={{
            fontSize: "0.6875rem", fontFamily: "'JetBrains Mono', monospace",
            color: progressToTarget >= 100 ? "#10B981" : "#F59E0B",
          }}>
            {Math.round(progressToTarget)}%
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, transition: "width 0.3s ease",
            background: progressToTarget >= 100 ? "#10B981" : "linear-gradient(90deg, #8B5CF6, #A78BFA)",
            width: `${Math.min(100, progressToTarget)}%`,
          }} />
        </div>
      </div>

      {/* Scenario table */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {scenarios.map((s) => {
          const sBuyers = s.regs * CONVERSION_RATE;
          const sRev = sBuyers * (1 - VIP_RATE) * NORMAL_TICKET + sBuyers * VIP_RATE * VIP_TICKET;
          return (
            <button key={s.label} onClick={() => setRegInput(s.regs)} style={{
              background: regInput === s.regs ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${regInput === s.regs ? "rgba(139, 92, 246, 0.3)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 8, padding: "8px 4px", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.625rem", color: "#9CA3AF", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", fontFamily: "'JetBrains Mono', monospace" }}>
                {formatEuro(Math.round(sRev / 1000))}k
              </div>
              <div style={{ fontSize: "0.5625rem", color: "#6B7280" }}>{s.regs.toLocaleString()} regs</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AD PERFORMANCE (Pre-Launch)
   ═══════════════════════════════════════════════════════════ */

function AdPerformancePreLaunch() {
  const adsStartDate = new Date("2026-03-25");
  const now = new Date();
  const daysUntilAds = Math.max(0, Math.ceil((adsStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const adsLive = daysUntilAds === 0;

  const weeklyBudget = DAILY_AD_BUDGET * 7;
  const monthlyBudget = DAILY_AD_BUDGET * 30;
  const totalCampaignBudget = DAILY_AD_BUDGET * 21; // Mar 25 to Apr 15

  return (
    <div style={{
      background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
            Ad Performance
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>
            {adsLive ? "LIVE" : `Ads start March 25 · ${daysUntilAds} days away`}
          </div>
        </div>
        {!adsLive && (
          <div style={{
            background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: 8, padding: "4px 10px", fontSize: "0.6875rem", color: "#F59E0B", fontWeight: 500,
          }}>
            PRE LAUNCH
          </div>
        )}
      </div>

      {/* Budget breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Daily", value: formatEuro(DAILY_AD_BUDGET) },
          { label: "Weekly", value: formatEuro(weeklyBudget) },
          { label: "Campaign Total", value: formatEuro(totalCampaignBudget) },
        ].map((b) => (
          <div key={b.label} style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.625rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>{b.label}</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
              {b.value}
            </div>
          </div>
        ))}
      </div>

      {/* Mock metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <div style={{
          background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "12px 16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>CPA (Cost per Acquisition)</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: 600, color: "#6B7280" }}>
            Awaiting data
          </div>
          <div style={{ fontSize: "0.625rem", color: "#F59E0B", marginTop: 2 }}>Ads start March 25. Data will appear automatically.</div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "12px 16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>ROAS</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: 600, color: "#6B7280" }}>
            Awaiting data
          </div>
          <div style={{ fontSize: "0.625rem", color: "#F59E0B", marginTop: 2 }}>Ads start March 25. Budget: €860/day.</div>
        </div>
      </div>

      <div style={{
        marginTop: 12, fontSize: "0.6875rem", color: "#6B7280",
        background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 12px",
        textAlign: "center",
      }}>
        📢 Ads start March 25. Live data will populate automatically.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTENT PERFORMANCE (IG Accounts)
   ═══════════════════════════════════════════════════════════ */

interface IGProfile {
  username: string;
  followersCount: number;
  postsCount: number;
  avgEngagementRate: number;
  isMock: boolean;
}

function ContentPerformance() {
  const [profiles, setProfiles] = useState<IGProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ig-performance");
        const json = await res.json();
        if (json.data?.profiles) {
          setProfiles(json.data.profiles);
          setIsMock(json.data.profiles.some((p: IGProfile) => p.isMock));
        }
      } catch {
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalFollowers = profiles.reduce((a, p) => a + p.followersCount, 0);
  const avgEngagement = profiles.length > 0
    ? profiles.reduce((a, p) => a + p.avgEngagementRate, 0) / profiles.length
    : 0;

  return (
    <div style={{
      background: "#1A1D23", border: "1px solid rgba(0, 229, 255, 0.15)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
            Content Performance
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>IG accounts overview</div>
        </div>
        {isMock && (
          <span style={{
            fontSize: "0.5rem", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B",
            padding: "2px 8px", borderRadius: 4, fontWeight: 600,
          }}>⚠️ IG scraper not running. Start Apify cron for live data.</span>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.625rem", color: "#6B7280", textTransform: "uppercase" }}>Total Followers</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.125rem", fontWeight: 600, color: "#00E5FF", marginTop: 2 }}>
            {loading ? "..." : `${(totalFollowers / 1000).toFixed(0)}k`}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.625rem", color: "#6B7280", textTransform: "uppercase" }}>Avg Engagement</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.125rem", fontWeight: 600, color: "#00E5FF", marginTop: 2 }}>
            {loading ? "..." : `${avgEngagement.toFixed(1)}%`}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.625rem", color: "#6B7280", textTransform: "uppercase" }}>Accounts</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.125rem", fontWeight: 600, color: "#00E5FF", marginTop: 2 }}>
            {profiles.length}
          </div>
        </div>
      </div>

      {/* Account list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {profiles.map((p) => (
          <div key={p.username} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.8125rem" }}>📸</span>
              <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", fontWeight: 500 }}>
                @{p.username}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
                {(p.followersCount / 1000).toFixed(1)}k
              </span>
              <span style={{ fontSize: "0.75rem", color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
                {p.avgEngagementRate}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ATTRIBUTION SECTION
   ═══════════════════════════════════════════════════════════ */

interface AttributionSource {
  source: string;
  leads: number;
  percentage: number;
  conversionRate: number;
  isMock: boolean;
}

function AttributionSection() {
  const [sources, setSources] = useState<AttributionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/attribution");
        const json = await res.json();
        if (json.data?.sources) {
          setSources(json.data.sources);
          setIsMock(json.data.sources.some((s: AttributionSource) => s.isMock));
        }
      } catch {
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const maxLeads = sources.length > 0 ? Math.max(...sources.map((s) => s.leads)) : 1;

  const barColors = ["#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95", "#3B0764"];

  return (
    <div style={{
      background: "#1A1D23", border: "1px solid rgba(139, 92, 246, 0.15)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
            UTM Attribution
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>Leads by acquisition source</div>
        </div>
        {isMock && (
          <span style={{
            fontSize: "0.5rem", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B",
            padding: "2px 8px", borderRadius: 4, fontWeight: 600,
          }}>⚠️ No traffic yet. Attribution data populates when campaign starts.</span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 20, color: "#6B7280" }}>Loading...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sources.map((src, i) => {
            const barW = Math.max(3, (src.leads / maxLeads) * 100);
            return (
              <div key={src.source} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 160, fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500,
                  flexShrink: 0, textAlign: "right",
                }}>
                  {src.source}
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{
                    width: `${barW}%`, height: 22, borderRadius: 4,
                    background: barColors[i % barColors.length], opacity: 0.8,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{
                  width: 120, display: "flex", gap: 8, justifyContent: "flex-end",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem", flexShrink: 0,
                }}>
                  <span style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                    {src.leads.toLocaleString()}
                  </span>
                  <span style={{ color: "#6B7280" }}>
                    {src.percentage}%
                  </span>
                  <span style={{ color: "#10B981" }}>
                    {src.conversionRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SVG CHART COMPONENTS (Existing)
   ═══════════════════════════════════════════════════════════ */

function TrafficOverTimeChart() {
  const dataHistorical = [50, 65, 80, 90, 120, 150, 180, 200, 250, 300, 350, 380, 400, 420];
  const dataProjected = [1200, 1800, 2200, 2500, 2800, 3000, 2900, 3100, 3300, 3500, 3800, 4000, 4200, 4500];
  const allData = [...dataHistorical, ...dataProjected];
  const todayIdx = dataHistorical.length - 1;

  const W = 700, H = 260, pL = 50, pR = 15, pT = 20, pB = 35;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxV = Math.max(...allData);

  const xP = (i: number) => pL + (i / (allData.length - 1)) * cW;
  const yP = (v: number) => pT + cH - (v / maxV) * cH;

  const hPath = dataHistorical.map((v, i) => `${i === 0 ? "M" : "L"}${xP(i).toFixed(1)},${yP(v).toFixed(1)}`).join(" ");
  const pPath = [`M${xP(todayIdx).toFixed(1)},${yP(dataHistorical[todayIdx]).toFixed(1)}`,
    ...dataProjected.map((v, i) => `L${xP(todayIdx + 1 + i).toFixed(1)},${yP(v).toFixed(1)}`)].join(" ");
  const areaPath = hPath + ` L${xP(todayIdx).toFixed(1)},${(pT + cH).toFixed(1)} L${xP(0).toFixed(1)},${(pT + cH).toFixed(1)} Z`;

  const yTicks = [0, 1000, 2000, 3000, 4500];
  const xLabels = [
    { label: "Mar 11", idx: 0 }, { label: "Mar 15", idx: 4 }, { label: "Mar 20", idx: 9 },
    { label: "Mar 25", idx: 14 }, { label: "Mar 30", idx: 19 }, { label: "Apr 4", idx: 24 },
  ];

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Traffic Over Time</div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>14 days actual + 14 days projected</div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.6875rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 16, height: 2, background: "#00D4AA", borderRadius: 1 }} /> Actual
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 16, height: 2, background: "#00D4AA", borderRadius: 1, opacity: 0.5, borderBottom: "2px dashed #7C5CFC" }} /> Projected
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map(t => (
          <g key={t}>
            <line x1={pL} y1={yP(t)} x2={W - pR} y2={yP(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pL - 8} y={yP(t) + 3} fill="#6B7280" fontSize="9" textAnchor="end" fontFamily="'JetBrains Mono', monospace">
              {t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t}
            </text>
          </g>
        ))}
        {xLabels.map(l => (
          <text key={l.label} x={xP(l.idx)} y={H - 8} fill="#6B7280" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
            {l.label}
          </text>
        ))}
        <path d={areaPath} fill="url(#trafficGrad)" />
        <path d={hPath} fill="none" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pPath} fill="none" stroke="#00D4AA" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" opacity="0.6" />
        <line x1={xP(todayIdx)} y1={pT} x2={xP(todayIdx)} y2={pT + cH} stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 3" />
        <text x={xP(todayIdx)} y={pT - 4} fill="#F59E0B" fontSize="8" textAnchor="middle" fontWeight="700">TODAY</text>
        {allData.map((v, i) => (
          <g key={i}>
            <circle cx={xP(i)} cy={yP(v)} r={hoverIdx === i ? 5 : 2.5} fill={i <= todayIdx ? "#7C5CFC" : "rgba(124,92,252,0.5)"}
              style={{ cursor: "pointer", transition: "r 0.15s" }}
              onMouseEnter={() => setHoverIdx(i)}
            />
            {hoverIdx === i && (
              <g>
                <rect x={xP(i) - 28} y={yP(v) - 22} width={56} height={18} rx={4} fill="#0D0F14" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x={xP(i)} y={yP(v) - 10} fill="rgba(255,255,255,0.92)" fontSize="9" textAnchor="middle" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
                  {v.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function LeadsBySourceChart() {
  const [liveSources, setLiveSources] = useState<TrafficSource[]>(initialSources);
  
  useEffect(() => {
    async function fetchUTM() {
      try {
        const res = await fetch('/api/ga4?property=aiuniversa');
        const json = await res.json();
        if (json.success && json.data?.utmAttribution) {
          const updated = initialSources.map(src => {
            const match = json.data.utmAttribution.find(
              (u: { source: string; medium: string; sessions: number }) => 
                u.source === src.utmSource && u.medium === src.utmMedium
            );
            return match ? { ...src, leads: match.sessions, visitors: match.sessions } : src;
          });
          // Add unmatched UTM sources
          const matchedKeys = new Set(initialSources.map(s => `${s.utmSource}/${s.utmMedium}`));
          let nextId = 100;
          json.data.utmAttribution.forEach((u: { source: string; medium: string; sessions: number; users: number }) => {
            const key = `${u.source}/${u.medium}`;
            if (!matchedKeys.has(key) && u.source !== '(direct)' && u.source !== '(not set)') {
              updated.push({
                id: nextId++, name: `${u.source} / ${u.medium}`, icon: "🌐",
                utmSource: u.source, utmMedium: u.medium, utmCampaign: "",
                leads: u.sessions, visitors: u.sessions, revenue: 0, active: true,
              });
            }
          });
          setLiveSources(updated);
        }
      } catch { /* keep initial */ }
    }
    fetchUTM();
  }, []);

  const sorted = [...liveSources].sort((a, b) => b.leads - a.leads);
  const maxLeads = sorted[0]?.leads || 1;
  const totalLeads = sorted.reduce((a, s) => a + s.leads, 0);
  const barColors = ["#7C5CFC", "#8B6FFD", "#9A82FE", "#A994FF", "#B8A7FF", "#6366F1", "#818CF8", "#A5B4FC", "#C4B5FD"];

  return (
    <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 4 }}>Leads by Source</div>
      <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginBottom: 16 }}>Sorted by lead count · Total: {totalLeads.toLocaleString()}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((src, i) => {
          const pct = ((src.leads / totalLeads) * 100).toFixed(1);
          const barW = Math.max(2, (src.leads / maxLeads) * 100);
          return (
            <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 130, fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500, flexShrink: 0, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                <span>{src.icon}</span> {src.name}
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{
                  width: `${barW}%`, height: 22, borderRadius: 4,
                  background: barColors[i % barColors.length],
                  opacity: 0.75, transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ width: 110, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem", color: "rgba(255,255,255,0.92)", fontWeight: 600, flexShrink: 0, textAlign: "right" }}>
                {src.leads.toLocaleString()} <span style={{ color: "#6B7280", fontWeight: 400 }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FunnelBarChart() {
  const steps = [
    { label: "Visitors", count: 48320 },
    { label: "Leads", count: 27658 },
    { label: "Registered", count: 19240 },
    { label: "Attended", count: 12480 },
    { label: "Purchased", count: 87 },
  ];
  const maxC = steps[0].count;
  const W = 500, H = 250, pL = 10, pR = 10, pT = 20, pB = 45;
  const cW = W - pL - pR, cH = H - pT - pB;
  const barW = cW / steps.length * 0.6;
  const gap = cW / steps.length;

  return (
    <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 4 }}>Conversion Funnel</div>
      <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginBottom: 16 }}>Decreasing volume at each step</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id="funnelBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {steps.map((s, i) => {
          const barH = (s.count / maxC) * cH;
          const x = pL + i * gap + (gap - barW) / 2;
          const y = pT + cH - barH;
          const dropOff = i > 0 ? ((1 - s.count / steps[i - 1].count) * 100).toFixed(0) : null;
          return (
            <g key={s.label}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill="url(#funnelBarGrad)" opacity={1 - i * 0.12} />
              <text x={x + barW / 2} y={y - 6} fill="rgba(255,255,255,0.92)" fontSize="9" textAnchor="middle" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
                {s.count >= 1000 ? `${(s.count / 1000).toFixed(1)}k` : s.count}
              </text>
              <text x={x + barW / 2} y={pT + cH + 14} fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="500">
                {s.label}
              </text>
              {dropOff && (
                <>
                  <line x1={pL + (i - 1) * gap + (gap - barW) / 2 + barW} y1={pT + cH - (steps[i - 1].count / maxC) * cH + 10} x2={x} y2={y + 10} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 2" />
                  <text x={(pL + (i - 1) * gap + (gap - barW) / 2 + barW + x) / 2} y={Math.max(y, pT + cH - (steps[i - 1].count / maxC) * cH) + 6} fill="#EF4444" fontSize="7" textAnchor="middle" fontWeight="600">
                    -{dropOff}%
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RevenueProjectionChart() {
  const days = ["Apr 17", "Apr 18", "Apr 19", "Apr 20", "Apr 21"];
  const conservative = [12000, 35000, 52000, 72000, 89700];
  const base =         [18000, 52000, 85000, 118000, 142867];
  const aggressive =   [28000, 78000, 135000, 195000, 247500];

  const W = 500, H = 240, pL = 55, pR = 15, pT = 20, pB = 35;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxV = 260000;

  const xP = (i: number) => pL + (i / (days.length - 1)) * cW;
  const yP = (v: number) => pT + cH - (v / maxV) * cH;

  const makePath = (data: number[]) => data.map((v, i) => `${i === 0 ? "M" : "L"}${xP(i).toFixed(1)},${yP(v).toFixed(1)}`).join(" ");

  const shadedArea = conservative.map((v, i) => `${xP(i).toFixed(1)},${yP(v).toFixed(1)}`).join(" ") +
    " " + [...aggressive].reverse().map((v, i) => `${xP(aggressive.length - 1 - i).toFixed(1)},${yP(v).toFixed(1)}`).join(" ");

  const yTicks = [0, 50000, 100000, 150000, 200000, 250000];

  return (
    <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Revenue Projection</div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>Cart open period: Apr 17 to 21</div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.6875rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 2, background: "#EF4444", borderRadius: 1 }} /> Conservative</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 2, background: "#F59E0B", borderRadius: 1 }} /> Base</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 2, background: "#10B981", borderRadius: 1 }} /> Aggressive</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {yTicks.map(t => (
          <g key={t}>
            <line x1={pL} y1={yP(t)} x2={W - pR} y2={yP(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pL - 8} y={yP(t) + 3} fill="#6B7280" fontSize="8" textAnchor="end" fontFamily="'JetBrains Mono', monospace">
              €{(t / 1000).toFixed(0)}k
            </text>
          </g>
        ))}
        {days.map((d, i) => (
          <text key={d} x={xP(i)} y={H - 8} fill="#6B7280" fontSize="8" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">{d}</text>
        ))}
        <polygon points={shadedArea} fill="rgba(0,212,170,0.08)" />
        <path d={makePath(conservative)} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={makePath(base)} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={makePath(aggressive)} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x={xP(4) + 5} y={yP(conservative[4]) + 3} fill="#EF4444" fontSize="8" fontWeight="600" fontFamily="'JetBrains Mono', monospace">€89.7k</text>
        <text x={xP(4) + 5} y={yP(base[4]) + 3} fill="#F59E0B" fontSize="8" fontWeight="600" fontFamily="'JetBrains Mono', monospace">€142.9k</text>
        <text x={xP(4) + 5} y={yP(aggressive[4]) + 3} fill="#10B981" fontSize="8" fontWeight="600" fontFamily="'JetBrains Mono', monospace">€247.5k</text>
        {base.map((v, i) => <circle key={i} cx={xP(i)} cy={yP(v)} r="3" fill="#F59E0B" />)}
      </svg>
    </div>
  );
}

function AdSpendRevenueChart() {
  const dates = ["W1", "W2", "W3", "W4"];
  const adSpend = [4200, 4800, 4500, 3932];
  const revenue = [2500, 8200, 18000, 42349];

  const W = 500, H = 220, pL = 55, pR = 55, pT = 20, pB = 35;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxSpend = 6000;
  const maxRev = 50000;

  const xP = (i: number) => pL + (i / (dates.length - 1)) * cW;
  const ySpend = (v: number) => pT + cH - (v / maxSpend) * cH;
  const yRev = (v: number) => pT + cH - (v / maxRev) * cH;

  const spendPath = adSpend.map((v, i) => `${i === 0 ? "M" : "L"}${xP(i).toFixed(1)},${ySpend(v).toFixed(1)}`).join(" ");
  const revPath = revenue.map((v, i) => `${i === 0 ? "M" : "L"}${xP(i).toFixed(1)},${yRev(v).toFixed(1)}`).join(" ");
  const roas = revenue.map((r, i) => adSpend[i] > 0 ? (r / adSpend[i]).toFixed(1) : "0");

  return (
    <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Ad Spend vs Revenue</div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>Weekly comparison · ROAS tracking</div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.6875rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 2, background: "#FB923C", borderRadius: 1 }} /> Ad Spend</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 2, background: "#10B981", borderRadius: 1 }} /> Revenue</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {[0, 2000, 4000, 6000].map(t => (
          <g key={`s${t}`}>
            <line x1={pL} y1={ySpend(t)} x2={W - pR} y2={ySpend(t)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={pL - 8} y={ySpend(t) + 3} fill="#FB923C" fontSize="8" textAnchor="end" fontFamily="'JetBrains Mono', monospace" opacity="0.7">€{(t / 1000).toFixed(0)}k</text>
          </g>
        ))}
        {[0, 15000, 30000, 50000].map(t => (
          <text key={`r${t}`} x={W - pR + 8} y={yRev(t) + 3} fill="#10B981" fontSize="8" textAnchor="start" fontFamily="'JetBrains Mono', monospace" opacity="0.7">€{(t / 1000).toFixed(0)}k</text>
        ))}
        {dates.map((d, i) => (
          <text key={d} x={xP(i)} y={H - 8} fill="#6B7280" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">{d}</text>
        ))}
        <path d={spendPath} fill="none" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={revPath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {adSpend.map((v, i) => <circle key={`s${i}`} cx={xP(i)} cy={ySpend(v)} r="3" fill="#FB923C" />)}
        {revenue.map((v, i) => <circle key={`r${i}`} cx={xP(i)} cy={yRev(v)} r="3" fill="#10B981" />)}
        {roas.map((r, i) => (
          <g key={`roas${i}`}>
            <rect x={xP(i) - 16} y={yRev(revenue[i]) - 20} width={32} height={14} rx={3} fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" />
            <text x={xP(i)} y={yRev(revenue[i]) - 10} fill="#10B981" fontSize="8" textAnchor="middle" fontWeight="700" fontFamily="'JetBrains Mono', monospace">{r}x</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function EmailPerformanceChart() {
  const emails = [
    { label: "E1", openRate: 42, clickRate: 12 },
    { label: "E1.5", openRate: 38, clickRate: 9 },
    { label: "E2", openRate: 35, clickRate: 8 },
    { label: "E3", openRate: 31, clickRate: 7 },
    { label: "E4", openRate: 28, clickRate: 6 },
    { label: "E5", openRate: 26, clickRate: 5 },
    { label: "E6", openRate: 24, clickRate: 4.5 },
    { label: "E7", openRate: 22, clickRate: 4 },
  ];

  const W = 500, H = 220, pL = 40, pR = 15, pT = 20, pB = 35;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxR = 50;
  const groupW = cW / emails.length;
  const barW = groupW * 0.3;
  const yP = (v: number) => pT + cH - (v / maxR) * cH;
  const openBenchmark = 25;
  const clickBenchmark = 3.5;

  return (
    <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Email Performance</div>
          <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 2 }}>Open rate & click rate per email</div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.6875rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#00D4AA" }} /> Open Rate</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#10B981" }} /> Click Rate</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {[0, 10, 20, 30, 40, 50].map(t => (
          <g key={t}>
            <line x1={pL} y1={yP(t)} x2={W - pR} y2={yP(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pL - 6} y={yP(t) + 3} fill="#6B7280" fontSize="8" textAnchor="end" fontFamily="'JetBrains Mono', monospace">{t}%</text>
          </g>
        ))}
        <line x1={pL} y1={yP(openBenchmark)} x2={W - pR} y2={yP(openBenchmark)} stroke="rgba(0,212,170,0.25)" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - pR + 2} y={yP(openBenchmark) + 3} fill="rgba(124,92,252,0.5)" fontSize="7" fontFamily="'JetBrains Mono', monospace">Benchmark</text>
        <line x1={pL} y1={yP(clickBenchmark)} x2={W - pR} y2={yP(clickBenchmark)} stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="4 3" />
        {emails.map((e, i) => {
          const cx = pL + i * groupW + groupW / 2;
          const openH = (e.openRate / maxR) * cH;
          const clickH = (e.clickRate / maxR) * cH;
          return (
            <g key={e.label}>
              <rect x={cx - barW - 1} y={pT + cH - openH} width={barW} height={openH} rx={2} fill="#00D4AA" opacity="0.8" />
              <rect x={cx + 1} y={pT + cH - clickH} width={barW} height={clickH} rx={2} fill="#10B981" opacity="0.8" />
              <text x={cx} y={H - 10} fill="#9CA3AF" fontSize="8" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">{e.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN ANALYTICS PAGE
   ═══════════════════════════════════════════════════════════ */

// --- GA4 Visitor Data ---
interface GA4Totals {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  newUsers: number;
  avgBounceRate: number;
}
interface GA4DailyEntry {
  date: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  newUsers: number;
  bounceRate: number;
}
interface GA4TrafficSource {
  channel: string;
  sessions: number;
  activeUsers: number;
}
interface GA4UtmEntry {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  users: number;
}
interface GA4Data {
  totals: GA4Totals;
  daily: GA4DailyEntry[];
  trafficSources: GA4TrafficSource[];
  utmAttribution?: GA4UtmEntry[];
  lastUpdated: string;
}

function GA4VisitorPanel({ data, loading, error, errorAction }: { data: GA4Data | null; loading: boolean; error: string | null; errorAction: string | null }) {

  if (loading) {
    return (
      <div style={{ background: '#1A1D23', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>GA4 Visitor Data</div>
        <div style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Loading GA4 data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#1A1D23', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>GA4 Visitor Data</div>
          <span style={{ fontSize: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>AUTH REQUIRED</span>
        </div>
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <p style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 600, marginBottom: 6 }}>{error}</p>
          {errorAction && <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{errorAction}</p>}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxDaily = Math.max(...data.daily.map(d => d.activeUsers), 1);

  return (
    <div style={{ background: '#1A1D23', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>GA4 Visitor Data</div>
          <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: 2 }}>Last 30 days from Google Analytics</div>
        </div>
        <span style={{ fontSize: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>LIVE</span>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Active Users', value: data.totals.activeUsers.toLocaleString(), color: '#8B5CF6' },
          { label: 'Sessions', value: data.totals.sessions.toLocaleString(), color: '#3B82F6' },
          { label: 'Page Views', value: data.totals.pageViews.toLocaleString(), color: '#10B981' },
          { label: 'New Users', value: data.totals.newUsers.toLocaleString(), color: '#F59E0B' },
          { label: 'Bounce Rate', value: `${(data.totals.avgBounceRate * 100).toFixed(1)}%`, color: '#EF4444' },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.125rem', fontWeight: 600, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '0.5625rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Daily trend */}
      {data.daily.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: 8 }}>Daily Active Users</div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 48 }}>
            {data.daily.slice(-30).map((day) => {
              const height = Math.max(2, (day.activeUsers / maxDaily) * 48);
              return (
                <div key={day.date} title={`${day.date}: ${day.activeUsers} users, ${day.sessions} sessions`} style={{
                  flex: 1, height, borderRadius: 2,
                  background: 'linear-gradient(180deg, #8B5CF6, rgba(139, 92, 246, 0.4))',
                }} />
              );
            })}
          </div>
        </div>
      )}

      {/* Traffic sources */}
      {data.trafficSources.length > 0 && (
        <div>
          <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: 8 }}>Traffic Sources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.trafficSources.slice(0, 6).map(src => {
              const maxSrc = Math.max(...data.trafficSources.map(s => s.sessions), 1);
              const barW = Math.max(3, (src.sessions / maxSrc) * 100);
              return (
                <div key={src.channel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 100, fontSize: '0.6875rem', color: '#9CA3AF', textAlign: 'right', flexShrink: 0 }}>{src.channel}</span>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ width: `${barW}%`, height: 16, borderRadius: 3, background: 'rgba(139, 92, 246, 0.6)', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ width: 80, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.92)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>
                    {src.sessions}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.5625rem', color: '#4B5563', marginTop: 12 }}>
        Updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [sources, setSources] = useState<TrafficSource[]>(initialSources);
  const [toast, setToast] = useState<string | null>(null);

  // GA4 data at parent level (shared with GA4VisitorPanel + traffic sources)
  const [ga4Data, setGa4Data] = useState<GA4Data | null>(null);
  const [ga4Loading, setGa4Loading] = useState(true);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [ga4Action, setGa4Action] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGA4() {
      try {
        const res = await fetch('/api/ga4?property=aiuniversa');
        const json = await res.json();
        if (json.success && json.data) {
          setGa4Data(json.data);
          setGa4Error(null);
          setGa4Action(null);
        } else {
          setGa4Error(json.error || 'GA4 API error');
          setGa4Action(json.action || null);
        }
      } catch {
        setGa4Error('Failed to connect to GA4 API');
      } finally {
        setGa4Loading(false);
      }
    }
    fetchGA4();
    const interval = setInterval(fetchGA4, 300000);
    return () => clearInterval(interval);
  }, []);

  // Merge GA4 UTM attribution data into traffic source cards
  useEffect(() => {
    if (!ga4Data?.utmAttribution?.length) return;

    setSources(prev => {
      const updated = prev.map(src => {
        // Find matching UTM entry by source + medium
        const match = ga4Data.utmAttribution!.find(
          utm => utm.source.toLowerCase() === src.utmSource.toLowerCase() &&
                 utm.medium.toLowerCase() === src.utmMedium.toLowerCase()
        );
        if (match) {
          return { ...src, visitors: match.sessions };
        }
        return src;
      });

      // Find UTM entries that don't match any predefined source
      const matchedKeys = new Set(
        updated
          .filter(s => s.visitors > 0)
          .map(s => `${s.utmSource.toLowerCase()}|${s.utmMedium.toLowerCase()}`)
      );
      // Also add predefined keys with 0 visitors so we don't duplicate them
      prev.forEach(s => matchedKeys.add(`${s.utmSource.toLowerCase()}|${s.utmMedium.toLowerCase()}`));

      const extraSources: TrafficSource[] = ga4Data.utmAttribution!
        .filter(utm => {
          const key = `${utm.source.toLowerCase()}|${utm.medium.toLowerCase()}`;
          return !matchedKeys.has(key) && utm.sessions > 0 && utm.source !== '(direct)';
        })
        .map((utm, idx) => ({
          id: 100 + idx,
          name: `${utm.source} / ${utm.medium}`,
          icon: "🌐",
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign || "",
          leads: 0,
          visitors: utm.sessions,
          revenue: 0,
          active: true,
        }));

      return [...updated, ...extraSources];
    });
  }, [ga4Data]);

  const totalLeads = sources.reduce((s, t) => s + t.leads, 0);
  const totalVisitors = sources.reduce((s, t) => s + t.visitors, 0);
  const convRate = totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(1) : "0";
  const adLeads = sources.filter(s => s.utmSource === "facebook").reduce((a, s) => a + s.leads, 0);
  const cpl = adLeads > 0 ? (totalSpent / adLeads).toFixed(2) : "—";

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }
  function toggleSource(id: number) {
    setSources(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }
  function copyAllUtms() {
    const text = sources.map(s => `${s.name}: ${utmUrl(s)}`).join("\n");
    copyToClipboard(text);
    showToast("All UTM links copied!");
  }
  function exportCsv() {
    const header = "Source,UTM Link,Leads,Visitors,Conversion %,Revenue €,Status";
    const rows = sources.map(s => {
      const cr = s.visitors > 0 ? ((s.leads / s.visitors) * 100).toFixed(1) : "0";
      return `"${s.name}","${utmUrl(s)}",${s.leads},${s.visitors},${cr},${s.revenue},${s.active ? "Active" : "Inactive"}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-universa-traffic-sources.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Health Score
  const leadTarget = 25000;
  const leadScore = Math.min(100, (totalLeads / leadTarget) * 100);
  const cplTarget = 8;
  const cplActual = adLeads > 0 ? totalSpent / adLeads : 0;
  const cplScore = cplActual > 0 ? Math.min(100, (cplTarget / cplActual) * 100) : 50;
  const convTarget = 40;
  const convActual = parseFloat(convRate);
  const convScore = Math.min(100, (convActual / convTarget) * 100);
  const healthScore = Math.round(leadScore * 0.4 + cplScore * 0.3 + convScore * 0.3);
  const healthColor = healthScore >= 70 ? "#10B981" : healthScore >= 40 ? "#F59E0B" : "#EF4444";

  // Revenue
  const normalSales = 62;
  const vipSales = 25;
  const normalRevenue = normalSales * 899;
  const vipRevenue = vipSales * 2499;
  const totalRevenue = normalRevenue + vipRevenue;

  return (
    <div className="max-w-[1200px] mx-auto" style={{ paddingBottom: "4rem" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50" style={{
          background: "#8B5CF6", color: "#fff", padding: "8px 16px", borderRadius: 10,
          fontSize: "0.8125rem", fontWeight: 500,
        }}>
          {toast}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          PRE-EVENT COMMAND CENTER
          ═══════════════════════════════════════════ */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 style={{
              fontFamily: "'Inter', sans-serif", fontSize: "1.75rem", fontWeight: 600,
              letterSpacing: "-0.02em",
            }}>
              <span style={{ color: "#8B5CF6" }}>AI Universa</span>{" "}
              <span style={{ color: "rgba(255,255,255,0.92)" }}>Command Center</span>
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: 4 }}>
              Pre event analytics · April 15, 2026
            </p>
          </div>
          <div style={{
            background: "#1A1D23", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: 16,
            padding: "12px 20px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Launch Health</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "1.5rem", fontWeight: 600, color: healthColor,
            }}>{healthScore}/100</span>
          </div>
        </div>

        {/* Countdown */}
        <div style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(232, 227, 66, 0.04))",
          border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: 16,
          padding: "24px", marginBottom: 20, textAlign: "center",
        }}>
          <div style={{ fontSize: "0.75rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            ⏱ Countdown to Launch
          </div>
          <CountdownTimer />
        </div>

        {/* Launch Timeline (compact) */}
        <div className="mb-6">
          <LaunchTimeline compact />
        </div>

        {/* Registration + Checklist + Revenue Projection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <RegistrationTracker />
          <ReadinessChecklist />
          <RevenueProjectionModel />
        </div>

        {/* GA4 Visitor Data (full width) */}
        <div className="mb-6">
          <GA4VisitorPanel data={ga4Data} loading={ga4Loading} error={ga4Error} errorAction={ga4Action} />
        </div>

        {/* Ad Performance + Attribution + Content Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <AdPerformancePreLaunch />
          <AttributionSection />
          <ContentPerformance />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          LAUNCH ANALYTICS (Existing)
          ═══════════════════════════════════════════ */}
      <div style={{
        fontSize: "0.75rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12, marginTop: 8, paddingTop: 24,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        📊 Launch Analytics (Post Event)
      </div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads", value: totalLeads.toLocaleString(), trend: "↑ 12.4%", trendColor: "#10B981" },
          { label: "Conversion Rate", value: `${convRate}%`, trend: "Visitors → Leads", trendColor: "#6B7280" },
          { label: "Ad Spend", value: `€${totalSpent.toLocaleString()}`, trend: `of €${totalBudget.toLocaleString()}`, trendColor: "#6B7280" },
          { label: "Cost Per Lead", value: `€${cpl}`, trend: "Target: €8.00 ✓", trendColor: "#10B981" },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
            padding: "20px 24px", transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
          >
            <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {kpi.label}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "1.75rem", fontWeight: 600,
              color: "rgba(255,255,255,0.92)", marginTop: 6,
            }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: kpi.trendColor, marginTop: 6 }}>{kpi.trend}</div>
          </div>
        ))}
      </div>

      {/* ═══ CHARTS SECTION ═══ */}
      <div style={{
        fontSize: "0.75rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12, marginTop: 8,
      }}>
        📊 Performance Charts
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <TrafficOverTimeChart />
        <LeadsBySourceChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <FunnelBarChart />
        <RevenueProjectionChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AdSpendRevenueChart />
        <EmailPerformanceChart />
      </div>

      {/* ═══ Funnel (original) ═══ */}
      <div style={{
        background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
        padding: "20px 24px", marginBottom: 24,
      }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 16 }}>
          Launch Funnel (Detailed)
        </h2>
        <div className="flex flex-col md:flex-row gap-2">
          {funnelSteps.map((step, i) => {
            const prevCount = i > 0 ? funnelSteps[i - 1].count : step.count;
            const convPct = i > 0 ? ((step.count / prevCount) * 100).toFixed(0) : null;
            const widthPct = (step.count / funnelSteps[0].count) * 100;
            return (
              <div key={step.label} className="flex-1 min-w-0">
                <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginBottom: 4, fontWeight: 500 }}>{step.label}</div>
                <div style={{
                  background: `rgba(124,92,252,${0.1 + (widthPct / 100) * 0.3})`,
                  border: "1px solid rgba(0,212,170,0.15)", borderRadius: 8,
                  padding: "10px 8px", textAlign: "center",
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem",
                    fontWeight: 600, color: "rgba(255,255,255,0.92)",
                  }}>
                    {step.count.toLocaleString()}
                  </span>
                </div>
                {convPct && (
                  <div style={{ fontSize: "0.625rem", color: "#6B7280", marginTop: 3, textAlign: "center" }}>
                    {convPct}% conv
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Traffic Sources Table ═══ */}
      <div style={{
        background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
        padding: "20px 24px", marginBottom: 24,
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Traffic Sources</h2>
          <div className="flex gap-2 flex-wrap">
            <button onClick={copyAllUtms} style={{
              fontSize: "0.75rem", padding: "6px 12px", borderRadius: 8, cursor: "pointer",
              background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#8B5CF6", fontWeight: 500,
            }}>
              📋 Copy All UTMs
            </button>
            <button onClick={exportCsv} style={{
              fontSize: "0.75rem", padding: "6px 12px", borderRadius: 8, cursor: "pointer",
              background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#6B7280", fontWeight: 500,
            }}>
              📥 Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Source", "UTM Link", "Leads", "Visitors", "Conv %", "Revenue", "Active"].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i >= 2 && i <= 5 ? "right" : i === 6 ? "center" : "left",
                    padding: "10px 8px", fontSize: "0.6875rem", fontWeight: 500, color: "#6B7280",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map((src, i) => {
                const cr = src.visitors > 0 ? ((src.leads / src.visitors) * 100).toFixed(1) : "—";
                const url = utmUrl(src);
                return (
                  <tr key={src.id} style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}>
                    <td style={{ padding: "10px 8px", fontWeight: 500, color: "rgba(255,255,255,0.92)" }}>
                      <span style={{ marginRight: 8 }}>{src.icon}</span>{src.name}
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <button
                        onClick={() => { copyToClipboard(url); showToast(`Copied: ${src.name}`); }}
                        style={{
                          fontSize: "0.6875rem", color: "#8B5CF6", fontFamily: "'JetBrains Mono', monospace",
                          background: "none", border: "none", cursor: "pointer", textAlign: "left",
                          maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                        }}
                        title={url}
                      >
                        {url.replace(BASE_URL, "…")}
                      </button>
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{src.leads.toLocaleString()}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>{src.visitors.toLocaleString()}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>{cr}%</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#10B981", fontWeight: 500 }}>€{src.revenue.toLocaleString()}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => toggleSource(src.id)}
                        style={{
                          width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", position: "relative",
                          background: src.active ? "#8B5CF6" : "#4A4D5C", transition: "background 0.2s",
                        }}
                      >
                        <span style={{
                          position: "absolute", top: 2, width: 16, height: 16, borderRadius: 8, background: "#fff",
                          transition: "left 0.2s", left: src.active ? 18 : 2,
                        }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Total</td>
                <td style={{ padding: "10px 8px" }} />
                <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{totalLeads.toLocaleString()}</td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>{totalVisitors.toLocaleString()}</td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>{convRate}%</td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#10B981", fontWeight: 600 }}>€{sources.reduce((a, s) => a + s.revenue, 0).toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ═══ Revenue + Budget Row ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 16 }}>Revenue</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div style={{ fontSize: "0.6875rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Normal (€899)</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.25rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginTop: 4 }}>{normalSales}</div>
              <div style={{ fontSize: "0.75rem", color: "#10B981", marginTop: 2 }}>€{normalRevenue.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>VIP (€2,499)</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.25rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginTop: 4 }}>{vipSales}</div>
              <div style={{ fontSize: "0.75rem", color: "#10B981", marginTop: 2 }}>€{vipRevenue.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.25rem", fontWeight: 600, color: "#10B981", marginTop: 4 }}>€{totalRevenue.toLocaleString()}</div>
              <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>{normalSales + vipSales} sales</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 16 }}>Budget & ROAS</h3>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>€{totalSpent.toLocaleString()} / €{totalBudget.toLocaleString()}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8125rem", color: "#9CA3AF" }}>{((totalSpent / totalBudget) * 100).toFixed(0)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#8B5CF6", width: `${(totalSpent / totalBudget) * 100}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>ROAS</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.5rem", fontWeight: 600, color: "#10B981" }}>
              {((sources.filter(s => s.utmSource === "facebook").reduce((a, s) => a + s.revenue, 0)) / totalSpent).toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Health Score Breakdown ═══ */}
      <div style={{
        background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
        padding: "20px 24px", marginBottom: 24,
      }}>
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 16 }}>Health Score Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Lead Target (40%)", score: leadScore, detail: `${totalLeads.toLocaleString()} / ${leadTarget.toLocaleString()}` },
            { label: "CPL Budget (30%)", score: cplScore, detail: `€${cpl} / €${cplTarget}` },
            { label: "Conversion (30%)", score: convScore, detail: `${convRate}% / ${convTarget}%` },
          ].map((item) => (
            <div key={item.label} style={{ background: "#1A1D23", borderRadius: 8, padding: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500, marginBottom: 8 }}>{item.label}</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "1.25rem", fontWeight: 600,
                color: item.score >= 70 ? "#10B981" : item.score >= 40 ? "#F59E0B" : "#EF4444",
              }}>
                {item.score.toFixed(0)}%
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#6B7280", marginTop: 4 }}>{item.detail}</div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginTop: 8 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: item.score >= 70 ? "#10B981" : item.score >= 40 ? "#F59E0B" : "#EF4444",
                  width: `${Math.min(100, item.score)}%`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Funnel Optimization Audit ═══ */}
      <div style={{
        background: "#1A1D23", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
        padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: "1rem" }}>🔬</span>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>Funnel Optimization Audit</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { step: "LP → Lead", current: "57.2%", benchmark: "35 to 55%", status: "above" as const, recommendation: "Add countdown timer to increase urgency", impact: "+3 to 5% conversion lift" },
            { step: "Lead → Registered", current: "45.0%", benchmark: "40 to 60%", status: "ok" as const, recommendation: "Add WhatsApp confirmation for higher show rate", impact: "+10% registration rate" },
            { step: "Registered → Attended D1", current: "38.0%", benchmark: "30 to 50%", status: "ok" as const, recommendation: "Send SMS reminder 1hr before + 15min before event", impact: "+8 to 12% attendance" },
            { step: "Attended D1 → D3", current: "72.0%", benchmark: "50 to 70%", status: "above" as const, recommendation: "Add 'what you missed' recap for D1 no shows", impact: "+5% retention through Day 3" },
            { step: "Attended → Purchase", current: "8.5%", benchmark: "5 to 15%", status: "ok" as const, recommendation: "Add payment plans to reduce price barrier (3× or 6× installments)", impact: "+15 to 20% purchase rate" },
            { step: "Purchase → LTV", current: "€899 to €2,499", benchmark: "€1,500 to €4,000+", status: "below" as const, recommendation: "Add monthly community tier (€47/mo) + coaching upsell (€299)", impact: "+40% LTV over 12 months" },
          ].map((item) => (
            <div key={item.step} style={{
              display: "flex", flexDirection: "column", gap: 8, padding: "16px 20px",
              borderRadius: 10, background: "rgba(255,255,255,0.02)",
              border: `1px solid ${item.status === "above" ? "rgba(16,185,129,0.15)" : item.status === "below" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{item.step}</div>
                <div style={{ display: "flex", gap: 12, fontSize: "0.75rem" }}>
                  <span style={{ color: "#9CA3AF" }}>
                    Current: <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                      color: item.status === "above" ? "#10B981" : item.status === "below" ? "#EF4444" : "#F59E0B",
                    }}>{item.current}</span>
                  </span>
                  <span style={{ color: "#6B7280" }}>
                    Benchmark: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.benchmark}</span>
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.8125rem", color: "#8B5CF6", fontWeight: 500 }}>💡</span>
                <span style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>{item.recommendation}</span>
                <span style={{
                  marginLeft: "auto", fontSize: "0.6875rem", fontWeight: 600,
                  color: "#10B981", background: "rgba(16,185,129,0.1)",
                  padding: "2px 8px", borderRadius: 9999, flexShrink: 0,
                }}>
                  {item.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
