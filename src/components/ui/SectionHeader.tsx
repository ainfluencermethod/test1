'use client';

import { DS, dsHeading } from '@/styles/design-system';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  badge,
  rightContent,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: DS.spacing.elementGap,
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            style={{
              ...dsHeading,
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              fontWeight: 500,
              margin: 0,
            }}
          >
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p
            style={{
              fontFamily: DS.fonts.body,
              fontSize: '0.8125rem',
              color: DS.colors.textSecondary,
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}
