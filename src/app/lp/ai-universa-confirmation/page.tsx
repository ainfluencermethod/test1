"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_QUIZ_FUNNEL_API_URL || "http://localhost:3003";
const SURVEY_PAYLOAD_KEY = "aiUniversaSurveyPayload";
const EMAIL_STORAGE_KEY = "aiUniversaLeadEmail";

type WhatsAppGroup = {
  id: number;
  name: string;
  inviteLink: string;
  capacity: number;
  currentCount: number;
  status: string;
};

type SurveyPayload = {
  email?: string;
  surveyAnswers?: Record<string, string>;
  completedAt?: string;
};

const benefits = [
  "Vse 3 Delovne zvezke",
  "Ekskluzivne bonuse",
  "Opomnik pred vsakim živim prenosom",
  "Direktna komunikacija z ekipo",
  "Skupnost učencev",
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#151515]">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff3b1f] via-[#ff5c1b] to-[#ff9100]"
        style={{ width: `${value}%` }}
      />
      <div
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#ffb36a] bg-[#ff6a1a] shadow-[0_0_14px_rgba(255,98,0,0.8)]"
        style={{ left: `calc(${Math.max(2, Math.min(value, 98))}% - 8px)` }}
      />
    </div>
  );
}

function AIUniversaConfirmationPage() {
  const searchParams = useSearchParams();
  const [group, setGroup] = useState<WhatsAppGroup | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const surveyPayload = useMemo<SurveyPayload>(() => {
    if (typeof window === "undefined") return {};

    const fromStorage = window.localStorage.getItem(SURVEY_PAYLOAD_KEY);
    const emailFromUrl = searchParams.get("email")?.trim() || "";
    const emailFromStorage = window.localStorage.getItem(EMAIL_STORAGE_KEY) || "";

    if (emailFromUrl) {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, emailFromUrl);
    }

    if (!fromStorage) {
      return { email: emailFromUrl || emailFromStorage };
    }

    try {
      const parsed = JSON.parse(fromStorage) as SurveyPayload;
      return {
        ...parsed,
        email: emailFromUrl || parsed.email || emailFromStorage,
      };
    } catch {
      return { email: emailFromUrl || emailFromStorage };
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadNextGroup() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/whatsapp/next-group`, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "WhatsApp skupina trenutno ni na voljo.");
        }

        if (cancelled) return;
        setGroup(data.group);
        setWarning(data.warning || null);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Napaka pri nalaganju WhatsApp skupine.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadNextGroup();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleJoin = async () => {
    try {
      setJoining(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/whatsapp/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: surveyPayload.email || "",
          surveyAnswers: surveyPayload.surveyAnswers || {},
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Pridružitev ni uspela.");
      }

      setGroup(data.group);
      setWarning(data.warning || null);
      window.location.href = data.inviteLink;
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Prišlo je do napake.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <main className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <section className="overflow-hidden rounded-[26px] border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <div className="relative aspect-video w-full bg-black">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12),rgba(0,0,0,0.55))]" />
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <Image src="/ai-universa-logo.png" alt="AI Universa" width={168} height={58} className="h-auto w-[150px] sm:w-[168px]" priority />
        </div>

        <div className="mt-7">
          <ProgressBar value={100} />
        </div>

        <section className="mt-8 text-center">
          <h1 className="mx-auto max-w-[20ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[52px]">
            Samo še <span className="bg-gradient-to-r from-[#ff4d1f] to-[#ff9a1a] bg-clip-text text-transparent">en korak</span> do tvoje brezplačne vstopnice in dostopa do Delovnih zvezkov
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[#9f9f9f] sm:text-[17px]">Tukaj je, kaj moraš narediti...</p>
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-6 sm:gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[30px]">Pridruži se WhatsApp skupini</h2>
              <p className="mt-3 text-[15px] leading-7 text-[#b1b1b1] sm:text-[16px]">
                Pridruži se naši zasebni WhatsApp skupini za vse brezplačne vire in Delovne zvezke, ki bodo deljeni med dogodkom.
              </p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#ffd21f]">
                {loading ? "Nalagam skupino..." : group ? `Skupina #${group.id}` : "Skupina ni na voljo"}
              </p>
              {surveyPayload.email ? (
                <p className="mt-2 text-xs text-[#8d8d8d]">Lead: {surveyPayload.email}</p>
              ) : null}
              {warning ? (
                <div className="mt-4 rounded-2xl border border-[#ff7d2a]/30 bg-[#ff7d2a]/10 px-4 py-3 text-sm text-[#ffb277]">
                  {warning}
                </div>
              ) : null}
              {error ? (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="w-full md:max-w-[240px]">
              <button
                type="button"
                onClick={handleJoin}
                disabled={loading || joining || !group}
                className="inline-flex min-h-[58px] w-full items-center justify-center rounded-[18px] bg-[#ffd21f] px-6 text-[14px] font-black uppercase tracking-[0.04em] text-black shadow-[0_10px_30px_rgba(255,210,31,0.24)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {joining ? "Povezujem..." : "PRIDRUŽI SE"}
              </button>
              <p className="mt-3 text-center text-[13px] leading-5 text-[#ff7d2a] md:text-left">
                Nimaš WhatsApp? Prenesi ga. To bo naš glavni komunikacijski kanal.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[24px] border border-white/8 bg-[#0a0a0a] p-5 sm:p-6">
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-[15px] leading-7 text-white sm:text-[16px]">
                <span className="mt-1 text-[18px] leading-none text-[#ffd21f]">✅</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}


export default function AIUniversaConfirmationPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AIUniversaConfirmationPage />
    </Suspense>
  );
}
