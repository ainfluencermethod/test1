// ============================================================================
// Design System — Hyperliquid-Inspired Premium Dashboard
// ============================================================================
// Near-black backgrounds, serif headlines, sage green accents,
// massive negative space, data as hero, minimal chrome.
// ============================================================================

export const DS = {
  colors: {
    bg: '#050505',
    bgCard: '#0A0A0A',
    bgCardHover: '#0F0F0F',
    border: 'rgba(255,255,255,0.04)',
    borderHover: 'rgba(255,255,255,0.08)',
    accent: '#4ADE80',        // sage green
    accentGold: '#D4A574',    // warm gold for revenue
    accentPurple: '#A78BFA',  // for AI Universa
    text: '#E8E8E8',
    textSecondary: '#666666',
    textMuted: '#333333',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  spacing: {
    cardPadding: '32px',
    sectionGap: '48px',
    elementGap: '24px',
  },
  radius: {
    card: '16px',
    button: '8px',
    badge: '6px',
  },
} as const;

// Convenience: inline style helpers
export const dsCard = {
  background: DS.colors.bgCard,
  border: `1px solid ${DS.colors.border}`,
  borderRadius: DS.radius.card,
  padding: DS.spacing.cardPadding,
  transition: 'border-color 0.2s ease',
} as const;

export const dsHeading = {
  fontFamily: DS.fonts.heading,
  color: DS.colors.text,
  letterSpacing: '-0.01em',
  lineHeight: 1.15,
} as const;
