"use client";

import { useState, useEffect, useCallback } from "react";

interface ABTest {
  id: string;
  pageName: string;
  elementName: string;
  variantA: string;
  variantB: string;
  activeVariant: string;
  notes: string;
}

const PAGES = [
  {
    name: "Freebie",
    url: "https://aistudio.google.com/apps/b9b9a840-7b94-4c7e-bdb0-779be5cfe9c6",
    audit: "Add PDF mockup image, 'what's inside' bullets, put email field on page. Current headline is strong — keep it.",
  },
  {
    name: "OTO",
    url: "https://aistudio.google.com/apps/791c9ea2-1d1e-4b56-a638-4dd8b23cf693",
    audit: "Replace 'EXTREMELY RARE' headline. Add 15-min countdown timer. Add 'Cheat Sheet vs Full Method' comparison.",
  },
  {
    name: "Upsell",
    url: "https://aistudio.google.com/apps/2e34ecc3-99c3-4486-84f1-2efcaddf2f97",
    audit: "Replace 'THE LAZIEST WAY TO EARN' headline. Remove 'two choices' close. Add sticky mobile CTA. Consider $1 trial.",
  },
];

export default function FunnelBuilder() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    const res = await fetch("/api/aib-launch/ab-tests");
    setTests(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const saveTest = async (test: ABTest) => {
    await fetch("/api/aib-launch/ab-tests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(test),
    });
    setToast("Saved!");
    setTimeout(() => setToast(""), 2000);
  };

  const updateTest = (id: string, field: keyof ABTest, value: string) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const addTest = async (pageName: string) => {
    const res = await fetch("/api/aib-launch/ab-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageName,
        elementName: "New Element",
        variantA: "",
        variantB: "",
        notes: "",
      }),
    });
    const newTest = await res.json();
    setTests((prev) => [...prev, newTest]);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {PAGES.map((page) => {
        const pageTests = tests.filter((t) => t.pageName === page.name);
        const isExpanded = expandedPage === page.name;

        return (
          <div key={page.name} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedPage(isExpanded ? null : page.name)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <div>
                <h3 className="font-semibold text-lg">{page.name} Page</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{pageTests.length} test(s)</p>
              </div>
              <span className="text-xl">{isExpanded ? "▾" : "▸"}</span>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--border)] p-6 space-y-6">
                {/* Link */}
                <div>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--accent)] hover:underline break-all"
                  >
                    🔗 Open page: {page.url}
                  </a>
                </div>

                {/* Audit Notes */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-1">📋 Audit Findings</h4>
                  <p className="text-sm text-[var(--text-muted)]">{page.audit}</p>
                </div>

                {/* A/B Tests */}
                {loading ? (
                  <div className="text-sm text-[var(--text-muted)]">Loading tests...</div>
                ) : (
                  <div className="space-y-4">
                    {pageTests.map((test) => (
                      <div key={test.id} className="border border-[var(--border)] rounded-lg p-4 space-y-3">
                        <input
                          value={test.elementName}
                          onChange={(e) => updateTest(test.id, "elementName", e.target.value)}
                          className="bg-transparent border-b border-[var(--border)] text-sm font-semibold w-full pb-1 focus:outline-none focus:border-[var(--accent)]"
                          placeholder="Element name"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-[var(--text-muted)] mb-1 block">
                              Variant A {test.activeVariant === "A" && <span className="text-green-400 ml-1">● LIVE</span>}
                            </label>
                            <textarea
                              value={test.variantA}
                              onChange={(e) => updateTest(test.id, "variantA", e.target.value)}
                              rows={2}
                              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[var(--text-muted)] mb-1 block">
                              Variant B {test.activeVariant === "B" && <span className="text-green-400 ml-1">● LIVE</span>}
                            </label>
                            <textarea
                              value={test.variantB}
                              onChange={(e) => updateTest(test.id, "variantB", e.target.value)}
                              rows={2}
                              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                            />
                          </div>
                        </div>
                        <textarea
                          value={test.notes}
                          onChange={(e) => updateTest(test.id, "notes", e.target.value)}
                          rows={2}
                          placeholder="Notes..."
                          className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={test.activeVariant}
                            onChange={(e) => updateTest(test.id, "activeVariant", e.target.value)}
                            className="bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                          >
                            <option value="A">Active: Variant A</option>
                            <option value="B">Active: Variant B</option>
                          </select>
                          <button
                            onClick={() => saveTest(test)}
                            className="bg-[var(--accent)] text-black px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addTest(page.name)}
                      className="text-sm text-[var(--accent)] hover:underline"
                    >
                      + Add A/B Test
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
