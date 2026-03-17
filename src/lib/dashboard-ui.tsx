'use client';

// ============================================================================
// Shared Dashboard UI Components — Hyperliquid Design System
// ============================================================================

import React from 'react';
import type { DataSource } from './types-unified';
import { DS } from '@/styles/design-system';

// --- Source Badge (LIVE / MOCK / CACHED / ERROR) ---
export function SourceBadge({ source, label }: { source: DataSource | 'error'; label?: string }) {
  const colorMap: Record<string, string> = {
    live: DS.colors.accent,
    cached: DS.colors.warning,
    mock: DS.colors.textMuted,
    error: DS.colors.error,
  };
  const labelMap: Record<string, string> = {
    live: 'Live',
    cached: 'Cached',
    mock: 'Mock',
    error: 'Error',
  };
  const color = colorMap[source] || DS.colors.textMuted;
  const text = label || labelMap[source] || source;
  return (
    <span style={{
      fontSize: '0.5625rem', fontWeight: 600, color, letterSpacing: '0.04em',
      background: `${color}12`, padding: '2px 6px',
      borderRadius: DS.radius.badge, border: `1px solid ${color}25`,
      fontFamily: DS.fonts.body,
    }}>
      {text}
    </span>
  );
}

// --- Loading Skeleton ---
export function LoadingSkeleton({ width = '100%', height = 24 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height, borderRadius: 4,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

// --- Loading Pulse for numbers ---
export function LoadingPulse({ width = 60 }: { width?: number }) {
  return (
    <span style={{
      display: 'inline-block', width, height: 20, borderRadius: 4,
      background: 'rgba(255,255,255,0.03)',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );
}

// --- Section Header ---
export function SectionHeader({ title, badge, rightContent }: { title: string; badge?: React.ReactNode; rightContent?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{
          fontFamily: DS.fonts.heading,
          fontSize: '1.125rem',
          fontWeight: 500,
          color: DS.colors.text,
          letterSpacing: '-0.01em',
        }}>{title}</h2>
        {badge}
      </div>
      {rightContent}
    </div>
  );
}

// --- Card ---
export function Card({ children, style: extraStyle, accent }: { children: React.ReactNode; style?: React.CSSProperties; accent?: string }) {
  return (
    <div style={{
      background: DS.colors.bgCard,
      border: `1px solid ${DS.colors.border}`,
      borderRadius: DS.radius.card,
      padding: DS.spacing.cardPadding,
      ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

// --- KPI Card with loading state ---
export function KPICard({ name, current, target, unit, trend, action, source, loading: isLoading, accentColor }: {
  name: string; current: number; target: number; unit: string;
  trend: 'up' | 'down' | 'flat'; action: string; source: DataSource | 'error';
  loading?: boolean; accentColor?: string;
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? DS.colors.accent : trend === 'down' ? DS.colors.error : DS.colors.textMuted;
  const barColor = accentColor || (pct > 70 ? DS.colors.accent : pct > 30 ? DS.colors.warning : DS.colors.error);

  return (
    <div style={{
      background: DS.colors.bgCard,
      border: `1px solid ${DS.colors.border}`,
      borderRadius: DS.radius.card,
      padding: '1.25rem 1.5rem',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{
          fontSize: '0.6875rem', color: DS.colors.textSecondary,
          letterSpacing: '0.02em', fontWeight: 400,
          fontFamily: DS.fonts.body,
        }}>
          {name}
        </span>
        <SourceBadge source={source} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        {isLoading ? (
          <LoadingPulse width={80} />
        ) : (
          <>
            <span style={{
              fontSize: '1.75rem', fontWeight: 700, color: DS.colors.text,
              fontFamily: DS.fonts.mono, fontVariantNumeric: 'tabular-nums',
            }}>
              {current.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: DS.colors.textMuted }}>/ {target.toLocaleString()} {unit}</span>
            <span style={{ fontSize: '0.75rem', color: trendColor, fontWeight: 600 }}>{trendIcon}</span>
          </>
        )}
      </div>
      <div style={{ height: 2, background: DS.colors.border, borderRadius: 1, marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 1, transition: 'width 0.3s' }} />
      </div>
      <p style={{ fontSize: '0.6875rem', color: DS.colors.textSecondary, lineHeight: 1.4 }}>
        {action}
      </p>
    </div>
  );
}

// --- Quick Action Button ---
export function QuickActionBtn({ icon, label, desc, href, onClick }: {
  icon: string; label: string; desc: string; href?: string; onClick?: () => void;
}) {
  const content = (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${DS.colors.border}`,
      borderRadius: DS.radius.card,
      padding: '1rem',
      cursor: 'pointer',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = DS.colors.border; }}
    >
      <span style={{ fontSize: '0.875rem', color: DS.colors.textSecondary }}>{icon}</span>
      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: DS.colors.text, marginTop: 6, fontFamily: DS.fonts.body }}>{label}</p>
      <p style={{ fontSize: '0.625rem', color: DS.colors.textSecondary, marginTop: 2 }}>{desc}</p>
    </div>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: 'none' }}>{content}</a>;
  }
  return <div onClick={onClick}>{content}</div>;
}

// --- Product Card (for Command Center) ---
export function ProductCard({ title, subtitle, accent, metrics, href, loading: isLoading }: {
  title: string; subtitle: string; accent: string;
  metrics: { label: string; value: string | number; source: DataSource | 'error' }[];
  href: string; loading?: boolean;
}) {
  return (
    <a href={href} style={{
      display: 'block', textDecoration: 'none',
      background: DS.colors.bgCard,
      border: `1px solid ${DS.colors.border}`,
      borderRadius: DS.radius.card,
      padding: DS.spacing.cardPadding,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = DS.colors.border; }}
    >
      <h3 style={{
        fontFamily: DS.fonts.heading,
        fontSize: '1.25rem',
        fontWeight: 500,
        color: accent,
        letterSpacing: '-0.01em',
        marginBottom: 4,
      }}>{title}</h3>
      <p style={{ fontSize: '0.6875rem', color: DS.colors.textSecondary, marginBottom: 20 }}>{subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', color: DS.colors.textSecondary }}>{m.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isLoading ? (
                <LoadingPulse width={40} />
              ) : (
                <span style={{
                  fontSize: '0.875rem', fontWeight: 700, color: DS.colors.text,
                  fontFamily: DS.fonts.mono, fontVariantNumeric: 'tabular-nums',
                }}>
                  {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                </span>
              )}
              <SourceBadge source={m.source} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <span style={{ fontSize: '0.75rem', color: accent, fontWeight: 500 }}>Open dashboard →</span>
      </div>
    </a>
  );
}

// --- Progress Bar ---
export function ProgressBar({ pct, color = DS.colors.accent, height = 4 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ height, borderRadius: height / 2, background: DS.colors.border, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: height / 2, width: `${Math.max(1, Math.min(100, pct))}%`,
        background: color, transition: 'width 0.5s ease',
      }} />
    </div>
  );
}

// --- Countdown Display ---
export function CountdownDisplay({ targetDate, label, color = DS.colors.accentPurple }: { targetDate: Date; label: string; color?: string }) {
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div style={{
      background: `${color}08`,
      border: `1px solid ${color}20`,
      borderRadius: DS.radius.card,
      padding: '12px 20px',
      textAlign: 'center',
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <span style={{
        fontSize: '1.75rem', fontWeight: 700, color,
        fontFamily: DS.fonts.mono, fontVariantNumeric: 'tabular-nums',
      }}>
        {daysLeft}
      </span>
      <span style={{ fontSize: '0.5625rem', color, fontWeight: 500, letterSpacing: '0.04em', fontFamily: DS.fonts.body }}>
        {label}
      </span>
    </div>
  );
}

// --- CSS Keyframes (inject once) ---
export function DashboardAnimations() {
  return (
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }
    `}</style>
  );
}
