"use client";
import { useEffect, useState } from "react";

interface Project { id: string; name: string; description: string | null; status: string; color: string; tasks: { id: string; status: string }[]; }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#8B5CF6" });

  useEffect(() => { fetch("/api/projects").then(r => r.json()).then(d => { setProjects(d); setLoading(false); }); }, []);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", description: "", color: "#8B5CF6" }); setShowForm(false);
    const res = await fetch("/api/projects"); setProjects(await res.json());
  }

  async function deleteProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    const res = await fetch("/api/projects"); setProjects(await res.json());
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-muted)]">Loading...</div></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Projects</h1><p className="text-[var(--text-muted)] text-sm mt-1">Major focus areas & initiatives</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">{showForm ? "Cancel" : "+ New Project"}</button>
      </div>

      {showForm && (
        <form onSubmit={addProject} className="card p-6 mb-6 space-y-3">
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Project name" className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" required />
          <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" />
          <div className="flex gap-3 items-center">
            <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-10 h-10 rounded cursor-pointer" />
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4">
        {projects.map(p => {
          const done = p.tasks.filter(t => t.status === "done").length;
          const total = p.tasks.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div key={p.id} className="card p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <h3 className="font-semibold">{p.name}</h3>
                </div>
                <button onClick={() => deleteProject(p.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100">✕</button>
              </div>
              {p.description && <p className="text-sm text-[var(--text-muted)] mt-2">{p.description}</p>}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>{done}/{total} tasks</span><span>{pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--bg)]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {projects.length === 0 && <div className="card p-12 text-center"><p className="text-[var(--text-muted)]">No projects yet.</p></div>}
    </div>
  );
}
