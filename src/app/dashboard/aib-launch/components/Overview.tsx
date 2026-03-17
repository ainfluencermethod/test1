"use client";

import { useState, useEffect, useCallback } from "react";

interface ChecklistItem {
  id: string;
  item: string;
  checked: boolean;
}

function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2026-03-13T07:00:00Z"); // March 13 00:00 UTC-7
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="flex gap-4 justify-center">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <div className="text-4xl font-bold text-[var(--accent)] tabular-nums">
            {String(u.value).padStart(2, "0")}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Overview() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const fetchChecklist = useCallback(async () => {
    const res = await fetch("/api/aib-launch/checklist");
    const data = await res.json();
    setChecklist(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const toggle = async (id: string, checked: boolean) => {
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
    await fetch("/api/aib-launch/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked }),
    });
    setToast("Saved!");
    setTimeout(() => setToast(""), 2000);
  };

  const completed = checklist.filter((i) => i.checked).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const metrics = [
    { label: "Total Leads", value: "2,600", icon: "👥", sub: "Cold list" },
    { label: "OTO Conversions", value: "—", icon: "💰", sub: "$27 each" },
    { label: "Community Sign-ups", value: "—", icon: "🏠", sub: "$97/mo" },
    { label: "Revenue", value: "$0", icon: "📊", sub: "Launch total" },
  ];

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Countdown */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 text-center">
        <h2 className="text-lg text-[var(--text-muted)] mb-2">🚀 Launch Countdown</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">March 13, 2026 — 12:00 AM PST</p>
        <Countdown />
      </div>

      {/* Funnel Visualization */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold mb-4">📊 Funnel Flow</h3>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { label: "Freebie", desc: "AI Character GPS", color: "bg-blue-500/20 border-blue-500/40" },
            { label: "→", desc: "", color: "" },
            { label: "OTO", desc: "$27 — AI Method", color: "bg-yellow-500/20 border-yellow-500/40" },
            { label: "→", desc: "", color: "" },
            { label: "Community", desc: "$97/mo or $497/yr", color: "bg-green-500/20 border-green-500/40" },
          ].map((step, i) =>
            step.color ? (
              <div key={i} className={`${step.color} border rounded-lg px-6 py-4 text-center min-w-[140px]`}>
                <div className="font-semibold">{step.label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{step.desc}</div>
              </div>
            ) : (
              <span key={i} className="text-2xl text-[var(--text-muted)]">{step.label}</span>
            )
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
              <span>{m.icon}</span> {m.label}
            </div>
            <div className="text-2xl font-bold">{m.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">✅ Launch Checklist</h3>
          <span className="text-sm text-[var(--text-muted)]">{completed}/{total} ({pct}%)</span>
        </div>
        <div className="w-full bg-[var(--border)] rounded-full h-2 mb-4">
          <div
            className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {loading ? (
          <div className="text-[var(--text-muted)] text-sm">Loading...</div>
        ) : (
          <div className="space-y-2">
            {checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => toggle(item.id, e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--accent)]"
                />
                <span className={item.checked ? "line-through text-[var(--text-muted)]" : ""}>
                  {item.item}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
