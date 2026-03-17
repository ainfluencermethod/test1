'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DS, dsCard, dsHeading } from '@/styles/design-system';
import { useDashboard, useUnfinishedBusiness } from '@/lib/store';
import { useDashboardLiveData, segmentContacts, todaysCompletedTasks, runningTasks } from '@/lib/hooks-live';
import RealtimeVisitors from '@/components/analytics/RealtimeVisitors';
import {
  SourceBadge, SectionHeader as LegacySectionHeader, Card, KPICard, QuickActionBtn, ProductCard,
  ProgressBar, CountdownDisplay, DashboardAnimations, LoadingPulse,
} from '@/lib/dashboard-ui';
import type { DataSource, Agent, TeamMember } from '@/lib/types-unified';

// ============================================================================
// COMMAND CENTER — Hyperliquid-inspired premium dashboard
// ============================================================================

const LAUNCH_DATE = new Date('2026-04-15T00:00:00+02:00');

// Revenue hook
function useCommandRevenue() {
  const [data, setData] = useState<{ totalRevenue: number; mrr: number; transactions: number } | null>(null);
  useEffect(() => {
    fetch('/api/whop/revenue').then(r => r.json()).then(d => {
      const combined = d?.combined || {};
      const monthly = combined?.monthlyRevenue || [];
      const latestMonth = monthly.length > 0 ? monthly[monthly.length - 1]?.revenue || 0 : 0;
      setData({ totalRevenue: combined?.totalRevenue || 0, mrr: latestMonth, transactions: combined?.totalTransactions || 0 });
    }).catch(() => {});
  }, []);
  return data;
}

// --- Unfinished Business Bar ---
function UnfinishedBusinessBar() {
  const items = useUnfinishedBusiness();
  const stalled = items.filter(i => i.stallDays >= 3);
  if (items.length === 0) return null;

  return (
    <div style={{
      background: stalled.length > 0 ? 'rgba(248,113,113,0.06)' : 'rgba(251,191,36,0.04)',
      border: `1px solid ${stalled.length > 0 ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.15)'}`,
      borderRadius: DS.radius.card, padding: '0.875rem 1.25rem', marginBottom: DS.spacing.elementGap,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: '0.8125rem', fontWeight: 500, fontFamily: DS.fonts.body,
            color: stalled.length > 0 ? DS.colors.error : DS.colors.warning,
            letterSpacing: '0.02em',
          }}>
            {items.length} unfinished {items.length === 1 ? 'item' : 'items'}
            {stalled.length > 0 && ` · ${stalled.length} stalled 3+ days`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {items.map(item => (
            <Link key={item.id} href={item.href} style={{
              fontSize: '0.6875rem', fontWeight: 400, padding: '3px 10px', borderRadius: DS.radius.badge,
              background: item.stallDays >= 3 ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.03)',
              color: item.stallDays >= 3 ? DS.colors.error : '#777',
              border: `1px solid ${item.stallDays >= 3 ? 'rgba(248,113,113,0.2)' : DS.colors.border}`,
              textDecoration: 'none',
            }}>
              {item.title} ({item.completionPercent}%)
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Human Row ---
function HumanRow({ member }: { member: TeamMember }) {
  const statusColors: Record<string, string> = {
    available: DS.colors.accent, busy: DS.colors.warning, 'deep-work': DS.colors.accentPurple, offline: '#222',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.625rem 0', borderBottom: `1px solid ${DS.colors.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[member.status] || '#222' }} />
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: DS.colors.text }}>{member.name}</span>
          <span style={{ fontSize: '0.6875rem', color: DS.colors.textSecondary, marginLeft: 8 }}>{member.role}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 60, height: 3, background: DS.colors.border, borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${member.workload}%`, borderRadius: 2, background: member.workload > 80 ? DS.colors.error : member.workload > 60 ? DS.colors.warning : DS.colors.accent }} />
        </div>
        <span style={{ fontSize: '0.625rem', color: DS.colors.textSecondary, fontFamily: DS.fonts.mono, width: 28, textAlign: 'right' }}>
          {member.workload}%
        </span>
      </div>
    </div>
  );
}

// --- Agent Row ---
function AgentRow({ agent }: { agent: Agent }) {
  const statusColors: Record<string, string> = {
    running: DS.colors.accent, idle: '#333', 'waiting-approval': DS.colors.warning, error: DS.colors.error, offline: '#1a1a1a',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.625rem 0', borderBottom: `1px solid ${DS.colors.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[agent.status] || '#222' }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: DS.colors.text }}>{agent.name}</span>
      </div>
      <span style={{
        fontSize: '0.5625rem', fontWeight: 500, color: statusColors[agent.status],
        fontFamily: DS.fonts.mono, letterSpacing: '0.04em',
      }}>
        {agent.status}
      </span>
    </div>
  );
}

// --- CLAW Report Types ---
interface CLAWFinding { finding: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; agent: string; evidence: string; }
interface CLAWRecommendation { action: string; expectedOutcome: string; priority: 'urgent' | 'important' | 'opportunity'; assignee: string; }
interface ConfidenceEntry { claim: string; confidence: string; rationale: string; }
interface CLAWReport { executiveSummary: string; keyFindings: CLAWFinding[]; recommendations: CLAWRecommendation[]; methodology: string; limitations: string[]; confidenceDashboard: ConfidenceEntry[]; }
interface CLAWResponse { focus: string; analyzedAt: string; dataSourcesAvailable: Record<string, boolean>; report: CLAWReport; model: string; recommendation?: { priority: string; action: string; impact: string; assignee: string; reasoning: string; }; source?: string; }

// --- Advisor Section ---
function AdvisorSection({ live }: { live: ReturnType<typeof useDashboardLiveData> }) {
  const [loading, setLoading] = useState(false);
  const [clawData, setClawData] = useState<CLAWResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/claw/analyze?focus=all', { signal: AbortSignal.timeout(45000) });
      if (!res.ok) { const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` })); throw new Error(errData.error || `HTTP ${res.status}`); }
      setClawData(await res.json());
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to analyze'); }
    finally { setLoading(false); }
  }, []);

  const priorityConfig: Record<string, { color: string; bg: string }> = {
    urgent: { color: DS.colors.error, bg: 'rgba(248,113,113,0.06)' },
    important: { color: DS.colors.warning, bg: 'rgba(251,191,36,0.06)' },
    opportunity: { color: DS.colors.accent, bg: 'rgba(74,222,128,0.06)' },
  };
  const confidenceColors: Record<string, string> = { HIGH: DS.colors.accent, MEDIUM: DS.colors.warning, LOW: DS.colors.error };

  const report = clawData?.report;

  return (
    <div style={{ marginBottom: DS.spacing.sectionGap }}>
      <button onClick={analyze} disabled={loading} style={{
        width: '100%', height: 52, border: `1px solid ${DS.colors.accentGold}30`, borderRadius: DS.radius.card,
        background: loading ? DS.colors.bgCard : 'transparent',
        color: loading ? DS.colors.textSecondary : DS.colors.accentGold,
        fontFamily: DS.fonts.heading, fontSize: '1rem', fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', letterSpacing: '0.02em',
      }}>
        {loading ? 'Analyzing...' : 'What should I do right now?'}
      </button>

      {error && (
        <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: DS.radius.button, background: 'rgba(248,113,113,0.06)', border: `1px solid rgba(248,113,113,0.15)`, fontSize: '0.8125rem', color: DS.colors.error }}>
          {error}
        </div>
      )}

      {report && !error && (
        <div style={{ marginTop: 20, ...dsCard, border: `1px solid ${DS.colors.accentGold}20` }}>
          <p style={{ fontSize: '1rem', fontWeight: 400, color: DS.colors.text, lineHeight: 1.6, marginBottom: 24, fontFamily: DS.fonts.body }}>
            {report.executiveSummary}
          </p>

          {report.keyFindings?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ ...dsHeading, fontSize: '0.875rem', fontWeight: 500, marginBottom: 12, color: DS.colors.textSecondary }}>Key findings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.keyFindings.map((f, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderRadius: DS.radius.button, background: 'rgba(255,255,255,0.02)', border: `1px solid ${DS.colors.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.5625rem', fontWeight: 600, padding: '2px 6px', borderRadius: 3, color: confidenceColors[f.confidence] || '#888', background: `${confidenceColors[f.confidence] || '#888'}15` }}>{f.confidence}</span>
                      <span style={{ fontSize: '0.5625rem', color: DS.colors.textMuted, fontFamily: DS.fonts.mono }}>{f.agent}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: DS.colors.text, lineHeight: 1.5 }}>{f.finding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.recommendations?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ ...dsHeading, fontSize: '0.875rem', fontWeight: 500, marginBottom: 12, color: DS.colors.textSecondary }}>Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.recommendations.map((r, i) => {
                  const pc = priorityConfig[r.priority] || priorityConfig.opportunity;
                  return (
                    <div key={i} style={{ padding: '12px 16px', borderRadius: DS.radius.button, background: pc.bg, border: `1px solid ${pc.color}20` }}>
                      <p style={{ fontSize: '0.8125rem', color: DS.colors.text, fontWeight: 500, lineHeight: 1.4 }}>{r.action}</p>
                      <p style={{ fontSize: '0.6875rem', color: DS.colors.textSecondary, marginTop: 4 }}>Expected: {r.expectedOutcome}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={() => setExpanded(!expanded)} style={{
            width: '100%', padding: '8px', border: `1px solid ${DS.colors.border}`, borderRadius: DS.radius.badge,
            background: 'transparent', color: DS.colors.textSecondary, fontSize: '0.6875rem', cursor: 'pointer',
          }}>
            {expanded ? 'Hide full report' : 'View full report'}
          </button>

          {expanded && report.methodology && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.6 }}>{report.methodology}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function CommandCenterPage() {
  const { state } = useDashboard();
  const live = useDashboardLiveData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const ghlTotal = live.ghlStats.data?.totalContacts ?? 0;
  const ghlRecent = live.ghlStats.data?.recentSignups ?? 0;
  const waMembers = live.whatsapp.data?.totalMembers ?? 0;
  const waGroups = live.whatsapp.data?.totalGroups ?? 0;
  const waFill = live.whatsapp.data?.fillPercentage ?? 0;
  const quizAudits = live.quiz.data?.totalAudits ?? 0;
  const quizLeads = live.quiz.data?.totalLeads ?? 0;
  const subRunning = runningTasks(live.subagents.data);
  const subCompleted = live.subagents.data ? todaysCompletedTasks(live.subagents.data.recent || []).length : 0;
  const contacts = live.ghlContacts.data?.contacts || [];
  const segments = segmentContacts(contacts);
  const revenueData = useCommandRevenue();
  const totalRevenue = revenueData?.mrr || 0;

  const daysToLaunch = Math.max(0, Math.ceil((LAUNCH_DATE.getTime() - now.getTime()) / 86400000));

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <DashboardAnimations />

      {/* Header */}
      <div style={{ marginBottom: DS.spacing.sectionGap }}>
        <h1 style={{
          ...dsHeading,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          marginBottom: 8,
        }}>
          Command Center
        </h1>
        <p style={{ fontSize: '0.8125rem', color: DS.colors.textSecondary, fontFamily: DS.fonts.body }}>
          Last updated: {live.ghlStats.lastFetched ? new Date(live.ghlStats.lastFetched).toLocaleTimeString() : 'fetching...'}
        </p>
      </div>

      {/* === HERO METRICS === */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: DS.spacing.elementGap,
        marginBottom: DS.spacing.sectionGap,
      }} className="hero-metrics">
        {/* Revenue */}
        <div style={{ ...dsCard, textAlign: 'center', padding: '40px 32px' }}>
          <span style={{
            fontFamily: DS.fonts.mono,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: DS.colors.accentGold,
            fontVariantNumeric: 'tabular-nums',
            display: 'block',
            lineHeight: 1.1,
          }}>
            ${totalRevenue.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.8125rem', color: DS.colors.textSecondary, marginTop: 8, display: 'block', fontFamily: DS.fonts.body }}>
            Monthly recurring revenue
          </span>
        </div>

        {/* Total Leads */}
        <div style={{ ...dsCard, textAlign: 'center', padding: '40px 32px' }}>
          <span style={{
            fontFamily: DS.fonts.mono,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: DS.colors.text,
            fontVariantNumeric: 'tabular-nums',
            display: 'block',
            lineHeight: 1.1,
          }}>
            {ghlTotal.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.8125rem', color: DS.colors.textSecondary, marginTop: 8, display: 'block', fontFamily: DS.fonts.body }}>
            Total leads
          </span>
        </div>

        {/* Days to Launch */}
        <div style={{ ...dsCard, textAlign: 'center', padding: '40px 32px' }}>
          <span style={{
            fontFamily: DS.fonts.mono,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: DS.colors.accentPurple,
            fontVariantNumeric: 'tabular-nums',
            display: 'block',
            lineHeight: 1.1,
          }}>
            {daysToLaunch}
          </span>
          <span style={{ fontSize: '0.8125rem', color: DS.colors.textSecondary, marginTop: 8, display: 'block', fontFamily: DS.fonts.body }}>
            Days to AI Universa launch
          </span>
        </div>
      </div>

      <UnfinishedBusinessBar />
      <AdvisorSection live={live} />

      {/* === BUSINESS PULSE === */}
      <div style={{ marginBottom: DS.spacing.sectionGap }}>
        <h2 style={{ ...dsHeading, fontSize: '1.5rem', fontWeight: 400, marginBottom: DS.spacing.elementGap }}>
          Business Pulse
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <KPICard name="Total revenue (MRR)" current={totalRevenue} target={100000} unit="$/mo"
            trend={totalRevenue > 0 ? 'up' : 'flat'} action={totalRevenue > 0 ? `$${totalRevenue.toLocaleString()} this month from Whop` : 'Loading Whop revenue data...'}
            source={revenueData ? 'live' : 'mock'} loading={!revenueData} />
          <KPICard name="Total leads (GHL)" current={ghlTotal} target={1000} unit="contacts"
            trend={ghlRecent > 0 ? 'up' : 'flat'} action={`${ghlRecent} recent signups`}
            source={live.ghlStats.source === 'error' ? 'error' : live.ghlStats.data ? 'live' : 'mock'} loading={live.ghlStats.loading} />
          <KPICard name="WhatsApp members" current={waMembers} target={250} unit={`across ${waGroups} groups`}
            trend={waMembers > 0 ? 'up' : 'flat'} action={`${waFill.toFixed(0)}% fill`}
            source={live.whatsapp.source === 'error' ? 'error' : live.whatsapp.data ? 'live' : 'mock'} loading={live.whatsapp.loading} />
          <KPICard name="Quiz audits" current={quizAudits} target={100} unit="audits"
            trend="flat" action={`${quizLeads} total leads captured`}
            source={live.quiz.source === 'error' ? 'error' : live.quiz.data ? 'live' : 'mock'} loading={live.quiz.loading} />
          <KPICard name="Agent tasks today" current={subCompleted} target={20} unit="completed"
            trend={subCompleted > 0 ? 'up' : 'flat'} action={`${subRunning} currently running`}
            source={live.subagents.source === 'error' ? 'error' : live.subagents.data ? 'live' : 'mock'} loading={live.subagents.loading} />
        </div>
      </div>

      {/* === PRODUCTS === */}
      <div style={{ marginBottom: DS.spacing.sectionGap }}>
        <h2 style={{ ...dsHeading, fontSize: '1.5rem', fontWeight: 400, marginBottom: DS.spacing.elementGap }}>
          Products
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="products-grid">
          <ProductCard
            title="AI Influencer Blueprint"
            subtitle="Evergreen recurring · $97/mo + $497/yr"
            accent={DS.colors.accent}
            href="/dashboard/aib"
            loading={live.ghlStats.loading}
            metrics={[
              { label: 'MRR', value: revenueData ? `$${revenueData.mrr.toLocaleString()}` : '$...', source: revenueData ? 'live' : 'mock' },
              { label: 'AIB leads', value: segments.aib.length, source: live.ghlContacts.data ? 'live' : 'mock' },
              { label: 'Quiz audits', value: quizAudits, source: live.quiz.data ? 'live' : 'mock' },
            ]}
          />
          <ProductCard
            title="AI Universa"
            subtitle="Event launch €899.99 / €2,499.99 + recurring SAAS"
            accent={DS.colors.accentPurple}
            href="/dashboard/aiuniversa"
            loading={live.whatsapp.loading}
            metrics={[
              { label: 'Launch', value: `${daysToLaunch}d`, source: 'live' },
              { label: 'Registrations', value: segments.aius.length, source: live.ghlContacts.data ? 'live' : 'mock' },
              { label: 'WhatsApp', value: `${waMembers}/${waGroups * 5 || 250}`, source: live.whatsapp.data ? 'live' : 'mock' },
            ]}
          />
        </div>
      </div>

      {/* === MAIN GRID === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: DS.spacing.elementGap }} className="command-grid">
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: DS.spacing.elementGap }}>
          <Card>
            <LegacySectionHeader title="Team" badge={<SourceBadge source={state.team.source} />} />
            {state.team.data.map(m => <HumanRow key={m.id} member={m} />)}
          </Card>

          <Card>
            <LegacySectionHeader title="AI Agents" badge={<SourceBadge source={live.subagents.data ? 'live' : state.agents.source} />} />
            {state.agents.data.map(a => <AgentRow key={a.id} agent={a} />)}

            {live.subagents.data && (live.subagents.data.running || []).length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${DS.colors.border}` }}>
                <span style={{ fontSize: '0.625rem', color: DS.colors.accent, fontWeight: 500, letterSpacing: '0.04em' }}>
                  Active tasks
                </span>
                {(live.subagents.data.running || []).map(t => (
                  <div key={t.runId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${DS.colors.border}` }}>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{t.label}</span>
                    <span style={{ fontSize: '0.625rem', color: DS.colors.textMuted, fontFamily: DS.fonts.mono }}>{t.runtime}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* GHL Lead Pipeline */}
          <Card>
            <LegacySectionHeader title="Lead pipeline" badge={<SourceBadge source={live.ghlStats.data ? 'live' : 'mock'} />} />
            {live.ghlStats.loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3].map(i => <LoadingPulse key={i} width={200} />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'AIB leads', count: segments.aib.length, color: DS.colors.accent },
                  { label: 'AIUS leads', count: segments.aius.length, color: DS.colors.accentPurple },
                  { label: 'Untagged', count: segments.other.length, color: DS.colors.textSecondary },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.02)', borderRadius: DS.radius.button, padding: '1rem', textAlign: 'center',
                    border: `1px solid ${DS.colors.border}`,
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, fontFamily: DS.fonts.mono }}>
                      {s.count}
                    </span>
                    <p style={{ fontSize: '0.6875rem', color: DS.colors.textSecondary, marginTop: 4, letterSpacing: '0.02em' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: DS.spacing.elementGap }}>
          {/* WhatsApp */}
          <Card>
            <LegacySectionHeader title="WhatsApp groups" badge={<SourceBadge source={live.whatsapp.data ? 'live' : 'mock'} />} />
            {live.whatsapp.loading ? (
              <LoadingPulse width={150} />
            ) : live.whatsapp.data ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: DS.colors.text, fontFamily: DS.fonts.mono }}>{waMembers}</span>
                  <span style={{ fontSize: '0.75rem', color: DS.colors.textSecondary }}>/ 250 target</span>
                </div>
                <ProgressBar pct={waFill} color={DS.colors.accent} />
                <p style={{ fontSize: '0.625rem', color: DS.colors.textSecondary, marginTop: 6 }}>
                  {waGroups} groups · {waFill.toFixed(0)}% capacity
                </p>
                {live.whatsapp.data.groups && live.whatsapp.data.groups.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {live.whatsapp.data.groups.slice(0, 5).map((g, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: `1px solid ${DS.colors.border}` }}>
                        <span style={{ fontSize: '0.625rem', color: '#777' }}>{g.name}</span>
                        <span style={{ fontSize: '0.625rem', color: g.members >= g.capacity ? DS.colors.error : DS.colors.accent, fontFamily: DS.fonts.mono }}>
                          {g.members}/{g.capacity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: DS.colors.textSecondary }}>No data</p>
            )}
          </Card>

          {/* Quiz Funnel */}
          <Card>
            <LegacySectionHeader title="Quiz funnel" badge={<SourceBadge source={live.quiz.data ? 'live' : live.quiz.error ? 'error' : 'mock'} />} />
            {live.quiz.loading ? <LoadingPulse width={120} /> : live.quiz.data ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: DS.radius.badge, padding: '0.75rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: DS.colors.text, fontFamily: DS.fonts.mono }}>{quizAudits}</span>
                  <p style={{ fontSize: '0.5625rem', color: DS.colors.textSecondary, marginTop: 2 }}>Audits</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: DS.radius.badge, padding: '0.75rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: DS.colors.text, fontFamily: DS.fonts.mono }}>{quizLeads}</span>
                  <p style={{ fontSize: '0.5625rem', color: DS.colors.textSecondary, marginTop: 2 }}>Leads</p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: live.quiz.error ? DS.colors.error : DS.colors.textSecondary }}>
                {live.quiz.error || 'Quiz funnel offline'}
              </p>
            )}
          </Card>

          {/* Data Sources */}
          <Card>
            <LegacySectionHeader title="Data sources" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { name: 'GHL API', connected: !live.ghlStats.error && !!live.ghlStats.data },
                { name: 'WhatsApp', connected: !live.whatsapp.error && !!live.whatsapp.data },
                { name: 'Quiz Funnel', connected: !live.quiz.error && !!live.quiz.data },
                { name: 'Subagents', connected: !live.subagents.error && !!live.subagents.data },
                { name: 'Whop API', connected: !!revenueData },
                { name: 'GA4', connected: true },
              ].map(src => (
                <div key={src.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.375rem 0', borderBottom: `1px solid ${DS.colors.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: src.connected ? DS.colors.accent : DS.colors.error,
                      boxShadow: src.connected ? `0 0 4px ${DS.colors.accent}60` : 'none',
                    }} />
                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 400 }}>{src.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <LegacySectionHeader title="Quick actions" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <QuickActionBtn icon="△" label="AIB Dashboard" desc="Evergreen metrics" href="/dashboard/aib" />
              <QuickActionBtn icon="○" label="AIUS Dashboard" desc="Launch ops" href="/dashboard/aiuniversa" />
              <QuickActionBtn icon="▹" label="Chat" desc="Talk to Jarvis" href="/dashboard/chat" />
              <QuickActionBtn icon="◇" label="War Room" desc="Revenue simulator" href="/dashboard/war-room" />
              <QuickActionBtn icon="◈" label="ClawBot" desc="Agent task board + approvals" href="/dashboard/clawbot" />
              <QuickActionBtn icon="✉" label="Emails" desc="24 launch emails" href="/dashboard/ai-universa/emails" />
            </div>
          </Card>
        </div>
      </div>

      {/* === REAL-TIME VISITORS === */}
      <div style={{ marginTop: DS.spacing.sectionGap }}>
        <h2 style={{ ...dsHeading, fontSize: '1.25rem', fontWeight: 400, marginBottom: DS.spacing.elementGap }}>
          Real Time Visitors
        </h2>
        <RealtimeVisitors property="aib" />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .command-grid { grid-template-columns: 1fr !important; }
          .products-grid { grid-template-columns: 1fr !important; }
          .hero-metrics { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
