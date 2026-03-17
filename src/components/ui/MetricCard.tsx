'use client';

import { DS, dsCard } from '@/styles/design-system';
import BigNumber from './BigNumber';
import Sparkline from './Sparkline';
import Badge from './Badge';

interface MetricCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: string;
  sparkData?: number[];
  source?: 'live' | 'mock' | 'error' | 'cached';
  loading?: boolean;
}

export default function MetricCard({
  value,
  label,
  prefix,
  suffix,
  decimals,
  color = DS.colors.text,
  sparkData,
  source,
  loading,
}: MetricCardProps) {
  return (
    <div
      style={{
        ...dsCard,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Source badge */}
      {source && (
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <Badge type={source} />
        </div>
      )}

      {/* Big number */}
      {loading ? (
        <div style={{
          height: 40,
          width: 120,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.03)',
          animation: 'shimmer 1.5s infinite',
        }} />
      ) : (
        <BigNumber
          value={value}
          label={label}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          color={color}
          size="large"
        />
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 1 && (
        <Sparkline data={sparkData} color={color} width={160} height={28} />
      )}
    </div>
  );
}
