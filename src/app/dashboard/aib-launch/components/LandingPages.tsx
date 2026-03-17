"use client";

import { useState, useEffect, useCallback } from "react";

interface PageEdit {
  id: string;
  pageName: string;
  sectionName: string;
  content: string;
  suggestions: string;
}

const PAGE_NAMES = ["Freebie", "OTO", "Upsell"];

export default function LandingPages() {
  const [pages, setPages] = useState<PageEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("Freebie");
  const [toast, setToast] = useState("");

  const fetchPages = useCallback(async () => {
    const res = await fetch("/api/aib-launch/pages");
    setPages(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const updateSection = (id: string, field: keyof PageEdit, value: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const saveSection = async (page: PageEdit) => {
    await fetch("/api/aib-launch/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(page),
    });
    setToast("Saved!");
    setTimeout(() => setToast(""), 2000);
  };

  const exportHTML = (pageName: string) => {
    const sections = pages.filter((p) => p.pageName === pageName);
    const html = `<!DOCTYPE html>
<html><head><title>${pageName}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;}
section{margin-bottom:40px;} h1{font-size:2.5em;} .cta{display:inline-block;background:#8B5CF6;color:white;padding:16px 32px;border-radius:8px;text-decoration:none;font-size:18px;}</style>
</head><body>
${sections.map((s) => `<section>\n<h2>${s.sectionName}</h2>\n<div>${s.content}</div>\n</section>`).join("\n")}
</body></html>`;
    navigator.clipboard.writeText(html);
    setToast("HTML exported to clipboard!");
    setTimeout(() => setToast(""), 2000);
  };

  const addSection = async () => {
    const res = await fetch("/api/aib-launch/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageName: activePage,
        sectionName: "New Section",
        content: "",
        suggestions: "",
      }),
    });
    const newPage = await res.json();
    setPages((prev) => [...prev, newPage]);
  };

  const activeSections = pages.filter((p) => p.pageName === activePage);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex gap-2">
        {PAGE_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setActivePage(name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === name
                ? "bg-[var(--accent)] text-black"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[var(--text-muted)]">Loading...</div>
      ) : (
        <>
          {/* Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-4">
              <h3 className="font-semibold">📝 Page Sections</h3>
              {activeSections.map((section) => (
                <div key={section.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
                  <input
                    value={section.sectionName}
                    onChange={(e) => updateSection(section.id, "sectionName", e.target.value)}
                    className="bg-transparent border-b border-[var(--border)] text-sm font-semibold w-full pb-1 focus:outline-none focus:border-[var(--accent)]"
                  />
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, "content", e.target.value)}
                    rows={4}
                    placeholder="Section content..."
                    className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[var(--accent)] resize-y"
                  />
                  {section.suggestions && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-yellow-400 mb-1">💡 Suggested Changes</p>
                      <p className="text-xs text-[var(--text-muted)]">{section.suggestions}</p>
                    </div>
                  )}
                  <button
                    onClick={() => saveSection(section)}
                    className="bg-[var(--accent)] text-black px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90"
                  >
                    Save
                  </button>
                </div>
              ))}
              <button onClick={addSection} className="text-sm text-[var(--accent)] hover:underline">
                + Add Section
              </button>
            </div>

            {/* Preview */}
            <div>
              <h3 className="font-semibold mb-4">👁️ Preview</h3>
              <div className="bg-white text-black rounded-xl p-6 space-y-4 min-h-[300px]">
                {activeSections.length === 0 ? (
                  <p className="text-gray-400 text-sm">No sections yet</p>
                ) : (
                  activeSections.map((section) => (
                    <div key={section.id}>
                      <h4 className="text-lg font-bold">{section.sectionName}</h4>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{section.content}</p>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => exportHTML(activePage)}
                className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                📋 Export as HTML
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
