"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";

type Question = {
  id: string;
  label: string;
  helper: string;
  type: "number" | "text" | "choice";
  placeholder?: string;
  options?: string[];
};

const STORAGE_KEY = "aiUniversaSurveyAnswers";
const SURVEY_PAYLOAD_KEY = "aiUniversaSurveyPayload";
const EMAIL_STORAGE_KEY = "aiUniversaLeadEmail";

const questions: Question[] = [
  {
    id: "age",
    label: "Koliko si star/a?",
    helper: "Prosim, vpiši svojo starost v letih.",
    type: "number",
    placeholder: "28",
  },
  {
    id: "situation",
    label: "Kakšna je tvoja trenutna situacija?",
    helper: "Izberi odgovor, ki te trenutno najbolje opiše.",
    type: "choice",
    options: ["Študent/ka", "Zaposlen/a", "Samostojni podjetnik/ca", "Brezposeln/a", "Drugo"],
  },
  {
    id: "experience",
    label: "Koliko izkušenj imaš z AI?",
    helper: "Izberi svojo trenutno raven izkušenj.",
    type: "choice",
    options: ["Nobenih", "Začetnik/ca", "Srednje", "Napreden/a"],
  },
  {
    id: "interest",
    label: "Kaj te najbolj zanima?",
    helper: "Povej nam, kaj želiš raziskati najprej.",
    type: "choice",
    options: ["AI Vplivneži", "AI Agencija", "AI Agenti", "Vse od zgoraj"],
  },
  {
    id: "goal",
    label: "Kakšen je tvoj cilj v naslednjih 90 dneh?",
    helper: "Na kratko opiši, kaj želiš doseči.",
    type: "text",
    placeholder: "Npr. do prve stranke ali prvega AI produkta",
  },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#151515]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff3b1f] via-[#ff5c1b] to-[#ff9100] transition-all duration-500"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#ffb36a] bg-[#ff6a1a] shadow-[0_0_14px_rgba(255,98,0,0.8)] transition-all duration-500"
          style={{ left: `calc(${Math.max(2, Math.min(value, 98))}% - 8px)` }}
        />
      </div>
    </div>
  );
}

function AIUniversaSurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveySectionRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      setAnswers(JSON.parse(saved) as Record<string, string>);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email")?.trim();
    if (emailFromUrl) {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, emailFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (!showSurvey) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timeout);
  }, [showSurvey, currentIndex]);

  const currentQuestion = questions[currentIndex];
  const currentValue = answers[currentQuestion.id] ?? "";
  const topProgress = showSurvey ? 60 + ((currentIndex + 1) / questions.length) * 40 : 60;
  const surveyProgress = useMemo(() => ((currentIndex + 1) / questions.length) * 100, [currentIndex]);
  const canContinue = currentValue.trim().length > 0;

  const updateAnswer = (value: string) => {
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: value }));
  };

  const goToSurvey = () => {
    setShowSurvey(true);
    window.requestAnimationFrame(() => {
      surveySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setDirection(-1);
    setCurrentIndex((previous) => previous - 1);
  };

  const goNext = () => {
    if (!canContinue) return;

    if (currentIndex === questions.length - 1) {
      const finalAnswers = { ...answers, [currentQuestion.id]: currentValue };
      const email = window.localStorage.getItem(EMAIL_STORAGE_KEY) || searchParams.get("email") || "";
      const payload = {
        email,
        surveyAnswers: finalAnswers,
        completedAt: new Date().toISOString(),
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalAnswers));
      window.localStorage.setItem(SURVEY_PAYLOAD_KEY, JSON.stringify(payload));
      router.push(email ? `/lp/ai-universa-confirmation?email=${encodeURIComponent(email)}` : "/lp/ai-universa-confirmation");
      return;
    }

    setDirection(1);
    setCurrentIndex((previous) => previous + 1);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goNext();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Enter" && currentQuestion.type !== "text") {
      event.preventDefault();
      goNext();
    }

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && currentQuestion.type === "text") {
      event.preventDefault();
      goNext();
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="sticky top-0 z-50 bg-black">
        <div className="bg-gradient-to-r from-[#d61d00] via-[#f14a13] to-[#ff8a00] px-4 py-3 text-center text-[13px] font-black uppercase tracking-[0.12em] text-white sm:text-sm">
          NE ZAPRI TE STRANI
        </div>
        <div className="border-b border-white/10 bg-black px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <ProgressBar value={topProgress} />
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <section className="flex flex-col items-center text-center">
          <h1 className="max-w-[18ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[52px]">
            Tvoja registracija je <span className="bg-gradient-to-r from-[#ff4d1f] to-[#ff9a1a] bg-clip-text italic text-transparent">skoraj končana...</span>
          </h1>

          <p className="mt-4 max-w-[34rem] text-[15px] leading-7 text-[#9f9f9f] sm:text-[17px]">
            Poglej video spodaj, da zaključiš registracijo in izpolni anketo za prenos Delovnih zvezkov v WhatsApp skupini
          </p>

          <div className="mt-8 w-full overflow-hidden rounded-[26px] border border-white/10 bg-[#090909] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="relative aspect-video w-full bg-black">
              <Image
                src="/ai-universa-images/image-5-authority-portrait.png"
                alt="AI Universa video placeholder"
                fill
                className="object-cover opacity-60"
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.62))]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <div className="flex h-18 w-18 items-center justify-center rounded-full border border-white/20 bg-black/45 backdrop-blur">
                  <Play className="ml-1 h-8 w-8 fill-white text-white" />
                </div>
                <p className="mt-5 text-base font-semibold text-white sm:text-lg">Poglej kratek video in nato izpolni anketo</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-white">NE ZAPRI TE STRANI</p>
            <p className="mt-2 text-sm leading-6 text-[#979797]">
              Ne zapri te strani, ker je tvoja registracija zaključena šele po izpolnjeni anketi.
            </p>
          </div>

          <button
            type="button"
            onClick={goToSurvey}
            className="mt-8 inline-flex min-h-[58px] w-full max-w-[24rem] items-center justify-center rounded-[18px] bg-[#ffd21f] px-6 text-center text-[13px] font-black uppercase tracking-[0.04em] text-black shadow-[0_10px_30px_rgba(255,210,31,0.24)] transition hover:brightness-105 active:scale-[0.99] sm:text-[14px]"
          >
            IZPOLNI ANKETO ZA PRIDRUŽITEV SKUPINI
          </button>
        </section>

        <section ref={surveySectionRef} className="pt-16 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full bg-gradient-to-r from-[#cf1d00] to-[#ff7a00] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white">
              KORAK 2
            </div>
            <h2 className="mt-5 text-[30px] font-semibold leading-[1.16] tracking-[-0.04em] text-white sm:text-[46px]">
              Izpolni kratko anketo spodaj, da dobiš dostop do <span className="bg-gradient-to-r from-[#ff4c1d] to-[#ff9718] bg-clip-text font-bold text-transparent">brezplačnih virov v WhatsApp skupini</span>
            </h2>
          </div>

          <div className="mx-auto mt-8 max-w-3xl rounded-[28px] bg-white px-5 py-6 text-black shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:px-8 sm:py-8">
            <div className="mb-6">
              <ProgressBar value={surveyProgress} />
            </div>

            {!showSurvey ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                <p className="text-[30px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[38px]">
                  Klikni rumeni gumb zgoraj za začetek ankete
                </p>
                <p className="mt-4 max-w-md text-[15px] leading-7 text-[#6e6e73]">
                  Odgovoril/a boš na 5 kratkih vprašanj. Vzame manj kot minuto.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="relative min-h-[380px] overflow-hidden sm:min-h-[410px]">
                <div
                  key={currentQuestion.id}
                  className={`absolute inset-0 transition-all duration-300 ease-out ${direction === 1 ? "animate-[slideUpIn_0.32s_ease-out]" : "animate-[slideDownIn_0.32s_ease-out]"}`}
                >
                  <div className="pr-14">
                    <p className="text-[13px] font-semibold text-[#6e6e73]">{currentIndex + 1}→ {currentQuestion.label}*</p>
                    <p className="mt-3 text-[15px] leading-7 text-[#7a7a80]">{currentQuestion.helper}</p>
                  </div>

                  <div className="mt-10">
                    {currentQuestion.type === "choice" ? (
                      <div className="space-y-3">
                        {currentQuestion.options?.map((option) => {
                          const active = currentValue === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => updateAnswer(option)}
                              className={`flex min-h-[54px] w-full items-center justify-between rounded-[16px] border px-4 text-left text-[15px] font-medium transition ${
                                active
                                  ? "border-[#ff8a00] bg-[#fff5df] text-black"
                                  : "border-[#e9e9eb] bg-white text-black hover:bg-[#fafafa]"
                              }`}
                            >
                              <span>{option}</span>
                              <span className={`text-[12px] ${active ? "text-[#ff7a00]" : "text-[#b2b2b7]"}`}>↵</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : currentQuestion.type === "text" ? (
                      <textarea
                        ref={(node) => {
                          inputRef.current = node;
                        }}
                        value={currentValue}
                        onChange={(event) => updateAnswer(event.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={currentQuestion.placeholder}
                        rows={5}
                        className="w-full resize-none border-0 border-b-2 border-[#111111] bg-transparent px-0 pb-3 pt-2 text-[28px] font-medium leading-tight text-black outline-none placeholder:text-[#b3b3b7]"
                      />
                    ) : (
                      <input
                        ref={(node) => {
                          inputRef.current = node;
                        }}
                        type="number"
                        inputMode="numeric"
                        value={currentValue}
                        onChange={(event) => updateAnswer(event.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={currentQuestion.placeholder}
                        className="w-full border-0 border-b-2 border-[#111111] bg-transparent px-0 pb-3 pt-2 text-[38px] font-medium leading-none text-black outline-none placeholder:text-[#b3b3b7]"
                      />
                    )}
                  </div>

                  <div className="mt-10 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={!canContinue}
                      className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#ffd21f] px-5 text-[14px] font-extrabold uppercase tracking-[0.04em] text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      OK
                    </button>
                    <p className="text-[13px] text-[#7a7a80]">pritisni Enter ↵{currentQuestion.type === "text" ? " ali Cmd/Ctrl + Enter" : ""}</p>
                  </div>

                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={currentIndex === 0}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfdfe3] text-[#55555a] transition hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Prejšnje vprašanje"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!canContinue}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfdfe3] text-[#55555a] transition hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Naslednje vprašanje"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes slideUpIn {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDownIn {
          from {
            opacity: 0;
            transform: translateY(-28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


export default function AIUniversaSurveyPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AIUniversaSurveyPage />
    </Suspense>
  );
}
