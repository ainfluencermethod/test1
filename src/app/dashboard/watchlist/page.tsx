"use client";

import { useEffect, useState } from "react";

interface Character {
  id: string;
  name: string;
  niche: string;
}

interface WatchlistItem {
  id: string;
  characterId: string;
  character: Character;
  username: string;
  profileUrl: string;
  notes: string | null;
  lastChecked: string | null;
  avgViews: string | null;
  createdAt: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCharId, setFilterCharId] = useState("");
  const [form, setForm] = useState({
    characterId: "",
    profileUrl: "",
    notes: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [watchRes, charRes] = await Promise.all([
      fetch("/api/watchlist"),
      fetch("/api/characters"),
    ]);
    setItems(await watchRes.json());
    setCharacters(await charRes.json());
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ characterId: "", profileUrl: "", notes: "" });
      setShowForm(false);
      fetchAll();
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    fetchAll();
  }

  const filtered = filterCharId
    ? items.filter((i) => i.characterId === filterCharId)
    : items;

  // Group by character
  const grouped = filtered.reduce<Record<string, WatchlistItem[]>>((acc, item) => {
    const key = item.character.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-muted)]">Loading watchlist...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Instagram profiles to monitor for each character
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? "Cancel" : "+ Add Profile"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="card p-6 mb-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Character</label>
            <select
              value={form.characterId}
              onChange={(e) => setForm({ ...form, characterId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm"
              required
            >
              <option value="">Select a character...</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.niche})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Instagram Profile URL or @username
            </label>
            <input
              type="text"
              value={form.profileUrl}
              onChange={(e) => setForm({ ...form, profileUrl: e.target.value })}
              placeholder="https://instagram.com/fit_aitana or @fit_aitana"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. AI lifestyle, fitness focus, good at transitions..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add to Watchlist
          </button>
        </form>
      )}

      {/* Filter */}
      {characters.length > 1 && (
        <div className="mb-6">
          <select
            value={filterCharId}
            onChange={(e) => setFilterCharId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-sm"
          >
            <option value="">All Characters</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)]">
            No profiles in the watchlist yet. Add Instagram profiles to monitor for your characters.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([charName, watchItems]) => (
          <div key={charName} className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              🎭 {charName}
              <span className="text-xs text-[var(--text-muted)] font-normal">
                {watchItems.length} profile{watchItems.length !== 1 ? "s" : ""}
              </span>
            </h2>
            <div className="space-y-2">
              {watchItems.map((item) => (
                <div
                  key={item.id}
                  className="card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {item.username[0].toUpperCase()}
                    </div>
                    <div>
                      <a
                        href={item.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:text-[var(--accent)] transition-colors"
                      >
                        @{item.username}
                      </a>
                      {item.notes && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.avgViews && (
                      <span className="text-xs text-[var(--text-muted)]">
                        Avg: {item.avgViews}
                      </span>
                    )}
                    {item.lastChecked && (
                      <span className="text-xs text-[var(--text-muted)]">
                        Checked:{" "}
                        {new Date(item.lastChecked).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
