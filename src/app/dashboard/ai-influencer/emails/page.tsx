"use client";

import { useEffect, useMemo, useState } from "react";

type EmailStatus = "draft" | "ready" | "sent" | "planned";
type ViewMode = "desktop" | "mobile";

interface EmailItem {
  day: number;
  timing: string;
  subject: string;
  file: string;
  status: EmailStatus;
}

interface EmailContentMap {
  [file: string]: string;
}

const emails: EmailItem[] = [
  { day: 0, timing: "Immediate", subject: "Your AI Influencer Blueprint is here", file: "/emails/aib-freebie-day0.html", status: "ready" },
  { day: 1, timing: "+24 hours", subject: "Did you actually read it?", file: "/emails/aib-freebie-day1.html", status: "ready" },
  { day: 2, timing: "+48 hours", subject: "The 3 biggest mistakes AI influencers make", file: "/emails/aib-freebie-day2.html", status: "ready" },
  { day: 3, timing: "+72 hours", subject: "How one student went from 0 to 50K followers", file: "/emails/aib-freebie-day3.html", status: "ready" },
  { day: 4, timing: "+96 hours", subject: "You don't need to show your face", file: "/emails/aib-freebie-day4.html", status: "ready" },
  { day: 5, timing: "+120 hours", subject: "The window is closing on AI influencers", file: "/emails/aib-freebie-day5.html", status: "ready" },
  { day: 6, timing: "+144 hours", subject: "From $0 to $1,500/month with Fanvue", file: "/emails/aib-freebie-day6.html", status: "ready" },
  { day: 7, timing: "+168 hours", subject: "Join AI Influencer Blueprint or keep guessing", file: "/emails/aib-freebie-day7.html", status: "ready" },
];

const statusConfig: Record<EmailStatus, { label: string; bg: string; text: string; border: string }> = {
  ready: { label: "Ready", bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.25)" },
  draft: { label: "Draft", bg: "rgba(245,158,11,0.12)", text: "#FBBF24", border: "rgba(245,158,11,0.22)" },
  sent: { label: "Sent", bg: "rgba(148,163,184,0.12)", text: "#CBD5E1", border: "rgba(148,163,184,0.22)" },
  planned: { label: "Planned", bg: "rgba(148,163,184,0.12)", text: "#94A3B8", border: "rgba(148,163,184,0.22)" },
};

function stripHtmlPreview(html: string) {
  if (typeof window === "undefined") return "Loading preview…";

  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = (doc.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "No preview available.";
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
}

export default function AIInfluencerEmailsPage() {
  const [htmlByFile, setHtmlByFile] = useState<EmailContentMap>({});
  const [loading, setLoading] = useState(true);
  const [activeEmail, setActiveEmail] = useState<EmailItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmails() {
      try {
        const results = await Promise.all(
          emails.map(async (email) => {
            const response = await fetch(email.file);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${email.file}`);
            }
            const html = await response.text();
            return [email.file, html] as const;
          })
        );

        if (!cancelled) {
          setHtmlByFile(Object.fromEntries(results));
        }
      } catch (error) {
        console.error("Failed to load email HTML:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEmails();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeEmail) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveEmail(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeEmail]);

  const previews = useMemo(() => {
    return Object.fromEntries(
      Object.entries(htmlByFile).map(([file, html]) => [file, stripHtmlPreview(html)])
    );
  }, [htmlByFile]);

  async function copyHtml(email: EmailItem, key: string) {
    try {
      const html = htmlByFile[email.file]
        ? htmlByFile[email.file]
        : await fetch(email.file).then(async (response) => {
            if (!response.ok) throw new Error(`Failed to fetch ${email.file}`);
            return response.text();
          });

      await navigator.clipboard.writeText(html);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 2000);
    } catch (error) {
      console.error("Failed to copy HTML:", error);
    }
  }

  const activeHtml = activeEmail ? htmlByFile[activeEmail.file] ?? "" : "";

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8 flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#00D4AA]">
            Email designer dashboard
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">📧 Email Sequences</h1>
            <p className="mt-2 text-sm text-[#94A3B8] sm:text-base">AIB Freebie Nurture — 7 Day Sequence</p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/6 bg-[#13151A] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.01)] sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">AIB sales funnel</h2>
              <p className="mt-1 max-w-3xl text-sm text-[#7C8799]">Freebie drives to the $27 OTO, which then ascends into the main $97/mo AI Influencer Blueprint community offer.</p>
            </div>
            <div className="text-xs uppercase tracking-[0.16em] text-[#64748B]">FREEBIE → OTO → MAIN</div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-3">
            <div className="flex-1 rounded-3xl border border-white/8 bg-[#13151A] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Free
                </span>
                <span className="text-xs text-[#64748B]">Card 01</span>
              </div>
              <h3 className="text-xl font-semibold text-white">7-Day Blueprint — Free Version</h3>
              <p className="mt-3 text-sm leading-6 text-[#9AA4B2]">Teaser guide with overview of each day. Drives to OTO.</p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href="/pdfs/aib-free-guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#00D4AA] px-4 py-3 text-sm font-semibold text-[#03120E] transition hover:brightness-105"
                >
                  Download Free Guide
                </a>
              </div>
              <div className="mt-5 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-xs text-[#94A3B8]">
                <span className="font-semibold uppercase tracking-[0.14em] text-[#7DD3C7]">Delivery</span>
                <div className="mt-1">Email Day 0 — immediate on signup</div>
              </div>
            </div>

            <div className="flex items-center justify-center text-2xl font-semibold text-[#00D4AA] lg:px-1">
              <span className="hidden lg:inline">→</span>
              <span className="lg:hidden">↓</span>
            </div>

            <div className="flex-1 rounded-3xl border border-white/8 bg-[#13151A] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                  $27 One-Time
                </span>
                <span className="text-xs text-[#64748B]">Card 02</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Full Blueprint + Prompt Guide</h3>
              <p className="mt-3 text-sm leading-6 text-[#9AA4B2]">Complete 7-day guide + 10-Layer Prompt System for photorealistic AI</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href="/pdfs/aib-oto-blueprint.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#00D4AA] px-4 py-3 text-center text-sm font-semibold text-[#03120E] transition hover:brightness-105"
                >
                  The Blueprint (Full)
                </a>
                <a
                  href="/pdfs/aib-oto-prompt-guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#00D4AA] px-4 py-3 text-center text-sm font-semibold text-[#03120E] transition hover:brightness-105"
                >
                  Prompt Guide
                </a>
              </div>
              <div className="mt-5 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-xs text-[#94A3B8]">
                <span className="font-semibold uppercase tracking-[0.14em] text-[#FCD34D]">Delivery</span>
                <div className="mt-1">After purchase on lp.ainfluencerblueprint.com</div>
              </div>
            </div>

            <div className="flex items-center justify-center text-2xl font-semibold text-[#7C5CFC] lg:px-1">
              <span className="hidden lg:inline">→</span>
              <span className="lg:hidden">↓</span>
            </div>

            <div className="flex-1 rounded-3xl border border-white/8 bg-[#13151A] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                  $97/Month
                </span>
                <span className="text-xs text-[#64748B]">Card 03</span>
              </div>
              <h3 className="text-xl font-semibold text-white">AI Influencer Blueprint Community</h3>
              <p className="mt-3 text-sm leading-6 text-[#9AA4B2]">Full community + course on Whop. Live calls, templates, support.</p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href="https://whop.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/12 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-400/18"
                >
                  View on Whop →
                </a>
              </div>
              <div className="mt-5 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-xs text-[#94A3B8]">
                <span className="font-semibold uppercase tracking-[0.14em] text-violet-300">Delivery</span>
                <div className="mt-1">Email Day 7 CTA + ongoing</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/6 bg-[#13151A] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.01)] sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Sequence timeline</h2>
              <p className="mt-1 text-sm text-[#7C8799]">Preview every planned nurture email and copy the full GHL-ready HTML in one click.</p>
            </div>
            <div className="text-xs text-[#64748B]">8 emails loaded from <span className="font-mono text-[#00D4AA]">/public/emails</span></div>
          </div>

          <div className="relative pl-4 sm:pl-8">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-[#00D4AA]/0 via-[#00D4AA]/50 to-[#00D4AA]/0 sm:left-3" />

            <div className="space-y-5">
              {emails.map((email) => {
                const status = statusConfig[email.status];
                const preview = previews[email.file] || (loading ? "Loading preview…" : "Preview unavailable.");
                const isCopied = copiedKey === email.file;

                return (
                  <div key={email.file} className="relative">
                    <div className="absolute left-[-13px] top-8 h-3 w-3 rounded-full border-2 border-[#0A0B0F] bg-[#00D4AA] shadow-[0_0_0_4px_rgba(0,212,170,0.18)] sm:left-[-21px]" />

                    <div className="rounded-2xl border border-white/8 bg-[#13151A] p-5 transition-colors duration-200 hover:border-white/15">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-[#00D4AA]/12 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#00D4AA] uppercase">
                              Day {email.day} — {email.timing}
                            </span>
                            <span
                              className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
                              style={{ background: status.bg, color: status.text, borderColor: status.border }}
                            >
                              {status.label}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-white sm:text-xl">{email.subject}</h3>
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#9AA4B2]">{preview}</p>
                          <div className="mt-4 text-xs text-[#5E6A7D]">
                            Source: <span className="font-mono text-[#7DD3C7]">{email.file}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:min-w-[180px]">
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode("desktop");
                              setActiveEmail(email);
                            }}
                            className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.04]"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => copyHtml(email, email.file)}
                            className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-[#03120E] transition hover:brightness-105"
                            style={{ background: isCopied ? "#6EE7B7" : "#00D4AA" }}
                          >
                            {isCopied ? "✓ Copied!" : "Copy GHL Code"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {activeEmail && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0F1116] px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-[#00D4AA]">Day {activeEmail.day} preview</div>
              <h2 className="truncate text-base font-semibold text-white sm:text-lg">{activeEmail.subject}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl border border-white/10 bg-white/[0.03] p-1 sm:flex">
                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${viewMode === "desktop" ? "bg-[#00D4AA] text-[#03120E]" : "text-[#AAB4C3] hover:text-white"}`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${viewMode === "mobile" ? "bg-[#00D4AA] text-[#03120E]" : "text-[#AAB4C3] hover:text-white"}`}
                >
                  Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={() => copyHtml(activeEmail, `modal-${activeEmail.file}`)}
                className="rounded-xl bg-[#00D4AA] px-4 py-2.5 text-sm font-semibold text-[#03120E] transition hover:brightness-105"
              >
                {copiedKey === `modal-${activeEmail.file}` ? "✓ Copied!" : "Copy Code"}
              </button>
              <button
                type="button"
                onClick={() => setActiveEmail(null)}
                className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-6">
            <div className="mb-4 flex justify-center sm:hidden">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${viewMode === "desktop" ? "bg-[#00D4AA] text-[#03120E]" : "text-[#AAB4C3] hover:text-white"}`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${viewMode === "mobile" ? "bg-[#00D4AA] text-[#03120E]" : "text-[#AAB4C3] hover:text-white"}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            <div className="mx-auto flex justify-center">
              <div
                className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl transition-all duration-200"
                style={{ width: viewMode === "mobile" ? 390 : "100%", maxWidth: viewMode === "mobile" ? 390 : 1200, minHeight: "75vh" }}
              >
                <iframe
                  title={activeEmail.subject}
                  srcDoc={activeHtml}
                  className="h-[75vh] w-full bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
