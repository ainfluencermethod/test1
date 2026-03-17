'use client';

import { DS, dsHeading } from '@/styles/design-system';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  useGHLStats, useGHLContacts, useWhatsAppStats, useQuizHealth, useSubagentActivity,
  segmentContacts, todaysCompletedTasks, runningTasks,
  type SubagentTask,
} from '@/lib/hooks-live';
import {
  SourceBadge, SectionHeader, Card, KPICard, QuickActionBtn,
  ProgressBar, CountdownDisplay, DashboardAnimations, LoadingPulse,
} from '@/lib/dashboard-ui';
import type { DataSource } from '@/lib/types-unified';
import LaunchTimeline from '@/components/LaunchTimeline';
import { AI_UNIVERSA_READINESS_ITEMS } from '@/lib/aiuniversa-readiness-data';
import { getDashboardMilestones, PHASE_COLORS } from '@/lib/launch-timeline-data';

// ============================================================================
// AI Universa Dashboard — Event-Based Launch + Recurring SAAS
// ============================================================================
// Revenue: Event launch (€899.99 / €2,499.99) + recurring SAAS subs
// Accent: Purple (#8B5CF6)
// ============================================================================

const ACCENT = '#8B5CF6';
const CARD_BG_AU = DS.colors.bgCard;
const LAUNCH_DATE = new Date('2026-04-15T00:00:00+02:00');

function categorizeTask(label: string): { icon: string; color: string } {
  const l = label.toLowerCase();
  if (/design|creative|ad|landing|lp|sidebar/.test(l)) return { icon: '🎨', color: '#E040FB' };
  if (/copy|vsl|email|script|pdf|guide/.test(l)) return { icon: '✍️', color: '#3B82F6' };
  if (/dev|build|dashboard|page|feed|orb|chat/.test(l)) return { icon: '⚡', color: '#10B981' };
  if (/research|scrape|analysis|audit/.test(l)) return { icon: '🔍', color: '#F59E0B' };
  return { icon: '📋', color: '#6B7280' };
}

// --- CLAW Advisor Modal for AI Universa ---
interface CLAWFinding { finding: string; confidence: string; agent: string; evidence: string; }
interface CLAWRec { action: string; expectedOutcome: string; priority: string; assignee: string; }
interface CLAWReportAU { executiveSummary: string; keyFindings: CLAWFinding[]; recommendations: CLAWRec[]; methodology: string; limitations: string[]; confidenceDashboard: Array<{ claim: string; confidence: string; rationale: string }>; }

function CLAWAdvisorButton({ focus }: { focus: string }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CLAWReportAU | null>(null);
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
          background: loading ? '#555' : `linear-gradient(135deg, ${ACCENT} 0%, #7C3AED 100%)`,
          color: '#FFF', fontSize: '0.75rem', fontWeight: 800,
          letterSpacing: '0.02em', transition: 'all 0.3s',
          boxShadow: loading ? 'none' : `0 2px 12px ${ACCENT}40`,
        }}
      >
        {loading ? '🧠 Analyzing...' : '🎯 What Should I Do?'}
      </button>
      {error && <span style={{ fontSize: '0.625rem', color: '#EF4444', marginLeft: 8 }}>{error}</span>}

      {showModal && report && (
        <div onClick={() => setShowModal(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: 700, width: '100%', maxHeight: '85vh', overflow: 'auto',
            borderRadius: 16, background: '#111318',
            border: `1px solid ${ACCENT}40`, boxShadow: `0 16px 48px rgba(0,0,0,0.6)`,
          }}>
            <div style={{
              padding: '16px 24px', borderBottom: `1px solid ${ACCENT}20`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: `${ACCENT}08`, position: 'sticky', top: 0, zIndex: 1,
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: ACCENT, letterSpacing: '0.06em' }}>🧠 CLAW ANALYTICS REPORT</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 20, padding: '16px', borderRadius: 10, background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
                <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Executive Summary</h3>
                <p style={{ fontSize: '0.9375rem', color: '#EDEDED', lineHeight: 1.6 }}>{report.executiveSummary}</p>
              </div>
              {report.keyFindings?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Key Findings</h3>
                  {report.keyFindings.map((f, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 6, marginBottom: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.5rem', fontWeight: 800, padding: '2px 6px', borderRadius: 3, color: confidenceColors[f.confidence] || '#888', background: `${confidenceColors[f.confidence] || '#888'}20` }}>{f.confidence}</span>
                        <span style={{ fontSize: '0.5rem', color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>{f.agent}</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#EDEDED', lineHeight: 1.4 }}>{f.finding}</p>
                      {f.evidence && <p style={{ fontSize: '0.625rem', color: '#666', marginTop: 4, fontStyle: 'italic' }}>{f.evidence}</p>}
                    </div>
                  ))}
                </div>
              )}
              {report.recommendations?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Recommendations</h3>
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
                      {report.limitations.map((l, i) => <p key={i} style={{ fontSize: '0.6875rem', color: '#AAA', marginBottom: 2 }}>⚠️ {l}</p>)}
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

// --- GA4 Data Hook ---
interface GA4Totals {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  newUsers: number;
  avgBounceRate: number;
}
interface GA4Data {
  totals: GA4Totals;
  daily: Array<{ date: string; activeUsers: number; sessions: number; pageViews: number; newUsers: number; bounceRate: number }>;
  trafficSources: Array<{ channel: string; sessions: number; activeUsers: number }>;
  utmAttribution: Array<{ source: string; medium: string; campaign: string; sessions: number; users: number }>;
  lastUpdated: string;
}
interface GA4State {
  data: GA4Data | null;
  loading: boolean;
  error: string | null;
  action: string | null;
}

function useGA4Data(property: string = 'aiuniversa'): GA4State {
  const [state, setState] = useState<GA4State>({ data: null, loading: true, error: null, action: null });
  useEffect(() => {
    async function fetchGA4() {
      try {
        const res = await fetch(`/api/ga4?property=${property}`);
        const json = await res.json();
        if (json.success && json.data) {
          setState({ data: json.data, loading: false, error: null, action: null });
        } else {
          setState({ data: null, loading: false, error: json.error || 'GA4 API error', action: json.action || null });
        }
      } catch (err) {
        setState({ data: null, loading: false, error: 'Failed to connect to GA4 API', action: null });
      }
    }
    fetchGA4();
    const interval = setInterval(fetchGA4, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, [property]);
  return state;
}

export default function AIUniversaDashboardPage() {
  const ghlStats = useGHLStats();
  const ghlContacts = useGHLContacts();
  const whatsapp = useWhatsAppStats();
  const quiz = useQuizHealth();
  const subagents = useSubagentActivity();
  const ga4 = useGA4Data();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const daysLeft = Math.max(0, Math.ceil((LAUNCH_DATE.getTime() - now.getTime()) / 86400000));
  const contacts = ghlContacts.data?.contacts || [];
  const segments = segmentContacts(contacts);
  const aiusLeads = segments.aius.length;
  const waMembers = whatsapp.data?.totalMembers ?? 0;
  const waGroups = whatsapp.data?.totalGroups ?? 0;
  const waFill = whatsapp.data?.fillPercentage ?? 0;
  const dashboardMilestones = getDashboardMilestones();

  // Readiness calc
  const readinessDone = AI_UNIVERSA_READINESS_ITEMS.filter(i => i.done).length;
  const readinessPct = Math.round((readinessDone / AI_UNIVERSA_READINESS_ITEMS.length) * 100);

  // Today's subagent deliverables
  const todayTasks = useMemo(() => {
    if (!subagents.data?.recent) return [];
    return todaysCompletedTasks(subagents.data.recent);
  }, [subagents.data]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <DashboardAnimations />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Link href="/dashboard/command" style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none' }}>← Command Center</Link>
          <h1 style={{ ...dsHeading, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, marginTop: 8 }}>
            AI Universa
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#555', marginTop: 4 }}>
            Event-Based Launch + Recurring SAAS · €899.99 Normal / €2,499.99 VIP
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CLAWAdvisorButton focus="aiuniversa" />
          <CountdownDisplay targetDate={LAUNCH_DATE} label="Days to Live Event" color={ACCENT} />
        </div>
      </div>

      {/* === LAUNCH TIMELINE === */}
      <div style={{ marginBottom: 32 }}>
        <LaunchTimeline />
      </div>

      {/* === LAUNCH COUNTDOWN + READINESS === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }} className="aius-grid">
        {/* Countdown */}
        <Card accent={ACCENT}>
          <SectionHeader title="🚀 Launch Countdown" />
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <span style={{
              fontSize: '4rem', fontWeight: 800, color: daysLeft <= 14 ? '#F59E0B' : ACCENT,
              fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums',
            }}>
              {daysLeft}
            </span>
            <p style={{ fontSize: '0.875rem', color: '#888', marginTop: 4 }}>days until April 15, 2026</p>
            <div style={{ marginTop: 16 }}>
              <ProgressBar pct={Math.min(100, ((90 - daysLeft) / 90) * 100)} color={ACCENT} height={8} />
              <p style={{ fontSize: '0.625rem', color: '#555', marginTop: 4 }}>Campaign progress</p>
            </div>
          </div>
          {/* Key dates */}
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
            {dashboardMilestones.map((milestone) => {
              const dUntil = Math.max(0, Math.ceil((new Date(`${milestone.date}T00:00:00`).getTime() - now.getTime()) / 86400000));
              const milestoneColor = PHASE_COLORS[milestone.phase].text;
              return (
                <div key={milestone.date} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: milestoneColor }} />
                  <span style={{ fontSize: '0.6875rem', color: '#AAA', flex: 1 }}>{milestone.label}</span>
                  <span style={{ fontSize: '0.625rem', color: milestoneColor, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{dUntil}d</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Readiness Checklist */}
        <Card accent={ACCENT}>
          <SectionHeader title="✅ Launch Readiness" rightContent={
            <span style={{ fontSize: '1rem', fontWeight: 700, color: ACCENT }}>{readinessPct}%</span>
          } />
          <ProgressBar pct={readinessPct} color={ACCENT} height={6} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {AI_UNIVERSA_READINESS_ITEMS.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0',
                opacity: item.done ? 0.6 : 1,
              }}>
                <span style={{ fontSize: '0.75rem' }}>{item.done ? '✅' : '⬜'}</span>
                <span style={{
                  fontSize: '0.6875rem', color: item.done ? '#555' : '#EDEDED',
                  textDecoration: item.done ? 'line-through' : 'none',
                  flex: 1,
                }}>
                  {item.label}
                </span>
                {item.category && (
                  <span style={{
                    fontSize: '0.5rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em',
                    padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.03)',
                  }}>
                    {item.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* === REGISTRATION FUNNEL === */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="📊 Registration Funnel" badge={<SourceBadge source={ghlContacts.data ? 'live' : 'mock'} />} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {([
            {
              label: 'LP Visitors',
              value: ga4.loading ? '...' as string | number : ga4.data ? ga4.data.totals.activeUsers as string | number : (ga4.error ? '⚠️ Auth Required' : '⚠️ No Data') as string | number,
              source: (ga4.data ? 'live' : ga4.error ? 'error' : 'mock') as DataSource,
              desc: ga4.data ? `${ga4.data.totals.sessions.toLocaleString()} sessions (30d)` : ga4.error ? 'GA4 needs OAuth2 setup' : 'Loading GA4 data...',
            },
            { label: 'Survey Completes', value: '—' as string | number, source: 'mock' as DataSource, desc: 'Typeform integration pending' },
            { label: 'WhatsApp Joins', value: waMembers as string | number, source: (whatsapp.data ? 'live' : 'mock') as DataSource, desc: `${waGroups} groups` },
            { label: 'Total Registrations', value: aiusLeads as string | number, source: (ghlContacts.data ? 'live' : 'mock') as DataSource, desc: 'AIUS tagged in GHL' },
          ]).map((s, i) => (
            <div key={s.label} style={{
              background: '#0d0d0d', borderRadius: 8, padding: '1rem', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
              borderTop: `3px solid ${ACCENT}`,
              opacity: 0.4 + (i * 0.2),
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <SourceBadge source={s.source} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EDEDED', fontVariantNumeric: 'tabular-nums' }}>
                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </span>
              <p style={{ fontSize: '0.625rem', color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {s.label}
              </p>
              <p style={{ fontSize: '0.5625rem', color: '#555', marginTop: 2 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === GA4 ANALYTICS STATUS === */}
      {!ga4.loading && (
        <div style={{ marginBottom: 32 }}>
          {ga4.data ? (
            <Card accent="#10B981">
              <SectionHeader title="📊 GA4 Visitor Analytics (30 Days)" badge={<SourceBadge source="live" />} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Active Users', value: ga4.data.totals.activeUsers.toLocaleString(), color: ACCENT },
                  { label: 'Sessions', value: ga4.data.totals.sessions.toLocaleString(), color: '#3B82F6' },
                  { label: 'Page Views', value: ga4.data.totals.pageViews.toLocaleString(), color: '#10B981' },
                  { label: 'New Users', value: ga4.data.totals.newUsers.toLocaleString(), color: '#F59E0B' },
                  { label: 'Avg Bounce Rate', value: `${(ga4.data.totals.avgBounceRate * 100).toFixed(1)}%`, color: '#EF4444' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
                    <p style={{ fontSize: '0.5625rem', color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{m.label}</p>
                  </div>
                ))}
              </div>
              {/* Daily visitor trend mini chart */}
              {ga4.data.daily.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily Visitor Trend</span>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 48, marginTop: 8 }}>
                    {ga4.data.daily.slice(-30).map((day) => {
                      const maxVal = Math.max(...ga4.data!.daily.map(d => d.activeUsers), 1);
                      const height = Math.max(2, (day.activeUsers / maxVal) * 48);
                      return (
                        <div key={day.date} title={`${day.date}: ${day.activeUsers} users`} style={{
                          flex: 1, height, borderRadius: 2,
                          background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT}40)`,
                        }} />
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Traffic sources */}
              {ga4.data.trafficSources.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                  <span style={{ fontSize: '0.625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Traffic Sources</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    {ga4.data.trafficSources.slice(0, 6).map(src => (
                      <div key={src.channel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span style={{ fontSize: '0.75rem', color: '#AAA' }}>{src.channel}</span>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: '0.6875rem', color: ACCENT, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{src.sessions} sessions</span>
                          <span style={{ fontSize: '0.6875rem', color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>{src.activeUsers} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* UTM Attribution */}
              {ga4.data.utmAttribution && ga4.data.utmAttribution.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                  <span style={{ fontSize: '0.625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>UTM Attribution</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    {ga4.data.utmAttribution.slice(0, 10).map((utm, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '0.75rem', color: '#AAA' }}>{utm.source} / {utm.medium}</span>
                          {utm.campaign !== '(not set)' && (
                            <span style={{ fontSize: '0.5625rem', color: '#666' }}>{utm.campaign}{utm.source === 'instagram' ? ` · ${utm.medium}` : ''}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: '0.6875rem', color: '#e8e342', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{utm.sessions} sessions</span>
                          <span style={{ fontSize: '0.6875rem', color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>{utm.users} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!ga4.data.utmAttribution || ga4.data.utmAttribution.length === 0) && (
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                  <span style={{ fontSize: '0.625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>UTM Attribution</span>
                  <p style={{ fontSize: '0.6875rem', color: '#666', marginTop: 8 }}>No UTM data yet. Traffic from tagged links (instagram/bio, ads, email) will appear here automatically.</p>
                </div>
              )}
              <p style={{ fontSize: '0.5rem', color: '#444', marginTop: 12 }}>Last updated: {new Date(ga4.data.lastUpdated).toLocaleString()}</p>
            </Card>
          ) : ga4.error ? (
            <Card accent="#F59E0B">
              <SectionHeader title="⚠️ GA4 Connection Status" badge={<SourceBadge source="error" />} />
              <div style={{ padding: '12px 0' }}>
                <p style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 600, marginBottom: 8 }}>{ga4.error}</p>
                {ga4.action && (
                  <div style={{ padding: '10px 12px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <p style={{ fontSize: '0.6875rem', color: '#AAA' }}>
                      <strong style={{ color: '#F59E0B' }}>Next step:</strong> {ga4.action}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : null}
        </div>
      )}

      {/* === WHATSAPP GROUPS === */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="💬 WhatsApp Groups" badge={<SourceBadge source={whatsapp.data ? 'live' : whatsapp.error ? 'error' : 'mock'} />} />
        <Card>
          {whatsapp.loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', padding: '2rem' }}>
              <LoadingPulse width={120} />
              <span style={{ fontSize: '0.625rem', color: '#555' }}>Connecting to WhatsApp...</span>
            </div>
          ) : whatsapp.data ? (
            <div>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#25D366' }}>{waMembers}</span>
                  <p style={{ fontSize: '0.625rem', color: '#555' }}>Total Members</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: ACCENT }}>{waGroups}</span>
                  <p style={{ fontSize: '0.625rem', color: '#555' }}>Groups</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: waFill > 80 ? '#F59E0B' : '#EDEDED' }}>
                    {waFill.toFixed(0)}%
                  </span>
                  <p style={{ fontSize: '0.625rem', color: '#555' }}>Fill Level</p>
                </div>
              </div>

              {/* Overall fill bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.625rem', color: '#888' }}>Capacity (50 groups × 5 members = 250)</span>
                  <span style={{ fontSize: '0.625rem', color: waFill > 80 ? '#F59E0B' : '#25D366', fontWeight: 600 }}>
                    {waMembers}/250
                  </span>
                </div>
                <ProgressBar pct={waFill} color="#25D366" height={8} />
              </div>

              {/* Per-group breakdown */}
              {whatsapp.data.groups && whatsapp.data.groups.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.625rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Group Fill Levels
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6, marginTop: 8 }}>
                    {whatsapp.data.groups.map((g, i) => {
                      const gPct = g.capacity > 0 ? (g.members / g.capacity) * 100 : 0;
                      const full = g.members >= g.capacity;
                      return (
                        <div key={i} style={{
                          padding: '8px', borderRadius: 6,
                          background: full ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${full ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)'}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.5625rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                              {g.name}
                            </span>
                            <span style={{ fontSize: '0.5625rem', color: full ? '#EF4444' : '#00D4AA', fontWeight: 600 }}>
                              {full ? 'FULL' : `${g.members}/${g.capacity}`}
                            </span>
                          </div>
                          <ProgressBar pct={gPct} color={full ? '#EF4444' : '#25D366'} height={3} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active group callout */}
              {whatsapp.data.activeGroup && (
                <div style={{
                  marginTop: 12, padding: '8px 12px', borderRadius: 6,
                  background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)',
                }}>
                  <span style={{ fontSize: '0.6875rem', color: '#25D366', fontWeight: 600 }}>
                    📌 Active group: {whatsapp.data.activeGroup}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#EF4444' }}>WhatsApp stats unavailable</p>
              <p style={{ fontSize: '0.625rem', color: '#555', marginTop: 4 }}>{whatsapp.error}</p>
            </div>
          )}
        </Card>
      </div>





      {/* === TODAY'S DELIVERABLES (from subagents) === */}
      {todayTasks.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader
            title="📦 Today&apos;s Deliverables"
            badge={<SourceBadge source="live" />}
            rightContent={
              <span style={{ fontSize: '0.6875rem', color: '#00D4AA', fontWeight: 600 }}>
                {todayTasks.length} completed
              </span>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayTasks.slice(0, 10).map(t => {
              const cat = categorizeTask(t.label);
              return (
                <Card key={t.runId} accent={cat.color} style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{cat.icon}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDEDED' }}>
                        {t.label.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.625rem', color: '#555',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {t.runtime}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* === QUICK ACTIONS === */}
      <div>
        <SectionHeader title="⚡ Quick Actions" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          <QuickActionBtn icon="🚀" label="Deploy to aiuniversa.si" desc="SSH deploy to production" />
          <QuickActionBtn icon="💬" label="WhatsApp Stats" desc="Check group fill levels" />
          <QuickActionBtn icon="🛍️" label="View Offer Page" desc="Sales page preview" href="/lp/ai-universa-offer" />
          <QuickActionBtn icon="📧" label="AU Emails" desc="Email sequences" href="/dashboard/ai-universa/emails" />
          <QuickActionBtn icon="📊" label="Analytics" desc="Charts & data" href="/dashboard/ai-universa/analytics" />
          <QuickActionBtn icon="🌐" label="Registration LP" desc="Lead capture page" href="/lp/ai-universa" />
          <QuickActionBtn icon="📋" label="Survey" desc="Opt-in survey" href="/lp/ai-universa-survey" />
          <QuickActionBtn icon="🎯" label="Command Center" desc="Back to overview" href="/dashboard/command" />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .aius-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
