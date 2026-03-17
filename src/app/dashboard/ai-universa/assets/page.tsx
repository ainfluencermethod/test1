"use client";

import { useState, useMemo } from "react";
import { DS, dsCard, dsHeading } from "@/styles/design-system";

// ============================================================================
// Types
// ============================================================================

type AssetStatus = "ready" | "built" | "missing" | "review" | "live" | "drive" | "queued";
type AssetType = "LP" | "VSL" | "Email" | "WhatsApp" | "Ad" | "Copy" | "Typeform" | "Design" | "Backend" | "Form" | "Ads" | "Video" | "PDF" | "Config";
type Phase = "pre-event" | "event" | "cart-open";

interface Asset {
  name: string;
  type: AssetType;
  status: AssetStatus;
  location: string;
  driveLink?: string;
  isExternal?: boolean;
  lastUpdated?: string;
}

// ============================================================================
// Data
// ============================================================================

const preEventAssets: Asset[] = [
  { name: "LP 1 Registration Page", type: "LP", status: "ready", location: "/tmp/boss-lp-code/dist/", lastUpdated: "2026-03-15" },
  { name: "LP 2 Survey/VSL Page", type: "LP", status: "built", location: "clawbot/missions/007-pre-event-funnel/deploy/lp2-survey.html", lastUpdated: "2026-03-16" },
  { name: "LP 3 Success Page", type: "LP", status: "built", location: "clawbot/missions/007-pre-event-funnel/deploy/lp3-success.html", lastUpdated: "2026-03-16" },
  { name: "Mini VSL Script (3 min)", type: "VSL", status: "ready", location: "clawbot/missions/008-mini-vsl/teleprompter-version-final.md", lastUpdated: "2026-03-16" },
  { name: "WhatsApp Redirect", type: "Backend", status: "built", location: "clawbot/missions/007-pre-event-funnel/deploy/whatsapp-redirect.php", lastUpdated: "2026-03-16" },
  { name: "Typeform Survey", type: "Form", status: "live", location: "https://form.typeform.com/to/01KKVTSDYYVP5XTHPZ46HKJ2JG", isExternal: true, lastUpdated: "2026-03-14" },
  { name: "Pre Event Email 1 (Mar 25)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-01.html", lastUpdated: "2026-03-15" },
  { name: "Pre Event Email 2 (Mar 27)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-02.html", lastUpdated: "2026-03-15" },
  { name: "Pre Event Email 3 (Apr 1)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-03.html", lastUpdated: "2026-03-15" },
  { name: "Pre Event Email 4 (Apr 3)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-04.html", lastUpdated: "2026-03-15" },
  { name: "Pre Event Email 5 (Apr 10)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-05.html", lastUpdated: "2026-03-15" },
  { name: "Pre Event Email 6 (Apr 12)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-06.html", lastUpdated: "2026-03-15" },
  { name: "Pre Event Email 7 (Apr 13)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-07.html", lastUpdated: "2026-03-15" },
  { name: "Pre Event Email 8 (Apr 14)", type: "Email", status: "built", location: "clawbot/missions/005-email-sequence/deploy/email-08.html", lastUpdated: "2026-03-15" },
  { name: "AI Readiness Report System", type: "Backend", status: "live", location: "https://ainfluencerblueprint.com/api/typeform-report.php", isExternal: true, lastUpdated: "2026-03-14" },
  { name: "AI Coach Chatbot", type: "Backend", status: "built", location: "clawbot/missions/002-readiness-coach/deploy/", lastUpdated: "2026-03-12" },
  { name: "Ad Creatives", type: "Ads", status: "drive", location: "Ad Creatives Folder", driveLink: "https://drive.google.com/drive/folders/1lGi-nDXhd-Y8-ije86au0nOx4Q3jswc6?usp=sharing", lastUpdated: "2026-03-16" },
  { name: "WhatsApp Welcome Messages", type: "Copy", status: "queued", location: "auto-005 in autonomous queue" },
  { name: "Trailer", type: "Video", status: "missing", location: "Boss filming" },
  { name: "Keynote", type: "Video", status: "missing", location: "Boss filming" },
];

const eventAssets: Asset[] = [
  { name: "Event Email E1 (Apr 15 AM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/event-e1.html", lastUpdated: "2026-03-16" },
  { name: "Event Email E2 (Apr 15 PM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/event-e2.html", lastUpdated: "2026-03-16" },
  { name: "Event Email E3 (Apr 16 AM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/event-e3.html", lastUpdated: "2026-03-16" },
  { name: "Event Email E4 (Apr 16 PM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/event-e4.html", lastUpdated: "2026-03-16" },
  { name: "Event Email E5 (Apr 17 AM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/event-e5.html", lastUpdated: "2026-03-16" },
  { name: "Event Email E6A (Apr 17 PM, non buyers)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/event-e6a.html", lastUpdated: "2026-03-16" },
  { name: "Event Email E6B (Apr 17 PM, buyers)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/event-e6b.html", lastUpdated: "2026-03-16" },
  { name: "YouTube Thumbnails", type: "Design", status: "queued", location: "auto-006 in autonomous queue" },
  { name: "V3 Launch LP", type: "LP", status: "ready", location: "content-dashboard/public/ai-universa-apr15-launch.html", lastUpdated: "2026-03-17" },
  { name: "Delovni Zvezki (Workbooks)", type: "PDF", status: "missing", location: "Boss content" },
  { name: "YouTube LIVE Setup", type: "Config", status: "missing", location: "Boss setup" },
];

const cartOpenAssets: Asset[] = [
  { name: "Big VSL Script (10 min)", type: "VSL", status: "ready", location: "clawbot/missions/009-big-vsl/teleprompter-version.md", lastUpdated: "2026-03-17" },
  { name: "Offer Page", type: "LP", status: "missing", location: "content-dashboard/public/ai-universa-offer-final.html" },
  { name: "Sales Email S1 (Apr 17)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/sales-s1.html", lastUpdated: "2026-03-16" },
  { name: "Sales Email S2 (Apr 18)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/sales-s2.html", lastUpdated: "2026-03-16" },
  { name: "Sales Email S3 (Apr 19)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/sales-s3.html", lastUpdated: "2026-03-16" },
  { name: "Sales Email S4 (Apr 20)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/sales-s4.html", lastUpdated: "2026-03-16" },
  { name: "Sales Email S5 (Apr 21)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/sales-s5.html", lastUpdated: "2026-03-16" },
  { name: "Urgency Email U1 (Apr 19 AM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/urgency-u1.html", lastUpdated: "2026-03-16" },
  { name: "Urgency Email U2 (Apr 20 AM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/urgency-u2.html", lastUpdated: "2026-03-16" },
  { name: "Urgency Email U3 (Apr 21 AM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/urgency-u3.html", lastUpdated: "2026-03-16" },
  { name: "Urgency Email U4 (Apr 21 PM)", type: "Email", status: "built", location: "clawbot/missions/006-event-sales-emails/deploy/urgency-u4.html", lastUpdated: "2026-03-16" },
  { name: "Payment Provider", type: "Config", status: "missing", location: "Boss setup" },
  { name: "Split Pay Option", type: "Config", status: "missing", location: "Boss setup" },
];

const phaseConfig = {
  "pre-event": { label: "PRE EVENT", color: "#F59E0B", dateRange: "March 25 to April 14", assets: preEventAssets },
  "event": { label: "EVENT", color: "#4ADE80", dateRange: "April 15 to 17", assets: eventAssets },
  "cart-open": { label: "CART OPEN", color: "#D4A574", dateRange: "April 17 to 21", assets: cartOpenAssets },
} as const;

// ============================================================================
// Helpers
// ============================================================================

const statusConfig: Record<AssetStatus, { label: string; emoji: string; color: string; bg: string }> = {
  ready: { label: "Ready", emoji: "✅", color: "#4ADE80", bg: "rgba(74, 222, 128, 0.1)" },
  live: { label: "Live", emoji: "✅", color: "#4ADE80", bg: "rgba(74, 222, 128, 0.1)" },
  built: { label: "Built", emoji: "🔨", color: "#60A5FA", bg: "rgba(96, 165, 250, 0.1)" },
  missing: { label: "Missing", emoji: "❌", color: "#F87171", bg: "rgba(248, 113, 113, 0.1)" },
  review: { label: "Needs Review", emoji: "👀", color: "#FBBF24", bg: "rgba(251, 191, 36, 0.1)" },
  drive: { label: "On Drive", emoji: "📁", color: "#A78BFA", bg: "rgba(167, 139, 250, 0.1)" },
  queued: { label: "Queued", emoji: "❌", color: "#F87171", bg: "rgba(248, 113, 113, 0.1)" },
};

const typeColors: Record<string, string> = {
  LP: "#A78BFA",
  VSL: "#F472B6",
  Email: "#60A5FA",
  WhatsApp: "#4ADE80",
  Ad: "#FBBF24",
  Ads: "#FBBF24",
  Copy: "#FB923C",
  Typeform: "#34D399",
  Design: "#C084FC",
  Backend: "#6EE7B7",
  Form: "#34D399",
  Video: "#F87171",
  PDF: "#FB923C",
  Config: "#94A3B8",
};

function countByStatus(assets: Asset[]): Record<string, number> {
  const counts: Record<string, number> = { ready: 0, built: 0, missing: 0, review: 0 };
  for (const a of assets) {
    if (a.status === "ready" || a.status === "live" || a.status === "drive") counts.ready++;
    else if (a.status === "built") counts.built++;
    else if (a.status === "missing" || a.status === "queued") counts.missing++;
    else if (a.status === "review") counts.review++;
  }
  return counts;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: AssetStatus }) {
  const cfg = statusConfig[status];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: "0.6875rem",
      fontFamily: DS.fonts.mono,
      fontWeight: 500,
      color: cfg.color,
      background: cfg.bg,
      whiteSpace: "nowrap",
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const color = typeColors[type] || "#666";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 6px",
      borderRadius: 4,
      fontSize: "0.625rem",
      fontFamily: DS.fonts.mono,
      fontWeight: 600,
      color: color,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      {type}
    </span>
  );
}

function StatCard({ label, value, emoji, color }: { label: string; value: number; emoji: string; color: string }) {
  return (
    <div style={{
      ...dsCard,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      flex: "1 1 0",
      minWidth: 140,
    }}>
      <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
      <div>
        <div style={{
          fontFamily: DS.fonts.mono,
          fontSize: "1.5rem",
          fontWeight: 600,
          color: color,
          lineHeight: 1,
        }}>{value}</div>
        <div style={{
          fontFamily: DS.fonts.body,
          fontSize: "0.6875rem",
          color: DS.colors.textSecondary,
          marginTop: 2,
        }}>{label}</div>
      </div>
    </div>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div style={{
      width: "100%",
      height: 6,
      background: "rgba(255,255,255,0.04)",
      borderRadius: 3,
      overflow: "hidden",
    }}>
      <div style={{
        width: `${percent}%`,
        height: "100%",
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        borderRadius: 3,
        transition: "width 0.5s ease",
      }} />
    </div>
  );
}

function AssetRow({ asset }: { asset: Asset }) {
  const isLink = asset.isExternal || asset.driveLink;
  const previewUrl = asset.isExternal ? asset.location : asset.driveLink || null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto auto auto auto",
      gap: 12,
      alignItems: "center",
      padding: "10px 16px",
      borderBottom: `1px solid ${DS.colors.border}`,
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = DS.colors.bgCardHover; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {/* Name + Location */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: DS.fonts.body,
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: DS.colors.text,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {asset.name}
        </div>
        <div style={{
          fontFamily: DS.fonts.mono,
          fontSize: "0.625rem",
          color: DS.colors.textMuted,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginTop: 2,
        }}>
          {asset.location}
        </div>
      </div>

      {/* Type */}
      <TypeBadge type={asset.type} />

      {/* Status */}
      <StatusBadge status={asset.status} />

      {/* Last Updated */}
      <span style={{
        fontFamily: DS.fonts.mono,
        fontSize: "0.625rem",
        color: DS.colors.textSecondary,
        whiteSpace: "nowrap",
      }}>
        {asset.lastUpdated || "—"}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4 }}>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${DS.colors.border}`,
              background: "transparent",
              color: DS.colors.textSecondary,
              fontSize: "0.75rem",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            title="Open link"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = DS.colors.accent;
              e.currentTarget.style.color = DS.colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = DS.colors.border;
              e.currentTarget.style.color = DS.colors.textSecondary;
            }}
          >
            ↗
          </a>
        )}
        {asset.driveLink && (
          <a
            href={asset.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${DS.colors.border}`,
              background: "transparent",
              color: DS.colors.textSecondary,
              fontSize: "0.75rem",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            title="Open in Drive"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = DS.colors.accentPurple;
              e.currentTarget.style.color = DS.colors.accentPurple;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = DS.colors.border;
              e.currentTarget.style.color = DS.colors.textSecondary;
            }}
          >
            📁
          </a>
        )}
      </div>
    </div>
  );
}

function MobileAssetCard({ asset }: { asset: Asset }) {
  const previewUrl = asset.isExternal ? asset.location : asset.driveLink || null;

  return (
    <div style={{
      ...dsCard,
      padding: "12px 16px",
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <div style={{
          fontFamily: DS.fonts.body,
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: DS.colors.text,
          flex: 1,
        }}>
          {asset.name}
        </div>
        <StatusBadge status={asset.status} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <TypeBadge type={asset.type} />
        {asset.lastUpdated && (
          <span style={{
            fontFamily: DS.fonts.mono,
            fontSize: "0.625rem",
            color: DS.colors.textSecondary,
          }}>
            {asset.lastUpdated}
          </span>
        )}
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: DS.fonts.mono,
            fontSize: "0.625rem",
            color: DS.colors.accent,
            textDecoration: "none",
          }}>
            Open ↗
          </a>
        )}
      </div>
      <div style={{
        fontFamily: DS.fonts.mono,
        fontSize: "0.5625rem",
        color: DS.colors.textMuted,
        marginTop: 6,
        wordBreak: "break-all",
      }}>
        {asset.location}
      </div>
    </div>
  );
}

function DriveStructure() {
  const folderStyle = {
    fontFamily: DS.fonts.mono,
    fontSize: "0.75rem",
    color: DS.colors.textSecondary,
    lineHeight: 1.8,
  };

  const linkStyle = {
    color: DS.colors.accentPurple,
    textDecoration: "none",
  };

  return (
    <div style={{ ...dsCard, padding: "24px" }}>
      <h3 style={{
        ...dsHeading,
        fontSize: "1rem",
        marginBottom: 16,
      }}>
        📂 Drive Folder Structure
      </h3>
      <pre style={{ ...folderStyle, margin: 0, whiteSpace: "pre-wrap" }}>
{`AI Universa Launch /
├── PRE EVENT /
│   ├── Landing Pages /
│   ├── Emails /
│   ├── VSL Scripts /
│   └── Ads → `}<a href="https://drive.google.com/drive/folders/1lGi-nDXhd-Y8-ije86au0nOx4Q3jswc6?usp=sharing" target="_blank" rel="noopener noreferrer" style={linkStyle}>Google Drive ↗</a>{`
├── EVENT /
│   ├── Emails /
│   ├── YouTube Thumbnails /
│   └── Workbooks /
└── CART OPEN /
    ├── Emails /
    ├── VSL Scripts /
    └── Offer Page /`}
      </pre>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function AssetsPage() {
  const [activePhase, setActivePhase] = useState<Phase>("pre-event");

  const allAssets = useMemo(() => [...preEventAssets, ...eventAssets, ...cartOpenAssets], []);
  const totalCounts = useMemo(() => countByStatus(allAssets), [allAssets]);
  const total = allAssets.length;
  const readyPercent = Math.round(((totalCounts.ready) / total) * 100);
  const completionPercent = Math.round(((totalCounts.ready + totalCounts.built) / total) * 100);

  const currentPhase = phaseConfig[activePhase];
  const phaseCounts = useMemo(() => countByStatus(currentPhase.assets), [activePhase]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          ...dsHeading,
          fontSize: "1.75rem",
          marginBottom: 4,
        }}>
          Launch Assets
        </h1>
        <p style={{
          fontFamily: DS.fonts.body,
          fontSize: "0.8125rem",
          color: DS.colors.textSecondary,
          fontWeight: 300,
        }}>
          AI Universa launch material tracker. All assets organized by event phase.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 16,
        flexWrap: "wrap",
      }}>
        <StatCard label="Total Assets" value={total} emoji="📦" color={DS.colors.text} />
        <StatCard label="Ready" value={totalCounts.ready} emoji="✅" color="#4ADE80" />
        <StatCard label="Built" value={totalCounts.built} emoji="🔨" color="#60A5FA" />
        <StatCard label="Missing" value={totalCounts.missing} emoji="❌" color="#F87171" />
      </div>

      {/* Progress Bar */}
      <div style={{ ...dsCard, padding: "16px 20px", marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{
            fontFamily: DS.fonts.body,
            fontSize: "0.75rem",
            color: DS.colors.textSecondary,
          }}>
            Overall Completion
          </span>
          <span style={{
            fontFamily: DS.fonts.mono,
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: DS.colors.accent,
          }}>
            {completionPercent}%
          </span>
        </div>
        <ProgressBar percent={completionPercent} color={DS.colors.accent} />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
        }}>
          <span style={{ fontFamily: DS.fonts.mono, fontSize: "0.625rem", color: DS.colors.textMuted }}>
            {readyPercent}% fully ready
          </span>
          <span style={{ fontFamily: DS.fonts.mono, fontSize: "0.625rem", color: DS.colors.textMuted }}>
            {totalCounts.ready + totalCounts.built}/{total} done or in progress
          </span>
        </div>
      </div>

      {/* Phase Tabs */}
      <div style={{
        display: "flex",
        gap: 0,
        marginBottom: 0,
        borderBottom: `1px solid ${DS.colors.border}`,
      }}>
        {(Object.entries(phaseConfig) as [Phase, typeof phaseConfig[Phase]][]).map(([key, cfg]) => {
          const active = activePhase === key;
          const counts = countByStatus(cfg.assets);
          return (
            <button
              key={key}
              onClick={() => setActivePhase(key)}
              style={{
                padding: "12px 20px",
                fontFamily: DS.fonts.body,
                fontSize: "0.8125rem",
                fontWeight: active ? 600 : 400,
                color: active ? cfg.color : DS.colors.textSecondary,
                background: active ? `${cfg.color}08` : "transparent",
                border: "none",
                borderBottom: active ? `2px solid ${cfg.color}` : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{cfg.label}</span>
              <span style={{
                fontFamily: DS.fonts.mono,
                fontSize: "0.625rem",
                padding: "1px 6px",
                borderRadius: 4,
                background: active ? `${cfg.color}20` : "rgba(255,255,255,0.04)",
                color: active ? cfg.color : DS.colors.textMuted,
              }}>
                {cfg.assets.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Phase Header */}
      <div style={{
        ...dsCard,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTop: "none",
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <span style={{
            fontFamily: DS.fonts.mono,
            fontSize: "0.6875rem",
            color: currentPhase.color,
            fontWeight: 600,
          }}>
            {currentPhase.dateRange}
          </span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontFamily: DS.fonts.mono, fontSize: "0.6875rem", color: "#4ADE80" }}>
            ✅ {phaseCounts.ready} ready
          </span>
          <span style={{ fontFamily: DS.fonts.mono, fontSize: "0.6875rem", color: "#60A5FA" }}>
            🔨 {phaseCounts.built} built
          </span>
          <span style={{ fontFamily: DS.fonts.mono, fontSize: "0.6875rem", color: "#F87171" }}>
            ❌ {phaseCounts.missing} missing
          </span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block" style={{
        ...dsCard,
        padding: 0,
        overflow: "hidden",
        marginBottom: 32,
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto auto",
          gap: 12,
          padding: "10px 16px",
          borderBottom: `1px solid ${DS.colors.border}`,
          background: "rgba(255,255,255,0.01)",
        }}>
          {["Asset", "Type", "Status", "Updated", ""].map((h) => (
            <span key={h} style={{
              fontFamily: DS.fonts.mono,
              fontSize: "0.5625rem",
              fontWeight: 600,
              color: DS.colors.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}>
              {h}
            </span>
          ))}
        </div>
        {/* Rows */}
        {currentPhase.assets.map((asset, i) => (
          <AssetRow key={`${activePhase}-${i}`} asset={asset} />
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden" style={{ marginBottom: 32 }}>
        {currentPhase.assets.map((asset, i) => (
          <MobileAssetCard key={`${activePhase}-mobile-${i}`} asset={asset} />
        ))}
      </div>

      {/* Drive Structure */}
      <DriveStructure />
    </div>
  );
}
