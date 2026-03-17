"use client";
import { useEffect, useState } from "react";

interface Task { id: string; title: string; description: string | null; status: string; priority: string; assignee: string | null; project: { name: string } | null; dueDate: string | null; }

const COLUMNS = [
  { key: "todo", label: "To Do", color: "border-gray-500" },
  { key: "in-progress", label: "In Progress", color: "border-blue-500" },
  { key: "review", label: "Review", color: "border-yellow-500" },
  { key: "done", label: "Done", color: "border-green-500" },
];

const PRIORITIES: Record<string, string> = { high: "🔴", medium: "🟡", low: "🟢" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", assignee: "", status: "todo" });

  useEffect(() => { fetch("/api/tasks").then(r => r.json()).then(d => { setTasks(d); setLoading(false); }); }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ title: "", description: "", priority: "medium", assignee: "", status: "todo" }); setShowForm(false); refreshTasks(); }
  }

  async function moveTask(id: string, status: string) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    refreshTasks();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    refreshTasks();
  }

  async function refreshTasks() {
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-muted)]">Loading tasks...</div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Task Board</h1><p className="text-[var(--text-muted)] text-sm mt-1">Kanban-style task management</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">{showForm ? "Cancel" : "+ New Task"}</button>
      </div>

      {showForm && (
        <form onSubmit={addTask} className="card p-6 mb-6 space-y-3">
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" required />
          <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" />
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm">
              <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
            </select>
            <input type="text" value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} placeholder="Assignee (e.g. Jarvis, Boss)" className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" />
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {COLUMNS.map(col => (
          <div key={col.key} className={`border-t-2 ${col.color} pt-3`}>
            <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
              {col.label} <span className="text-xs text-[var(--text-muted)] font-normal">{tasks.filter(t => t.status === col.key).length}</span>
            </h3>
            <div className="space-y-2">
              {tasks.filter(t => t.status === col.key).map(task => (
                <div key={task.id} className="card p-3 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{PRIORITIES[task.priority]} {task.title}</p>
                      {task.description && <p className="text-xs text-[var(--text-muted)] mt-1">{task.description}</p>}
                      {task.assignee && <p className="text-xs text-[var(--accent)] mt-1">→ {task.assignee}</p>}
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {COLUMNS.filter(c => c.key !== col.key).map(c => (
                      <button key={c.key} onClick={() => moveTask(task.id, c.key)} className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
