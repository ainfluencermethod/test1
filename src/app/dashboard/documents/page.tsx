"use client";
import { useEffect, useState } from "react";

interface Doc { id: string; title: string; content: string; category: string; tags: string | null; createdAt: string; updatedAt: string; }

const CATEGORIES = ["general", "planning", "research", "newsletter", "guide", "template"];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general", tags: "" });

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    const res = await fetch(`/api/documents?${params}`);
    setDocs(await res.json()); setLoading(false);
  }

  useEffect(() => { fetchDocs(); }, [search, filterCat]);

  async function addDoc(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", content: "", category: "general", tags: "" }); setShowForm(false); fetchDocs();
  }

  async function deleteDoc(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" }); setSelectedDoc(null); fetchDocs();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-muted)]">Loading...</div></div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Documents</h1><p className="text-[var(--text-muted)] text-sm mt-1">All created docs, searchable & categorized</p></div>
        <button onClick={() => { setShowForm(!showForm); setSelectedDoc(null); }} className="btn btn-primary">{showForm ? "Cancel" : "+ New Doc"}</button>
      </div>

      <div className="flex gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-sm" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={addDoc} className="card p-6 mb-6 space-y-3">
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" required />
          <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Content..." rows={6} className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" required />
          <div className="flex gap-3">
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Tags (comma separated)" className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm" />
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      )}

      {selectedDoc ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button onClick={() => setSelectedDoc(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] mb-2">← Back</button>
              <h2 className="text-xl font-bold">{selectedDoc.title}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">{selectedDoc.category} · {new Date(selectedDoc.updatedAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteDoc(selectedDoc.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm">{selectedDoc.content}</div>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(d => (
            <div key={d.id} onClick={() => setSelectedDoc(d)} className="card p-4 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{d.content.slice(0, 100)}...</p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-muted)]">{d.category}</span>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{new Date(d.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
          {docs.length === 0 && <div className="card p-12 text-center"><p className="text-[var(--text-muted)]">No documents found.</p></div>}
        </div>
      )}
    </div>
  );
}
