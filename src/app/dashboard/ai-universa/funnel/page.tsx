"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_QUIZ_FUNNEL_API_URL || "http://localhost:3003";

type GroupStat = {
  id: number;
  name: string;
  inviteLink: string;
  capacity: number;
  currentCount: number;
  status: string;
  fillPercent: number;
  isCurrent: boolean;
};

type WarmLead = {
  email: string;
  surveyAnswers?: Record<string, string>;
  groupId: number;
  groupName: string;
  joinedAt: string;
  qualified: boolean;
};

type FunnelStats = {
  totals: {
    lpVisits: number;
    surveyCompletions: number;
    whatsappJoins: number;
    conversionRate: number;
    totalCapacity: number;
    usedCapacity: number;
    availableCapacity: number;
    capacityUsedPercent: number;
  };
  currentGroup: GroupStat | null;
  groups: GroupStat[];
  warnings: string[];
  warmLeads: WarmLead[];
  updatedAt: string;
};

const statCard = "rounded-3xl border border-white/10 bg-white/[0.03] p-5";

export default function AIUniversaFunnelPage() {
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/whatsapp/stats`, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load funnel stats");
        }

        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStats();
    const interval = window.setInterval(loadStats, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const topGroups = useMemo(() => stats?.groups.slice(0, 12) || [], [stats]);

  if (loading && !stats) {
    return <div className="text-slate-300">Nalagam AI Universa funnel metrike...</div>;
  }

  if (error && !stats) {
    return <div className="text-red-300">{error}</div>;
  }

  if (!stats) {
    return <div className="text-slate-300">Ni podatkov.</div>;
  }

  return (
    <div className="max-w-7xl space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">AI Universa · Funnel</h1>
        <p className="text-sm text-slate-400">Live overview of survey → WhatsApp join flow. Zadnja osvežitev: {new Date(stats.updatedAt).toLocaleString()}</p>
      </div>

      {stats.warnings.length > 0 ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
          <p className="font-semibold">⚠️ WhatsApp kapaciteta pri 80%! Pripravite nove skupine.</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-100">
            {stats.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total LP visits", value: stats.totals.lpVisits.toLocaleString(), helper: "Placeholder until analytics is wired" },
          { label: "Survey completions", value: stats.totals.surveyCompletions.toLocaleString(), helper: "Stored from completed funnel payloads" },
          { label: "WhatsApp joins", value: stats.totals.whatsappJoins.toLocaleString(), helper: `Current active: ${stats.currentGroup ? `Skupina #${stats.currentGroup.id}` : "n/a"}` },
          { label: "Conversion rate", value: `${stats.totals.conversionRate}%`, helper: "Joins / survey completions" },
        ].map((item) => (
          <div key={item.label} className={statCard}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
            <p className="mt-2 text-xs text-slate-500">{item.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">WhatsApp group fill levels</p>
              <p className="text-xs text-slate-500">Showing first 12 groups. Active group is highlighted.</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Used: {stats.totals.usedCapacity.toLocaleString()} / {stats.totals.totalCapacity.toLocaleString()}</div>
              <div>Available: {stats.totals.availableCapacity.toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topGroups.map((group) => (
              <div key={group.id} className={`rounded-2xl border p-4 ${group.isCurrent ? "border-[#ffd21f]/50 bg-[#ffd21f]/10" : "border-white/10 bg-black/20"}`}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Skupina #{group.id}</p>
                    <p className="text-xs text-slate-500">{group.name}</p>
                  </div>
                  <div className="text-right text-sm text-white">{group.currentCount} / {group.capacity}</div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${group.isCurrent ? "bg-[#ffd21f]" : "bg-[#7C5CFC]"}`}
                    style={{ width: `${Math.min(group.fillPercent, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{group.fillPercent}% full</span>
                  <span>{group.isCurrent ? "ACTIVE" : group.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-semibold text-white">Capacity snapshot</p>
            <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${stats.totals.capacityUsedPercent >= 80 ? "bg-red-500" : "bg-emerald-400"}`} style={{ width: `${Math.min(stats.totals.capacityUsedPercent, 100)}%` }} />
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{stats.totals.capacityUsedPercent}%</p>
            <p className="mt-1 text-xs text-slate-500">Total capacity used across all 50 groups</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-semibold text-white">Warm leads</p>
            <div className="mt-4 space-y-3">
              {stats.warmLeads.length === 0 ? (
                <p className="text-sm text-slate-500">No leads logged yet.</p>
              ) : (
                stats.warmLeads.slice(0, 10).map((lead) => (
                  <div key={`${lead.email}-${lead.joinedAt}`} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-white">{lead.email || "unknown@email.com"}</p>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#ffd21f]">#{lead.groupId}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{lead.groupName}</p>
                    <p className="mt-2 text-[11px] text-slate-500">{new Date(lead.joinedAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="text-sm text-red-300">Fetch warning: {error}</div> : null}
    </div>
  );
}
