'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { DashboardAnimations } from '@/lib/dashboard-ui';

// ============================================================================
// CLAW Daily Briefing Page
// ============================================================================

const ACCENT = '#D4A843';
const CARD_BG = '#13151A';

interface BriefingPriority {
  priority: string;
  why: string;
  urgency: 'critical' | 'high' | 'normal';
}

interface MetricChange {
  metric: string;
  current: string;
  change: string;
  direction: 'up' | 'down' | 'flat';
}

interface BriefingAlert {
  type: 'warning' | 'info' | 'success';
  message: string;
}

interface Briefing {
  greeting: string;
  topPriorities: BriefingPriority[];
  metricChanges: MetricChange[];
  alerts: BriefingAlert[];
  oneLiner: string;
}

const urgencyColors: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'CRITICAL' },
  high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'HIGH' },
  normal: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'NORMAL' },
};

const alertStyles: Record<string, { emoji: string; color: string; bg: string }> = {
  warning: { emoji: '⚠️', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
  info: { emoji: 'ℹ️', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)' },
  success: { emoji: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.06)' },
};

const directionEmoji: Record<string, string> = {
  up: '📈',
  down: '📉',
  flat: '➡️',
};

export default function BriefingPage() {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/claw/daily-briefing', { signal: AbortSignal.timeout(60000) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setBriefing(data.briefing);
      setGeneratedAt(data.generatedAt);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load briefing');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <DashboardAnimations />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/command" style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none' }}>
          ← Command Center
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: ACCENT, letterSpacing: '-0.02em', marginTop: 8 }}>
          ☀️ Daily Briefing
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#555', marginTop: 4 }}>
          CLAW powered morning intelligence report
        </p>
      </div>

      {/* Generate Button */}
      {!briefing && !loading && (
        <button
          onClick={fetchBriefing}
          style={{
            width: '100%', height: 64, border: 'none', borderRadius: 12, cursor: 'pointer',
            background: `linear-gradient(135deg, ${ACCENT} 0%, #E8C547 100%)`,
            color: '#1A1A1A', fontSize: '1.125rem', fontWeight: 800,
            letterSpacing: '0.02em', transition: 'all 0.3s',
            boxShadow: `0 4px 20px rgba(212,168,67,0.3)`,
          }}
        >
          ☀️ GENERATE TODAY&apos;S BRIEFING
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '3rem 0',
          background: CARD_BG, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>🧠</div>
          <p style={{ fontSize: '0.875rem', color: '#888' }}>CLAW is analyzing all data sources...</p>
          <p style={{ fontSize: '0.625rem', color: '#555', marginTop: 4 }}>This may take up to 30 seconds</p>
          <style>{`@keyframes pulse { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginTop: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#EF4444', fontWeight: 600 }}>❌ {error}</p>
          <button
            onClick={fetchBriefing}
            style={{
              marginTop: 8, padding: '6px 16px', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6, background: 'transparent', color: '#EF4444',
              fontSize: '0.75rem', cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Briefing Content */}
      {briefing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
          {/* Greeting */}
          <div style={{
            padding: '24px', borderRadius: 12, background: CARD_BG,
            border: `1px solid ${ACCENT}30`,
            borderLeft: `4px solid ${ACCENT}`,
          }}>
            <p style={{ fontSize: '1.125rem', color: '#EDEDED', fontWeight: 600, lineHeight: 1.5 }}>
              {briefing.greeting}
            </p>
            {briefing.oneLiner && (
              <p style={{ fontSize: '0.875rem', color: ACCENT, fontWeight: 500, marginTop: 8 }}>
                🎯 {briefing.oneLiner}
              </p>
            )}
            {generatedAt && (
              <p style={{ fontSize: '0.5625rem', color: '#444', marginTop: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                Generated {new Date(generatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Top Priorities */}
          {briefing.topPriorities && briefing.topPriorities.length > 0 && (
            <div style={{
              padding: '20px', borderRadius: 12, background: CARD_BG,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EDEDED', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🏆 Top Priorities
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {briefing.topPriorities.map((p, i) => {
                  const style = urgencyColors[p.urgency] || urgencyColors.normal;
                  return (
                    <div key={i} style={{
                      padding: '14px 16px', borderRadius: 8,
                      background: style.bg, border: `1px solid ${style.color}30`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: style.color }}>#{i + 1}</span>
                        <span style={{
                          fontSize: '0.5rem', fontWeight: 800, color: style.color,
                          padding: '2px 6px', borderRadius: 3, background: `${style.color}20`,
                          letterSpacing: '0.08em',
                        }}>
                          {style.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#EDEDED', fontWeight: 600, lineHeight: 1.4 }}>
                        {p.priority}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: '#888', marginTop: 4, lineHeight: 1.3 }}>
                        {p.why}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metric Changes */}
          {briefing.metricChanges && briefing.metricChanges.length > 0 && (
            <div style={{
              padding: '20px', borderRadius: 12, background: CARD_BG,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EDEDED', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📊 Key Metrics
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {briefing.metricChanges.map((m, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span>{directionEmoji[m.direction] || '➡️'}</span>
                      <span style={{ fontSize: '0.625rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                        {m.metric}
                      </span>
                    </div>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#EDEDED' }}>
                      {m.current}
                    </span>
                    <p style={{
                      fontSize: '0.625rem', marginTop: 2, fontWeight: 600,
                      color: m.direction === 'up' ? '#10B981' : m.direction === 'down' ? '#EF4444' : '#888',
                    }}>
                      {m.change}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {briefing.alerts && briefing.alerts.length > 0 && (
            <div style={{
              padding: '20px', borderRadius: 12, background: CARD_BG,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EDEDED', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🔔 Alerts
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {briefing.alerts.map((a, i) => {
                  const s = alertStyles[a.type] || alertStyles.info;
                  return (
                    <div key={i} style={{
                      padding: '10px 14px', borderRadius: 6,
                      background: s.bg, border: `1px solid ${s.color}20`,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span>{s.emoji}</span>
                      <p style={{ fontSize: '0.8125rem', color: s.color, lineHeight: 1.4 }}>{a.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchBriefing}
            disabled={loading}
            style={{
              width: '100%', padding: '12px', border: `1px solid ${ACCENT}40`,
              borderRadius: 8, background: 'transparent', color: ACCENT,
              fontSize: '0.8125rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🔄 Regenerate Briefing
          </button>
        </div>
      )}
    </div>
  );
}
