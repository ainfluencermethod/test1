'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  useGHLStats, useGHLContacts, useQuizHealth,
  segmentContacts,
  type GHLContact, type GHLStats, type QuizHealth,
} from '@/lib/hooks-live';
import { SourceBadge, SectionHeader, LoadingPulse, DashboardAnimations } from '@/lib/dashboard-ui';
import type { DataSource } from '@/lib/types-unified';

// ============================================================================
// AIB Analytics — Comprehensive view of ALL data sources
// ============================================================================

const ACCENT = '#00E5FF';
const BG = '#0A0B0F';
const CARD_BG = '#13151A';
const CARD_BORDER = 'rgba(255,255,255,0.06)';

// --- Revenue types & hook ---
interface RevenueData {
  historical: { gross: number; refunds: number; net: number; paidCount: number };
  live: { revenue: number; events: number; revenueEvents: number; eventTypes: Record<string, number>; recent: Array<{ time: string; event_type: string; amount: number; is_revenue: boolean; product_name: string; user_email: string; user_name: string; status: string; substatus: string; country: string }> };
  combined: {
    totalRevenue: number;
    totalTransactions: number;
    monthlyRevenue: { month: string; revenue: number; count: number }[];
    products: { id: string; name: string; revenue: number; count: number }[];
  };
}

function useRevenueData() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch('/api/whop/revenue', { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const iv = setInterval(doFetch, 60000);
    return () => clearInterval(iv);
  }, [doFetch]);

  return { data, loading, error, refetch: doFetch };
}

// --- Whop types & hook ---
interface WhopData {
  company: { title: string; id: string } | null;
  totalMembers: number | null;
  products: { id: string; name: string; visibility: string }[];
}

function useWhopData() {
  const [data, setData] = useState<WhopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch('/api/whop', { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastFetched(Date.now());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const iv = setInterval(doFetch, 30000);
    return () => clearInterval(iv);
  }, [doFetch]);

  return { data, loading, error, source: (error ? 'error' : data ? 'live' : 'mock') as DataSource | 'error', lastFetched, refetch: doFetch };
}

// --- Analytics pixel types & hook ---
interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  byPage: Record<string, number>;
  utmSources: Record<string, number>;
  referrers: Record<string, number>;
  recentVisitors: { url: string; ts: string; ref?: string; utm?: string }[];
  source?: string;
}

function useAnalyticsPixel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastFetched(Date.now());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const iv = setInterval(doFetch, 30000);
    return () => clearInterval(iv);
  }, [doFetch]);

  return { data, loading, error, source: (error ? 'error' : data ? 'live' : 'mock') as DataSource | 'error', lastFetched, refetch: doFetch };
}

// --- Helper: Badge component ---
function LiveBadge({ source, label }: { source: DataSource | 'error'; label?: string }) {
  return <SourceBadge source={source} label={label} />;
}

// --- Helper: CSS bar chart ---
function BarChart({ data, color = ACCENT, maxBars = 30 }: { data: { label: string; value: number }[]; color?: string; maxBars?: number }) {
  const items = data.slice(-maxBars);
  const max = Math.max(...items.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 100, padding: '8px 0' }}>
      {items.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            width: '100%', minWidth: 4, borderRadius: '2px 2px 0 0',
            height: `${Math.max((d.value / max) * 80, 2)}px`,
            background: `linear-gradient(180deg, ${color}, ${color}60)`,
            transition: 'height 0.3s ease',
          }} />
          {items.length <= 15 && (
            <span style={{ fontSize: '0.5rem', color: '#555', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
              {d.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Helper: Horizontal bar ---
function HBar({ label, value, max, color = ACCENT }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: '0.6875rem', color: '#AAA' }}>{label}</span>
        <span style={{ fontSize: '0.6875rem', color, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
      </div>
      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

// --- Card wrapper ---
function ACard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: CARD_BG, borderRadius: 12, padding: '1.25rem',
      border: `1px solid ${CARD_BORDER}`, ...style,
    }}>
      {children}
    </div>
  );
}

// --- KPI Big Card ---
function KPIBig({ icon, label, value, source, loading: isLoading }: {
  icon: string; label: string; value: string | number; source: DataSource | 'error'; loading?: boolean;
}) {
  return (
    <div style={{
      background: CARD_BG, borderRadius: 12, padding: '1.25rem 1.5rem',
      border: `1px solid ${CARD_BORDER}`, flex: 1, minWidth: 200,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}40)`,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <LiveBadge source={source} />
      </div>
      {isLoading ? (
        <LoadingPulse width={80} />
      ) : (
        <span style={{
          fontSize: '2rem', fontWeight: 800, color: '#EDEDED',
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      )}
      <p style={{
        fontSize: '0.625rem', color: '#666', marginTop: 6,
        textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
      }}>
        {label}
      </p>
    </div>
  );
}

// --- Funnel Step ---
function FunnelStep({ label, sublabel, value, conversionPct, isLast }: {
  label: string; sublabel: string; value: string | number; conversionPct?: number; isLast?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 8px',
        textAlign: 'center', flex: 1, border: `1px solid ${CARD_BORDER}`,
        borderTop: `3px solid ${ACCENT}`,
      }}>
        <span style={{
          fontSize: '1.25rem', fontWeight: 700, color: ACCENT, display: 'block',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span style={{ fontSize: '0.625rem', color: '#AAA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.5rem', color: '#555', display: 'block', marginTop: 2 }}>{sublabel}</span>
      </div>
      {!isLast && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.875rem', color: '#333' }}>→</span>
          {conversionPct !== undefined && (
            <span style={{
              fontSize: '0.5rem', color: ACCENT, fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {conversionPct.toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function AIBAnalyticsPage() {
  const ghlStats = useGHLStats();
  const ghlContacts = useGHLContacts(200);
  const quiz = useQuizHealth();
  const whop = useWhopData();
  const pixel = useAnalyticsPixel();
  const revenue = useRevenueData();

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // --- Derived data ---
  const contacts = ghlContacts.data?.contacts || [];
  const segments = segmentContacts(contacts);
  const aibLeads = segments.aib;
  const totalLeads = ghlStats.data?.totalContacts ?? 0;
  const quizAudits = quiz.data?.totalAudits ?? 0;
  const quizLeads = quiz.data?.totalLeads ?? 0;
  const whopMembers = whop.data?.totalMembers ?? 1713;
  const pixelViews = pixel.data?.totalViews ?? 0;
  const pixelToday = pixel.data?.todayViews ?? 0;

  // Tag distribution from GHL
  const tagCounts: Record<string, number> = {};
  for (const c of contacts) {
    for (const t of c.tags || []) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const maxTagCount = sortedTags.length > 0 ? sortedTags[0][1] : 1;

  // New leads by day (last 30 days)
  const dailyLeads: Record<string, number> = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    dailyLeads[key] = 0;
  }
  for (const c of contacts) {
    if (c.dateAdded) {
      const key = new Date(c.dateAdded).toISOString().slice(5, 10);
      if (key in dailyLeads) dailyLeads[key]++;
    }
  }
  const dailyLeadData = Object.entries(dailyLeads).map(([label, value]) => ({ label, value }));

  // New leads today / this week / this month
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  let leadsToday = 0, leadsWeek = 0, leadsMonth = 0;
  for (const c of contacts) {
    if (c.dateAdded) {
      const d = new Date(c.dateAdded).getTime();
      if (d >= todayStart.getTime()) leadsToday++;
      if (d >= weekStart.getTime()) leadsWeek++;
      if (d >= monthStart.getTime()) leadsMonth++;
    }
  }

  // Lead source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const c of contacts) {
    const src = c.source || 'unknown';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }
  const sortedSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
  const maxSourceCount = sortedSources.length > 0 ? sortedSources[0][1] : 1;

  // Funnel conversions
  const funnelPageVisits = pixelViews || totalLeads * 3; // estimate if no pixel data
  const funnelEmailSignups = totalLeads;
  const funnelQuizStarted = quizLeads;
  const funnelAuditGen = quizAudits;
  const funnelWhopJoin = whopMembers;

  const calcConv = (from: number, to: number) => from > 0 ? (to / from) * 100 : 0;

  // Traffic data
  const byPage = pixel.data?.byPage || {};
  const utmSources = pixel.data?.utmSources || {};
  const referrers = pixel.data?.referrers || {};

  // Email sequence data (placeholders)
  // Data sources status
  const dataSources = [
    { name: 'GoHighLevel (CRM)', status: ghlStats.data ? 'live' as const : ghlStats.error ? 'error' as const : 'mock' as const, note: 'Contacts, tags, leads' },
    { name: 'Whop (Members)', status: whop.data ? 'live' as const : whop.error ? 'error' as const : 'mock' as const, note: whop.data ? 'Members only, revenue pending' : 'Connecting...' },
    { name: 'GA4 (Analytics)', status: 'live' as const, note: 'Property G-9TB7XBNBB9' },
    { name: 'Custom Pixel', status: pixel.data?.source !== 'unavailable' ? 'live' as const : 'mock' as const, note: pixel.data?.source === 'unavailable' ? 'Server unreachable' : 'Page views, UTMs' },
    { name: 'Quiz Funnel', status: quiz.data ? 'live' as const : quiz.error ? 'error' as const : 'mock' as const, note: quiz.data ? `Status: ${quiz.data.status}` : 'Connecting...' },
  ];

  const formatTime = (ts: number | null) => ts ? new Date(ts).toLocaleTimeString() : '—';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', color: '#EDEDED' }}>
      <DashboardAnimations />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Link href="/dashboard/aib" style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none' }}>← AIB Dashboard</Link>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: ACCENT, letterSpacing: '-0.02em' }}>
            📊 AIB Analytics
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#555', marginTop: 4 }}>
            All data sources • Auto-refreshes every 30s • Last: {formatTime(now)}
          </p>
        </div>
        <div style={{
          background: `${ACCENT}08`, border: `1px solid ${ACCENT}20`,
          borderRadius: 10, padding: '8px 16px', fontSize: '0.625rem', color: '#666',
        }}>
          <span style={{ color: ACCENT, fontWeight: 700 }}>G-9TB7XBNBB9</span> GA4 Property
        </div>
      </div>

      {/* ============ KPI STRIP ============ */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <KPIBig icon="📧" label="Total Leads" value={totalLeads} source={ghlStats.data ? 'live' : 'mock'} loading={ghlStats.loading} />
        <KPIBig icon="👥" label="Whop Members" value={whopMembers} source={whop.data ? 'live' : 'mock'} loading={whop.loading} />
        <KPIBig icon="📊" label="Page Views" value={pixelViews || '—'} source={pixel.data?.source !== 'unavailable' ? 'live' : 'mock'} loading={pixel.loading} />
        <KPIBig icon="🧮" label="Audits Generated" value={quizAudits} source={quiz.data ? 'live' : 'mock'} loading={quiz.loading} />
      </div>

      {/* ============ SECTION 1: FUNNEL ============ */}
      <ACard style={{ marginBottom: 24 }}>
        <SectionHeader title="🔄 Funnel Visualization" badge={<LiveBadge source={ghlStats.data ? 'live' : 'mock'} />} />
        <div style={{ display: 'flex', gap: 0, alignItems: 'center', overflowX: 'auto', paddingBottom: 8 }}>
          <FunnelStep label="Page Visits" sublabel="GA4 / Pixel" value={funnelPageVisits}
            conversionPct={calcConv(funnelPageVisits, funnelEmailSignups)} />
          <FunnelStep label="Email Signup" sublabel="GHL Webhook" value={funnelEmailSignups}
            conversionPct={calcConv(funnelEmailSignups, funnelQuizStarted)} />
          <FunnelStep label="Quiz Started" sublabel="Quiz API" value={funnelQuizStarted}
            conversionPct={calcConv(funnelQuizStarted, funnelAuditGen)} />
          <FunnelStep label="Audit Generated" sublabel="Quiz API" value={funnelAuditGen}
            conversionPct={calcConv(funnelAuditGen, funnelWhopJoin)} />
          <FunnelStep label="Whop Join" sublabel="Whop API" value={funnelWhopJoin} isLast />
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(0,229,255,0.04)', borderRadius: 6, fontSize: '0.625rem', color: '#666' }}>
          💡 End-to-end conversion: {funnelPageVisits > 0 ? ((funnelWhopJoin / funnelPageVisits) * 100).toFixed(2) : '—'}%
          &nbsp;|&nbsp; Page → Signup: {calcConv(funnelPageVisits, funnelEmailSignups).toFixed(1)}%
          &nbsp;|&nbsp; Signup → Audit: {calcConv(funnelEmailSignups, funnelAuditGen).toFixed(1)}%
        </div>
      </ACard>

      {/* ============ SECTION 2: LEAD ANALYTICS ============ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }} className="analytics-grid">
        {/* New leads chart */}
        <ACard>
          <SectionHeader title="📈 New Leads (Last 30 Days)" badge={<LiveBadge source={ghlContacts.data ? 'live' : 'mock'} />} />
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: ACCENT }}>{leadsToday}</span>
              <p style={{ fontSize: '0.5625rem', color: '#555' }}>TODAY</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EDEDED' }}>{leadsWeek}</span>
              <p style={{ fontSize: '0.5625rem', color: '#555' }}>THIS WEEK</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EDEDED' }}>{leadsMonth}</span>
              <p style={{ fontSize: '0.5625rem', color: '#555' }}>THIS MONTH</p>
            </div>
          </div>
          <BarChart data={dailyLeadData} />
        </ACard>

        {/* Tag distribution */}
        <ACard>
          <SectionHeader title="🏷️ Tag Distribution" badge={<LiveBadge source={ghlStats.data ? 'live' : 'mock'} />} />
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {sortedTags.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', padding: '2rem 0' }}>No tag data yet</p>
            ) : (
              sortedTags.slice(0, 12).map(([tag, count]) => (
                <HBar key={tag} label={tag} value={count} max={maxTagCount} />
              ))
            )}
          </div>
        </ACard>
      </div>

      {/* Lead source + Recent leads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="analytics-grid">
        {/* Lead source breakdown */}
        <ACard>
          <SectionHeader title="🔗 Lead Source Breakdown" badge={<LiveBadge source={ghlContacts.data ? 'live' : 'mock'} />} />
          {sortedSources.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', padding: '2rem 0' }}>No source data</p>
          ) : (
            sortedSources.slice(0, 8).map(([src, count]) => (
              <HBar key={src} label={src} value={count} max={maxSourceCount} color="#7C5CFC" />
            ))
          )}
        </ACard>

        {/* Recent leads */}
        <ACard>
          <SectionHeader title="👤 Recent Leads" badge={<LiveBadge source={ghlContacts.data ? 'live' : 'mock'} />} />
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {contacts.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', padding: '2rem 0' }}>Loading contacts...</p>
            ) : (
              [...contacts]
                .sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime())
                .slice(0, 10)
                .map((c) => (
                  <div key={c.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#CCC' }}>
                        {c.firstName || ''} {c.lastName || ''}
                      </span>
                      {c.email && <span style={{ fontSize: '0.625rem', color: '#555', marginLeft: 6 }}>{c.email}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {(c.tags || []).slice(0, 2).map(t => (
                        <span key={t} style={{
                          fontSize: '0.5rem', padding: '1px 4px', borderRadius: 3,
                          background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25`,
                        }}>
                          {t}
                        </span>
                      ))}
                      <span style={{ fontSize: '0.5625rem', color: '#444', marginLeft: 4 }}>
                        {c.dateAdded ? new Date(c.dateAdded).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </ACard>
      </div>

      {/* ============ SECTION 3: TRAFFIC ============ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="analytics-grid">
        {/* Page views by site */}
        <ACard>
          <SectionHeader title="🌐 Views by Site" badge={<LiveBadge source={pixel.data?.source !== 'unavailable' ? 'live' : 'mock'} />} />
          {Object.keys(byPage).length > 0 ? (
            Object.entries(byPage).map(([page, count]) => (
              <HBar key={page} label={page} value={count as number} max={Math.max(...Object.values(byPage) as number[])} color="#3B82F6" />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.75rem', color: '#555' }}>Pixel data loading...</p>
              <p style={{ fontSize: '0.5625rem', color: '#444', marginTop: 4 }}>free. | lp. | main</p>
            </div>
          )}
        </ACard>

        {/* UTM sources */}
        <ACard>
          <SectionHeader title="📡 UTM Sources" badge={<LiveBadge source={pixel.data?.source !== 'unavailable' ? 'live' : 'mock'} />} />
          {Object.keys(utmSources).length > 0 ? (
            Object.entries(utmSources).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 6).map(([src, count]) => (
              <HBar key={src} label={src} value={count as number} max={Math.max(...Object.values(utmSources) as number[])} color="#F59E0B" />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.75rem', color: '#555' }}>No UTM data yet</p>
              <p style={{ fontSize: '0.5625rem', color: '#444', marginTop: 4 }}>Add ?utm_source= to links</p>
            </div>
          )}
        </ACard>


      </div>



      {/* ============ SECTION 5: REVENUE ============ */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader title="💰 Revenue" badge={<LiveBadge source={revenue.data ? 'live' : revenue.error ? 'error' : 'mock'} />} />

        {revenue.loading ? (
          <ACard><div style={{ padding: '2rem 0', textAlign: 'center' }}><LoadingPulse width={160} /></div></ACard>
        ) : revenue.error ? (
          <ACard><p style={{ fontSize: '0.75rem', color: '#EF4444', textAlign: 'center', padding: '2rem 0' }}>Revenue data unavailable: {revenue.error}</p></ACard>
        ) : revenue.data ? (
          <>
            {/* Revenue KPI Strip */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { icon: '💵', label: 'Total Net Revenue', value: `$${revenue.data.combined.totalRevenue.toLocaleString()}`, color: '#00D4AA' },
                { icon: '📦', label: 'Historical Gross', value: `$${revenue.data.historical.gross.toLocaleString()}`, color: ACCENT },
                { icon: '↩️', label: 'Refunds', value: `$${revenue.data.historical.refunds.toLocaleString()}`, color: '#EF4444' },
                { icon: '🔄', label: 'Live Webhook Revenue', value: `$${revenue.data.live.revenue.toLocaleString()}`, color: '#7C5CFC' },
                { icon: '📊', label: 'Paid Transactions', value: revenue.data.combined.totalTransactions.toLocaleString(), color: '#F59E0B' },
              ].map((kpi) => (
                <div key={kpi.label} style={{
                  background: CARD_BG, borderRadius: 12, padding: '1rem 1.25rem',
                  border: `1px solid ${CARD_BORDER}`, flex: '1 1 180px', minWidth: 160,
                  borderTop: `3px solid ${kpi.color}`,
                }}>
                  <span style={{ fontSize: '1rem' }}>{kpi.icon}</span>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 800, color: '#EDEDED',
                    fontFamily: "'JetBrains Mono', monospace", marginTop: 4,
                  }}>
                    {kpi.value}
                  </div>
                  <p style={{ fontSize: '0.5625rem', color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    {kpi.label}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }} className="analytics-grid">
              {/* Monthly Revenue Chart */}
              <ACard>
                <SectionHeader title="📈 Monthly Revenue" />
                {revenue.data.combined.monthlyRevenue.length > 0 ? (
                  <>
                    <BarChart
                      data={revenue.data.combined.monthlyRevenue.map(m => ({
                        label: m.month.slice(2), // "25-10" format
                        value: m.revenue,
                      }))}
                      color="#00D4AA"
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {revenue.data.combined.monthlyRevenue.slice(-6).map(m => (
                        <div key={m.month} style={{
                          fontSize: '0.5625rem', padding: '4px 8px', borderRadius: 4,
                          background: 'rgba(255,255,255,0.03)', color: '#AAA',
                        }}>
                          <span style={{ color: ACCENT, fontWeight: 700 }}>{m.month}</span>
                          {' '} ${m.revenue.toLocaleString()} ({m.count} txns)
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', padding: '2rem 0' }}>No monthly data available</p>
                )}
              </ACard>

              {/* Product Breakdown */}
              <ACard>
                <SectionHeader title="📦 Product Breakdown" />
                {revenue.data.combined.products.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {revenue.data.combined.products.map(p => {
                      const maxRev = Math.max(...revenue.data!.combined.products.map(x => x.revenue));
                      return (
                        <div key={p.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.6875rem', color: '#AAA', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name || p.id}</span>
                            <span style={{ fontSize: '0.6875rem', color: ACCENT, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                              ${p.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${maxRev > 0 ? (p.revenue / maxRev) * 100 : 0}%`,
                              height: '100%', borderRadius: 3,
                              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}60)`,
                            }} />
                          </div>
                          <span style={{ fontSize: '0.5rem', color: '#555' }}>{p.count} transactions</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', padding: '2rem 0' }}>No product data</p>
                )}
              </ACard>
            </div>

            {/* Recent Webhook Events */}
            {revenue.data.live.recent && revenue.data.live.recent.length > 0 && (
              <ACard>
                <SectionHeader title="🔔 Recent Webhook Events" badge={
                  <span style={{ fontSize: '0.5rem', color: '#00D4AA', fontWeight: 700 }}>
                    {revenue.data.live.events} total events
                  </span>
                } />
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {revenue.data.live.recent.slice(0, 15).map((evt, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: '0.5rem', padding: '2px 6px', borderRadius: 3, flexShrink: 0,
                          background: evt.is_revenue ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.04)',
                          color: evt.is_revenue ? '#00D4AA' : '#555',
                          fontWeight: 600,
                        }}>
                          {evt.event_type}
                        </span>
                        <span style={{ fontSize: '0.625rem', color: '#AAA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {evt.user_name || evt.user_email || 'Unknown'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        {evt.amount > 0 && (
                          <span style={{
                            fontSize: '0.6875rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                            color: evt.is_revenue ? '#00D4AA' : '#555',
                          }}>
                            ${evt.amount}
                          </span>
                        )}
                        <span style={{ fontSize: '0.5rem', color: '#444' }}>
                          {evt.time ? new Date(evt.time).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Event type breakdown */}
                {revenue.data.live.eventTypes && Object.keys(revenue.data.live.eventTypes).length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(revenue.data.live.eventTypes).map(([type, count]) => (
                      <span key={type} style={{
                        fontSize: '0.5rem', padding: '2px 8px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)', color: '#666',
                      }}>
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </ACard>
            )}

            {/* Revenue target progress */}
            <ACard style={{ marginTop: 16 }}>
              <SectionHeader title="🎯 Revenue Progress" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.6875rem', color: '#888' }}>Progress to $100K total revenue</span>
                <span style={{ fontSize: '0.6875rem', color: ACCENT, fontWeight: 600 }}>
                  {((revenue.data.combined.totalRevenue / 100000) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((revenue.data.combined.totalRevenue / 100000) * 100, 100)}%`,
                  height: '100%', borderRadius: 5,
                  background: `linear-gradient(90deg, ${ACCENT}, #7C5CFC)`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.5625rem', color: '#555' }}>
                  ${revenue.data.combined.totalRevenue.toLocaleString()} earned
                </span>
                <span style={{ fontSize: '0.5625rem', color: '#555' }}>
                  ${(100000 - revenue.data.combined.totalRevenue).toLocaleString()} to go
                </span>
              </div>
            </ACard>
          </>
        ) : null}
      </div>

      {/* ============ SECTION 6: DATA SOURCES ============ */}
      <ACard style={{ marginBottom: 32 }}>
        <SectionHeader title="🔌 Data Sources Status" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
          {dataSources.map((ds) => {
            const statusColor = ds.status === 'live' ? '#00D4AA' : ds.status === 'error' ? '#EF4444' : '#F59E0B';
            const statusLabel = ds.status === 'live' ? 'LIVE' : ds.status === 'error' ? 'ERROR' : 'PENDING';
            return (
              <div key={ds.name} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'rgba(255,255,255,0.02)', borderRadius: 8,
                border: `1px solid ${statusColor}20`,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', background: statusColor, flexShrink: 0,
                  boxShadow: ds.status === 'live' ? `0 0 8px ${statusColor}40` : 'none',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: '#CCC', fontWeight: 500 }}>{ds.name}</span>
                  <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 2 }}>{ds.note}</p>
                </div>
                <span style={{
                  fontSize: '0.5rem', fontWeight: 700, color: statusColor,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </ACard>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .analytics-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .analytics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
