"use client";
import { useEffect, useState } from "react";

interface MemoryFile { name: string; date: string; content: string; size: number; }

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    fetch("/api/memory").then(r => r.json()).then(d => { setFiles(d); setLoading(false); if (d.length > 0) setSelectedFile(d[0]); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-muted)]">Loading memories...</div></div>;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Memory</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Browse daily memories & long-term memory</p>
      </div>

      {/* Mobile: toggle between list and content */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowList(!showList)}
          className="btn btn-secondary w-full justify-center text-sm"
        >
          {showList ? "📄 View Selected" : "📂 File List"}
          {selectedFile && !showList && <span className="ml-2 text-[var(--text-muted)]">({selectedFile.date || selectedFile.name})</span>}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* File list — hidden on mobile when viewing content */}
        <div className={`w-full md:w-48 space-y-1 shrink-0 ${!showList ? 'hidden md:block' : ''}`}>
          {files.map(f => (
            <button key={f.name} onClick={() => { setSelectedFile(f); setShowList(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedFile?.name === f.name ? "bg-[var(--accent)] text-black font-medium" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]"}`}>
              {f.date || f.name}
            </button>
          ))}
          {files.length === 0 && <p className="text-xs text-[var(--text-muted)]">No memory files found.</p>}
        </div>

        {/* Content — hidden on mobile when viewing list */}
        <div className={`flex-1 ${showList ? 'hidden md:block' : ''}`}>
          {selectedFile ? (
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedFile.date || selectedFile.name}</h2>
                <span className="text-xs text-[var(--text-muted)]">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed break-words">{selectedFile.content}</div>
            </div>
          ) : (
            <div className="card p-12 text-center"><p className="text-[var(--text-muted)]">Select a memory file to view.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
