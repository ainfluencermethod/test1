'use client';

import { useState, useEffect } from 'react';
import {
  LAUNCH_EVENTS, PHASE_COLORS, PHASE_LABELS,
  getTimelineStatus, getEventStatus,
  type TimelineEvent,
} from '@/lib/launch-timeline-data';

// Phase icons
const PHASE_ICONS: Record<string, string> = {
  'pre-event': '📧',
  'live-event': '🎥',
  'cart-open': '🛒',
};

const STATUS_STYLE = {
  past: { opacity: 0.45, iconBg: 'rgba(255,255,255,0.06)' },
  today: { opacity: 1, iconBg: 'rgba(232, 227, 66, 0.2)' },
  future: { opacity: 1, iconBg: 'rgba(255,255,255,0.04)' },
};

interface LaunchTimelineProps {
  compact?: boolean;
}

export default function LaunchTimeline({ compact = false }: LaunchTimelineProps) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const status = getTimelineStatus(now);

  // Group events by phase
  const phases = ['pre-event', 'live-event', 'cart-open'] as const;
  const grouped = phases.map(phase => ({
    phase,
    events: LAUNCH_EVENTS.filter(e => e.phase === phase),
  }));

  if (compact) {
    return <CompactTimeline now={now} status={status} />;
  }

  return (
    <div style={{
      background: '#13151A',
      borderRadius: 16,
      border: '1px solid rgba(232, 227, 66, 0.12)',
      padding: '20px 24px',
      overflow: 'hidden',
    }}>
      {/* Header with countdowns */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e8e342', letterSpacing: '0.04em', margin: 0 }}>
            🗓️ LAUNCH TIMELINE
          </h3>
          <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: 4 }}>
            March 25 → April 21, 2026
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {status.nextMilestone && (
            <CountdownPill
              label="Next Milestone"
              days={status.nextMilestone.daysAway}
              subtitle={status.nextMilestone.title}
              color="#e8e342"
            />
          )}
          <CountdownPill
            label="Launch Day"
            days={status.daysUntilLaunch}
            color="#10B981"
          />
        </div>
      </div>

      {/* Phase sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {grouped.map(({ phase, events }) => (
          <PhaseSection key={phase} phase={phase} events={events} now={now} />
        ))}
      </div>
    </div>
  );
}

function CountdownPill({ label, days, subtitle, color }: { label: string; days: number; subtitle?: string; color: string }) {
  return (
    <div style={{
      background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: 10,
      padding: '8px 14px',
      textAlign: 'center',
      minWidth: 90,
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '1.5rem',
        fontWeight: 800,
        color,
        display: 'block',
        lineHeight: 1,
      }}>
        {days}
      </span>
      <span style={{ fontSize: '0.5rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginTop: 2 }}>
        {label}
      </span>
      {subtitle && (
        <span style={{ fontSize: '0.5rem', color: `${color}99`, display: 'block', marginTop: 1 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

function PhaseSection({ phase, events, now }: { phase: string; events: TimelineEvent[]; now: Date }) {
  const colors = PHASE_COLORS[phase];
  const label = PHASE_LABELS[phase];
  const icon = PHASE_ICONS[phase];

  return (
    <div>
      {/* Phase header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        padding: '6px 10px', borderRadius: 8,
        background: colors.bg, border: `1px solid ${colors.border}`,
      }}>
        <span style={{ fontSize: '0.75rem' }}>{icon}</span>
        <span style={{
          fontSize: '0.625rem', fontWeight: 800, color: colors.text,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {label}
        </span>
        <span style={{ fontSize: '0.5rem', color: '#6B7280', marginLeft: 'auto' }}>
          {events[0]?.date.slice(5)} → {events[events.length - 1]?.date.slice(5)}
        </span>
      </div>

      {/* Events */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 8 }}>
        {events.map((event) => (
          <TimelineItem key={event.date} event={event} now={now} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ event, now }: { event: TimelineEvent; now: Date }) {
  const eventStatus = getEventStatus(event.date, now);
  const colors = PHASE_COLORS[event.phase];
  const style = STATUS_STYLE[eventStatus];

  const dateObj = new Date(event.date + 'T00:00:00');
  const dayStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '6px 8px', borderRadius: 6,
      opacity: style.opacity,
      background: eventStatus === 'today' ? 'rgba(232, 227, 66, 0.06)' : 'transparent',
      border: eventStatus === 'today' ? '1px solid rgba(232, 227, 66, 0.2)' : '1px solid transparent',
      position: 'relative',
    }}>
      {/* Timeline dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 14, paddingTop: 2 }}>
        <div style={{
          width: eventStatus === 'today' ? 10 : 8,
          height: eventStatus === 'today' ? 10 : 8,
          borderRadius: '50%',
          background: eventStatus === 'past' ? '#4B5563' : eventStatus === 'today' ? '#e8e342' : colors.text,
          boxShadow: eventStatus === 'today' ? '0 0 8px rgba(232, 227, 66, 0.5)' : 'none',
        }} />
      </div>

      {/* Date */}
      <div style={{ minWidth: 65, flexShrink: 0 }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 600,
          color: eventStatus === 'today' ? '#e8e342' : eventStatus === 'past' ? '#4B5563' : '#9CA3AF',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {dayStr}
        </span>
        <span style={{ fontSize: '0.5rem', color: '#4B5563', display: 'block' }}>{weekday}</span>
      </div>

      {/* Status icon */}
      <div style={{ minWidth: 18, textAlign: 'center' }}>
        {eventStatus === 'past' ? (
          <span style={{ fontSize: '0.75rem' }}>✅</span>
        ) : eventStatus === 'today' ? (
          <span style={{ fontSize: '0.75rem' }}>⚡</span>
        ) : (
          <span style={{ fontSize: '0.75rem' }}>⬜</span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600,
          color: eventStatus === 'today' ? '#e8e342' : eventStatus === 'past' ? '#6B7280' : 'rgba(255,255,255,0.92)',
          textDecoration: eventStatus === 'past' ? 'line-through' : 'none',
        }}>
          {event.title}
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {event.items.map((item, i) => (
            <span key={i} style={{
              fontSize: '0.5625rem',
              color: eventStatus === 'past' ? '#4B5563' : '#6B7280',
              padding: '1px 6px',
              borderRadius: 4,
              background: eventStatus === 'today' ? 'rgba(232, 227, 66, 0.08)' : 'rgba(255,255,255,0.03)',
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Compact version for analytics page ─── */
function CompactTimeline({ now, status }: { now: Date; status: ReturnType<typeof getTimelineStatus> }) {
  // Show only upcoming + today events (max 5)
  const upcoming = LAUNCH_EVENTS.filter(e => {
    const s = getEventStatus(e.date, now);
    return s === 'today' || s === 'future';
  }).slice(0, 5);

  const recent = LAUNCH_EVENTS.filter(e => getEventStatus(e.date, now) === 'past').slice(-2);

  return (
    <div style={{
      background: '#1A1D23',
      borderRadius: 12,
      border: '1px solid rgba(232, 227, 66, 0.12)',
      padding: '16px 20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e342' }}>
          🗓️ Launch Timeline
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {status.nextMilestone && (
            <span style={{
              fontSize: '0.625rem', color: '#e8e342',
              background: 'rgba(232, 227, 66, 0.1)',
              padding: '2px 8px', borderRadius: 6,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            }}>
              {status.nextMilestone.daysAway}d → {status.nextMilestone.title}
            </span>
          )}
          <span style={{
            fontSize: '0.625rem', color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '2px 8px', borderRadius: 6,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
          }}>
            {status.daysUntilLaunch}d to launch
          </span>
        </div>
      </div>

      {/* Recent past (dimmed) */}
      {recent.map(event => {
        const colors = PHASE_COLORS[event.phase];
        return (
          <div key={event.date} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', opacity: 0.4,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4B5563' }} />
            <span style={{ fontSize: '0.625rem', color: '#4B5563', fontFamily: "'JetBrains Mono', monospace", minWidth: 48 }}>
              {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span style={{ fontSize: '0.625rem', color: '#4B5563', textDecoration: 'line-through' }}>
              ✅ {event.title}
            </span>
          </div>
        );
      })}

      {/* Upcoming */}
      {upcoming.map(event => {
        const eventStatus = getEventStatus(event.date, now);
        const colors = PHASE_COLORS[event.phase];
        const isToday = eventStatus === 'today';
        return (
          <div key={event.date} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
            background: isToday ? 'rgba(232, 227, 66, 0.04)' : 'transparent',
            borderRadius: 4,
          }}>
            <div style={{
              width: isToday ? 8 : 6, height: isToday ? 8 : 6, borderRadius: '50%',
              background: isToday ? '#e8e342' : colors.text,
              boxShadow: isToday ? '0 0 6px rgba(232, 227, 66, 0.4)' : 'none',
            }} />
            <span style={{
              fontSize: '0.625rem',
              color: isToday ? '#e8e342' : '#6B7280',
              fontFamily: "'JetBrains Mono', monospace",
              minWidth: 48,
              fontWeight: isToday ? 700 : 400,
            }}>
              {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span style={{
              fontSize: '0.625rem',
              color: isToday ? '#e8e342' : 'rgba(255,255,255,0.7)',
              fontWeight: isToday ? 600 : 400,
            }}>
              {isToday ? '⚡ ' : ''}{event.title}
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: '0.5rem',
              color: colors.text, background: colors.bg,
              padding: '1px 5px', borderRadius: 3,
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {PHASE_LABELS[event.phase]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
