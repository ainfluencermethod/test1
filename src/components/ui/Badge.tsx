'use client';

import { DS } from '@/styles/design-system';

type BadgeType = 'live' | 'mock' | 'error' | 'cached' | 'pending' | 'success' | 'warning';

interface BadgeProps {
  type: BadgeType;
  label?: string;
}

const config: Record<BadgeType, { color: string; text: string; dot?: boolean }> = {
  live:    { color: DS.colors.accent,  text: 'Live',    dot: true },
  mock:    { color: DS.colors.textMuted, text: 'Mock' },
  error:   { color: DS.colors.error,  text: 'Error' },
  cached:  { color: DS.colors.warning, text: 'Cached' },
  pending: { color: DS.colors.warning, text: 'Pending', dot: true },
  success: { color: DS.colors.success, text: 'Done' },
  warning: { color: DS.colors.warning, text: 'Warning' },
};

export default function Badge({ type, label }: BadgeProps) {
  const c = config[type] || config.mock;
  const text = label || c.text;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: '0.5625rem',
        fontWeight: 600,
        color: c.color,
        letterSpacing: '0.04em',
        padding: '3px 8px',
        borderRadius: DS.radius.badge,
        background: `${c.color}12`,
        border: `1px solid ${c.color}25`,
        fontFamily: DS.fonts.body,
      }}
    >
      {c.dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: c.color,
            boxShadow: `0 0 6px ${c.color}60`,
            flexShrink: 0,
          }}
        />
      )}
      {text}
    </span>
  );
}
