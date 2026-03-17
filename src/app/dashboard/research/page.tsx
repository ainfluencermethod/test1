"use client";

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Outlier {
  account?: string;
  url: string;
  shortCode?: string;
  caption?: string;
  type?: string;
  likes: number;
  comments: number;
  views?: number;
  outlierType?: string;
  engagementMultiplier: string;
  viewMultiplier?: string;
}

interface Profile {
  username: string;
  postCount: number;
  avgLikes: number;
  avgComments: number;
  avgViews: number;
  avgEngagement: number;
  outliers: Outlier[];
}

interface NicheReport {
  niche: string;
  scrapedAt: string;
  accountCount: number;
  totalPostsScraped: number;
  profiles: Profile[];
  outliers: Outlier[];
}

interface IGReport {
  hour: string;
  data: NicheReport[];
}

interface MarkdownReport {
  hour?: string;
  type?: string;
  content: string;
}

interface DateSummary {
  date: string;
  igCount: number;
  webXYTCount: number;
  leadCount: number;
  totalReports: number;
}

interface ReportData {
  date: string;
  igReports: IGReport[];
  webXYTReports: MarkdownReport[];
  leadReports: MarkdownReport[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const AVATAR_COLORS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ------------------------------------------------------------------ */
/*  Simple Markdown Renderer                                           */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-4 mb-2 text-[var(--text)]">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-semibold mt-4 mb-2 text-[var(--text)]">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-semibold mt-3 mb-1 text-[var(--text)]">{line.slice(4)}</h3>);
    } else if (line.startsWith("#### ")) {
      elements.push(<h4 key={i} className="text-sm font-semibold mt-2 mb-1 text-[var(--text)]">{line.slice(5)}</h4>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-[var(--border)] my-4" />);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 text-sm text-[var(--text-muted)] ml-2 my-0.5">
          <span className="text-[var(--accent)]">•</span>
          <span>{formatInlineMarkdown(line.slice(2))}</span>
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)![1];
      elements.push(
        <div key={i} className="flex gap-2 text-sm text-[var(--text-muted)] ml-2 my-0.5">
          <span className="text-[var(--accent)] font-medium min-w-[1.2rem]">{num}.</span>
          <span>{formatInlineMarkdown(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="text-sm text-[var(--text-muted)] leading-relaxed">{formatInlineMarkdown(line)}</p>);
    }
  }

  return <div>{elements}</div>;
}

function formatInlineMarkdown(text: string): React.ReactNode {
  // Bold + links
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // Bold
      parts.push(<strong key={match.index} className="text-[var(--text)] font-medium">{match[2]}</strong>);
    } else if (match[3] && match[4]) {
      // Link
      parts.push(
        <a key={match.index} href={match[4]} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
          {match[3]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? <>{parts}</> : text;
}

/* ------------------------------------------------------------------ */
/*  Agent Paper Tabs                                                   */
/* ------------------------------------------------------------------ */

type AgentTab = "lead" | "instagram" | "webxyt";

const AGENT_TABS: { key: AgentTab; label: string; icon: string }[] = [
  { key: "lead", label: "Research Lead", icon: "📋" },
  { key: "instagram", label: "Instagram Intel", icon: "📸" },
  { key: "webxyt", label: "Web / X / YouTube", icon: "🌐" },
];

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function ResearchPage() {
  const [dates, setDates] = useState<DateSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentTab>("lead");
  const [leadExpanded, setLeadExpanded] = useState(false);

  // Fetch available dates
  useEffect(() => {
    fetch("/api/research")
      .then((r) => r.json())
      .then((data) => {
        const d: DateSummary[] = data.dates || [];
        setDates(d);
        if (d.length > 0 && !selectedDate) setSelectedDate(d[0].date);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReport = useCallback((date: string) => {
    setLoadingReport(true);
    fetch(`/api/research/${date}`)
      .then((r) => r.json())
      .then((data) => {
        setReportData(data);
        // Default to lead tab if lead report exists, otherwise first available
        if (data.leadReports?.length > 0) setActiveTab("lead");
        else if (data.igReports?.length > 0) setActiveTab("instagram");
        else setActiveTab("webxyt");
      })
      .catch(() => setReportData(null))
      .finally(() => setLoadingReport(false));
  }, []);

  useEffect(() => {
    if (selectedDate) fetchReport(selectedDate);
  }, [selectedDate, fetchReport]);

  // Aggregate IG data
  const allOutliers: (Outlier & { niche: string })[] = [];
  const allProfiles: (Profile & { niche: string })[] = [];
  let totalPostsScraped = 0;

  if (reportData) {
    for (const ig of reportData.igReports) {
      for (const niche of ig.data) {
        totalPostsScraped += niche.totalPostsScraped;
        for (const o of niche.outliers || []) {
          allOutliers.push({ ...o, niche: niche.niche });
        }
        for (const p of niche.profiles || []) {
          allProfiles.push({ ...p, niche: niche.niche });
        }
      }
    }
  }

  allOutliers.sort(
    (a, b) => parseFloat(b.engagementMultiplier) - parseFloat(a.engagementMultiplier)
  );

  const profileMap = new Map<string, (typeof allProfiles)[0]>();
  for (const p of allProfiles) {
    if (!profileMap.has(p.username)) profileMap.set(p.username, p);
  }
  const uniqueProfiles = Array.from(profileMap.values());

  // Lead report — pick the most recent one
  const leadReport = reportData?.leadReports?.[reportData.leadReports.length - 1];
  const LEAD_PREVIEW_LINES = 12;

  function getLeadPreview(content: string) {
    const lines = content.split("\n");
    return lines.slice(0, LEAD_PREVIEW_LINES).join("\n");
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🔍 Research Hub
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Intelligence reports from the Research Department
          </p>
        </div>
        <div className="flex items-center gap-3">
          {reportData && (
            <>
              <span className="badge badge-green">
                {allOutliers.length} outliers
              </span>
              <span className="badge badge-blue">
                {totalPostsScraped} posts scraped
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Date Selector ────────────────────────────────────────── */}
      {loading ? (
        <div className="card p-8 text-center text-[var(--text-muted)]">
          Loading reports…
        </div>
      ) : dates.length === 0 ? (
        <div className="card p-8 text-center text-[var(--text-muted)]">
          No research reports found yet. Reports generate at noon and midnight.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => { setSelectedDate(d.date); setLeadExpanded(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDate === d.date
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] border border-[var(--border)]"
                }`}
              >
                {new Date(d.date + "T12:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </button>
            ))}
          </div>

          {loadingReport ? (
            <div className="card p-8 text-center text-[var(--text-muted)]">
              Loading report data…
            </div>
          ) : reportData ? (
            <div className="space-y-6">

              {/* ════════════════════════════════════════════════════ */}
              {/* LEAD REPORT — ALWAYS ON TOP                         */}
              {/* ════════════════════════════════════════════════════ */}
              {leadReport ? (
                <div
                  className="card overflow-hidden"
                  style={{ borderLeft: "4px solid var(--accent)", padding: 0 }}
                >
                  <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-lg">
                        📋
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          Research Lead Report
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          {leadReport.type === "noon" ? "☀️ Noon Briefing" : "🌙 Midnight Briefing"} — {selectedDate}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-green text-xs">LEAD</span>
                  </div>

                  <div className="px-6 py-5">
                    {leadExpanded ? (
                      <div className="max-h-[800px] overflow-y-auto pr-2">
                        {renderMarkdown(leadReport.content)}
                      </div>
                    ) : (
                      <div>
                        {renderMarkdown(getLeadPreview(leadReport.content))}
                        {leadReport.content.split("\n").length > LEAD_PREVIEW_LINES && (
                          <div className="mt-1 h-8 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                        )}
                      </div>
                    )}
                  </div>

                  {leadReport.content.split("\n").length > LEAD_PREVIEW_LINES && (
                    <div className="px-6 pb-4">
                      <button
                        onClick={() => setLeadExpanded(!leadExpanded)}
                        className="btn btn-secondary w-full justify-center"
                      >
                        {leadExpanded ? "Collapse Report ▲" : "Read Full Report ▼"}
                      </button>
                    </div>
                  )}

                  {/* Show all lead reports if more than one */}
                  {reportData.leadReports.length > 1 && (
                    <div className="px-6 pb-4 pt-2 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)] mb-2">Other reports today:</p>
                      <div className="flex gap-2">
                        {reportData.leadReports.map((lr, idx) => (
                          <span key={idx} className="badge badge-gray text-xs">
                            {lr.type === "noon" ? "☀️ Noon" : "🌙 Midnight"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="card p-6 text-center"
                  style={{ borderLeft: "4px solid var(--border)" }}
                >
                  <p className="text-[var(--text-muted)]">
                    📋 No Research Lead report yet for this date. The lead synthesizes at noon and midnight.
                  </p>
                </div>
              )}

              {/* ════════════════════════════════════════════════════ */}
              {/* AGENT RESEARCH PAPERS — TAB VIEW                    */}
              {/* ════════════════════════════════════════════════════ */}
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  📂 Agent Research Papers
                </h2>

                {/* Tab buttons */}
                <div className="flex gap-1 mb-4 bg-[var(--bg-card)] rounded-lg p-1 border border-[var(--border)] w-full sm:w-fit overflow-x-auto">
                  {AGENT_TABS.map((tab) => {
                    const count =
                      tab.key === "lead" ? (reportData.leadReports?.length || 0) :
                      tab.key === "instagram" ? (reportData.igReports?.length || 0) :
                      (reportData.webXYTReports?.length || 0);

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                          activeTab === tab.key
                            ? "bg-[var(--accent)] text-black"
                            : "text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        <span>{tab.icon}</span>
                        {tab.label}
                        {count > 0 && (
                          <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                            activeTab === tab.key
                              ? "bg-black/20 text-black"
                              : "bg-[var(--border)] text-[var(--text-muted)]"
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div>
                  {/* ── Lead Tab ─────────────────────────────────── */}
                  {activeTab === "lead" && (
                    <div className="space-y-4">
                      {reportData.leadReports.length === 0 ? (
                        <div className="card p-8 text-center text-[var(--text-muted)]">
                          No lead reports available yet.
                        </div>
                      ) : (
                        reportData.leadReports.map((lr, idx) => (
                          <div key={idx} className="card p-0 overflow-hidden">
                            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
                              <span className="badge badge-green text-xs">
                                {lr.type === "noon" ? "☀️ Noon" : "🌙 Midnight"}
                              </span>
                              <span className="text-sm text-[var(--text-muted)]">
                                Research Lead Synthesis
                              </span>
                            </div>
                            <div className="px-5 py-4 max-h-[600px] overflow-y-auto">
                              {renderMarkdown(lr.content)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── Instagram Tab ────────────────────────────── */}
                  {activeTab === "instagram" && (
                    <div className="space-y-6">
                      {/* Outliers */}
                      <div>
                        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                          🔥 Outliers
                          {allOutliers.length > 0 && (
                            <span className="badge badge-green">{allOutliers.length}</span>
                          )}
                        </h3>
                        {allOutliers.length === 0 ? (
                          <div className="card p-6 text-center text-[var(--text-muted)]">
                            No outliers detected this cycle.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {allOutliers.map((o, i) => {
                              const name = o.account || "unknown";
                              return (
                                <div key={`${o.url}-${i}`} className="card p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                                  <div className="flex items-start gap-3">
                                    <div
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
                                      style={{ backgroundColor: avatarColor(name) }}
                                    >
                                      {name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-[var(--text)]">@{name}</span>
                                        <span className="badge badge-green">{o.engagementMultiplier}x</span>
                                        {o.type && <span className="badge badge-blue text-xs">{o.type}</span>}
                                      </div>
                                      <div className="flex gap-4 mt-2 text-xs text-[var(--text-muted)]">
                                        {o.likes >= 0 && <span>❤️ {formatNumber(o.likes)}</span>}
                                        <span>💬 {formatNumber(o.comments)}</span>
                                        {o.views != null && o.views > 0 && <span>👁 {formatNumber(o.views)}</span>}
                                        {o.viewMultiplier && o.viewMultiplier !== "N/A" && (
                                          <span className="text-[var(--accent)]">{o.viewMultiplier}x views</span>
                                        )}
                                      </div>
                                      {o.caption && (
                                        <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">
                                          &ldquo;{o.caption.slice(0, 140)}{o.caption.length > 140 ? "…" : ""}&rdquo;
                                        </p>
                                      )}
                                      {o.url && (
                                        <a href={o.url} target="_blank" rel="noopener noreferrer"
                                          className="text-xs text-[var(--accent)] hover:underline mt-1.5 inline-block">
                                          View Post →
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Account Performance */}
                      {uniqueProfiles.length > 0 && (
                        <div>
                          <h3 className="text-base font-semibold mb-3">📊 Account Performance</h3>
                          <div className="card p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-wider bg-[var(--bg)]">
                                    <th className="text-left px-4 py-3">Account</th>
                                    <th className="text-left px-4 py-3">Niche</th>
                                    <th className="text-right px-4 py-3">Posts</th>
                                    <th className="text-right px-4 py-3">Avg ❤️</th>
                                    <th className="text-right px-4 py-3">Avg 💬</th>
                                    <th className="text-right px-4 py-3">Avg 👁</th>
                                    <th className="text-right px-4 py-3">Outliers</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {uniqueProfiles.map((p) => (
                                    <tr key={p.username}
                                      className={`border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors ${
                                        p.postCount === 0 ? "opacity-40" : ""
                                      }`}
                                    >
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0"
                                            style={{ backgroundColor: avatarColor(p.username) }}>
                                            {p.username[0].toUpperCase()}
                                          </div>
                                          <span className="font-medium">@{p.username}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-[var(--text-muted)] capitalize">{p.niche}</td>
                                      <td className="px-4 py-3 text-right">{p.postCount}</td>
                                      <td className="px-4 py-3 text-right">{formatNumber(p.avgLikes)}</td>
                                      <td className="px-4 py-3 text-right">{formatNumber(p.avgComments)}</td>
                                      <td className="px-4 py-3 text-right">{formatNumber(p.avgViews)}</td>
                                      <td className="px-4 py-3 text-right">
                                        {p.outliers.length > 0 ? (
                                          <span className="badge badge-green">{p.outliers.length}</span>
                                        ) : (
                                          <span className="text-[var(--text-muted)]">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* IG Summary reports */}
                      {reportData.igReports.map((ig) => (
                        <div key={ig.hour} className="card p-0 overflow-hidden">
                          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
                            <span className="badge badge-blue text-xs">📸 {ig.hour}:00</span>
                            <span className="text-sm text-[var(--text-muted)]">
                              Instagram Scraper — {ig.data.reduce((s, n) => s + n.totalPostsScraped, 0)} posts across {ig.data.reduce((s, n) => s + n.accountCount, 0)} accounts
                            </span>
                          </div>
                        </div>
                      ))}

                      {reportData.igReports.length === 0 && allOutliers.length === 0 && (
                        <div className="card p-8 text-center text-[var(--text-muted)]">
                          No Instagram data for this date yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Web/X/YT Tab ─────────────────────────────── */}
                  {activeTab === "webxyt" && (
                    <div className="space-y-4">
                      {reportData.webXYTReports.length === 0 ? (
                        <div className="card p-8 text-center text-[var(--text-muted)]">
                          No Web/X/YouTube research papers for this date yet.
                        </div>
                      ) : (
                        reportData.webXYTReports.map((r, idx) => (
                          <div key={idx} className="card p-0 overflow-hidden">
                            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
                              <span className="badge badge-blue text-xs">🌐 {r.hour || "—"}:00</span>
                              <span className="text-sm text-[var(--text-muted)]">
                                Web / X / YouTube Intelligence
                              </span>
                            </div>
                            <div className="px-5 py-4 max-h-[700px] overflow-y-auto">
                              {renderMarkdown(r.content)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {reportData.igReports.length === 0 &&
                reportData.webXYTReports.length === 0 &&
                reportData.leadReports.length === 0 && (
                  <div className="card p-8 text-center text-[var(--text-muted)]">
                    No report data available for {selectedDate}. Reports generate at noon and midnight.
                  </div>
                )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
