"use client";

import { useEffect, useState } from "react";

interface XReportItem {
  id: string;
  tweetId: string | null;
  author: string | null;
  authorHandle: string | null;
  content: string;
  summary: string;
  category: string;
  url: string | null;
  engagement: string | null;
  deepResearch: string | null;
}

interface XReport {
  id: string;
  date: string;
  summary: string | null;
  status: string;
  items: XReportItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "New Tool": "bg-green-500/20 text-green-400",
  "Tool Update": "bg-blue-500/20 text-blue-400",
  Workflow: "bg-purple-500/20 text-purple-400",
  "Case Study": "bg-orange-500/20 text-orange-400",
  Strategy: "bg-yellow-500/20 text-yellow-400",
  "Industry News": "bg-gray-500/20 text-gray-400",
};

export default function XResearchPage() {
  const [reports, setReports] = useState<XReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<XReport | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const res = await fetch("/api/x-research");
    const data = await res.json();
    setReports(data);
    if (data.length > 0) setSelectedReport(data[0]);
    setLoading(false);
  }

  async function triggerReport() {
    const res = await fetch("/api/x-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) fetchReports();
  }

  async function triggerDeepResearch(itemId: string) {
    setResearchingId(itemId);
    const res = await fetch(`/api/x-research/${itemId}/deep-research`, {
      method: "POST",
    });
    if (res.ok) {
      // Poll for result
      const poll = async () => {
        const reportRes = await fetch("/api/x-research");
        const data = await reportRes.json();
        setReports(data);
        const current = data.find((r: XReport) => r.id === selectedReport?.id);
        if (current) {
          setSelectedReport(current);
          const item = current.items.find((i: XReportItem) => i.id === itemId);
          if (item?.deepResearch && item.deepResearch !== "__PENDING__") {
            setResearchingId(null);
            setExpandedId(itemId);
            return;
          }
        }
        setTimeout(poll, 3000);
      };
      setTimeout(poll, 3000);
    }
  }

  const filteredItems = selectedReport?.items.filter(
    (i) => !filterCategory || i.category === filterCategory
  ) || [];

  const categories = selectedReport
    ? [...new Set(selectedReport.items.map((i) => i.category))]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-muted)]">Loading X research...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">X Research</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Daily AI content & tools intelligence from X
          </p>
        </div>
        <button onClick={triggerReport} className="btn btn-primary">
          Generate Report
        </button>
      </div>

      {/* Report selector */}
      {reports.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedReport(r);
                setFilterCategory("");
              }}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedReport?.id === r.id
                  ? "bg-[var(--accent)] text-black font-medium"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {new Date(r.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              <span className="ml-2 opacity-60">{r.items.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      {selectedReport?.summary && (
        <div className="card p-4 mb-6">
          <p className="text-sm text-[var(--text-muted)]">
            📊 {selectedReport.summary}
          </p>
        </div>
      )}

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              !filterCategory
                ? "bg-[var(--accent)] text-black"
                : "bg-[var(--bg-card)] text-[var(--text-muted)]"
            }`}
          >
            All ({selectedReport?.items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat === filterCategory ? "" : cat)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                filterCategory === cat
                  ? "bg-[var(--accent)] text-black"
                  : CATEGORY_COLORS[cat] || "bg-[var(--bg-card)] text-[var(--text-muted)]"
              }`}
            >
              {cat} (
              {selectedReport?.items.filter((i) => i.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Items */}
      {reports.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)]">
            No reports yet. Click &quot;Generate Report&quot; or wait for the midnight
            cron to run.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)]">
            {selectedReport?.status === "pending"
              ? "Report is being generated..."
              : "No items in this report."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        CATEGORY_COLORS[item.category] || ""
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.engagement && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {item.engagement}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">{item.summary}</p>
                  {item.authorHandle && (
                    <p className="text-xs text-[var(--text-muted)]">
                      @{item.authorHandle}
                      {item.url && (
                        <>
                          {" · "}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--accent)] transition-colors"
                          >
                            View on X ↗
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (item.deepResearch && item.deepResearch !== "__PENDING__") {
                      setExpandedId(expandedId === item.id ? null : item.id);
                    } else {
                      triggerDeepResearch(item.id);
                    }
                  }}
                  disabled={researchingId === item.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    item.deepResearch && item.deepResearch !== "__PENDING__"
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : researchingId === item.id
                      ? "bg-[var(--bg)] text-[var(--text-muted)] animate-pulse"
                      : "bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30"
                  }`}
                >
                  {item.deepResearch && item.deepResearch !== "__PENDING__"
                    ? expandedId === item.id
                      ? "Hide Research"
                      : "View Research"
                    : researchingId === item.id
                    ? "Researching..."
                    : "🔍 Deep Research"}
                </button>
              </div>

              {/* Deep Research expanded */}
              {expandedId === item.id &&
                item.deepResearch &&
                item.deepResearch !== "__PENDING__" && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div
                        className="text-sm text-[var(--text-muted)] whitespace-pre-wrap"
                      >
                        {item.deepResearch}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
