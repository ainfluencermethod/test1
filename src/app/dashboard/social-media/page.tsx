"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SessionLog {
  filename: string;
  date: string;
  time: string;
  reels: number;
  likes: number;
  saves: number;
  comments: number;
  duration: string;
  durationSec: number;
  status: "success" | "error";
  error?: string;
}

interface Aggregate {
  reels: number;
  likes: number;
  saves: number;
  comments: number;
}

interface ProfileMetrics {
  swipeSpeed: string;
  pauseMedian: string;
  likeRate: string;
  saveRate: string;
  commentRate: string;
  sessionLength: string;
}

interface TestRunStatus {
  isRunning: boolean;
  lastOutput: string;
  pid: number | null;
  exitCode: number | null;
}

interface ContentRecreationItem {
  id: string;
  originalUrl: string;
  originalAuthor: string;
  description: string;
  contentType: "reel" | "carousel" | "story" | "static" | "other";
  niche: string;
  estimatedViews: string;
  priority: "high" | "medium" | "low";
  status: "queued" | "scripting" | "filming" | "editing" | "posted" | "archived";
  ourUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Schedule Data                                                      */
/* ------------------------------------------------------------------ */

const SESSIONS = [
  { emoji: "🌅", label: "Morning", start: "10:00 AM", end: "11:30 AM", hour: 10 },
  { emoji: "🌞", label: "Afternoon", start: "12:30 PM", end: "2:00 PM", hour: 12 },
  { emoji: "🌆", label: "Evening", start: "3:30 PM", end: "5:00 PM", hour: 15 },
  { emoji: "🌙", label: "Night", start: "6:30 PM", end: "8:00 PM", hour: 18 },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function ScheduleCard({ sessions }: { sessions: SessionLog[] }) {
  const now = new Date();
  const currentHour = now.getHours();

  function getSessionStatus(sessionHour: number) {
    // Find a log that matches this session window
    const today = now.toISOString().split("T")[0];
    const todayLogs = sessions.filter((s) => s.date === today);

    // Map session hours to approximate log times
    const matchedLog = todayLogs.find((log) => {
      const logHour = parseInt(log.time.split(":")[0]);
      return Math.abs(logHour - sessionHour) <= 2;
    });

    if (matchedLog) {
      return {
        ran: true,
        status: matchedLog.status,
        reels: matchedLog.reels,
        duration: matchedLog.duration,
      };
    }

    if (currentHour >= sessionHour && currentHour < sessionHour + 2) {
      return { ran: false, status: "active" as const, reels: 0, duration: "" };
    }

    if (currentHour < sessionHour) {
      return { ran: false, status: "upcoming" as const, reels: 0, duration: "" };
    }

    return { ran: false, status: "missed" as const, reels: 0, duration: "" };
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          📅 Warm-Up Schedule
        </h3>
        <span className="badge badge-gray">10-30 min sessions</span>
      </div>
      <div className="space-y-2">
        {SESSIONS.map((session) => {
          const info = getSessionStatus(session.hour);
          return (
            <div
              key={session.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]"
            >
              <span className="text-xl w-8 text-center">{session.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{session.label}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {session.start} — {session.end}
                  </span>
                </div>
                {info.ran && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {info.reels} reels · {info.duration}
                  </span>
                )}
              </div>
              <div>
                {info.ran && info.status === "success" && (
                  <span className="badge badge-green">✓ Done</span>
                )}
                {info.ran && info.status === "error" && (
                  <span className="badge badge-red">✗ Error</span>
                )}
                {!info.ran && info.status === "active" && (
                  <span className="badge badge-yellow">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-1.5" />
                    Window Open
                  </span>
                )}
                {!info.ran && info.status === "upcoming" && (
                  <span className="badge badge-gray">Upcoming</span>
                )}
                {!info.ran && info.status === "missed" && (
                  <span className="badge badge-gray">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsCard({ aggregate }: { aggregate: Aggregate }) {
  const stats = [
    { label: "Reels Today", value: aggregate.reels, emoji: "📱", color: "var(--accent)" },
    { label: "Likes", value: aggregate.likes, emoji: "❤️", color: "#ef4444" },
    { label: "Saves", value: aggregate.saves, emoji: "🔖", color: "#f59e0b" },
    { label: "Comments", value: aggregate.comments, emoji: "💬", color: "#3b82f6" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="card text-center"
          style={{ borderTop: `2px solid ${s.color}` }}
        >
          <span className="text-xl">{s.emoji}</span>
          <p className="text-2xl font-bold mt-1">{s.value}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function ProfileCard({ metrics }: { metrics: ProfileMetrics | null }) {
  if (!metrics) return null;

  const items = [
    { label: "Swipe Speed", value: "300ms", tag: "FAST", tagColor: "badge-green" },
    { label: "Avg Pause", value: metrics.pauseMedian, tag: "median", tagColor: "badge-gray" },
    { label: "Like Rate", value: metrics.likeRate, tag: null, tagColor: "" },
    { label: "Save Rate", value: metrics.saveRate, tag: null, tagColor: "" },
    { label: "Comment Rate", value: metrics.commentRate, tag: null, tagColor: "" },
    { label: "Session Length", value: metrics.sessionLength, tag: null, tagColor: "" },
  ];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        🎭 Behavior Profile
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]"
          >
            <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">{item.value}</span>
              {item.tag && (
                <span className={`badge ${item.tagColor} text-[10px] px-1.5 py-0`}>
                  {item.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneMirror() {
  const [mirroring, setMirroring] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchScreenshot = useCallback(async () => {
    try {
      const res = await fetch("/api/social-media/screenshot");
      if (res.ok) {
        const data = await res.json();
        if (data.image) {
          setScreenshot(data.image);
          setError(null);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to capture screenshot");
      }
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    if (mirroring) {
      fetchScreenshot();
      intervalRef.current = setInterval(fetchScreenshot, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mirroring, fetchScreenshot]);

  return (
    <div className="card flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          📱 Live Mirror
        </h3>
        <button
          onClick={() => setMirroring(!mirroring)}
          className={`btn text-xs ${mirroring ? "btn-danger" : "btn-primary"}`}
        >
          {mirroring ? "⏹ Stop" : "▶ Start"} Mirror
        </button>
      </div>

      {/* Phone Frame */}
      <div
        className="relative bg-black rounded-[2.5rem] border-[3px] border-[#333] overflow-hidden"
        style={{ width: 220, height: 440 }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-b-2xl z-10"
          style={{ width: 90, height: 22 }}
        />

        {/* Screen content */}
        <div className="w-full h-full bg-[#111] flex items-center justify-center overflow-hidden">
          {screenshot ? (
            <img
              src={screenshot}
              alt="Phone screen"
              className="w-full h-full object-cover"
            />
          ) : error ? (
            <div className="text-center px-4">
              <p className="text-xs text-[var(--text-muted)]">
                {mirroring ? "📱 Connecting..." : "Mirror inactive"}
              </p>
              {mirroring && error && (
                <p className="text-[10px] text-red-400 mt-2 break-words">
                  {error.slice(0, 100)}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center px-4">
              <p className="text-3xl mb-2">📱</p>
              <p className="text-xs text-[var(--text-muted)]">
                {mirroring ? "Connecting..." : "Start mirror to see phone"}
              </p>
            </div>
          )}
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-[#444]" />
      </div>

      {mirroring && (
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-[var(--text-muted)]">Live • 2s refresh</span>
        </div>
      )}
    </div>
  );
}

function TestRunButton({ onComplete }: { onComplete: () => void }) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRun = async () => {
    try {
      setStatus("running");
      setErrorMsg("");
      const res = await fetch("/api/social-media/test-run", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.status === "running") {
          // Already running, start polling
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Failed to start test run");
          setTimeout(() => setStatus("idle"), 5000);
          return;
        }
      }

      // Poll for completion
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch("/api/social-media/test-run");
          if (pollRes.ok) {
            const data: TestRunStatus = await pollRes.json();
            if (!data.isRunning) {
              if (pollRef.current) clearInterval(pollRef.current);

              // Check if the process exited with an error
              if (data.exitCode !== null && data.exitCode !== 0) {
                setStatus("error");
                // Extract a readable error from lastOutput
                const output = data.lastOutput || "";
                const errorLine = output.split("\n").find((l: string) => l.includes("ERROR") || l.includes("Error:")) || "Process exited with an error";
                setErrorMsg(errorLine.slice(0, 120));
                setTimeout(() => setStatus("idle"), 5000);
              } else {
                setStatus("done");
                onComplete();
                setTimeout(() => setStatus("idle"), 3000);
              }
            }
          }
        } catch {
          // ignore poll errors
        }
      }, 3000);
    } catch {
      setStatus("error");
      setErrorMsg("Network error — is the server running?");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      <button
        onClick={startRun}
        disabled={status === "running"}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          status === "running"
            ? "bg-yellow-600/20 text-yellow-400 border-2 border-yellow-600/50 cursor-wait"
            : status === "done"
            ? "bg-green-600/20 text-green-400 border-2 border-green-600/50"
            : status === "error"
            ? "bg-red-600/20 text-red-400 border-2 border-red-600/50 cursor-pointer"
            : "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] cursor-pointer border-2 border-transparent"
        }`}
      >
        {status === "running" && (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            Running Test Session...
          </span>
        )}
        {status === "done" && "✓ Session Complete!"}
        {status === "error" && "✗ Failed — Try Again"}
        {status === "idle" && "🚀 Test Run (1 min)"}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-xs text-red-400 mt-2 text-center truncate" title={errorMsg}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}

function SessionHistory({ sessions }: { sessions: SessionLog[] }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          📋 Session History
        </h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-8 text-sm">
            No sessions recorded yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-wider bg-[var(--bg)]">
                <th className="text-left px-4 py-2.5">Date</th>
                <th className="text-right px-4 py-2.5">Reels</th>
                <th className="text-right px-4 py-2.5">❤️</th>
                <th className="text-right px-4 py-2.5">🔖</th>
                <th className="text-right px-4 py-2.5">⏱️</th>
                <th className="text-right px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.filename}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <span className="font-medium">{s.date}</span>
                    <span className="text-[var(--text-muted)] ml-1.5">{s.time}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">{s.reels}</td>
                  <td className="px-4 py-2.5 text-right">{s.likes}</td>
                  <td className="px-4 py-2.5 text-right">{s.saves}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--text-muted)]">
                    {s.duration}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.status === "success" ? (
                      <span className="badge badge-green">✓</span>
                    ) : (
                      <span className="badge badge-red" title={s.error}>
                        ✗
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Content Recreation Table                                           */
/* ------------------------------------------------------------------ */

const CONTENT_TYPES: ContentRecreationItem["contentType"][] = [
  "reel",
  "carousel",
  "story",
  "static",
  "other",
];
const PRIORITIES: ContentRecreationItem["priority"][] = ["high", "medium", "low"];
const STATUSES: ContentRecreationItem["status"][] = [
  "queued",
  "scripting",
  "filming",
  "editing",
  "posted",
  "archived",
];

const TYPE_EMOJI: Record<ContentRecreationItem["contentType"], string> = {
  reel: "🎬",
  carousel: "📸",
  story: "📖",
  static: "🖼️",
  other: "📌",
};

const PRIORITY_BADGE: Record<ContentRecreationItem["priority"], string> = {
  high: "badge-red",
  medium: "badge-yellow",
  low: "badge-gray",
};

const STATUS_BADGE: Record<ContentRecreationItem["status"], string> = {
  queued: "badge-gray",
  scripting: "badge-blue",
  filming: "badge-purple",
  editing: "badge-yellow",
  posted: "badge-green",
  archived: "badge-gray",
};

const EMPTY_FORM: Omit<ContentRecreationItem, "id" | "createdAt" | "updatedAt"> = {
  originalUrl: "",
  originalAuthor: "",
  description: "",
  contentType: "reel",
  niche: "",
  estimatedViews: "",
  priority: "medium",
  status: "queued",
  ourUrl: "",
  notes: "",
};

function ContentRecreationTable() {
  const [items, setItems] = useState<ContentRecreationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/social-media/content-recreation");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const action = editingId ? "update" : "create";
      const payload = editingId ? { action, id: editingId, ...form } : { action, ...form };
      const res = await fetch("/api/social-media/content-recreation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchItems();
        setForm(EMPTY_FORM);
        setShowForm(false);
        setEditingId(null);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch("/api/social-media/content-recreation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    await fetchItems();
  };

  const handleStatusChange = async (id: string, status: ContentRecreationItem["status"]) => {
    await fetch("/api/social-media/content-recreation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, status }),
    });
    await fetchItems();
  };

  const startEdit = (item: ContentRecreationItem) => {
    setEditingId(item.id);
    setForm({
      originalUrl: item.originalUrl,
      originalAuthor: item.originalAuthor,
      description: item.description,
      contentType: item.contentType,
      niche: item.niche,
      estimatedViews: item.estimatedViews,
      priority: item.priority,
      status: item.status,
      ourUrl: item.ourUrl,
      notes: item.notes,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // Filter logic
  const filtered = items.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterPriority !== "all" && item.priority !== filterPriority) return false;
    return true;
  });

  // Stats
  const statusCounts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="card flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              🔄 Content Recreation Pipeline
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Track viral content to recreate — from discovery to posting
            </p>
          </div>
          <button
            onClick={() => {
              if (showForm) cancelForm();
              else setShowForm(true);
            }}
            className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
          >
            {showForm ? "✕ Cancel" : "+ Add Content"}
          </button>
        </div>

        {/* Mini stats */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(["queued", "scripting", "filming", "editing", "posted"] as const).map((s) => (
            <span
              key={s}
              className={`badge ${STATUS_BADGE[s]} cursor-pointer ${filterStatus === s ? "ring-1 ring-white/20" : ""}`}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            >
              {s}: {statusCounts[s] || 0}
            </span>
          ))}
          <span
            className={`badge badge-gray cursor-pointer ${filterStatus === "all" && filterPriority === "all" ? "ring-1 ring-white/20" : ""}`}
            onClick={() => {
              setFilterStatus("all");
              setFilterPriority("all");
            }}
          >
            all: {items.length}
          </span>
        </div>
      </div>

      {/* Input Form */}
      {showForm && (
        <div className="card border-[var(--accent)] border-opacity-30" style={{ borderColor: "rgba(0,212,170,0.3)" }}>
          <h3 className="text-sm font-semibold mb-4">
            {editingId ? "✏️ Edit Content" : "➕ Add Content to Recreate"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Original URL */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="label-upper mb-1 block">Original URL *</label>
              <input
                type="url"
                className="input"
                placeholder="https://instagram.com/reel/..."
                value={form.originalUrl}
                onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              />
            </div>

            {/* Author */}
            <div>
              <label className="label-upper mb-1 block">Author</label>
              <input
                className="input"
                placeholder="@username"
                value={form.originalAuthor}
                onChange={(e) => setForm({ ...form, originalAuthor: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="label-upper mb-1 block">Description</label>
              <input
                className="input"
                placeholder="What makes this content viral? Key hook, format..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="label-upper mb-1 block">Type</label>
              <select
                className="input"
                value={form.contentType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contentType: e.target.value as ContentRecreationItem["contentType"],
                  })
                }
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_EMOJI[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Niche */}
            <div>
              <label className="label-upper mb-1 block">Niche / Topic</label>
              <input
                className="input"
                placeholder="AI, fitness, business..."
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
              />
            </div>

            {/* Est. Views */}
            <div>
              <label className="label-upper mb-1 block">Est. Views</label>
              <input
                className="input"
                placeholder="1.2M, 500K..."
                value={form.estimatedViews}
                onChange={(e) => setForm({ ...form, estimatedViews: e.target.value })}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="label-upper mb-1 block">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value as ContentRecreationItem["priority"],
                  })
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="label-upper mb-1 block">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as ContentRecreationItem["status"],
                  })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Our recreated URL */}
            <div>
              <label className="label-upper mb-1 block">Our Post URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://instagram.com/reel/... (after posting)"
                value={form.ourUrl}
                onChange={(e) => setForm({ ...form, ourUrl: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="label-upper mb-1 block">Notes</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Recreation angle, twist ideas, what to change..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={saving || !form.originalUrl.trim()}
              className="btn btn-primary"
              style={
                !form.originalUrl.trim()
                  ? { opacity: 0.4, cursor: "not-allowed" }
                  : {}
              }
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editingId ? (
                "💾 Update"
              ) : (
                "✓ Add to Pipeline"
              )}
            </button>
            <button onClick={cancelForm} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Filter:</span>
          <select
            className="input text-xs"
            style={{ width: "auto", padding: "0.25rem 0.5rem" }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="input text-xs"
            style={{ width: "auto", padding: "0.25rem 0.5rem" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          {(filterStatus !== "all" || filterPriority !== "all") && (
            <button
              className="text-xs text-[var(--accent)] hover:underline"
              onClick={() => {
                setFilterStatus("all");
                setFilterPriority("all");
              }}
            >
              Clear filters
            </button>
          )}
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            {filtered.length} of {items.length} items
          </span>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🎬</p>
              <p className="text-sm text-[var(--text-muted)]">
                {items.length === 0
                  ? "No content in the recreation pipeline yet."
                  : "No items match the current filters."}
              </p>
              {items.length === 0 && (
                <button
                  className="btn btn-primary mt-3 text-xs"
                  onClick={() => setShowForm(true)}
                >
                  + Add your first content
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-wider bg-[var(--bg)]">
                  <th className="text-left px-4 py-2.5 w-8">#</th>
                  <th className="text-left px-4 py-2.5">Content</th>
                  <th className="text-left px-4 py-2.5 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-2.5 hidden lg:table-cell">Niche</th>
                  <th className="text-center px-4 py-2.5 hidden sm:table-cell">Views</th>
                  <th className="text-center px-4 py-2.5">Priority</th>
                  <th className="text-center px-4 py-2.5">Status</th>
                  <th className="text-right px-4 py-2.5 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <Fragment key={item.id}>
                    <tr
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === item.id ? null : item.id)
                      }
                    >
                      <td className="px-4 py-2.5 text-[var(--text-muted)] font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate max-w-[240px]">
                            {item.description || "Untitled"}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] truncate max-w-[240px]">
                            {item.originalAuthor && `@${item.originalAuthor.replace("@", "")} · `}
                            {item.originalUrl
                              ? new URL(item.originalUrl).pathname.slice(0, 30)
                              : "No URL"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="text-xs">
                          {TYPE_EMOJI[item.contentType]}{" "}
                          {item.contentType.charAt(0).toUpperCase() +
                            item.contentType.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell">
                        <span className="text-xs text-[var(--text-muted)]">
                          {item.niche || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center hidden sm:table-cell">
                        <span className="text-xs font-mono">
                          {item.estimatedViews || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`badge ${PRIORITY_BADGE[item.priority]}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <select
                          className="text-xs bg-transparent border-none cursor-pointer"
                          value={item.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as ContentRecreationItem["status"]
                            )
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.originalUrl && (
                            <a
                              href={item.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors"
                              title="Open original"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🔗
                            </a>
                          )}
                          <button
                            className="p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(item);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === item.id && (
                      <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="label-upper">Original URL</span>
                              <p className="mt-1 break-all">
                                {item.originalUrl ? (
                                  <a
                                    href={item.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--accent)] hover:underline"
                                  >
                                    {item.originalUrl}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="label-upper">Our Post URL</span>
                              <p className="mt-1 break-all">
                                {item.ourUrl ? (
                                  <a
                                    href={item.ourUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--accent)] hover:underline"
                                  >
                                    {item.ourUrl}
                                  </a>
                                ) : (
                                  <span className="text-[var(--text-muted)]">
                                    Not posted yet
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="label-upper">Added</span>
                              <p className="mt-1 text-[var(--text-muted)]">
                                {new Date(item.createdAt).toLocaleDateString()}{" "}
                                {new Date(item.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {item.notes && (
                              <div className="sm:col-span-2 lg:col-span-3">
                                <span className="label-upper">Notes</span>
                                <p className="mt-1 text-[var(--text-secondary)] whitespace-pre-wrap">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function SocialMediaPage() {
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [aggregate, setAggregate] = useState<Aggregate>({
    reels: 0,
    likes: 0,
    saves: 0,
    comments: 0,
  });
  const [profile, setProfile] = useState<ProfileMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/social-media/logs");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setAggregate(data.aggregate || { reels: 0, likes: 0, saves: 0, comments: 0 });
      }
    } catch {
      // silent
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/social-media/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.metrics || null);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchLogs(), fetchProfile()]).finally(() => setLoading(false));
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs, fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📱 Social Media Manager
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Instagram warm-up automation — phone control & session monitoring
        </p>
      </div>

      {/* Today&apos;s Stats */}
      <StatsCard aggregate={aggregate} />

      {/* Main Grid: Phone Mirror (left) | Controls + Info (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left: Phone Mirror */}
        <div className="space-y-4">
          <PhoneMirror />
        </div>

        {/* Right: Schedule, Profile, Test Run */}
        <div className="space-y-4">
          <ScheduleCard sessions={sessions} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ProfileCard metrics={profile} />
            <div className="card flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  🧪 Quick Actions
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Run a 1-minute test session to verify phone connectivity and
                  automation pipeline.
                </p>
              </div>
              <TestRunButton onComplete={fetchLogs} />
            </div>
          </div>
        </div>
      </div>

      {/* Session History */}
      <SessionHistory sessions={sessions} />

      {/* Content Recreation Pipeline */}
      <ContentRecreationTable />
    </div>
  );
}
