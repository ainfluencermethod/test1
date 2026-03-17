"use client";

import { useEffect, useState } from "react";

interface PipelineItem {
  id: string;
  sourceUrl: string | null;
  sourceAccount: string | null;
  sourceViews: string | null;
  sourceConcept: string | null;
  step: string;
  approved: boolean;
  isTransition: boolean;
  notes: string | null;
  character: { name: string; niche: string } | null;
}

interface PipelineRun {
  id: string;
  niche: string;
  date: string;
  status: string;
  items: PipelineItem[];
}

const STEPS = [
  { key: "research", label: "Research", icon: "🔍" },
  { key: "download", label: "Download", icon: "⬇️" },
  { key: "extract", label: "Extract", icon: "🖼️" },
  { key: "recreate", label: "Recreate", icon: "✨" },
  { key: "motion", label: "Motion", icon: "🎬" },
  { key: "edit", label: "Edit", icon: "✂️" },
  { key: "upload", label: "Upload", icon: "☁️" },
  { key: "done", label: "Done", icon: "✅" },
];

function StepBadge({ step }: { step: string }) {
  const classes: Record<string, string> = {
    research: "badge badge-blue",
    download: "badge badge-blue",
    extract: "badge badge-blue",
    recreate: "badge badge-yellow",
    motion: "badge badge-yellow",
    edit: "badge badge-yellow",
    upload: "badge badge-yellow",
    done: "badge badge-green",
  };
  const labels: Record<string, string> = {
    research: "🔍 Research",
    download: "⬇️ Download",
    extract: "🖼️ Extract",
    recreate: "✨ Recreate",
    motion: "🎬 Motion",
    edit: "✂️ Edit",
    upload: "☁️ Upload",
    done: "✅ Done",
  };
  return <span className={classes[step] || "badge badge-gray"}>{labels[step] || step}</span>;
}

export default function PipelinePage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRun, setShowNewRun] = useState(false);
  const [newNiche, setNewNiche] = useState("");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  useEffect(() => {
    fetchRuns();
  }, []);

  async function fetchRuns() {
    const res = await fetch("/api/pipeline");
    const data = await res.json();
    setRuns(data);
    setLoading(false);
  }

  async function createRun(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche: newNiche }),
    });
    setNewNiche("");
    setShowNewRun(false);
    fetchRuns();
  }

  async function updateItemStep(runId: string, itemId: string, step: string) {
    await fetch(`/api/pipeline/${runId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
    });
    fetchRuns();
  }

  async function approveItem(runId: string, itemId: string) {
    await fetch(`/api/pipeline/${runId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    fetchRuns();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowNewRun(!showNewRun)}
        >
          {showNewRun ? "Cancel" : "+ New Run"}
        </button>
      </div>

      {/* Step Legend */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <span className="text-xs">{s.icon} {s.label}</span>
            {i < STEPS.length - 1 && <span className="text-[var(--text-muted)] mx-1">→</span>}
          </div>
        ))}
      </div>

      {showNewRun && (
        <form onSubmit={createRun} className="card mb-6 flex gap-3">
          <input
            className="input flex-1"
            placeholder="Niche (e.g. Fitness, Lifestyle)"
            value={newNiche}
            onChange={(e) => setNewNiche(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Create Run
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-[var(--text-muted)]">Loading...</p>
      ) : runs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-[var(--text-muted)]">No pipeline runs yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Create a new run to start producing content
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <div key={run.id} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedRun(expandedRun === run.id ? null : run.id)
                }
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold">{run.niche}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {new Date(run.date).toLocaleDateString()} · {run.items.length} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StepBadge step={run.status} />
                  <span className="text-[var(--text-muted)]">
                    {expandedRun === run.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expandedRun === run.id && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3">
                  {run.items.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)] text-center py-4">
                      No items yet — research will populate this
                    </p>
                  ) : (
                    run.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.sourceAccount && (
                              <span className="text-sm font-medium">
                                @{item.sourceAccount}
                              </span>
                            )}
                            {item.sourceViews && (
                              <span className="text-xs text-[var(--text-muted)]">
                                {item.sourceViews} views
                              </span>
                            )}
                            {item.isTransition && (
                              <span className="badge badge-yellow text-xs">Transition</span>
                            )}
                          </div>
                          {item.sourceConcept && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {item.sourceConcept}
                            </p>
                          )}
                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--accent)] hover:underline"
                            >
                              View Source →
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <StepBadge step={item.step} />
                          {!item.approved && item.step === "research" && (
                            <button
                              className="btn btn-primary text-xs py-1 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                approveItem(run.id, item.id);
                              }}
                            >
                              Approve
                            </button>
                          )}
                          {item.step !== "done" && item.approved && (
                            <select
                              className="input text-xs py-1 px-2 w-auto"
                              value={item.step}
                              onChange={(e) =>
                                updateItemStep(run.id, item.id, e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                            >
                              {STEPS.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
