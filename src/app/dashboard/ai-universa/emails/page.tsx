"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { DS, dsCard } from "@/styles/design-system";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type EmailStatus = "draft" | "ready" | "sent";
type FlowType = "preevent" | "event" | "sales" | "urgency";
type TabId = "preevent" | "event" | "sales";

interface EmailEntry {
  id: string;
  num: string;           // file number for API
  flow: FlowType;        // for API lookup
  name: string;          // display name
  sendDate: string;
  sendTime?: string;
  subjectA: string;
  subjectB: string;
  audience: string;
  status: EmailStatus;
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMAIL DATA (from wordcel markdown files)
   ═══════════════════════════════════════════════════════════════════════════ */

const PRE_EVENT_EMAILS: EmailEntry[] = [
  { id: "PE1", num: "1", flow: "preevent", name: "Launch Announcement", sendDate: "Mar 25", subjectA: "to je tisto, na kar sem čakal", subjectB: "3 dni do kopiranja mojega AI sistema", audience: "All registered", status: "ready" },
  { id: "PE2", num: "2", flow: "preevent", name: "Social Proof", sendDate: "Mar 27", subjectA: "si videl to?", subjectB: "ne želim, da zamudiš tole", audience: "All registered", status: "ready" },
  { id: "PE3", num: "3", flow: "preevent", name: "Event Details", sendDate: "Apr 1", subjectA: "kaj točno se naučiš v 3 dneh", subjectB: "tukaj je celoten načrt za event", audience: "All registered", status: "ready" },
  { id: "PE4", num: "4", flow: "preevent", name: "Momentum + FOMO", sendDate: "Apr 3", subjectA: "mesta se polnijo hitreje kot pričakovano", subjectB: "že 4.000+ prijavljenih", audience: "All registered", status: "ready" },
  { id: "PE5", num: "5", flow: "preevent", name: "Day 1 Preview", sendDate: "Apr 10", subjectA: "tole pokažem na dan 1", subjectB: "preview: kako zgradim AI profil od nič", audience: "All registered", status: "ready" },
  { id: "PE6", num: "6", flow: "preevent", name: "3 Day Countdown", sendDate: "Apr 12", subjectA: "še 3 dni", subjectB: "v torek se začne", audience: "All registered", status: "ready" },
  { id: "PE7", num: "7", flow: "preevent", name: "Tomorrow Reminder", sendDate: "Apr 13", subjectA: "pojutrišnjem ob 19:00", subjectB: "2 dni. potem je konec.", audience: "All registered", status: "ready" },
  { id: "PE8", num: "8", flow: "preevent", name: "Day Before Event", sendDate: "Apr 14", subjectA: "jutri ob 19:00", subjectB: "zadnja noč pred eventom", audience: "All registered", status: "ready" },
];

const EVENT_EMAILS: EmailEntry[] = [
  { id: "E1", num: "1", flow: "event", name: "Day 1 Morning", sendDate: "Apr 15", sendTime: "10:00", subjectA: "DANES ob 19:00, začnemo!", subjectB: "danes zvečer se vse začne", audience: "All registered", status: "ready" },
  { id: "E2", num: "2", flow: "event", name: "Day 1 Replay", sendDate: "Apr 15", sendTime: "22:00", subjectA: "Replay Dan 1 + kaj prihaja jutri", subjectB: "si videl dan 1? replay je tukaj", audience: "All registered", status: "ready" },
  { id: "E3", num: "3", flow: "event", name: "Day 2 Morning", sendDate: "Apr 16", sendTime: "10:00", subjectA: "Dan 2 danes: AI Agencija + AI Influencerji", subjectB: "danes ti pokažem, kje je denar v AI", audience: "All registered", status: "ready" },
  { id: "E4", num: "4", flow: "event", name: "Day 2 Replay", sendDate: "Apr 16", sendTime: "22:00", subjectA: "Replay Dan 2 + jutri je THE BIG ONE", subjectB: "dan 2 replay in zakaj je jutri najpomembnejši", audience: "All registered", status: "ready" },
  { id: "E5", num: "5", flow: "event", name: "Day 3 Morning", sendDate: "Apr 17", sendTime: "10:00", subjectA: "ZADNJI DAN: AI Agenti, danes ob 19:00", subjectB: "dan 3: Claw Bot v živo. danes.", audience: "All registered", status: "ready" },
  { id: "E6A", num: "6a", flow: "event", name: "Day 3 Replay (non buyers)", sendDate: "Apr 17", sendTime: "22:00", subjectA: "Replay Dan 3 + nekaj velikega prihaja JUTRI", subjectB: "videl si AI agente. to še ni konec.", audience: "Non buyers", status: "ready" },
  { id: "E6B", num: "6b", flow: "event", name: "Day 3 Thank You (buyers)", sendDate: "Apr 17", sendTime: "22:00", subjectA: "Hvala za 3 neverjetne dni!", subjectB: "dobrodošel v AI Universa", audience: "Buyers", status: "ready" },
];

const SALES_EMAILS: EmailEntry[] = [
  { id: "S1", num: "1", flow: "sales", name: "Cart Open", sendDate: "Apr 17", sendTime: "evening", subjectA: "Vrata so odprta, AI Universa", subjectB: "prijave so odprte. tukaj je vse.", audience: "Non buyers", status: "ready" },
  { id: "S2", num: "2", flow: "sales", name: "Story: Security Guard", sendDate: "Apr 18", subjectA: "Od varnostnika do €41k/mesec z AI", subjectB: "njegova zgodba me vsak dan znova motivira", audience: "Non buyers", status: "ready" },
  { id: "S3", num: "3", flow: "sales", name: "AI Agents Pitch", sendDate: "Apr 19", subjectA: "AI agenti: zakaj je TO druga liga", subjectB: "ChatGPT je igračka. to je orožje.", audience: "Non buyers", status: "ready" },
  { id: "S4", num: "4", flow: "sales", name: "VIP Mentorship", sendDate: "Apr 20", subjectA: "Zakaj 1 na 1 mentorstvo spremeni VSE", subjectB: "VIP paket: za tiste, ki mislijo resno", audience: "Non buyers", status: "ready" },
  { id: "S5", num: "5", flow: "sales", name: "Cart Close", sendDate: "Apr 21", subjectA: "DANES se vrata zaprejo, zadnji dan", subjectB: "zadnja priložnost. danes ob polnoči je konec.", audience: "Non buyers", status: "ready" },
  { id: "U1", num: "1", flow: "urgency", name: "72hr Urgency", sendDate: "Apr 19", sendTime: "AM", subjectA: "72 ur. Potem je konec.", subjectB: "še 3 dni. potem se zapre.", audience: "Non buyers", status: "ready" },
  { id: "U2", num: "2", flow: "urgency", name: "FAQ + Objections", sendDate: "Apr 20", sendTime: "AM", subjectA: '"A to res deluje?" Odgovarjam na dvome', subjectB: "tvoji dvomi. moji odgovori. 48 ur.", audience: "Non buyers", status: "ready" },
  { id: "U3", num: "3", flow: "urgency", name: "24hr Warning", sendDate: "Apr 21", sendTime: "AM", subjectA: "24 ur. Jutri bo prepozno.", subjectB: "zadnji dan. danes ali nikoli.", audience: "Non buyers", status: "ready" },
  { id: "U4", num: "4", flow: "urgency", name: "Final 12hr", sendDate: "Apr 21", sendTime: "PM", subjectA: "ZADNJIH 12 UR, vrata se zapirajo NOCOJ", subjectB: "ob polnoči je konec. to je zadnji email.", audience: "Non buyers", status: "ready" },
];

const ALL_EMAILS = [...PRE_EVENT_EMAILS, ...EVENT_EMAILS, ...SALES_EMAILS];

/* ═══════════════════════════════════════════════════════════════════════════
   FLOW COLORS
   ═══════════════════════════════════════════════════════════════════════════ */

const FLOW_COLORS: Record<FlowType, string> = {
  preevent: "#3B82F6",  // blue
  event: "#10B981",     // green
  sales: "#D4A574",     // gold
  urgency: "#EF4444",   // red
};

const TAB_CONFIG: { id: TabId; label: string; count: number; color: string }[] = [
  { id: "preevent", label: "Pre Event", count: 8, color: FLOW_COLORS.preevent },
  { id: "event", label: "Event Flow", count: 7, color: FLOW_COLORS.event },
  { id: "sales", label: "Sales Flow", count: 9, color: FLOW_COLORS.sales },
];

const STATUS_STYLES: Record<EmailStatus, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "rgba(251,191,36,0.1)", text: "#FBBF24" },
  ready: { label: "Ready", bg: "rgba(74,222,128,0.1)", text: "#4ADE80" },
  sent: { label: "Sent", bg: "rgba(167,139,250,0.1)", text: "#A78BFA" },
};

/* ═══════════════════════════════════════════════════════════════════════════
   TIMELINE DATA
   ═══════════════════════════════════════════════════════════════════════════ */

interface TimelineEntry {
  date: string;
  emails: { id: string; name: string; flow: FlowType; time?: string }[];
}

const TIMELINE: TimelineEntry[] = [
  { date: "Mar 25", emails: [{ id: "PE1", name: "Launch Announcement", flow: "preevent" }] },
  { date: "Mar 27", emails: [{ id: "PE2", name: "Social Proof", flow: "preevent" }] },
  { date: "Apr 1", emails: [{ id: "PE3", name: "Event Details", flow: "preevent" }] },
  { date: "Apr 3", emails: [{ id: "PE4", name: "Momentum + FOMO", flow: "preevent" }] },
  { date: "Apr 10", emails: [{ id: "PE5", name: "Day 1 Preview", flow: "preevent" }] },
  { date: "Apr 12", emails: [{ id: "PE6", name: "3 Day Countdown", flow: "preevent" }] },
  { date: "Apr 13", emails: [{ id: "PE7", name: "Tomorrow Reminder", flow: "preevent" }] },
  { date: "Apr 14", emails: [{ id: "PE8", name: "Day Before Event", flow: "preevent" }] },
  { date: "Apr 15", emails: [
    { id: "E1", name: "Day 1 Morning", flow: "event", time: "10:00" },
    { id: "E2", name: "Day 1 Replay", flow: "event", time: "22:00" },
  ]},
  { date: "Apr 16", emails: [
    { id: "E3", name: "Day 2 Morning", flow: "event", time: "10:00" },
    { id: "E4", name: "Day 2 Replay", flow: "event", time: "22:00" },
  ]},
  { date: "Apr 17", emails: [
    { id: "E5", name: "Day 3 Morning", flow: "event", time: "10:00" },
    { id: "S1", name: "Cart Open", flow: "sales", time: "evening" },
    { id: "E6A", name: "Replay (non buyers)", flow: "event", time: "22:00" },
    { id: "E6B", name: "Thank You (buyers)", flow: "event", time: "22:00" },
  ]},
  { date: "Apr 18", emails: [
    { id: "S2", name: "Story: Security Guard", flow: "sales" },
  ]},
  { date: "Apr 19", emails: [
    { id: "U1", name: "72hr Urgency", flow: "urgency", time: "AM" },
    { id: "S3", name: "AI Agents Pitch", flow: "sales" },
  ]},
  { date: "Apr 20", emails: [
    { id: "U2", name: "FAQ + Objections", flow: "urgency", time: "AM" },
    { id: "S4", name: "VIP Mentorship", flow: "sales" },
  ]},
  { date: "Apr 21", emails: [
    { id: "U3", name: "24hr Warning", flow: "urgency", time: "AM" },
    { id: "S5", name: "Cart Close", flow: "sales" },
    { id: "U4", name: "Final 12hr", flow: "urgency", time: "PM" },
  ]},
];

/* ═══════════════════════════════════════════════════════════════════════════
   PREVIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

function PreviewModal({ email, onClose }: { email: EmailEntry; onClose: () => void }) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/emails/preview?flow=${email.flow}&num=${email.num}`)
      .then((res) => res.json())
      .then((data) => {
        setHtml(data.html || "");
        setExists(data.exists);
        setLoading(false);
      })
      .catch(() => {
        setExists(false);
        setLoading(false);
      });
  }, [email.flow, email.num]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 720, maxHeight: "90vh",
          background: DS.colors.bgCard, border: `1px solid ${DS.colors.border}`,
          borderRadius: 16, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${DS.colors.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontFamily: DS.fonts.heading, fontSize: "1.125rem", color: DS.colors.text, fontWeight: 600 }}>
              {email.name}
            </p>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontSize: "0.75rem", color: DS.colors.textSecondary }}>
                <span style={{ color: FLOW_COLORS[email.flow], fontWeight: 600 }}>A:</span> {email.subjectA}
              </p>
              <p style={{ fontSize: "0.75rem", color: DS.colors.textSecondary }}>
                <span style={{ color: DS.colors.textMuted, fontWeight: 600 }}>B:</span> {email.subjectB}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: "rgba(255,255,255,0.04)", color: DS.colors.textSecondary,
              cursor: "pointer", fontSize: "1rem", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: DS.colors.textSecondary }}>
              Loading preview...
            </div>
          ) : !exists ? (
            <div style={{ padding: 40, textAlign: "center", color: DS.colors.error }}>
              HTML file not found
            </div>
          ) : (
            <iframe
              srcDoc={html}
              title={`Preview: ${email.name}`}
              style={{
                width: "100%", height: "70vh", border: "none",
                background: "#ffffff",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: EmailStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 6,
      fontSize: "0.6875rem", fontWeight: 500,
      background: s.bg, color: s.text,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.text }} />
      {s.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMAIL ROW
   ═══════════════════════════════════════════════════════════════════════════ */

function EmailRow({ email, onPreview }: { email: EmailEntry; onPreview: (e: EmailEntry) => void }) {
  const flowColor = FLOW_COLORS[email.flow];

  return (
    <div style={{
      ...dsCard,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* Top row: ID badge + name + date + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          fontSize: "0.625rem", fontWeight: 700,
          background: flowColor + "20", color: flowColor,
          border: `1px solid ${flowColor}40`,
        }}>
          {email.id}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "0.9375rem", fontWeight: 600,
            color: DS.colors.text,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {email.name}
          </p>
        </div>
        <span style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, flexShrink: 0 }}>
          {email.sendDate}{email.sendTime ? ` · ${email.sendTime}` : ""}
        </span>
        <span style={{
          fontSize: "0.6875rem", padding: "3px 10px", borderRadius: 6,
          background: "rgba(255,255,255,0.03)", color: DS.colors.textSecondary,
          flexShrink: 0,
        }}>
          {email.audience}
        </span>
        <StatusBadge status={email.status} />
      </div>

      {/* Subject lines */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
      }}>
        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.colors.border}`,
        }}>
          <span style={{ fontSize: "0.625rem", fontWeight: 600, color: flowColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Subject A
          </span>
          <p style={{ fontSize: "0.8125rem", color: DS.colors.text, marginTop: 4, lineHeight: 1.4 }}>
            {email.subjectA}
          </p>
        </div>
        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.colors.border}`,
        }}>
          <span style={{ fontSize: "0.625rem", fontWeight: 600, color: DS.colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Subject B
          </span>
          <p style={{ fontSize: "0.8125rem", color: DS.colors.textSecondary, marginTop: 4, lineHeight: 1.4 }}>
            {email.subjectB}
          </p>
        </div>
      </div>

      {/* Preview button */}
      <div>
        <button
          onClick={() => onPreview(email)}
          style={{
            padding: "7px 16px", borderRadius: 8,
            fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer",
            background: flowColor + "12", color: flowColor,
            border: `1px solid ${flowColor}30`,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = flowColor + "25"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = flowColor + "12"; }}
        >
          Preview HTML Email
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCHEDULE TIMELINE
   ═══════════════════════════════════════════════════════════════════════════ */

function ScheduleTimeline() {
  return (
    <div style={{ ...dsCard, padding: "24px 28px" }}>
      <h3 style={{
        fontFamily: DS.fonts.heading, fontSize: "1.125rem",
        color: DS.colors.text, marginBottom: 20,
      }}>
        Send Schedule
      </h3>
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 59, top: 0, bottom: 0,
          width: 1, background: DS.colors.border,
        }} />

        {TIMELINE.map((day, idx) => (
          <div key={day.date} style={{
            display: "flex", gap: 20, marginBottom: idx < TIMELINE.length - 1 ? 16 : 0,
            position: "relative",
          }}>
            {/* Date label */}
            <div style={{
              width: 52, flexShrink: 0, textAlign: "right",
              fontSize: "0.75rem", fontWeight: 600,
              fontFamily: DS.fonts.mono,
              color: DS.colors.textSecondary,
              paddingTop: 2,
            }}>
              {day.date}
            </div>

            {/* Dot */}
            <div style={{
              width: 11, height: 11, borderRadius: "50%",
              background: DS.colors.bgCard,
              border: `2px solid ${FLOW_COLORS[day.emails[0].flow]}`,
              flexShrink: 0, marginTop: 3, zIndex: 1,
            }} />

            {/* Emails for that day */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
              {day.emails.map((em) => (
                <span key={em.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 10px", borderRadius: 6,
                  fontSize: "0.6875rem", fontWeight: 500,
                  background: FLOW_COLORS[em.flow] + "12",
                  color: FLOW_COLORS[em.flow],
                  border: `1px solid ${FLOW_COLORS[em.flow]}25`,
                }}>
                  {em.id}
                  <span style={{ color: DS.colors.textSecondary, fontWeight: 400 }}>
                    {em.name}{em.time ? ` · ${em.time}` : ""}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 16, marginTop: 20, paddingTop: 16,
        borderTop: `1px solid ${DS.colors.border}`,
      }}>
        {(["preevent", "event", "sales", "urgency"] as FlowType[]).map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: FLOW_COLORS[f] }} />
            <span style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary, textTransform: "capitalize" }}>
              {f === "preevent" ? "Pre Event" : f}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("preevent");
  const [previewEmail, setPreviewEmail] = useState<EmailEntry | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const emails = useMemo(() => {
    switch (activeTab) {
      case "preevent": return PRE_EVENT_EMAILS;
      case "event": return EVENT_EMAILS;
      case "sales": return SALES_EMAILS;
    }
  }, [activeTab]);

  const statusCounts = useMemo(() => {
    const counts = { draft: 0, ready: 0, sent: 0 };
    ALL_EMAILS.forEach((e) => counts[e.status]++);
    return counts;
  }, []);

  const handlePreview = useCallback((email: EmailEntry) => {
    setPreviewEmail(email);
  }, []);

  return (
    <div className="max-w-5xl mx-auto" style={{ paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: DS.fonts.heading, fontSize: "2rem",
          color: DS.colors.text, letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}>
          Email Sequences
        </h1>
        <p style={{ fontSize: "0.875rem", color: DS.colors.textSecondary, marginTop: 6 }}>
          AI Universa launch · 24 emails across 3 flows · Mar 25 → Apr 21, 2026
        </p>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12, marginBottom: 32,
      }}>
        {[
          { label: "Total Emails", value: "24", color: DS.colors.text },
          { label: "Pre Event", value: "8", color: FLOW_COLORS.preevent },
          { label: "Event Flow", value: "7", color: FLOW_COLORS.event },
          { label: "Sales Flow", value: "9", color: FLOW_COLORS.sales },
          { label: "Ready", value: String(statusCounts.ready), color: DS.colors.success },
          { label: "Draft", value: String(statusCounts.draft), color: DS.colors.warning },
        ].map((stat) => (
          <div key={stat.label} style={{
            ...dsCard, padding: "14px 18px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <span style={{ fontSize: "0.6875rem", color: DS.colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {stat.label}
            </span>
            <span style={{
              fontFamily: DS.fonts.mono, fontSize: "1.5rem",
              fontWeight: 700, color: stat.color,
            }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Toggle Timeline */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          style={{
            padding: "8px 16px", borderRadius: 8,
            fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer",
            background: showTimeline ? DS.colors.accent + "12" : "rgba(255,255,255,0.03)",
            color: showTimeline ? DS.colors.accent : DS.colors.textSecondary,
            border: `1px solid ${showTimeline ? DS.colors.accent + "30" : DS.colors.border}`,
            transition: "all 0.15s",
          }}
        >
          {showTimeline ? "▲ Hide" : "▼ Show"} Schedule Timeline
        </button>
      </div>

      {showTimeline && (
        <div style={{ marginBottom: 32 }}>
          <ScheduleTimeline />
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 24,
        borderBottom: `1px solid ${DS.colors.border}`,
        paddingBottom: 12,
      }}>
        {TAB_CONFIG.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 20px", borderRadius: 8,
                fontSize: "0.875rem", fontWeight: active ? 600 : 400,
                cursor: "pointer",
                background: active ? tab.color + "15" : "transparent",
                color: active ? tab.color : DS.colors.textSecondary,
                border: `1px solid ${active ? tab.color + "30" : "transparent"}`,
                transition: "all 0.15s",
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: 8, fontSize: "0.6875rem",
                padding: "2px 7px", borderRadius: 4,
                background: active ? tab.color + "20" : "rgba(255,255,255,0.04)",
                fontFamily: DS.fonts.mono,
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Flow Description */}
      <div style={{
        ...dsCard, padding: "14px 20px", marginBottom: 24,
        borderLeft: `3px solid ${TAB_CONFIG.find(t => t.id === activeTab)!.color}`,
      }}>
        {activeTab === "preevent" && (
          <>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: FLOW_COLORS.preevent }}>Pre Event Registration Flow</p>
            <p style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, marginTop: 2 }}>Mar 25 → Apr 14 · 8 emails · Goal: free 3 day event sign ups</p>
          </>
        )}
        {activeTab === "event" && (
          <>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: FLOW_COLORS.event }}>3 Day Event Flow</p>
            <p style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, marginTop: 2 }}>Apr 15 → 17 · 7 emails · Morning hype + evening replay · YouTube LIVE 19:00 CEST</p>
          </>
        )}
        {activeTab === "sales" && (
          <>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: FLOW_COLORS.sales }}>Sales + Urgency Flow</p>
            <p style={{ fontSize: "0.75rem", color: DS.colors.textSecondary, marginTop: 2 }}>Apr 17 → 21 · 5 sales + 4 urgency overlays · Non buyers only · Cart open → close</p>
          </>
        )}
      </div>

      {/* Email List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {emails.map((email) => (
          <EmailRow key={email.id} email={email} onPreview={handlePreview} />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 48, borderTop: `1px solid ${DS.colors.border}`,
        paddingTop: 20, textAlign: "center",
      }}>
        <p style={{ fontSize: "0.75rem", color: DS.colors.textMuted }}>
          AI Universa · 24 emails · 3 flows · Sender: pici@go.aiuniversa.si
        </p>
      </div>

      {/* Preview Modal */}
      {previewEmail && (
        <PreviewModal email={previewEmail} onClose={() => setPreviewEmail(null)} />
      )}
    </div>
  );
}
