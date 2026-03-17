'use client';

import { useEffect, useRef } from 'react';
import { DS } from '@/styles/design-system';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showGradient?: boolean;
}

export default function Sparkline({
  data,
  width = 120,
  height = 32,
  color = DS.colors.accent,
  strokeWidth = 1.5,
  showGradient = true,
}: SparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const gradientId = `spark-grad-${Math.random().toString(36).slice(2, 8)}`;

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    // trigger animation
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 0.8s ease-out';
      path.style.strokeDashoffset = '0';
    });
  }, [data]);

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }));

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Area path for gradient fill
  const areaD = `${d} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGradient && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
