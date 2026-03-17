"use client";

import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string | null;
  status: string;
  currentTask: string | null;
  model: string | null;
  cronSchedule: string | null;
  restrictions: string | null;
  systemPrompt: string | null;
  skills: string | null;
  type: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string; avatar: string | null; role: string }[];
  activities: { id: string; action: string; details: string | null; category: string | null; createdAt: string }[];
}

const statusColors: Record<string, string> = {
  working: "badge-green",
  idle: "badge-yellow",
  offline: "badge-gray",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentEditor({ agent: initial }: { agent: Agent }) {
  const [agent, setAgent] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Draft values for each editable field
  const [drafts, setDrafts] = useState({
    systemPrompt: agent.systemPrompt || "",
    model: agent.model || "",
    cronSchedule: agent.cronSchedule || "",
    restrictions: agent.restrictions || "",
    skills: agent.skills || "",
    name: agent.name,
    role: agent.role,
    avatar: agent.avatar || "",
  });

  async function save(field: string) {
    setSaving(true);
    try {
      const value = drafts[field as keyof typeof drafts];
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value || null }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setAgent({ ...agent, ...updated });
      setEditing(null);
      setToast(`${field} saved ✓`);
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast("Error saving — try again");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDrafts({
      systemPrompt: agent.systemPrompt || "",
      model: agent.model || "",
      cronSchedule: agent.cronSchedule || "",
      restrictions: agent.restrictions || "",
      skills: agent.skills || "",
      name: agent.name,
      role: agent.role,
      avatar: agent.avatar || "",
    });
    setEditing(null);
  }

  const restrictions = agent.restrictions?.split("\n").filter(Boolean) || [];
  const skills = agent.skills?.split(",").filter(Boolean) || [];

  function EditButton({ field }: { field: string }) {
    if (editing === field) return null;
    return (
      <button
        onClick={() => setEditing(field)}
        className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors ml-auto"
      >
        ✏️ Edit
      </button>
    );
  }

  function SaveCancel({ field }: { field: string }) {
    if (editing !== field) return null;
    return (
      <div className="flex gap-2 mt-3">
        <button onClick={() => save(field)} disabled={saving} className="btn btn-primary text-xs">
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={cancel} className="btn btn-secondary text-xs">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[var(--accent)] text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg)] flex items-center justify-center text-4xl">
            {editing === "avatar" ? (
              <input
                className="input !w-16 text-center text-2xl !p-1"
                value={drafts.avatar}
                onChange={(e) => setDrafts({ ...drafts, avatar: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && save("avatar")}
              />
            ) : (
              <span onClick={() => setEditing("avatar")} className="cursor-pointer hover:opacity-70 transition-opacity">
                {agent.avatar || "🤖"}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              {editing === "name" ? (
                <div className="flex items-center gap-2">
                  <input
                    className="input !w-48 text-xl font-bold"
                    value={drafts.name}
                    onChange={(e) => setDrafts({ ...drafts, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && save("name")}
                    autoFocus
                  />
                  <SaveCancel field="name" />
                </div>
              ) : (
                <h1 className="text-2xl font-bold cursor-pointer hover:text-[var(--accent)] transition-colors" onClick={() => setEditing("name")}>
                  {agent.name}
                </h1>
              )}
              <span className={`badge ${statusColors[agent.status]} text-xs`}>
                {agent.status}
              </span>
            </div>
            {editing === "role" ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  className="input !w-64 text-sm"
                  value={drafts.role}
                  onChange={(e) => setDrafts({ ...drafts, role: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && save("role")}
                  autoFocus
                />
                <SaveCancel field="role" />
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-sm cursor-pointer hover:text-[var(--accent)] transition-colors" onClick={() => setEditing("role")}>
                {agent.role} · {agent.department}
              </p>
            )}
            {agent.parent && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Reports to: <a href={`/dashboard/agents/${agent.parent.id}`} className="text-[var(--accent)] hover:underline">{agent.parent.name}</a>
              </p>
            )}
          </div>
        </div>
        <a href="/dashboard/org" className="btn btn-secondary text-xs">
          ← Back to Org
        </a>
      </div>

      {editing === "avatar" && <SaveCancel field="avatar" />}

      {agent.currentTask && (
        <div className="card border-l-4 border-l-green-500 !bg-green-500/5">
          <p className="text-xs text-[var(--text-muted)] mb-1">Currently working on:</p>
          <p className="text-sm font-medium">{agent.currentTask}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* System Prompt */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span>🧠</span> System Prompt
              </h2>
              <EditButton field="systemPrompt" />
            </div>
            {editing === "systemPrompt" ? (
              <>
                <textarea
                  className="input font-mono text-sm leading-relaxed"
                  rows={12}
                  value={drafts.systemPrompt}
                  onChange={(e) => setDrafts({ ...drafts, systemPrompt: e.target.value })}
                  autoFocus
                />
                <SaveCancel field="systemPrompt" />
              </>
            ) : agent.systemPrompt ? (
              <pre className="text-sm text-[var(--text-muted)] whitespace-pre-wrap font-mono bg-[var(--bg)] rounded-lg p-4 leading-relaxed cursor-pointer hover:border-[var(--accent)] border border-transparent transition-colors"
                onClick={() => setEditing("systemPrompt")}>
                {agent.systemPrompt}
              </pre>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">No system prompt configured</p>
            )}
          </div>

          {/* Model & Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span>🤖</span> Model
                </h2>
                <EditButton field="model" />
              </div>
              {editing === "model" ? (
                <>
                  <input
                    className="input font-mono text-sm"
                    value={drafts.model}
                    onChange={(e) => setDrafts({ ...drafts, model: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && save("model")}
                    placeholder="e.g. anthropic/claude-sonnet-4-20250514"
                    autoFocus
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-2">
                    Options: anthropic/claude-opus-4-6 · anthropic/claude-sonnet-4-20250514 · openai-codex/gpt-5.3-codex · groq/llama-3.3-70b
                  </p>
                  <SaveCancel field="model" />
                </>
              ) : (
                <p className="text-sm font-mono bg-[var(--bg)] rounded-lg px-3 py-2 cursor-pointer hover:border-[var(--accent)] border border-transparent transition-colors"
                  onClick={() => setEditing("model")}>
                  {agent.model || "N/A"}
                </p>
              )}
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span>⏰</span> Cron Schedule
                </h2>
                <EditButton field="cronSchedule" />
              </div>
              {editing === "cronSchedule" ? (
                <>
                  <input
                    className="input font-mono text-sm"
                    value={drafts.cronSchedule}
                    onChange={(e) => setDrafts({ ...drafts, cronSchedule: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && save("cronSchedule")}
                    placeholder="e.g. 0 5 * * * (daily at 5 AM)"
                    autoFocus
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-2">
                    Format: min hour day month weekday · Examples: 0 9 * * * (daily 9AM) · 0 9 * * 1,3,5 (Mon/Wed/Fri 9AM) · Leave empty for on-demand
                  </p>
                  <SaveCancel field="cronSchedule" />
                </>
              ) : (
                <p className="text-sm font-mono bg-[var(--bg)] rounded-lg px-3 py-2 cursor-pointer hover:border-[var(--accent)] border border-transparent transition-colors"
                  onClick={() => setEditing("cronSchedule")}>
                  {agent.cronSchedule || "On-demand only"}
                </p>
              )}
            </div>
          </div>

          {/* Restrictions */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span>🚫</span> Restrictions
              </h2>
              <EditButton field="restrictions" />
            </div>
            {editing === "restrictions" ? (
              <>
                <textarea
                  className="input text-sm"
                  rows={6}
                  value={drafts.restrictions}
                  onChange={(e) => setDrafts({ ...drafts, restrictions: e.target.value })}
                  placeholder="One restriction per line"
                  autoFocus
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-2">One restriction per line</p>
                <SaveCancel field="restrictions" />
              </>
            ) : restrictions.length > 0 ? (
              <ul className="space-y-2 cursor-pointer" onClick={() => setEditing("restrictions")}>
                {restrictions.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <span className="text-red-400 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic cursor-pointer" onClick={() => setEditing("restrictions")}>
                No restrictions — click to add
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span>🛠️</span> Skills
              </h2>
              <EditButton field="skills" />
            </div>
            {editing === "skills" ? (
              <>
                <input
                  className="input text-sm"
                  value={drafts.skills}
                  onChange={(e) => setDrafts({ ...drafts, skills: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && save("skills")}
                  placeholder="Comma-separated: Skill 1, Skill 2, Skill 3"
                  autoFocus
                />
                <SaveCancel field="skills" />
              </>
            ) : (
              <div className="flex flex-wrap gap-2 cursor-pointer" onClick={() => setEditing("skills")}>
                {skills.map((s) => (
                  <span key={s} className="badge badge-blue">{s.trim()}</span>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] italic">No skills — click to add</p>
                )}
              </div>
            )}
          </div>

          {/* Direct Reports */}
          {agent.children.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>👥</span> Direct Reports ({agent.children.length})
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {agent.children.map((child) => (
                  <a key={child.id} href={`/dashboard/agents/${child.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-sm">
                      {child.avatar || "🤖"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{child.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{child.role}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Activity */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Activity Log</h2>
          <div className="space-y-2">
            {agent.activities.length === 0 ? (
              <div className="card text-center py-8 text-[var(--text-muted)] text-sm">
                No activity yet
              </div>
            ) : (
              agent.activities.map((act) => (
                <div key={act.id} className="card !p-3">
                  <p className="text-sm">{act.action}</p>
                  {act.details && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{act.details}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {act.category && <span className="badge badge-gray text-[10px]">{act.category}</span>}
                    <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(act.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
