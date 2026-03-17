"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

/* ─── TYPES ─── */

type Segment = "all" | "non-buyers" | "buyers";
type ApprovalStatus = "pending" | "approved" | "denied";

interface WhatsAppMessage {
  id: string;
  phase: string;
  timing: string;
  segment: Segment;
  text: string;
}

interface ApprovalState {
  status: ApprovalStatus;
  feedback: string;
  timestamp: number;
}

/* ─── SEGMENT BADGE CONFIG ─── */

const SEGMENT_CONFIG: Record<Segment, { label: string; bg: string; text: string }> = {
  all: { label: "All", bg: "rgba(0,212,170,0.12)", text: "#7C5CFC" },
  "non-buyers": { label: "Non-buyers only", bg: "rgba(245,158,11,0.12)", text: "#F59E0B" },
  buyers: { label: "Buyers", bg: "rgba(16,185,129,0.12)", text: "#10B981" },
};

/* ─── PHASE CONFIG ─── */

interface PhaseConfig {
  id: string;
  title: string;
  emoji: string;
  color: string;
}

const PHASES: PhaseConfig[] = [
  { id: "pre-event", title: "Pre-Event", emoji: "📌", color: "#00D4AA" },
  { id: "during-event", title: "During Event", emoji: "🔴", color: "#10B981" },
  { id: "sales", title: "Sales", emoji: "💰", color: "#EF4444" },
  { id: "buyers", title: "Existing Buyers", emoji: "🎉", color: "#F59E0B" },
];

/* ─── MESSAGE DATA ─── */

const messages: WhatsAppMessage[] = [
  // PRE-EVENT
  { id: "WA-01", phase: "pre-event", timing: "Immediately on group join", segment: "all", text: `Ej, dobrodošel/a v skupini! 🙌\n\nTukaj boš dobil/a vse info za *Delavnico za zaslužek z umetno inteligenco* — 15., 16. in 17. aprila ob 19:00 na YouTubu.\n\n3 dni, 3 LIVE seje, konkretne stvari ki jih lahko takoj uporabiš.\n\nTukaj imaš še brezplačen *prompt pack* za začetek 👇\nhttps://nepridiprav.si/prompt-pack\n\nVidimo se! 🔥` },
  { id: "WA-02", phase: "pre-event", timing: "Apr 12, 10:00", segment: "all", text: `Čez 3 dni začnemo 👀\n\nPripravil sem nekaj kar bo marsikoga šokiralo. Ljudje s katerimi sem to testiral so v enem tednu naredili stvari za katere so prej rabili mesec.\n\nAja — in na delavnici razkrijemo nagradni sklad. Avto, 3x MacBook Pro, iPhone… 🎁\n\nTorek, 19:00. Bodi tam.` },
  { id: "WA-03", phase: "pre-event", timing: "Apr 14, 18:00", segment: "all", text: `*JUTRI ob 19:00 začnemo!* 🔔\n\nNastavi si alarm, resno. To ni webinar kjer bereš slide-e. To je živa delavnica kjer boš naredil/a svoj prvi AI zaslužek sistem.\n\nSe vidimo jutri na YouTubu 💪` },
  { id: "WA-04", phase: "pre-event", timing: "Apr 15, 09:00", segment: "all", text: `*Danes je dan!* 🚀\n\nOb 19:00 gremo LIVE. Pripravi si računalnik, ker boš delal/a z mano skupaj.\n\nNe samo gledat — delat. To je razlika. Vidimo se zvečer! 💥` },

  // DURING EVENT
  { id: "WA-05", phase: "during-event", timing: "Apr 15, 18:30", segment: "all", text: `Čez 30 minut smo LIVE! 🔴\n\nPridruži se tukaj 👇\nhttps://youtube.com/live/PLACEHOLDER\n\nImej odprt računalnik, danes delamo skupaj.` },
  { id: "WA-06", phase: "during-event", timing: "Apr 15, ~21:00", segment: "all", text: `Kaj pravite?! 🤯\n\nUpam da ste vidli zakaj sem bil tako navdušen. In to je bil šele *dan 1*.\n\nReplay za tiste ki so zamudili 👇\nhttps://youtube.com/live/PLACEHOLDER\n\nJutri gre na naslednji level. Resno. Bodi tam ob 19:00 🔥` },
  { id: "WA-07", phase: "during-event", timing: "Apr 16, 18:30", segment: "all", text: `30 minut do LIVE! 🔴\n\nDanes ti pokažem kako *avtomatiziraš* to kar smo včeraj naredili. Tukaj bi morali biti vsi.\n\n👇\nhttps://youtube.com/live/PLACEHOLDER` },
  { id: "WA-08", phase: "during-event", timing: "Apr 16, ~21:00", segment: "all", text: `Dan 2 ✅ oddelan!\n\nSte vidli tiste rezultate v živo? To ni teorija, to so dejanski zaslužki.\n\nReplay 👇\nhttps://youtube.com/live/PLACEHOLDER\n\nJutri je *dan 3* — in to je tisti dan. Največja stvar ki sem jo kadarkoli pripravil. Ne zamudi. 🚀` },
  { id: "WA-09", phase: "during-event", timing: "Apr 17, 18:30", segment: "all", text: `*To je tisti dan.* 🔥\n\nČez 30 minut razkrijemo vse. Celoten sistem. Plus nagradni sklad — avto, MacBook-i, iPhone.\n\nTukaj bodi 👇\nhttps://youtube.com/live/PLACEHOLDER\n\nDanes se zgodi. 💥` },
  { id: "WA-10", phase: "during-event", timing: "Apr 17, ~21:00", segment: "all", text: `To je blo OGROMNO 🤯\n\nHvala vsem ki ste bili. 3 dni, nešteto aha momentov. Replay gre gor kmalu.\n\nReplay 👇\nhttps://youtube.com/live/PLACEHOLDER\n\nOstanite z mano — prihaja še nekaj 👀` },

  // SALES — NON-BUYERS ONLY
  { id: "WA-11", phase: "sales", timing: "Apr 17, ~21:30", segment: "non-buyers", text: `Okej, tukaj je 👇\n\n*AI Universa je odprta!* 🚀\n\nTo je celoten sistem ki si ga videl/a na delavnici — ampak z mentorstvom, skupnostjo in podporo.\n\n✅ Vsi AI moduli\n✅ Žive coaching seje\n✅ Skupnost in podpora\n✅ Nagradni sklad (avto + MacBook-i + iPhone)\n\nNormal: €899 | VIP: €2.499\n\n👉 https://nepridiprav.si/ai-universa\n\nVrata so odprta do 21. aprila. Potem zaprem.` },
  { id: "WA-12", phase: "sales", timing: "Apr 18, 12:00", segment: "non-buyers", text: `Moram to delit 👀\n\nMarko se je včeraj zvečer prijavil in do danes zjutraj že naredil svoj prvi €47 zaslužek z AI. Doslovno čez noč.\n\nIn ni edini — inbox mi eksplodira s sporočili od ljudi ki že vidijo rezultate.\n\nČe razmišljaš — ne razmišljaj predolgo 😉\n\n👉 https://nepridiprav.si/ai-universa` },
  { id: "WA-13", phase: "sales", timing: "Apr 19, 18:00", segment: "non-buyers", text: `Hej, hiter heads up ⏰\n\nŠe *48 ur* je do zaprtja AI Universe.\n\nPo 21. aprilu se vrata zaprejo in ne vem kdaj se spet odprejo. Nagradni sklad z avtom pa velja samo za tiste ki se prijavijo do takrat.\n\nČe je to zate — zdaj je čas 👇\nhttps://nepridiprav.si/ai-universa` },
  { id: "WA-14", phase: "sales", timing: "Apr 21, 10:00", segment: "non-buyers", text: `*Zadnja možnost* ⏳\n\nDanes ob polnoči se AI Universa zapre. Brez izjem, brez podaljšanja.\n\nVse kar smo delali 3 dni na delavnici — to je šele začetek tega kar dobiš noter.\n\nČe čutiš da je to zate — ne čakaj na "pravi trenutek". Ta trenutek je zdaj.\n\n👉 https://nepridiprav.si/ai-universa\n\nVrata se zaprejo ob polnoči. 🔒` },

  // BUYERS ONLY
  { id: "WA-15", phase: "buyers", timing: "On purchase", segment: "buyers", text: `DOBRODOŠEL/A v AI Universi! 🎉🚀\n\nPonosen sem da si se odločil/a. Zdaj se začne pravo delo — in nisi sam/a.\n\nKmalu dobiš dostop do vsega. Vmes — uživaj v energiji! 💪` },
  { id: "WA-16", phase: "buyers", timing: "Apr 15, 18:30", segment: "buyers", text: `Hej! 🔴 Čez 30 min gremo LIVE!\n\nKot član AI Universe boš danes dobil/a še extra vpogled. Bodi na LIVEu!\n\n👇\nhttps://youtube.com/live/PLACEHOLDER` },
  { id: "WA-17", phase: "buyers", timing: "Apr 18, 10:00", segment: "buyers", text: `Ej, si že pogledal/a vse module? 👀\n\nSkupnost je na ognju — ljudje že delijo svoje prve rezultate. Skoči notr in pokaži kaj si naredil/a!\n\nVidimo se tam 💪` },
  { id: "WA-18", phase: "buyers", timing: "Apr 20, 12:00", segment: "buyers", text: `Samo reminder — nagradni sklad še vedno teče! 🎁\n\nAvto, 3x MacBook Pro, iPhone… Bolj ko si aktiven/a v programu, boljše šanse.\n\nKeep going! 🔥` },
];

/* ─── APPROVAL HOOK ─── */

const WA_APPROVAL_STORAGE_KEY = "whatsapp-approvals";
const WA_APPROVAL_API_URL = "/api/approvals/whatsapp";

function readLocalApprovals() {
  try {
    const stored = localStorage.getItem(WA_APPROVAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

async function persistApprovals(approvals: Record<string, ApprovalState>) {
  await fetch(WA_APPROVAL_API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approvals),
  });
}

function useApprovals() {
  const [approvals, setApprovals] = useState<Record<string, ApprovalState>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadApprovals() {
      const localApprovals = readLocalApprovals();

      try {
        const res = await fetch(WA_APPROVAL_API_URL, { cache: "no-store" });
        const serverApprovals = res.ok ? await res.json() : {};
        if (cancelled) return;

        const next = Object.keys(serverApprovals).length > 0 ? serverApprovals : localApprovals;
        setApprovals(next);
        localStorage.setItem(WA_APPROVAL_STORAGE_KEY, JSON.stringify(next));

        if (Object.keys(serverApprovals).length === 0 && Object.keys(localApprovals).length > 0) {
          await persistApprovals(localApprovals);
        }
      } catch {
        if (cancelled) return;
        setApprovals(localApprovals);
      }
    }

    loadApprovals();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateApproval = useCallback((msgId: string, status: ApprovalStatus, feedback: string = "") => {
    setApprovals((prev) => {
      const next = { ...prev, [msgId]: { status, feedback, timestamp: Date.now() } };
      localStorage.setItem(WA_APPROVAL_STORAGE_KEY, JSON.stringify(next));
      void persistApprovals(next);
      return next;
    });
  }, []);

  const resetApproval = useCallback((msgId: string) => {
    setApprovals((prev) => {
      const next = { ...prev };
      delete next[msgId];
      localStorage.setItem(WA_APPROVAL_STORAGE_KEY, JSON.stringify(next));
      void persistApprovals(next);
      return next;
    });
  }, []);

  return { approvals, updateApproval, resetApproval };
}

/* ─── APPROVAL CONFIG ─── */

const APPROVAL_CONFIG: Record<ApprovalStatus, { label: string; bg: string; text: string; icon: string }> = {
  pending: { label: "Pending", bg: "rgba(107,114,128,0.12)", text: "#6B7280", icon: "⏳" },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.12)", text: "#10B981", icon: "✅" },
  denied: { label: "Needs Changes", bg: "rgba(239,68,68,0.12)", text: "#EF4444", icon: "✗" },
};

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const cfg = APPROVAL_CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: '0.6875rem', fontWeight: 600,
      background: cfg.bg, color: cfg.text,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function WAApprovalControls({
  msgId,
  approval,
  onApprove,
  onDeny,
  onReset,
}: {
  msgId: string;
  approval?: ApprovalState;
  onApprove: (id: string) => void;
  onDeny: (id: string, feedback: string) => void;
  onReset: (id: string) => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const status = approval?.status || "pending";

  if (status === "approved") {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <ApprovalBadge status="approved" />
        <span style={{ fontSize: '0.6875rem', color: '#4A4D5C' }}>
          {approval?.timestamp ? new Date(approval.timestamp).toLocaleString() : ""}
        </span>
        <button onClick={() => onReset(msgId)} style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: 6,
          fontSize: '0.6875rem', fontWeight: 500, cursor: 'pointer',
          background: 'transparent', color: '#6B7280',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          ↺ Reset
        </button>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ApprovalBadge status="denied" />
          <span style={{ fontSize: '0.6875rem', color: '#4A4D5C' }}>
            {approval?.timestamp ? new Date(approval.timestamp).toLocaleString() : ""}
          </span>
          <button onClick={() => onReset(msgId)} style={{
            marginLeft: 'auto', padding: '4px 10px', borderRadius: 6,
            fontSize: '0.6875rem', fontWeight: 500, cursor: 'pointer',
            background: 'transparent', color: '#6B7280',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            ↺ Reset
          </button>
        </div>
        {approval?.feedback && (
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
            borderRadius: 8, padding: '10px 14px',
            fontSize: '0.8125rem', color: '#F87171', lineHeight: 1.5,
          }}>
            💬 {approval.feedback}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      {!showFeedback ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => onApprove(msgId)} style={{
            padding: '7px 16px', borderRadius: 8,
            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
            background: 'rgba(16,185,129,0.15)', color: '#10B981',
            border: '1px solid rgba(16,185,129,0.25)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; }}
          >
            ✓ Approve
          </button>
          <button onClick={() => setShowFeedback(true)} style={{
            padding: '7px 16px', borderRadius: 8,
            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
            background: 'rgba(239,68,68,0.1)', color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            ✗ Request Changes
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What needs to change? Be specific..."
            rows={3}
            style={{
              width: '100%', background: '#13151A', color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
              padding: '10px 14px', fontSize: '0.8125rem', lineHeight: 1.5,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => {
              if (feedback.trim()) {
                onDeny(msgId, feedback.trim());
                setShowFeedback(false);
                setFeedback("");
              }
            }} style={{
              padding: '7px 16px', borderRadius: 8,
              fontSize: '0.8125rem', fontWeight: 600, cursor: feedback.trim() ? 'pointer' : 'not-allowed',
              background: feedback.trim() ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.05)',
              color: feedback.trim() ? '#EF4444' : '#6B7280',
              border: `1px solid ${feedback.trim() ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              Submit Feedback
            </button>
            <button onClick={() => { setShowFeedback(false); setFeedback(""); }} style={{
              padding: '7px 16px', borderRadius: 8,
              fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              background: 'transparent', color: '#6B7280',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── HELPERS ─── */

function renderWhatsAppText(text: string): string {
  return text
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/~([^~]+)~/g, "<del>$1</del>")
    .replace(/(https?:\/\/[^\s]+)/g, '<span style="color:#7C5CFC;text-decoration:underline">$1</span>')
    .replace(/\n/g, "<br/>");
}

/* ─── COMPONENT ─── */

export default function WhatsAppPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterSegment, setFilterSegment] = useState<Segment | "all-segments">("all-segments");
  const { approvals, updateApproval, resetApproval } = useApprovals();

  const handleApprove = useCallback((id: string) => updateApproval(id, "approved"), [updateApproval]);
  const handleDeny = useCallback((id: string, feedback: string) => updateApproval(id, "denied", feedback), [updateApproval]);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = filterSegment === "all-segments"
    ? messages
    : messages.filter((m) => m.segment === filterSegment);

  const stats = {
    total: messages.length,
    all: messages.filter((m) => m.segment === "all").length,
    nonBuyers: messages.filter((m) => m.segment === "non-buyers").length,
    buyers: messages.filter((m) => m.segment === "buyers").length,
  };

  const approvalCounts = useMemo(() => {
    const approved = messages.filter((m) => approvals[m.id]?.status === "approved").length;
    const denied = messages.filter((m) => approvals[m.id]?.status === "denied").length;
    const pending = messages.length - approved - denied;
    return { approved, denied, pending };
  }, [approvals]);

  return (
    <div className="max-w-4xl mx-auto" style={{ paddingBottom: '4rem' }}>
      {/* HEADER */}
      <div className="mb-8">
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
          <span style={{ color: "rgba(255,255,255,0.92)" }}>WhatsApp</span>{" "}
          <span style={{ color: "#6B7280" }}>Sequence</span>
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: 4 }}>
          AI Universa · April 2026 · {messages.length} messages
        </p>

        {/* STATS */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: "Total", value: stats.total, color: "rgba(255,255,255,0.92)" },
            { label: "All segments", value: stats.all, color: "#00D4AA" },
            { label: "Non-buyers", value: stats.nonBuyers, color: "#F59E0B" },
            { label: "Buyers", value: stats.buyers, color: "#10B981" },
            { label: "✅ Approved", value: approvalCounts.approved, color: "#10B981" },
            { label: "✗ Changes", value: approvalCounts.denied, color: "#EF4444" },
            { label: "⏳ Pending", value: approvalCounts.pending, color: "#6B7280" },
          ].map((s) => (
            <div key={s.label} style={{ background: '#1A1D23', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 16px' }}>
              <span style={{ fontSize: '0.6875rem', color: '#6B7280' }}>{s.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: s.color, marginLeft: 8 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(
            [
              { key: "all-segments", label: "All segments" },
              { key: "all", label: "All recipients" },
              { key: "non-buyers", label: "Non-buyers" },
              { key: "buyers", label: "Buyers" },
            ] as { key: Segment | "all-segments"; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterSegment(f.key)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${filterSegment === f.key ? '#7C5CFC33' : 'rgba(255,255,255,0.06)'}`,
                background: filterSegment === f.key ? 'rgba(0,212,170,0.1)' : 'transparent',
                color: filterSegment === f.key ? '#7C5CFC' : '#6B7280',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* PHASES */}
      {PHASES.map((phase) => {
        const phaseMessages = filtered.filter((m) => m.phase === phase.id);
        if (phaseMessages.length === 0) return null;

        return (
          <div key={phase.id} style={{ marginBottom: 36 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 10,
              borderBottom: `2px solid ${phase.color}`,
            }}>
              <span style={{ fontSize: 18 }}>{phase.emoji}</span>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0 }}>{phase.title}</h2>
              <span style={{ fontSize: '0.6875rem', color: '#6B7280', background: '#1A1D23', padding: '2px 8px', borderRadius: 6 }}>
                {phaseMessages.length} messages
              </span>
            </div>

            <div className="space-y-4">
              {phaseMessages.map((msg) => {
                const charCount = msg.text.length;
                const overLimit = charCount > 500;

                const msgApproval = approvals[msg.id];
                const approvalBorder = msgApproval?.status === "approved"
                  ? "rgba(16,185,129,0.25)"
                  : msgApproval?.status === "denied"
                  ? "rgba(239,68,68,0.25)"
                  : "rgba(255,255,255,0.06)";

                return (
                  <div key={msg.id} style={{
                    background: '#1A1D23',
                    border: `1px solid ${approvalBorder}`,
                    borderRadius: 16, padding: '18px 20px',
                    transition: 'border-color 0.2s',
                    borderLeftWidth: msgApproval?.status === "approved" || msgApproval?.status === "denied" ? 3 : 1,
                    borderLeftColor: msgApproval?.status === "approved" ? "#10B981" : msgApproval?.status === "denied" ? "#EF4444" : undefined,
                  }}>
                    {/* Top bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.92)', fontSize: '0.875rem' }}>{msg.id}</span>
                        <span style={{
                          fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 6, fontWeight: 500,
                          background: SEGMENT_CONFIG[msg.segment].bg, color: SEGMENT_CONFIG[msg.segment].text,
                        }}>
                          {SEGMENT_CONFIG[msg.segment].label}
                        </span>
                        <ApprovalBadge status={msgApproval?.status || "pending"} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.6875rem', color: overLimit ? '#EF4444' : '#6B7280', fontWeight: overLimit ? 600 : 400 }}>
                          {charCount} / 500 chars
                        </span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          style={{
                            padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.06)',
                            background: copiedId === msg.id ? 'rgba(16,185,129,0.12)' : 'transparent',
                            color: copiedId === msg.id ? '#10B981' : '#6B7280',
                            transition: 'all 0.15s',
                          }}
                        >
                          {copiedId === msg.id ? "✓ Copied!" : "📋 Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Timing */}
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 10 }}>
                      🕐 {msg.timing}
                    </div>

                    {/* WhatsApp bubble */}
                    <div style={{
                      background: '#005c4b', borderRadius: '12px 12px 4px 12px',
                      padding: '12px 16px', maxWidth: 420, marginLeft: 'auto',
                      fontSize: '0.875rem', lineHeight: 1.55, color: '#e9edef', wordBreak: 'break-word',
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: renderWhatsAppText(msg.text) }} />
                      <div style={{ textAlign: 'right', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                        19:00 ✓✓
                      </div>
                    </div>

                    {/* Approval Controls */}
                    <WAApprovalControls
                      msgId={msg.id}
                      approval={msgApproval}
                      onApprove={handleApprove}
                      onDeny={handleDeny}
                      onReset={resetApproval}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* FOOTER */}
      <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#4A4D5C' }}>
          AI Universa WhatsApp Sequence — {messages.length} messages · April 2026
        </p>
      </div>
    </div>
  );
}
