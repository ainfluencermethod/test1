'use client';

import { useEffect, useRef } from 'react';
import { DS } from '@/styles/design-system';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export default function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 3,
  color = DS.colors.accent,
  label,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 0.6s ease-out';
      circle.style.strokeDashoffset = `${offset}`;
    });
  }, [circumference, offset]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: DS.fonts.mono,
            fontSize: size > 48 ? '0.875rem' : '0.6875rem',
            fontWeight: 700,
            color: DS.colors.text,
          }}
        >
          {Math.round(progress)}%
        </span>
        {label && (
          <span
            style={{
              fontSize: '0.4375rem',
              color: DS.colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
