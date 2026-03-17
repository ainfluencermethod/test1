"use client";

import { useState, useEffect, useCallback } from "react";

interface Email {
  id: string;
  day: number;
  subject: string;
  previewText: string;
  body: string;
  sendTime: string;
  ctaLink: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  ready: "bg-blue-500/20 text-blue-400",
  tested: "bg-yellow-500/20 text-yellow-400",
  sent: "bg-green-500/20 text-green-400",
};

const DAY_LABELS: Record<number, string> = {
  0: "Day 0 — Warm-up",
  1: "Day 1 — Freebie Delivery",
  2: "Day 2 — Origin Story",
  3: "Day 3 — Struggle",
  4: "Day 4 — Formula",
  5: "Day 5 — Proof",
  6: "Day 6 — Vision",
  7: "Day 7 — CTA",
  8: "Day 8 — Cart Close",
  9: "Post-Purchase — Welcome",
};

export default function EmailFlows() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const fetchEmails = useCallback(async () => {
    const res = await fetch("/api/aib-launch/emails");
    setEmails(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const saveEmail = async (email: Email) => {
    await fetch("/api/aib-launch/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email),
    });
    setToast("Saved!");
    setTimeout(() => setToast(""), 2000);
  };

  const updateEmail = (id: string, field: keyof Email, value: string | number) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const markTested = async (email: Email) => {
    const updated = { ...email, status: "tested" };
    setEmails((prev) => prev.map((e) => (e.id === email.id ? updated : e)));
    await fetch("/api/aib-launch/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setToast("Marked as tested!");
    setTimeout(() => setToast(""), 2000);
  };

  const copyGHL = (email: Email) => {
    const html = `<html><body>
<h2>${email.subject}</h2>
<p style="color:#666;font-size:14px;">${email.previewText}</p>
<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;">
${email.body.split("\n").map((l) => `<p>${l}</p>`).join("\n")}
</div>
${email.ctaLink ? `<a href="${email.ctaLink}" style="display:inline-block;background:#8B5CF6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Click Here</a>` : ""}
</body></html>`;
    navigator.clipboard.writeText(html);
    setToast("GHL HTML copied!");
    setTimeout(() => setToast(""), 2000);
  };

  const selectedEmail = emails.find((e) => e.id === selected);

  if (loading) return <div className="text-[var(--text-muted)]">Loading emails...</div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold mb-4">📧 Email Sequence Timeline</h3>
        <div className="space-y-2">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelected(selected === email.id ? null : email.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors ${
                selected === email.id
                  ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30"
                  : "hover:bg-[var(--bg-card-hover)] border border-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-sm font-bold shrink-0">
                {email.day === 9 ? "✉️" : `D${email.day}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {DAY_LABELS[email.day] || `Day ${email.day}`}
                </div>
                <div className="text-xs text-[var(--text-muted)] truncate">
                  &quot;{email.subject}&quot;
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[var(--text-muted)]">{email.sendTime}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[email.status] || STATUS_COLORS.draft}`}>
                  {email.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email Editor */}
      {selectedEmail && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">
            ✏️ Edit: {DAY_LABELS[selectedEmail.day] || `Day ${selectedEmail.day}`}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Subject Line</label>
              <input
                value={selectedEmail.subject}
                onChange={(e) => updateEmail(selectedEmail.id, "subject", e.target.value)}
                className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Preview Text</label>
              <input
                value={selectedEmail.previewText}
                onChange={(e) => updateEmail(selectedEmail.id, "previewText", e.target.value)}
                className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Send Time</label>
              <input
                value={selectedEmail.sendTime}
                onChange={(e) => updateEmail(selectedEmail.id, "sendTime", e.target.value)}
                className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">CTA Link</label>
              <input
                value={selectedEmail.ctaLink}
                onChange={(e) => updateEmail(selectedEmail.id, "ctaLink", e.target.value)}
                className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Status</label>
            <select
              value={selectedEmail.status}
              onChange={(e) => updateEmail(selectedEmail.id, "status", e.target.value)}
              className="bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="tested">Tested</option>
              <option value="sent">Sent</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Email Body</label>
            <textarea
              value={selectedEmail.body}
              onChange={(e) => updateEmail(selectedEmail.id, "body", e.target.value)}
              rows={12}
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--accent)] resize-y font-mono"
              placeholder="Paste or write email body here..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => saveEmail(selectedEmail)}
              className="bg-[var(--accent)] text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => markTested(selectedEmail)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              🧪 Send Test Email
            </button>
            <button
              onClick={() => copyGHL(selectedEmail)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              📋 Export to GHL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
