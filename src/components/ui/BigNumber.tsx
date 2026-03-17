'use client';

import { DS } from '@/styles/design-system';
import AnimatedCounter from './AnimatedCounter';

interface BigNumberProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: string;
  size?: 'hero' | 'large' | 'medium';
}

const sizes = {
  hero: { number: 'clamp(2.5rem, 6vw, 4.5rem)', label: '0.8125rem' },
  large: { number: 'clamp(1.75rem, 4vw, 3rem)', label: '0.75rem' },
  medium: { number: '1.5rem', label: '0.6875rem' },
};

export default function BigNumber({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  color = DS.colors.text,
  size = 'hero',
}: BigNumberProps) {
  const s = sizes[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <AnimatedCounter
        value={value}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        style={{
          fontSize: s.number,
          fontWeight: 700,
          color,
          lineHeight: 1.1,
        }}
      />
      <span
        style={{
          fontFamily: DS.fonts.body,
          fontSize: s.label,
          color: DS.colors.textSecondary,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
    </div>
  );
}
