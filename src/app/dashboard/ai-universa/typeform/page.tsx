"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type LeadGrade = "A" | "B" | "C" | "D";

interface ReportStatsData {
  total_reports: number;
  average_readiness_score: number;
  score_distribution: { "15_35": number; "36_55": number; "56_75": number; "76_100": number };
  grade_distribution: Record<LeadGrade, number>;
  income_distribution: Record<string, number>;
  interest_distribution: Record<string, number>;
  reports_by_date: Record<string, number>;
  latest_reports: Array<{
    report_id: string;
    name: string;
    email: string;
    readiness_score: number;
    grade: string;
    interest: string;
    income_potential: string;
    generated_at: string;
  }>;
  last_updated: string;
}

interface BreakdownItem {
  label: string;
  count: number;
}

interface LeadScoreBucket {
  label: string;
  min: number;
  max: number;
  count: number;
}

interface LeadVolumePoint {
  date: string;
  count: number;
}

interface TypeformSubmission {
  id: string;
  submittedAt: string;
  respondentName?: string;
  email?: string;
  phone?: string;
  interest?: string;
  aiMaturity?: string;
  budget?: string;
  urgency?: string;
  blocker?: string;
  role?: string;
  score?: number;
  leadGrade?: LeadGrade;
}

interface LeadScoreDashboardData {
  connected: boolean;
  source: "jsonl" | "json" | "none";
  sourcePath: string | null;
  setup: {
    webhookUrl: string;
    jsonlPath: string;
    jsonPath: string;
    nextSteps: string[];
  };
  totals: {
    submissions: number;
    scoredSubmissions: number;
    averageScore: number;
  };
  gradeDistribution: Record<LeadGrade, number>;
  scoreBuckets: LeadScoreBucket[];
  responseVolume: LeadVolumePoint[];
  breakdowns: {
    interest: BreakdownItem[];
    aiMaturity: BreakdownItem[];
    budget: BreakdownItem[];
    urgency: BreakdownItem[];
    blocker: BreakdownItem[];
    role: BreakdownItem[];
  };
  latestSubmissions: TypeformSubmission[];
  lastUpdated: string;
}

const pageCard: CSSProperties = {
  background: "#121419",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 18,
  padding: 24,
};

const labelStyle: CSSProperties = {
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#6B7280",
  fontWeight: 700,
};

const numberStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700,
  color: "rgba(255,255,255,0.94)",
};

function fmtDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDateTime(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function gradeColor(grade: LeadGrade) {
  if (grade === "A") return "#E8E342";
  if (grade === "B") return "#7C5CFC";
  if (grade === "C") return "#F59E0B";
  return "#EF4444";
}

function sourceLabel(source: LeadScoreDashboardData["source"] | "remote") {
  if (source === "jsonl") return "JSONL store";
  if (source === "json") return "JSON store";
  if (source === "remote") return "Hostinger API";
  return "No store";
}

function StatusPill({ connected, source }: { connected: boolean; source: LeadScoreDashboardData["source"] }) {
  const color = connected ? "#00D4AA" : "#F59E0B";
  const text = connected ? `Connected via ${sourceLabel(source)}` : "Not connected";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 9999,
        background: `${color}14`,
        border: `1px solid ${color}33`,
        color,
        fontSize: "0.75rem",
        fontWeight: 700,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px ${color}77`,
        }}
      />
      {text}
    </span>
  );
}

function MetricCard({ title, value, detail, accent }: { title: string; value: string | number; detail: string; accent: string }) {
  return (
    <div style={{ ...pageCard, padding: 20, borderLeft: `3px solid ${accent}` }}>
      <div style={labelStyle}>{title}</div>
      <div style={{ ...numberStyle, fontSize: "1.75rem", marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "#80838F", marginTop: 6 }}>{detail}</div>
    </div>
  );
}

function DistributionBars({ values }: { values: Record<LeadGrade, number> }) {
  const max = Math.max(1, ...Object.values(values));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {(["A", "B", "C", "D"] as LeadGrade[]).map((grade) => {
        const value = values[grade];
        const width = `${Math.max(4, (value / max) * 100)}%`;
        const color = gradeColor(grade);
        return (
          <div key={grade}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.8125rem", color: "#D1D5DB", fontWeight: 600 }}>Lead {grade}</span>
              <span style={{ ...numberStyle, fontSize: "0.8125rem", color }}>{value}</span>
            </div>
            <div style={{ height: 10, borderRadius: 9999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ width, height: "100%", borderRadius: 9999, background: color, boxShadow: `0 0 12px ${color}55` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BucketChart({ buckets }: { buckets: LeadScoreBucket[] }) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {buckets.map((bucket) => {
        const height = `${Math.max(12, (bucket.count / max) * 100)}%`;
        return (
          <div key={bucket.label} style={{ display: "grid", gridTemplateColumns: "88px 1fr 44px", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{bucket.label}</span>
            <div style={{ height: 12, borderRadius: 9999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ width: height, height: "100%", background: "linear-gradient(90deg, #E8E342, #7C5CFC)", borderRadius: 9999 }} />
            </div>
            <span style={{ ...numberStyle, fontSize: "0.75rem" }}>{bucket.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function VolumeChart({ data }: { data: LeadVolumePoint[] }) {
  const max = Math.max(1, ...data.map((item) => item.count));
  if (!data.length) {
    return <div style={{ fontSize: "0.8125rem", color: "#6B7280" }}>No response volume yet</div>;
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, minHeight: 220, paddingTop: 18 }}>
      {data.map((item) => {
        const height = Math.max(12, (item.count / max) * 170);
        return (
          <div key={item.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ ...numberStyle, fontSize: "0.6875rem", color: "#9CA3AF" }}>{item.count}</div>
            <div
              title={`${item.date} ${item.count}`}
              style={{
                width: "100%",
                maxWidth: 40,
                height,
                borderRadius: 14,
                background: "linear-gradient(180deg, #E8E342, rgba(124,92,252,0.85))",
                boxShadow: "0 0 18px rgba(232,227,66,0.18)",
              }}
            />
            <div style={{ fontSize: "0.625rem", color: "#6B7280", textAlign: "center" }}>{fmtDate(item.date)}</div>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownList({ title, items }: { title: string; items: BreakdownItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <div style={{ ...pageCard, padding: 18 }}>
      <div style={{ ...labelStyle, marginBottom: 14 }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>No responses yet</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.slice(0, 8).map((item) => (
            <div key={`${title}-${item.label}`}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", color: "#D1D5DB" }}>{item.label}</span>
                <span style={{ ...numberStyle, fontSize: "0.75rem" }}>{item.count}</span>
              </div>
              <div style={{ height: 8, borderRadius: 9999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${Math.max(5, (item.count / max) * 100)}%`, height: "100%", borderRadius: 9999, background: "rgba(232,227,66,0.85)" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LatestTable({ submissions }: { submissions: TypeformSubmission[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              "Time",
              "Name",
              "Email",
              "Lead",
              "Score",
              "Interest",
              "AI maturity",
              "Budget",
              "Urgency",
            ].map((header) => (
              <th
                key={header}
                style={{
                  textAlign: "left",
                  padding: "12px 10px",
                  fontSize: "0.6875rem",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ padding: "18px 10px", color: "#6B7280", fontSize: "0.8125rem" }}>
                No submissions yet
              </td>
            </tr>
          ) : (
            submissions.map((submission) => (
              <tr key={submission.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 10px", fontSize: "0.75rem", color: "#9CA3AF" }}>{fmtDateTime(submission.submittedAt)}</td>
                <td style={{ padding: "12px 10px", fontSize: "0.75rem", color: "#E5E7EB", fontWeight: 600 }}>{submission.respondentName || "Unknown"}</td>
                <td style={{ padding: "12px 10px", fontSize: "0.75rem", color: "#D1D5DB" }}>{submission.email || "Unknown"}</td>
                <td style={{ padding: "12px 10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      minWidth: 28,
                      justifyContent: "center",
                      padding: "4px 8px",
                      borderRadius: 9999,
                      background: `${gradeColor(submission.leadGrade || "D")}18`,
                      border: `1px solid ${gradeColor(submission.leadGrade || "D")}40`,
                      color: gradeColor(submission.leadGrade || "D"),
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {submission.leadGrade || "D"}
                  </span>
                </td>
                <td style={{ padding: "12px 10px", ...numberStyle, fontSize: "0.75rem" }}>{submission.score ?? 0}</td>
                <td style={{ padding: "12px 10px", fontSize: "0.75rem", color: "#9CA3AF" }}>{submission.interest || "Unknown"}</td>
                <td style={{ padding: "12px 10px", fontSize: "0.75rem", color: "#9CA3AF" }}>{submission.aiMaturity || "Unknown"}</td>
                <td style={{ padding: "12px 10px", fontSize: "0.75rem", color: "#9CA3AF" }}>{submission.budget || "Unknown"}</td>
                <td style={{ padding: "12px 10px", fontSize: "0.75rem", color: "#9CA3AF" }}>{submission.urgency || "Unknown"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ReportsSection({ stats }: { stats: ReportStatsData | null }) {
  if (!stats) return null;

  const scoreBuckets = [
    { label: "15 to 35", count: stats.score_distribution["15_35"], color: "#EF4444" },
    { label: "36 to 55", count: stats.score_distribution["36_55"], color: "#F59E0B" },
    { label: "56 to 75", count: stats.score_distribution["56_75"], color: "#7C5CFC" },
    { label: "76 to 100", count: stats.score_distribution["76_100"], color: "#E8E342" },
  ];
  const maxBucket = Math.max(1, ...scoreBuckets.map((b) => b.count));

  const incomeEntries = Object.entries(stats.income_distribution).sort((a, b) => b[1] - a[1]);
  const maxIncome = Math.max(1, ...incomeEntries.map(([, c]) => c));

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={labelStyle}>AI Readiness Reports</div>
          <p style={{ marginTop: 4, color: "#6B7280", fontSize: "0.75rem" }}>
            Auto-generated reports via Groq AI
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 9999,
            background: stats.total_reports > 0 ? "rgba(0,212,170,0.08)" : "rgba(245,158,11,0.08)",
            border: `1px solid ${stats.total_reports > 0 ? "rgba(0,212,170,0.25)" : "rgba(245,158,11,0.25)"}`,
            color: stats.total_reports > 0 ? "#00D4AA" : "#F59E0B",
            fontSize: "0.6875rem",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: stats.total_reports > 0 ? "#00D4AA" : "#F59E0B",
            }}
          />
          {stats.total_reports > 0 ? `${stats.total_reports} reports generated` : "No reports yet"}
        </span>
      </div>

      {/* Report KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 20 }}>
        <MetricCard
          title="Reports generated"
          value={stats.total_reports}
          detail="AI Readiness Reports"
          accent="#7C5CFC"
        />
        <MetricCard
          title="Avg readiness score"
          value={stats.average_readiness_score}
          detail="Out of 100"
          accent="#E8E342"
        />
        <MetricCard
          title="Top grade reports"
          value={stats.grade_distribution.A + stats.grade_distribution.B}
          detail={`${stats.grade_distribution.A} Grade A, ${stats.grade_distribution.B} Grade B`}
          accent="#00D4AA"
        />
      </div>

      {/* Readiness Score Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ marginBottom: 20 }}>
        <div style={pageCard}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>Readiness score distribution</div>
          <div style={{ display: "grid", gap: 14 }}>
            {scoreBuckets.map((bucket) => (
              <div key={bucket.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.8125rem", color: "#D1D5DB" }}>{bucket.label}</span>
                  <span style={{ ...numberStyle, fontSize: "0.8125rem", color: bucket.color }}>{bucket.count}</span>
                </div>
                <div style={{ height: 10, borderRadius: 9999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.max(4, (bucket.count / maxBucket) * 100)}%`,
                      height: "100%",
                      borderRadius: 9999,
                      background: bucket.color,
                      boxShadow: `0 0 12px ${bucket.color}44`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={pageCard}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>Income potential distribution</div>
          {incomeEntries.length === 0 ? (
            <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>No reports yet</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {incomeEntries.map(([label, count]) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
                    <span style={{ fontSize: "0.75rem", color: "#D1D5DB" }}>{label}/mesec</span>
                    <span style={{ ...numberStyle, fontSize: "0.75rem" }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 9999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.max(5, (count / maxIncome) * 100)}%`,
                        height: "100%",
                        borderRadius: 9999,
                        background: "linear-gradient(90deg, #7C5CFC, #E8E342)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest Reports Table */}
      <div style={pageCard}>
        <div style={{ ...labelStyle, marginBottom: 14 }}>Latest generated reports</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Generated", "Name", "Readiness", "Grade", "Interest", "Potential", "View"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      fontSize: "0.6875rem",
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.latest_reports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "16px 8px", color: "#6B7280", fontSize: "0.8125rem" }}>
                    No reports generated yet
                  </td>
                </tr>
              ) : (
                stats.latest_reports.map((r) => (
                  <tr key={r.report_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 8px", fontSize: "0.75rem", color: "#9CA3AF" }}>
                      {fmtDateTime(r.generated_at)}
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: "0.75rem", color: "#E5E7EB", fontWeight: 600 }}>
                      {r.name || "Unknown"}
                    </td>
                    <td style={{ padding: "10px 8px", ...numberStyle, fontSize: "0.875rem" }}>
                      {r.readiness_score}/100
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          minWidth: 28,
                          justifyContent: "center",
                          padding: "3px 8px",
                          borderRadius: 9999,
                          background: `${gradeColor((r.grade || "D") as LeadGrade)}18`,
                          border: `1px solid ${gradeColor((r.grade || "D") as LeadGrade)}40`,
                          color: gradeColor((r.grade || "D") as LeadGrade),
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {r.grade || "D"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: "0.75rem", color: "#9CA3AF" }}>
                      {r.interest || "N/A"}
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: "0.75rem", color: "#E8E342" }}>
                      {r.income_potential || "N/A"}
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <a
                        href={`https://ainfluencerblueprint.com/api/typeform-report-view.php?id=${r.report_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.6875rem",
                          color: "#7C5CFC",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TypeformLeadScorePage() {
  const [data, setData] = useState<LeadScoreDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportStats, setReportStats] = useState<ReportStatsData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Try local API first, then fall back to public stats endpoint
        let json: any = null;
        let source: "local" | "remote" = "local";

        try {
          const localRes = await fetch("/api/typeform/lead-score", { cache: "no-store" });
          if (localRes.ok) {
            json = await localRes.json();
            if (json.connected) {
              source = "local";
            } else {
              json = null; // local store empty, try remote
            }
          }
        } catch {
          // local API unavailable, fall back to remote
        }

        // Fetch from public Hostinger stats endpoint
        if (!json || !json.connected) {
          const remoteRes = await fetch("https://ainfluencerblueprint.com/api/typeform-stats.php", { cache: "no-store" });
          if (remoteRes.ok) {
            const remote = await remoteRes.json();
            source = "remote";
            // Transform the remote format into the dashboard format
            const grades = remote.grades || { A: 0, B: 0, C: 0, D: 0 };
            const byDate = remote.by_date || {};
            const latest = remote.latest || [];
            const breakdown = remote.breakdown || {};

            const transformBreakdown = (obj: Record<string, number>) =>
              Object.entries(obj || {}).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

            const responseVolume = Object.entries(byDate)
              .map(([date, count]) => ({ date, count: count as number }))
              .sort((a, b) => a.date.localeCompare(b.date));

            const totalScore = latest.reduce((sum: number, l: any) => sum + (l.score || 0), 0);
            const avgScore = latest.length ? Math.round(totalScore / latest.length) : (remote.average_score || 0);

            json = {
              connected: true,
              source: "json" as const,
              sourcePath: "https://ainfluencerblueprint.com/api/typeform-stats.php",
              setup: {
                webhookUrl: "https://ainfluencerblueprint.com/api/typeform-webhook.php",
                jsonlPath: "Remote JSONL on Hostinger",
                jsonPath: "",
                nextSteps: [],
              },
              totals: {
                submissions: remote.total || 0,
                scoredSubmissions: remote.total || 0,
                averageScore: avgScore,
              },
              gradeDistribution: grades,
              scoreBuckets: [
                { label: "0 to 5", min: 0, max: 5, count: latest.filter((l: any) => (l.score || 0) <= 5).length },
                { label: "6 to 10", min: 6, max: 10, count: latest.filter((l: any) => (l.score || 0) >= 6 && (l.score || 0) <= 10).length },
                { label: "11 to 15", min: 11, max: 15, count: latest.filter((l: any) => (l.score || 0) >= 11 && (l.score || 0) <= 15).length },
                { label: "16 to 20", min: 16, max: 20, count: latest.filter((l: any) => (l.score || 0) >= 16 && (l.score || 0) <= 20).length },
              ],
              responseVolume,
              breakdowns: {
                interest: transformBreakdown(breakdown.interest || {}),
                aiMaturity: transformBreakdown(breakdown.ai_level || {}),
                budget: transformBreakdown(breakdown.budget || {}),
                urgency: transformBreakdown(breakdown.urgency || {}),
                blocker: transformBreakdown(breakdown.blocker || {}),
                role: transformBreakdown(breakdown.role || {}),
              },
              latestSubmissions: latest.map((l: any, i: number) => ({
                id: `remote-${i}`,
                submittedAt: l.timestamp || new Date().toISOString(),
                respondentName: l.name || "Unknown",
                email: l.email || "",
                phone: l.phone || "",
                interest: "",
                aiMaturity: "",
                budget: "",
                urgency: "",
                score: l.score || 0,
                leadGrade: (l.grade || "D") as LeadGrade,
              })),
              lastUpdated: new Date().toISOString(),
            } as LeadScoreDashboardData;
          }
        }

        if (!json) {
          throw new Error("Failed to load Typeform lead score data from any source");
        }

        if (!cancelled) {
          setData(json);
          setError(null);
        }

        // Also fetch report stats
        try {
          const reportRes = await fetch("https://ainfluencerblueprint.com/api/typeform-report-stats.php", { cache: "no-store" });
          if (reportRes.ok) {
            const reportJson = await reportRes.json();
            if (!cancelled && reportJson.success && reportJson.data) {
              setReportStats(reportJson.data);
            }
          }
        } catch {
          // Report stats are optional, don't fail the page
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load Typeform lead score data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const breakdownCards = useMemo(() => {
    if (!data) return [];
    return [
      { title: "Interest", items: data.breakdowns.interest },
      { title: "AI maturity", items: data.breakdowns.aiMaturity },
      { title: "Budget", items: data.breakdowns.budget },
      { title: "Urgency", items: data.breakdowns.urgency },
      { title: "Blocker", items: data.breakdowns.blocker },
      { title: "Role", items: data.breakdowns.role },
    ];
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto" style={{ paddingBottom: "4rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: 6 }}>AI Universa</div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.95)", margin: 0 }}>
              Typeform lead score dashboard
            </h1>
            <p style={{ marginTop: 8, color: "#9CA3AF", fontSize: "0.875rem", maxWidth: 760 }}>
              Internal view for lead quality, score distribution, response trends, and survey breakdowns.
            </p>
          </div>
          {data ? <StatusPill connected={data.connected} source={data.source} /> : null}
        </div>
      </div>

      {loading ? (
        <div style={pageCard}>
          <div style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>Loading Typeform dashboard</div>
        </div>
      ) : error ? (
        <div style={{ ...pageCard, borderColor: "rgba(239,68,68,0.25)" }}>
          <div style={{ color: "#EF4444", fontWeight: 700, marginBottom: 8 }}>Dashboard load failed</div>
          <div style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>{error}</div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 20 }}>
            <MetricCard title="Total submissions" value={data.totals.submissions} detail={data.connected ? "Stored responses" : "No stored responses yet"} accent="#E8E342" />
            <MetricCard title="Average score" value={data.totals.averageScore} detail={`${data.totals.scoredSubmissions} scored responses`} accent="#7C5CFC" />
            <MetricCard title="Data source" value={sourceLabel(data.source)} detail={data.sourcePath || "Waiting for local store"} accent="#00D4AA" />
          </div>

          {!data.connected ? (
            <div style={{ ...pageCard, marginBottom: 20, borderColor: "rgba(245,158,11,0.22)" }}>
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <div style={{ fontSize: "1rem", color: "#FDE68A", fontWeight: 700, marginBottom: 6 }}>Typeform is not connected yet</div>
                  <div style={{ fontSize: "0.875rem", color: "#9CA3AF", maxWidth: 860 }}>
                    This page is live and ready, but it will stay empty until responses arrive through the local webhook or local store.
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div style={{ ...pageCard, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ ...labelStyle, marginBottom: 10 }}>Webhook route</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#E8E342", fontSize: "0.8125rem", wordBreak: "break-all" }}>
                      {data.setup.webhookUrl}
                    </div>
                    <div style={{ marginTop: 10, color: "#9CA3AF", fontSize: "0.8125rem" }}>
                      Send Typeform responses to this route.
                    </div>
                  </div>

                  <div style={{ ...pageCard, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ ...labelStyle, marginBottom: 10 }}>Local store</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#E8E342", fontSize: "0.75rem", wordBreak: "break-all" }}>
                      {data.setup.jsonlPath}
                    </div>
                    <div style={{ marginTop: 10, color: "#9CA3AF", fontSize: "0.8125rem" }}>
                      Save normalized submissions here in JSONL format.
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ ...labelStyle, marginBottom: 10 }}>Exact next step</div>
                  <ol style={{ margin: 0, paddingLeft: 18, color: "#D1D5DB", display: "grid", gap: 8, fontSize: "0.875rem" }}>
                    {data.setup.nextSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ marginBottom: 20 }}>
            <div style={pageCard}>
              <div style={{ ...labelStyle, marginBottom: 16 }}>Lead categories</div>
              <DistributionBars values={data.gradeDistribution} />
            </div>

            <div style={pageCard}>
              <div style={{ ...labelStyle, marginBottom: 16 }}>Score buckets</div>
              <BucketChart buckets={data.scoreBuckets} />
            </div>
          </div>

          <div style={{ ...pageCard, marginBottom: 20 }}>
            <div style={{ ...labelStyle, marginBottom: 16 }}>Response volume over time</div>
            <VolumeChart data={data.responseVolume} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" style={{ marginBottom: 20 }}>
            {breakdownCards.map((card) => (
              <BreakdownList key={card.title} title={card.title} items={card.items} />
            ))}
          </div>

          <div style={pageCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <div style={labelStyle}>Latest submissions</div>
                <div style={{ fontSize: "0.8125rem", color: "#6B7280", marginTop: 6 }}>
                  Last updated {fmtDateTime(data.lastUpdated)}
                </div>
              </div>
            </div>
            <LatestTable submissions={data.latestSubmissions} />
          </div>

          {/* AI Readiness Reports Section */}
          <ReportsSection stats={reportStats} />
        </>
      ) : null}
    </div>
  );
}
