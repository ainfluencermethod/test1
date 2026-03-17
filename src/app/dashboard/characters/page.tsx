"use client";

import { useEffect, useState } from "react";

interface Character {
  id: string;
  name: string;
  niche: string;
  referenceImage: string | null;
  driveLink: string | null;
  description: string | null;
  createdAt: string;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    niche: "",
    referenceImage: "",
    driveLink: "",
    description: "",
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    const res = await fetch("/api/characters");
    const data = await res.json();
    setCharacters(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", niche: "", referenceImage: "", driveLink: "", description: "" });
    setShowForm(false);
    fetchCharacters();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Characters</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ New Character"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Character Name</label>
              <input
                className="input"
                placeholder="e.g. Luna"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Niche</label>
              <input
                className="input"
                placeholder="e.g. Fitness, Lifestyle"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Reference Image (Google Drive link)
            </label>
            <input
              className="input"
              placeholder="https://drive.google.com/..."
              value={form.referenceImage}
              onChange={(e) => setForm({ ...form, referenceImage: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Assets Drive Folder
            </label>
            <input
              className="input"
              placeholder="https://drive.google.com/drive/folders/..."
              value={form.driveLink}
              onChange={(e) => setForm({ ...form, driveLink: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description / Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Character DNA, style notes, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Create Character
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-[var(--text-muted)]">Loading...</p>
      ) : characters.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎭</p>
          <p className="text-[var(--text-muted)]">No characters yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Add your first AI character to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {characters.map((char) => (
            <div key={char.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{char.name}</h3>
                  <span className="badge badge-blue mt-1">{char.niche}</span>
                </div>
                {char.referenceImage && (
                  <a
                    href={char.referenceImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    View Reference →
                  </a>
                )}
              </div>

              {char.description && (
                <p className="text-sm text-[var(--text-muted)] mt-3">
                  {char.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border)]">
                {char.driveLink && (
                  <a
                    href={char.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    📁 Drive Folder
                  </a>
                )}
                <span className="text-xs text-[var(--text-muted)]">
                  Added {new Date(char.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
