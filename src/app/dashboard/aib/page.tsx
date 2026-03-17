'use client';

import { DS, dsHeading } from '@/styles/design-system';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  useGHLStats, useGHLContacts, useQuizHealth, useSubagentActivity,
  segmentContacts, todaysCompletedTasks,
} from '@/lib/hooks-live';
import {
  SourceBadge, SectionHeader, Card, KPICard, QuickActionBtn,
  ProgressBar, DashboardAnimations, LoadingPulse,
} from '@/lib/dashboard-ui';
import type { DataSource } from '@/lib/types-unified';

// ============================================================================
// AIB Dashboard — AI Influencer Blueprint
// ============================================================================
// Evergreen Recurring Business: $97/mo + $497/yr Whop Subscriptions
// Accent: Teal/Cyan (#00E5FF)
// ============================================================================

const ACCENT = '#00E5FF';
const CARD_BG = DS.colors.bgCard;
const MRR_TARGET = 100_000;

// --- GA4 Data Hook ---
function useGA4Data(property: string) {
  const [data, setData] = useState<{ activeUsers: number; sessions: number; pageViews: number; newUsers: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchGA4() {
      try {
        const res = await fetch(`/api/ga4?property=${property}`);
        const json = await res.json();
        if (json.success && json.data?.totals) {
          setData(json.data.totals);
          setError(null);
        } else {
          setError(json.error || 'GA4 API error');
        }
      } catch {
        setError('Failed to connect to GA4 API');
      } finally {
        setLoading(false);
      }
    }
    fetchGA4();
    const interval = setInterval(fetchGA4, 300000);
    return () => clearInterval(interval);
  }, [property]);
  return { data, loading, error };
}

// --- Subscription Health Hook ---
interface SubscriptionHealth {
  activeSubscribers: number;
  churned: number;
  churnRate: number;
  avgOrderValue: number;
  refundRate: number;
  failedPayments: number;
  failedRevenue: number;
  monthlyRecurring: { month: string; mrr: number; newSubs: number; churned: number }[];
  topCountries: { country: string; count: number }[];
}

function useSubscriptionHealth() {
  const [data, setData] = useState<SubscriptionHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch('/api/whop/health', { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error(`${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const iv = setInterval(doFetch, 120000);
    return () => clearInterval(iv);
  }, [doFetch]);

  return { data, loading, error };
}

// --- Revenue Data Hook ---
interface RevenueData {
  historical: { gross: number; refunds: number; net: number; paidCount: number };
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
      setData(await res.json());
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

  return { data, loading, error };
}

// --- Collapsible Pillar Section ---
function PillarSection({ icon, title, defaultOpen, children }: {
  icon: string; title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          padding: '12px 16px', background: `${ACCENT}08`, borderRadius: open ? '10px 10px 0 0' : 10,
          border: `1px solid ${ACCENT}20`, borderBottom: open ? 'none' : `1px solid ${ACCENT}20`,
          userSelect: 'none', transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: '1.125rem' }}>{icon}</span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: ACCENT, flex: 1, letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <span style={{ fontSize: '0.875rem', color: '#555', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </div>
      {open && (
        <div style={{
          padding: '16px', background: CARD_BG, borderRadius: '0 0 10px 10px',
          border: `1px solid ${ACCENT}20`, borderTop: `1px solid rgba(255,255,255,0.04)`,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// --- Metric Box ---
function MetricBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '12px 14px',
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: '0.625rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EDEDED', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
      {sub && <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

// --- CLAW Advisor Modal for AIB ---
interface CLAWFinding { finding: string; confidence: string; agent: string; evidence: string; }
interface CLAWRec { action: string; expectedOutcome: string; priority: string; assignee: string; }
interface CLAWReport { executiveSummary: string; keyFindings: CLAWFinding[]; recommendations: CLAWRec[]; methodology: string; limitations: string[]; confidenceDashboard: Array<{ claim: string; confidence: string; rationale: string }>; }

function CLAWAdvisorButton({ focus }: { focus: string }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CLAWReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/claw/analyze?focus=${focus}`, { signal: AbortSignal.timeout(45000) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setReport(data.report);
      setShowModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [focus]);

  const confidenceColors: Record<string, string> = { HIGH: '#10B981', MEDIUM: '#F59E0B', LOW: '#EF4444' };
  const priorityConfig: Record<string, { emoji: string; color: string }> = {
    urgent: { emoji: '🔴', color: '#EF4444' },
    important: { emoji: '🟡', color: '#F59E0B' },
    opportunity: { emoji: '🟢', color: '#10B981' },
  };

  return (
    <>
      <button
        onClick={analyze}
        disabled={loading}
        style={{
          padding: '8px 20px', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#555' : `linear-gradient(135deg, ${ACCENT} 0%, #00B8D4 100%)`,
          color: loading ? '#CCC' : '#0A0A0A', fontSize: '0.75rem', fontWeight: 800,
          letterSpacing: '0.02em', transition: 'all 0.3s',
          boxShadow: loading ? 'none' : `0 2px 12px ${ACCENT}40`,
        }}
      >
        {loading ? '🧠 Analyzing...' : '🎯 What Should I Do?'}
      </button>
      {error && <span style={{ fontSize: '0.625rem', color: '#EF4444', marginLeft: 8 }}>{error}</span>}

      {/* Modal Overlay */}
      {showModal && report && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 700, width: '100%', maxHeight: '85vh', overflow: 'auto',
              borderRadius: 16, background: '#111318',
              border: `1px solid ${ACCENT}40`, boxShadow: `0 16px 48px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px', borderBottom: `1px solid ${ACCENT}20`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: `${ACCENT}08`, position: 'sticky', top: 0, zIndex: 1,
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: ACCENT, letterSpacing: '0.06em' }}>
                🧠 CLAW ANALYTICS REPORT
              </span>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', color: '#555', fontSize: '1.25rem', cursor: 'pointer',
              }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Executive Summary */}
              <div style={{ marginBottom: 20, padding: '16px', borderRadius: 10, background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
                <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Executive Summary
                </h3>
                <p style={{ fontSize: '0.9375rem', color: '#EDEDED', lineHeight: 1.6 }}>{report.executiveSummary}</p>
              </div>

              {/* Key Findings */}
              {report.keyFindings?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Key Findings
                  </h3>
                  {report.keyFindings.map((f, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 6, marginBottom: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.5rem', fontWeight: 800, padding: '2px 6px', borderRadius: 3, color: confidenceColors[f.confidence] || '#888', background: `${confidenceColors[f.confidence] || '#888'}20` }}>
                          {f.confidence}
                        </span>
                        <span style={{ fontSize: '0.5rem', color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>{f.agent}</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#EDEDED', lineHeight: 1.4 }}>{f.finding}</p>
                      {f.evidence && <p style={{ fontSize: '0.625rem', color: '#666', marginTop: 4, fontStyle: 'italic' }}>{f.evidence}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {report.recommendations?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Recommendations
                  </h3>
                  {report.recommendations.map((r, i) => {
                    const pc = priorityConfig[r.priority] || { emoji: '🎯', color: '#888' };
                    return (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 6, marginBottom: 6, background: `${pc.color}10`, border: `1px solid ${pc.color}30` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span>{pc.emoji}</span>
                          <span style={{ fontSize: '0.5rem', color: '#00D4AA', marginLeft: 'auto' }}>→ {r.assignee}</span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#EDEDED', fontWeight: 600 }}>{r.action}</p>
                        <p style={{ fontSize: '0.625rem', color: '#888', marginTop: 4 }}>Expected: {r.expectedOutcome}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expand for methodology + limitations */}
              <button onClick={() => setExpanded(!expanded)} style={{
                width: '100%', padding: '8px', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, background: 'transparent', color: '#888', fontSize: '0.6875rem', cursor: 'pointer',
              }}>
                {expanded ? '▲ Hide Full Report' : '▼ View Full Report (Methodology + Limitations)'}
              </button>

              {expanded && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {report.methodology && (
                    <div>
                      <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Methodology</h4>
                      <p style={{ fontSize: '0.75rem', color: '#AAA', lineHeight: 1.5 }}>{report.methodology}</p>
                    </div>
                  )}
                  {report.limitations?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Limitations</h4>
                      {report.limitations.map((l, i) => (
                        <p key={i} style={{ fontSize: '0.6875rem', color: '#AAA', marginBottom: 2 }}>⚠️ {l}</p>
                      ))}
                    </div>
                  )}
                  {report.confidenceDashboard?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Confidence Dashboard</h4>
                      {report.confidenceDashboard.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                          <span style={{ fontSize: '0.5rem', fontWeight: 800, padding: '1px 5px', borderRadius: 3, color: confidenceColors[c.confidence] || '#888', background: `${confidenceColors[c.confidence] || '#888'}20` }}>{c.confidence}</span>
                          <span style={{ fontSize: '0.6875rem', color: '#EDEDED' }}>{c.claim}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AIBDashboardPage() {
  const ghlStats = useGHLStats();
  const ghlContacts = useGHLContacts();
  const quiz = useQuizHealth();
  const subagents = useSubagentActivity();
  const subHealth = useSubscriptionHealth();
  const revenue = useRevenueData();
  const ga4 = useGA4Data('aib');

  // Content output tracking (localStorage)
  const [postsThisWeek, setPostsThisWeek] = useState(0);
  const [postsThisMonth, setPostsThisMonth] = useState(0);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aib-content-output');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPostsThisWeek(parsed.week ?? 0);
        setPostsThisMonth(parsed.month ?? 0);
      }
    } catch { /* ignore */ }
  }, []);

  const contacts = ghlContacts.data?.contacts || [];
  const segments = segmentContacts(contacts);
  const aibLeads = segments.aib.length;
  const totalContacts = ghlStats.data?.totalContacts ?? 0;
  const recentSignups = ghlStats.data?.recentSignups ?? 0;
  const quizAudits = quiz.data?.totalAudits ?? 0;
  const quizLeads = quiz.data?.totalLeads ?? 0;

  // Wire MRR data from real Whop APIs
  const currentMRR = (() => {
    if (!revenue.data?.combined?.monthlyRevenue) return 0;
    const months = revenue.data.combined.monthlyRevenue;
    const currentMonth = new Date().toISOString().slice(0, 7);
    return months.find(m => m.month === currentMonth)?.revenue || (months.length > 0 ? months[months.length - 1].revenue : 0);
  })();
  const subscribers = subHealth.data?.activeSubscribers ?? 0;
  const churnRate = subHealth.data ? subHealth.data.churnRate * 100 : 0;
  const ltv = revenue.data && subHealth.data
    ? (revenue.data.combined.totalRevenue / Math.max(subHealth.data.activeSubscribers, 1))
    : 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <DashboardAnimations />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard/command" style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none' }}>← Command Center</Link>
          </div>
          <h1 style={{ ...dsHeading, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, marginTop: 8 }}>
            AI Influencer Blueprint
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#555', marginTop: 4 }}>
            Evergreen Recurring — $97/mo + $497/yr Whop Subscriptions
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CLAWAdvisorButton focus="aib" />
          <div style={{
            background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`,
            borderRadius: 12, padding: '12px 20px', textAlign: 'center',
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
              ${currentMRR.toLocaleString()}
            </span>
            <p style={{ fontSize: '0.5625rem', color: ACCENT, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              MRR / ${MRR_TARGET.toLocaleString()} target
            </p>
          </div>
        </div>
      </div>

      {/* === MRR TRACKER === */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="💰 MRR Tracker" badge={<SourceBadge source={revenue.data && subHealth.data ? 'live' : revenue.loading || subHealth.loading ? 'mock' : 'error'} />} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          <KPICard name="Current MRR" current={currentMRR} target={MRR_TARGET} unit="$/mo"
            trend={currentMRR > 0 ? 'up' : 'flat'} action="Drive free→LP→Whop conversion"
            source={revenue.data ? 'live' : 'mock'} accentColor={ACCENT} loading={revenue.loading} />
          <KPICard name="Active Subscribers" current={subscribers} target={1000} unit="subs"
            trend={subscribers > 0 ? 'up' : 'flat'} action="Drive free→LP→Whop conversion"
            source={subHealth.data ? 'live' : 'mock'} accentColor={ACCENT} loading={subHealth.loading} />
          <KPICard name="Churn Rate" current={churnRate} target={5} unit="%"
            trend={churnRate > 0 && churnRate < 10 ? 'up' : 'flat'} action="< 5% monthly target. Nurture sequences needed"
            source={subHealth.data ? 'live' : 'mock'} accentColor={ACCENT} loading={subHealth.loading} />
          <KPICard name="Customer LTV" current={ltv} target={500} unit="$"
            trend={ltv > 0 ? 'up' : 'flat'} action="Increase with upsells + yearly plan"
            source={revenue.data && subHealth.data ? 'live' : 'mock'} accentColor={ACCENT} loading={revenue.loading || subHealth.loading} />
        </div>
        {/* MRR Progress */}
        <div style={{ marginTop: 12, padding: '12px 16px', background: '#0d0d0d', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.6875rem', color: '#888' }}>Progress to $100K/mo</span>
            <span style={{ fontSize: '0.6875rem', color: ACCENT, fontWeight: 600 }}>{((currentMRR / MRR_TARGET) * 100).toFixed(1)}%</span>
          </div>
          <ProgressBar pct={(currentMRR / MRR_TARGET) * 100} color={ACCENT} height={8} />
        </div>
      </div>

      {/* === EVERGREEN FUNNEL === */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="🔄 Evergreen Funnel" badge={<SourceBadge source={ghlStats.data ? 'live' : 'mock'} />} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {([
            { label: 'free. visitors', value: (ga4.loading ? '...' : ga4.error ? '⚠️ GA4 error' : ga4.data?.sessions ?? 0) as string | number, source: (ga4.data ? 'live' : ga4.error ? 'error' : 'mock') as DataSource, desc: ga4.data ? `${ga4.data.activeUsers} active users, ${ga4.data.pageViews} page views` : ga4.error ? ga4.error : 'Loading GA4...' },
            { label: 'lp. signups', value: recentSignups as string | number, source: (ghlStats.data ? 'live' : 'mock') as DataSource, desc: 'Email opt-ins' },
            { label: 'Quiz completed', value: quizAudits as string | number, source: (quiz.data ? 'live' : 'mock') as DataSource, desc: 'Audit PDFs generated' },
            { label: 'Whop conversions', value: (subHealth.data?.activeSubscribers ?? 0) as string | number, source: (subHealth.data ? 'live' : 'mock') as DataSource, desc: 'Paying subscribers' },
          ]).map((stage, i) => (
            <div key={stage.label} style={{
              background: '#0d0d0d', borderRadius: 8, padding: '1rem', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
              borderTop: `3px solid ${ACCENT}${i === 0 ? '30' : i === 1 ? '50' : i === 2 ? '80' : 'FF'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <SourceBadge source={stage.source} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EDEDED', fontVariantNumeric: 'tabular-nums' }}>
                {typeof stage.value === 'number' ? stage.value.toLocaleString() : stage.value}
              </span>
              <p style={{ fontSize: '0.625rem', color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {stage.label}
              </p>
              <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 2 }}>{stage.desc}</p>
              {i < 3 && (
                <div style={{ position: 'absolute', right: -8, top: '50%', color: '#333', fontSize: '1rem' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* === QUIZ FUNNEL === */}
      <div style={{ marginBottom: 32 }}>
        <Card>
          <SectionHeader title="🧠 Quiz Funnel" badge={<SourceBadge source={quiz.data ? 'live' : quiz.error ? 'error' : 'mock'} />} />
          {quiz.loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', padding: '2rem 0' }}>
              <LoadingPulse width={100} />
              <span style={{ fontSize: '0.625rem', color: '#555' }}>Connecting to quiz-funnel...</span>
            </div>
          ) : quiz.data ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: ACCENT }}>{quizAudits}</span>
                  <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 2 }}>AUDITS</p>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EDEDED' }}>{quizLeads}</span>
                  <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 2 }}>LEADS</p>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EDEDED' }}>
                    {quizLeads > 0 ? ((quizAudits / quizLeads) * 100).toFixed(0) : '—'}
                  </span>
                  <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 2 }}>% CONVERSION</p>
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,229,255,0.05)', borderRadius: 6, border: `1px solid ${ACCENT}20` }}>
                <p style={{ fontSize: '0.6875rem', color: '#AAA' }}>
                  Funnel: Quiz → Audit PDF → Email Capture → Whop
                </p>
                <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 4 }}>
                  Status: {quiz.data.status || 'running'} · Uptime: {quiz.data.uptime ? `${Math.floor(quiz.data.uptime / 3600)}h` : '—'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#EF4444' }}>Quiz funnel server offline</p>
              <p style={{ fontSize: '0.625rem', color: '#555', marginTop: 4 }}>{quiz.error}</p>
            </div>
          )}
        </Card>
      </div>



      {/* === GHL LEADS === */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="👥 GHL Leads (AIB-Tagged)" badge={<SourceBadge source={ghlContacts.data ? 'live' : 'mock'} />} />
        <Card>
          {ghlContacts.loading ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4].map(i => <LoadingPulse key={i} width={80} />)}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: ACCENT }}>{aibLeads}</span>
                <span style={{ fontSize: '0.75rem', color: '#555' }}>AIB-tagged contacts in GHL</span>
              </div>
              {/* Tag distribution */}
              {ghlStats.data?.tags && Object.keys(ghlStats.data.tags).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(ghlStats.data.tags)
                    .filter(([tag]) => tag.toLowerCase().includes('aib') || tag.toLowerCase().includes('influencer'))
                    .slice(0, 10)
                    .map(([tag, count]) => (
                      <span key={tag} style={{
                        fontSize: '0.5625rem', padding: '3px 8px', borderRadius: 4,
                        background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30`,
                      }}>
                        {tag}: {count}
                      </span>
                    ))
                  }
                </div>
              )}
              {/* Recent signups */}
              {segments.aib.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: '0.625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Recent AIB Leads
                  </span>
                  {segments.aib.slice(0, 5).map(c => (
                    <div key={c.id} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                    }}>
                      <span style={{ fontSize: '0.6875rem', color: '#AAA' }}>
                        {c.firstName || ''} {c.lastName || ''} {c.email ? `(${c.email})` : ''}
                      </span>
                      <span style={{ fontSize: '0.5625rem', color: '#555' }}>{c.dateAdded ? new Date(c.dateAdded).toLocaleDateString() : '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* === QUICK ACTIONS === */}
      <div>
        <SectionHeader title="⚡ Quick Actions" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          <QuickActionBtn icon="🚀" label="Deploy Freebie" desc="SSH deploy to free." />
          <QuickActionBtn icon="🔥" label="Reddit Warmup" desc="Run Xavier Blanc" />
          <QuickActionBtn icon="📋" label="Check GHL" desc="View CRM contacts" href="https://app.gohighlevel.com" />
          <QuickActionBtn icon="📧" label="View Emails" desc="AIB email sequences" href="/dashboard/ai-influencer/emails" />
          <QuickActionBtn icon="📊" label="Funnel Stats" desc="Quiz performance" href="/dashboard/ai-universa/funnel" />
          <QuickActionBtn icon="🎯" label="Command Center" desc="Back to overview" href="/dashboard/command" />
        </div>
      </div>

      {/* ================================================================ */}
      {/* THREE PILLARS — Boss's North Star                                */}
      {/* ================================================================ */}
      <div style={{ marginTop: 48, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)` }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Three Pillars
          </span>
          <div style={{ height: 2, flex: 1, background: `linear-gradient(270deg, ${ACCENT}40, transparent)` }} />
        </div>
      </div>

      {/* === PILLAR 1: TRAFFIC === */}
      <PillarSection icon="📊" title="Pillar 1: Traffic" defaultOpen={true}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }} className="pillar-grid">
          <MetricBox
            label="Posts This Week"
            value={postsThisWeek}
            sub="Manual counter (localStorage)"
          />
          <MetricBox
            label="Posts This Month"
            value={postsThisMonth}
            sub="Manual counter (localStorage)"
          />
          <MetricBox
            label="Total Contacts"
            value={totalContacts.toLocaleString()}
            sub={ghlStats.data ? 'GHL live' : 'Waiting for GHL'}
          />
          <MetricBox
            label="Recent Signups"
            value={recentSignups.toLocaleString()}
            sub={ghlStats.data ? 'Last 30 days (GHL)' : 'Waiting for GHL'}
          />
        </div>

        {/* Funnel Flow */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.6875rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>
            Funnel Flow
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }} className="pillar-grid">
            {[
              { label: 'Freebie Downloads', value: recentSignups || 0, source: ghlStats.data ? 'live' : 'mock' },
              { label: 'Email Signups', value: totalContacts || 0, source: ghlStats.data ? 'live' : 'mock' },
              { label: 'Quiz Completions', value: quizAudits || 0, source: quiz.data ? 'live' : 'mock' },
              { label: 'Sales', value: subHealth.data?.activeSubscribers || 0, source: subHealth.data ? 'live' : 'mock' },
            ].map((step, i) => (
              <div key={step.label} style={{
                textAlign: 'center', padding: '10px 8px', borderRadius: 6,
                background: `rgba(0,229,255,${0.02 + i * 0.02})`,
                border: `1px solid ${ACCENT}${(15 + i * 10).toString(16)}`,
                position: 'relative',
              }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#EDEDED', fontVariantNumeric: 'tabular-nums' }}>
                  {step.value.toLocaleString()}
                </span>
                <p style={{ fontSize: '0.5625rem', color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {step.label}
                </p>
                <SourceBadge source={step.source as 'live' | 'mock'} />
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '0.6875rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>
            Traffic Sources
          </span>
          {ghlStats.data?.tags && Object.keys(ghlStats.data.tags).length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(ghlStats.data.tags).slice(0, 12).map(([tag, count]) => (
                <span key={tag} style={{
                  fontSize: '0.5625rem', padding: '4px 8px', borderRadius: 4,
                  background: `${ACCENT}10`, color: '#AAA', border: `1px solid ${ACCENT}20`,
                }}>
                  {tag}: {count}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.625rem', color: '#555' }}>
              No tag data yet. GHL contact tags will populate traffic source breakdown.
            </p>
          )}
        </div>

        {/* Conversion Rate */}
        <div style={{
          padding: '10px 14px', background: 'rgba(0,229,255,0.04)', borderRadius: 6,
          border: `1px solid ${ACCENT}15`,
        }}>
          <span style={{ fontSize: '0.6875rem', color: '#888', fontWeight: 600 }}>Conversion Pipeline</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#EDEDED' }}>
              {totalContacts.toLocaleString()} visitors
            </span>
            <span style={{ color: ACCENT }}>→</span>
            <span style={{ fontSize: '0.75rem', color: '#EDEDED' }}>
              {quizLeads.toLocaleString()} leads
              <span style={{ fontSize: '0.5625rem', color: '#555', marginLeft: 4 }}>
                ({totalContacts > 0 ? ((quizLeads / totalContacts) * 100).toFixed(1) : '0'}%)
              </span>
            </span>
            <span style={{ color: ACCENT }}>→</span>
            <span style={{ fontSize: '0.75rem', color: '#EDEDED' }}>
              {(subHealth.data?.activeSubscribers || 0).toLocaleString()} customers
              <span style={{ fontSize: '0.5625rem', color: '#555', marginLeft: 4 }}>
                ({quizLeads > 0 ? (((subHealth.data?.activeSubscribers || 0) / quizLeads) * 100).toFixed(1) : '0'}%)
              </span>
            </span>
          </div>
        </div>
      </PillarSection>



      {/* === PILLAR 3: PRODUCT VALUE === */}
      <PillarSection icon="💎" title="Pillar 3: Product Value" defaultOpen={true}>
        {/* Subscription Health */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: '0.6875rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Subscription Health
            </span>
            <SourceBadge source={subHealth.data ? 'live' : subHealth.error ? 'error' : 'mock'} />
          </div>
          {subHealth.loading ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(i => <LoadingPulse key={i} width={120} />)}
            </div>
          ) : subHealth.data ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }} className="pillar-grid">
              <MetricBox label="Active Subscribers" value={subHealth.data.activeSubscribers} sub="Unique emails with succeeded payments" />
              <MetricBox label="Churned" value={subHealth.data.churned} sub="Refunded + dispute lost" />
              <MetricBox label="Churn Rate" value={`${(subHealth.data.churnRate * 100).toFixed(1)}%`} sub="Churned / total subscribers" />
              <MetricBox label="Avg Order Value" value={`$${subHealth.data.avgOrderValue.toFixed(2)}`} sub="Mean payment amount" />
              <MetricBox label="Refund Rate" value={`${(subHealth.data.refundRate * 100).toFixed(1)}%`} sub="Refunds / total transactions" />
            </div>
          ) : (
            <p style={{ fontSize: '0.75rem', color: '#EF4444' }}>
              Failed to load subscription health: {subHealth.error}
            </p>
          )}
        </div>

        {/* Revenue Metrics */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: '0.6875rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Revenue Metrics
            </span>
            <SourceBadge source={revenue.data ? 'live' : revenue.error ? 'error' : 'mock'} />
          </div>
          {revenue.loading ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(i => <LoadingPulse key={i} width={120} />)}
            </div>
          ) : revenue.data ? (() => {
            const months = revenue.data.combined.monthlyRevenue;
            const currentMonth = new Date().toISOString().slice(0, 7);
            const currentMRRCalc = months.find(m => m.month === currentMonth)?.revenue || 0;
            const prevMonth = months.length >= 2 ? months[months.length - 2] : null;
            const mrrGrowth = prevMonth && prevMonth.revenue > 0
              ? (((currentMRRCalc - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1)
              : '0';
            const totalRev = revenue.data.combined.totalRevenue;
            const totalCust = subHealth.data?.activeSubscribers || 1;
            const ltv = totalRev / totalCust;

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }} className="pillar-grid">
                <MetricBox label="Current MRR" value={`$${currentMRRCalc.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`${currentMonth} recurring payments`} />
                <MetricBox label="MRR Growth" value={`${Number(mrrGrowth) >= 0 ? '+' : ''}${mrrGrowth}%`} sub="Month over month change" />
                <MetricBox label="LTV Estimate" value={`$${ltv.toFixed(0)}`} sub="Total revenue / active customers" />
                <MetricBox label="Total Revenue" value={`$${totalRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`${revenue.data.combined.totalTransactions} transactions`} />
              </div>
            );
          })() : (
            <p style={{ fontSize: '0.75rem', color: '#EF4444' }}>
              Failed to load revenue: {revenue.error}
            </p>
          )}

          {/* MRR by Month Mini Chart */}
          {revenue.data?.combined.monthlyRevenue && revenue.data.combined.monthlyRevenue.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: '0.5625rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Monthly Revenue Trend
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70 }}>
                {revenue.data.combined.monthlyRevenue.slice(-8).map((m, i) => {
                  const maxRev = Math.max(...revenue.data!.combined.monthlyRevenue.slice(-8).map(x => x.revenue));
                  const pct = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: '0.4375rem', color: '#666' }}>${(m.revenue / 1000).toFixed(1)}k</span>
                      <div style={{
                        width: '100%', maxWidth: 30,
                        height: `${Math.max(pct * 0.5, 3)}px`,
                        background: i === revenue.data!.combined.monthlyRevenue.slice(-8).length - 1 ? ACCENT : `${ACCENT}50`,
                        borderRadius: 2,
                      }} />
                      <span style={{ fontSize: '0.375rem', color: '#444' }}>{m.month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Library */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: '0.6875rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>
            Product Library
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} className="pillar-grid">
            <div style={{
              padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: '1.25rem' }}>📘</span>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#EDEDED', fontWeight: 600 }}>DNA Framework PDF</span>
                <p style={{ fontSize: '0.5625rem', color: '#555' }}>Core methodology guide</p>
              </div>
            </div>
            <div style={{
              padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: '1.25rem' }}>🎁</span>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#EDEDED', fontWeight: 600 }}>Freebie Guide</span>
                <p style={{ fontSize: '0.5625rem', color: '#555' }}>Lead magnet download</p>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 6 }}>2 products in library. Add more to increase LTV.</p>
        </div>

        {/* Failed Payment Recovery */}
        {subHealth.data && subHealth.data.failedPayments > 0 && (
          <div style={{
            padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1rem' }}>🚨</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#EF4444' }}>
                Failed Payment Recovery
              </span>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EDEDED' }}>{subHealth.data.failedPayments}</span>
                <p style={{ fontSize: '0.5625rem', color: '#888' }}>Failed payments</p>
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EF4444' }}>
                  ${subHealth.data.failedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <p style={{ fontSize: '0.5625rem', color: '#888' }}>Estimated lost revenue</p>
              </div>
            </div>
            <p style={{ fontSize: '0.5625rem', color: '#888', marginTop: 8 }}>
              Consider implementing dunning emails and retry logic to recover failed payments.
            </p>
          </div>
        )}
      </PillarSection>

      <style>{`
        @media (max-width: 1024px) {
          .aib-grid { grid-template-columns: 1fr !important; }
          .pillar-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .pillar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
