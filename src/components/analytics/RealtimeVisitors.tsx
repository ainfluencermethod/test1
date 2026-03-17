'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Real-Time Visitors Widget — GA4 Live Data
// AIB Brand: #0D0F11 bg, #1A1D21 cards, #4ECDC4 accent, white/#B8B8B8 text
// Auto-refreshes every 30s. Shows placeholder when GA4 not configured.
// ============================================================================

// --- Types ---

interface RealtimePageEntry {
  page: string;
  activeUsers: number;
}

interface RealtimeSourceEntry {
  source: string;
  activeUsers: number;
}

interface RealtimeDeviceEntry {
  category: string;
  activeUsers: number;
}

interface RealtimeCountryEntry {
  country: string;
  activeUsers: number;
}

interface RealtimeData {
  activeUsers: number;
  topPages: RealtimePageEntry[];
  sources: RealtimeSourceEntry[];
  devices: RealtimeDeviceEntry[];
  countries: RealtimeCountryEntry[];
}

interface ApiResponse {
  success: boolean;
  data?: RealtimeData;
  error?: string;
  cached?: boolean;
  lastUpdated?: string;
}

// --- Brand Colors ---

const BRAND = {
  bg: '#0D0F11',
  card: '#1A1D21',
  cardHover: '#22262C',
  accent: '#4ECDC4',
  accentDim: 'rgba(78, 205, 196, 0.15)',
  accentBorder: 'rgba(78, 205, 196, 0.25)',
  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
  textMuted: '#666666',
  border: 'rgba(255, 255, 255, 0.06)',
  error: '#F87171',
  errorBg: 'rgba(248, 113, 113, 0.08)',
  pulse: 'rgba(78, 205, 196, 0.4)',
} as const;

// --- Device Icons ---

const DEVICE_ICONS: Record<string, string> = {
  desktop: '🖥️',
  mobile: '📱',
  tablet: '📱',
};

// --- Helpers ---

function formatSourceName(source: string): string {
  if (source === '(direct)' || source === '(not set)') return 'Direct';
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function truncatePage(page: string, maxLen: number = 40): string {
  if (page.length <= maxLen) return page;
  return page.slice(0, maxLen - 3) + '...';
}

// --- Sub Components ---

function PulsingDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: BRAND.accent,
          opacity: 0.75,
          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: BRAND.accent,
        }}
      />
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4
      style={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: BRAND.textMuted,
        margin: '0 0 10px 0',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </h4>
  );
}

function BarRow({
  label,
  value,
  maxValue,
  icon,
}: {
  label: string;
  value: number;
  maxValue: number;
  icon?: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      {icon && <span style={{ fontSize: '0.75rem', width: 18, textAlign: 'center' as const }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: BRAND.text,
              fontFamily: "'Inter', sans-serif",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              color: BRAND.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              marginLeft: 8,
              flexShrink: 0,
            }}
          >
            {value}
          </span>
        </div>
        <div
          style={{
            height: 3,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.max(pct, 2)}%`,
              backgroundColor: BRAND.accent,
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// --- Loading State ---

function LoadingState() {
  return (
    <div
      style={{
        background: BRAND.card,
        borderRadius: 16,
        border: `1px solid ${BRAND.border}`,
        padding: '32px',
        textAlign: 'center' as const,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `2px solid ${BRAND.accentBorder}`,
          borderTopColor: BRAND.accent,
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <p style={{ color: BRAND.textSecondary, fontSize: '0.8125rem', margin: 0, fontFamily: "'Inter', sans-serif" }}>
        Loading real time data...
      </p>
    </div>
  );
}

// --- Error State ---

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        background: BRAND.card,
        borderRadius: 16,
        border: `1px solid rgba(248, 113, 113, 0.15)`,
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: BRAND.error, fontSize: '0.8125rem', fontWeight: 500, margin: '0 0 4px 0', fontFamily: "'Inter', sans-serif" }}>
            Real time data unavailable
          </p>
          <p style={{ color: BRAND.textMuted, fontSize: '0.75rem', margin: '0 0 12px 0', fontFamily: "'Inter', sans-serif" }}>
            {message}
          </p>
          <button
            onClick={onRetry}
            style={{
              background: BRAND.errorBg,
              border: `1px solid rgba(248, 113, 113, 0.2)`,
              borderRadius: 8,
              color: BRAND.error,
              padding: '6px 16px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Not Configured Placeholder ---

function NotConfiguredState() {
  return (
    <div
      style={{
        background: BRAND.card,
        borderRadius: 16,
        border: `1px dashed ${BRAND.accentBorder}`,
        padding: '32px',
        textAlign: 'center' as const,
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>📊</div>
      <h3
        style={{
          color: BRAND.text,
          fontSize: '1rem',
          fontWeight: 600,
          margin: '0 0 8px 0',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Connect GA4
      </h3>
      <p
        style={{
          color: BRAND.textSecondary,
          fontSize: '0.8125rem',
          margin: '0 0 16px 0',
          fontFamily: "'Inter', sans-serif",
          maxWidth: 320,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.5,
        }}
      >
        Set up Google Analytics 4 credentials to see real time visitor data. See GA4_SETUP.md for configuration steps.
      </p>
      <div
        style={{
          display: 'inline-block',
          background: BRAND.accentDim,
          border: `1px solid ${BRAND.accentBorder}`,
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.75rem',
          color: BRAND.accent,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        ga4-aib-adc.json required
      </div>
    </div>
  );
}

// --- Main Component ---

interface RealtimeVisitorsProps {
  property?: 'aib' | 'aiuniversa';
  refreshInterval?: number;
}

export default function RealtimeVisitors({
  property = 'aib',
  refreshInterval = 30_000,
}: RealtimeVisitorsProps) {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/realtime?property=${property}`);
      const json: ApiResponse = await res.json();

      if (json.success && json.data) {
        setData(json.data);
        setError(null);
        setNotConfigured(false);
        setLastUpdated(json.lastUpdated || new Date().toISOString());
      } else {
        const errMsg = json.error || 'Unknown error';
        // Detect "not configured" vs actual API errors
        if (errMsg.includes('ENOENT') || errMsg.includes('credentials') || errMsg.includes('not found')) {
          setNotConfigured(true);
          setError(null);
        } else {
          setError(errMsg);
          setNotConfigured(false);
        }
      }
    } catch (fetchErr) {
      setError(fetchErr instanceof Error ? fetchErr.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [property]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Inject keyframe animations
  useEffect(() => {
    const styleId = 'realtime-visitors-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes ping { 0% { transform: scale(1); opacity: 0.75; } 75%, 100% { transform: scale(2); opacity: 0; } }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }, []);

  if (loading) return <LoadingState />;
  if (notConfigured) return <NotConfiguredState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  const maxPageUsers = Math.max(...data.topPages.map((p) => p.activeUsers), 1);
  const maxSourceUsers = Math.max(...data.sources.map((s) => s.activeUsers), 1);
  const totalDeviceUsers = data.devices.reduce((sum, d) => sum + d.activeUsers, 0) || 1;

  return (
    <div
      style={{
        background: BRAND.card,
        borderRadius: 16,
        border: `1px solid ${BRAND.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header with active users count */}
      <div
        style={{
          padding: '24px 24px 20px',
          borderBottom: `1px solid ${BRAND.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PulsingDot />
          <div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: BRAND.text,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
              }}
            >
              {data.activeUsers}
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: BRAND.textSecondary,
                fontFamily: "'Inter', sans-serif",
                marginTop: 2,
              }}
            >
              active {data.activeUsers === 1 ? 'user' : 'users'} right now
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: '0.625rem',
            color: BRAND.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {lastUpdated
            ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}`
            : 'Live'}
        </div>
      </div>

      {/* Grid: Pages + Sources + Devices + Countries */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 0,
        }}
      >
        {/* Top Pages */}
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${BRAND.border}`, borderBottom: `1px solid ${BRAND.border}` }}>
          <SectionTitle>Top Pages</SectionTitle>
          {data.topPages.length === 0 ? (
            <p style={{ color: BRAND.textMuted, fontSize: '0.75rem', margin: 0 }}>No page data</p>
          ) : (
            data.topPages.slice(0, 5).map((page) => (
              <BarRow
                key={page.page}
                label={truncatePage(page.page)}
                value={page.activeUsers}
                maxValue={maxPageUsers}
              />
            ))
          )}
        </div>

        {/* Traffic Sources */}
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${BRAND.border}`, borderBottom: `1px solid ${BRAND.border}` }}>
          <SectionTitle>Traffic Sources</SectionTitle>
          {data.sources.length === 0 ? (
            <p style={{ color: BRAND.textMuted, fontSize: '0.75rem', margin: 0 }}>No source data</p>
          ) : (
            data.sources.slice(0, 5).map((source) => (
              <BarRow
                key={source.source}
                label={formatSourceName(source.source)}
                value={source.activeUsers}
                maxValue={maxSourceUsers}
              />
            ))
          )}
        </div>

        {/* Devices */}
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${BRAND.border}`, borderBottom: `1px solid ${BRAND.border}` }}>
          <SectionTitle>Devices</SectionTitle>
          {data.devices.length === 0 ? (
            <p style={{ color: BRAND.textMuted, fontSize: '0.75rem', margin: 0 }}>No device data</p>
          ) : (
            data.devices.map((device) => {
              const pct = Math.round((device.activeUsers / totalDeviceUsers) * 100);
              return (
                <BarRow
                  key={device.category}
                  label={`${device.category.charAt(0).toUpperCase() + device.category.slice(1)} (${pct}%)`}
                  value={device.activeUsers}
                  maxValue={Math.max(...data.devices.map((d) => d.activeUsers), 1)}
                  icon={DEVICE_ICONS[device.category.toLowerCase()] || '💻'}
                />
              );
            })
          )}
        </div>

        {/* Countries */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.border}` }}>
          <SectionTitle>Top Countries</SectionTitle>
          {data.countries.length === 0 ? (
            <p style={{ color: BRAND.textMuted, fontSize: '0.75rem', margin: 0 }}>No geo data</p>
          ) : (
            data.countries.slice(0, 5).map((country) => (
              <BarRow
                key={country.country}
                label={country.country}
                value={country.activeUsers}
                maxValue={Math.max(...data.countries.map((c) => c.activeUsers), 1)}
                icon="🌍"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
