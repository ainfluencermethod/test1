"use client";

import { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  currentTask: string | null;
  avatar: string | null;
  activities: Activity[];
}

interface Activity {
  id: string;
  agentId: string | null;
  action: string;
  details: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  agent?: { name: string; avatar: string | null } | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ROSE = "#f43f5e";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  idle: { bg: "rgba(100,116,139,0.15)", text: "#94a3b8", dot: "#94a3b8" },
  working: { bg: "rgba(34,197,94,0.15)", text: "#22c55e", dot: "#22c55e" },
  error: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", dot: "#ef4444" },
};

const NEWSLETTER_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#f59e0b" },
  review: { label: "In Review", color: "#3b82f6" },
  scheduled: { label: "Scheduled", color: "#8b5cf6" },
  sent: { label: "Sent", color: "#22c55e" },
  completed: { label: "Completed", color: "#22c55e" },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function EmailMarketingPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [latestDraft, setLatestDraft] = useState<Activity | null>(null);
  const [history, setHistory] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/email-marketing")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents || []);
        setLatestDraft(data.latestDraft || null);
        setHistory(data.history || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lead = agents.find((a) => a.role === "lead");
  const copywriter = agents.find((a) => a.role === "agent");

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span style={{ color: ROSE }}>📧</span> Email Marketing
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Newsletter campaigns &amp; email content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: `${ROSE}20`, color: ROSE }}
          >
            {history.length} newsletters
          </span>
          {latestDraft && (
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: `${NEWSLETTER_STATUS[latestDraft.status]?.color || ROSE}20`,
                color: NEWSLETTER_STATUS[latestDraft.status]?.color || ROSE,
              }}
            >
              {NEWSLETTER_STATUS[latestDraft.status]?.label || latestDraft.status}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-[var(--text-muted)]">
          Loading email marketing data…
        </div>
      ) : (
        <>
          {/* ── Agent Status Cards ────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[lead, copywriter].filter(Boolean).map((agent) => {
              const a = agent!;
              const st = STATUS_STYLES[a.status] || STATUS_STYLES.idle;
              return (
                <div
                  key={a.id}
                  className="card p-5"
                  style={{ borderLeft: `4px solid ${ROSE}` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
                      style={{ background: `${ROSE}20` }}
                    >
                      {a.avatar || "📧"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--text)]">
                          {a.name}
                        </h3>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: st.bg, color: st.text }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{
                              background: st.dot,
                              animation:
                                a.status === "working"
                                  ? "pulse 2s infinite"
                                  : "none",
                            }}
                          />
                          {a.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {a.role === "lead"
                          ? "Oversees email campaigns & newsletter schedule"
                          : "Writes daily newsletter copy from AI news"}
                      </p>
                      {a.currentTask && (
                        <p className="text-xs mt-2 text-[var(--text-muted)]">
                          📌 {a.currentTask}
                        </p>
                      )}
                      {a.activities.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                            Recent Activity
                          </p>
                          {a.activities.slice(0, 3).map((act) => (
                            <div
                              key={act.id}
                              className="text-xs text-[var(--text-muted)] flex items-center gap-2"
                            >
                              <span className="opacity-50">
                                {timeAgo(act.createdAt)}
                              </span>
                              <span className="truncate">{act.action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {agents.length === 0 && (
              <div className="card p-6 text-center text-[var(--text-muted)] col-span-2">
                No Email Marketing agents found.
              </div>
            )}
          </div>

          {/* ── Latest Newsletter Draft ──────────────────────────── */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              ✏️ Latest Newsletter Draft
            </h2>
            {latestDraft ? (
              <div
                className="card overflow-hidden"
                style={{ borderLeft: `4px solid ${ROSE}`, padding: 0 }}
              >
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ background: `${ROSE}20` }}
                    >
                      ✉️
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text)]">
                        {latestDraft.action}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatDate(latestDraft.createdAt)}
                        {latestDraft.agent && (
                          <> · by {latestDraft.agent.name}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      background: `${
                        NEWSLETTER_STATUS[latestDraft.status]?.color || ROSE
                      }20`,
                      color:
                        NEWSLETTER_STATUS[latestDraft.status]?.color || ROSE,
                    }}
                  >
                    {NEWSLETTER_STATUS[latestDraft.status]?.label ||
                      latestDraft.status}
                  </span>
                </div>
                <div className="px-6 py-5">
                  {latestDraft.details ? (
                    <div className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                      {latestDraft.details}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] italic">
                      No content yet.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="card p-6 text-center"
                style={{ borderLeft: `4px solid var(--border)` }}
              >
                <p className="text-[var(--text-muted)]">
                  ✉️ No newsletter draft yet. The Email Copywriter will create
                  one based on the latest AI news.
                </p>
              </div>
            )}
          </div>

          {/* ── Newsletter History ───────────────────────────────── */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              📚 Newsletter History
            </h2>
            {history.length === 0 ? (
              <div className="card p-6 text-center text-[var(--text-muted)]">
                No newsletters sent yet. History will appear here as
                newsletters are created and sent.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => {
                  const ns = NEWSLETTER_STATUS[item.status] || {
                    label: item.status,
                    color: "#94a3b8",
                  };
                  return (
                    <div
                      key={item.id}
                      className="card p-4 hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                          style={{ background: `${ns.color}20` }}
                        >
                          ✉️
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-[var(--text)] truncate">
                              {item.action}
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{
                                background: `${ns.color}20`,
                                color: ns.color,
                              }}
                            >
                              {ns.label}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {formatDate(item.createdAt)}
                            {item.agent && <> · {item.agent.name}</>}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Schedule / Info ───────────────────────────────────── */}
          <div className="card p-5" style={{ borderLeft: `4px solid ${ROSE}` }}>
            <h3 className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
              📅 Send Schedule
            </h3>
            <div className="text-sm text-[var(--text-muted)] space-y-1">
              <p>
                • <strong>Daily Newsletter:</strong> AI content creation news,
                curated from web &amp; X research
              </p>
              <p>
                • <strong>Schedule:</strong> Drafts generated daily, reviewed
                before send
              </p>
              <p>
                • <strong>Sources:</strong> Research department reports, X
                trending topics, industry updates
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
