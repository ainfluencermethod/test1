"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import {
  BadgeCheck,
  Bot,
  Check,
  ChevronDown,
  CircleDollarSign,
  Gem,
  Gift,
  MessageSquareText,
  Mic,
  Play,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  WandSparkles,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "600", "700", "800"],
});

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

type Product = {
  title: string;
  value: string;
  description: string;
  bullets: string[];
  note?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const targetIso = "2026-04-21T21:59:00Z";

const products: Product[] = [
  {
    title: "AI Vplivneži Masterclass",
    value: "€2.999/leto vrednost",
    description:
      "Celoten sistem za ustvarjanje AI vplivnežev, viralnih short-form vsebin in monetizacije brez tega, da moraš biti obraz znamke.",
    bullets: [
      "Kako ustvariš premium AI like in profile",
      "Kako delaš viralne vsebine za TikTok in Instagram",
      "Kako monetiziraš z Fanvue in podobnimi modeli",
      "Workflowi, promti in produkcijski sistemi",
    ],
    icon: Sparkles,
  },
  {
    title: "AI Agencija Sistem",
    value: "€2.999/leto vrednost",
    description:
      "Dokazan model, kako AI znanje spremeniš v storitev, ponudbo in cash-flow, tudi če začenjaš brez audience-a.",
    bullets: [
      "Kako zapakiraš AI storitev v jasno ponudbo",
      "Kako pridobiš prve stranke in lead-e",
      "Kako z AI dvigneš output in maržo",
      "Kako zgradiš delivery brez kaosa",
    ],
    icon: TrendingUp,
  },
  {
    title: "AI Agenti SAAS Platforma",
    value: "€1.068/leto vrednost",
    note: "+ €200 kreditov predobljenih",
    description:
      "Pred-dostop do platforme, kjer lahko AI agente dejansko uporabljaš. Ne dobiš samo teorije — dobiš infrastrukturo.",
    bullets: [
      "Pred-dostop pred javnim launchom",
      "€200 kreditov vključenih takoj",
      "Agenti za avtomatizacijo prodaje, podpore in operacij",
      "Možnost dodatnega zaslužka prek affiliate modela",
    ],
    icon: Bot,
  },
  {
    title: "AI Universa Skupnost",
    value: "€1.495 vrednost",
    description:
      "Zaprt ekosistem ljudi, ki gradijo z AI. Dobiš podporo, feedback, odgovore in hitrejši momentum kot sam/a.",
    bullets: [
      "Dostop do zaprte skupnosti",
      "Pomoč pri implementaciji in feedback",
      "Okolje ljudi z istim ciljem",
      "Boljši fokus, manj tavanja med tooli",
    ],
    icon: Users,
  },
  {
    title: "Nagradna Igra — €25.000+ v Nagradah",
    value: "Neprecenljivo",
    description:
      "Ob vstopu sodeluješ tudi za velike nagrade. To ni glavni razlog za pridružitev, je pa konkreten bonus na vrhu vsega.",
    bullets: [
      "Glavna nagrada: avto",
      "3x MacBook",
      "iPhone",
      "VIP prinese več možnosti v žrebanju",
    ],
    icon: Trophy,
  },
  {
    title: "Mesečni LIVE Klici",
    value: "Neprecenljivo",
    description:
      "Redni live klici, kjer dobiš usmeritev, odgovore in pomoč pri realni implementaciji, ne samo gledanja lekcij v prazno.",
    bullets: [
      "Mesečni LIVE Q&A klici",
      "Sprotne usmeritve in clarity",
      "Odgovori na konkretna vprašanja",
      "Podpora pri naslednjih korakih",
    ],
    icon: Mic,
  },
];

const studentCards = [
  ["@nina.ai", "€4.280", "Prvih 90 dni"],
  ["@markobuilds", "€6.140", "Fanvue + custom deal-i"],
  ["@lina.studio", "€3.760", "AI content sistem"],
  ["@urbanagency", "€8.920", "AI agency offer"],
  ["@katja.grow", "€5.310", "Prvi recurring klienti"],
  ["@neoautomates", "€7.480", "AI agent setupi"],
];

const dmProof = [
  {
    text: "Brat tole je noro… prvič sem dejansko zaprl klienta z AI offerjem. Čist resno mislim.",
    highlight: "prvič sem dejansko zaprl klienta",
  },
  {
    text: "Ta sistem za AI content mi je prinesel prve prodaje. Nisem pričakovala, da bo šlo tako hitro.",
    highlight: "prinesel prve prodaje",
  },
  {
    text: "Po dveh tednih imam že 3 profile live in eden je začel res lepo vlečt oglede.",
    highlight: "3 profile live",
  },
  {
    text: "Končno razumem, kako vse to monetizirat. Prej sem samo gledal tool videe.",
    highlight: "kako vse to monetizirat",
  },
  {
    text: "€2k+ v enem mesecu iz AI storitve. Točno to sem rabil — jasen sistem.",
    highlight: "€2k+ v enem mesecu",
  },
  {
    text: "Hvala, ker si to razložil po domače. Brez BS. Samo koraki in execution.",
    highlight: "Brez BS. Samo koraki",
  },
  {
    text: "S SAAS krediti sem takoj lahko testiral agente brez dodatnega stroška. Huge win.",
    highlight: "takoj lahko testiral agente",
  },
  {
    text: "Skupnost je underrated. Dobil sem več uporabnih odgovorov tukaj kot v 20 YouTube videih.",
    highlight: "več uporabnih odgovorov",
  },
  {
    text: "To ni še en course. To je dejansko business model, ki ga lahko spelješ.",
    highlight: "dejansko business model",
  },
];

const faqs = [
  ["Je to primerno za začetnike?", "Ja. Sistem je narejen tako, da lahko začneš tudi brez coding znanja, ekipe ali izkušenj z AI."],
  ["Kaj je vključeno v nakup?", "Dobiš vse glavne produkte: AI Vplivneži, AI Agencija, AI Agenti SAAS, skupnost, LIVE klice in bonus nagradno igro."],
  ["Ali dobim dostop takoj?", "Ja, dostop do vsebin dobiš takoj po uspešnem nakupu. SAAS onboarding sledi po navodilih znotraj programa."],
  ["Kaj pomeni pred-dostop do SAAS-a?", "Pomeni, da dobiš zgodnji dostop do platforme pred javnostjo, skupaj s krediti in prednostjo pri uporabi."],
  ["Kakšna je razlika med Normal in VIP?", "VIP prinese več kreditov, več podpore, bolj direkten dostop in več prednosti v nagradni igri."],
  ["Ali lahko to uporabim, če že imam biznis?", "Ja. Sistem je uporaben tako za popolne začetnike kot za ljudi, ki že imajo ponudbo, občinstvo ali podjetje."],
  ["Ali je tukaj garancija?", "Ja. Imaš 14-dnevno garancijo vračila denarja v skladu s pogoji nakupa."],
  ["Do kdaj je ponudba odprta?", "Ponudba se zaključi 21. aprila 2026 ob 23:59 CEST."],
  ["Ali moram pokazati obraz?", "Ne. Eden glavnih appealov sistema je ravno to, da lahko ostaneš v ozadju."],
  ["Kako začnem?", "Klikneš na enega od CTA gumbov, izbereš paket in dobiš dostop do vsega, kar potrebuješ za začetek."],
] as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useCountdown(target: string): Countdown {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  const [state, setState] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setState({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return state;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CTA({ children, secondary = false, onClick }: { children: React.ReactNode; secondary?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] transition duration-300",
        secondary
          ? "border border-[#ffe600]/30 bg-transparent text-[#ffe600] hover:border-[#ffe600] hover:bg-[#ffe600]/8"
          : "bg-[#ffe600] text-[#0b0d17] hover:scale-[1.02] hover:shadow-[0_12px_50px_rgba(255,230,0,0.22)]",
      )}
    >
      {children}
    </button>
  );
}

function CountdownInline() {
  const t = useCountdown(targetIso);
  if (t.expired) return <span className="text-[#ffe600]">ZAKLJUČENO</span>;
  return (
    <span className="text-[#ffe600] tabular-nums">{String(t.days).padStart(2, "0")}D : {String(t.hours).padStart(2, "0")}H : {String(t.minutes).padStart(2, "0")}M : {String(t.seconds).padStart(2, "0")}S</span>
  );
}

function CountdownBlocks() {
  const t = useCountdown(targetIso);
  const items = [
    [t.days, "dni"],
    [t.hours, "ur"],
    [t.minutes, "min"],
    [t.seconds, "sek"],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([value, label]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
          <div className="text-3xl font-bold tabular-nums text-white">{String(value).padStart(2, "0")}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">{label}</div>
        </div>
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161821]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left">
        <span className="text-sm font-semibold text-white md:text-base">{q}</span>
        <ChevronDown className={cn("h-5 w-5 text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-7 text-zinc-400">{a}</p>}
    </div>
  );
}

function ProductCard({ product, reverse }: { product: Product; reverse?: boolean }) {
  const Icon = product.icon;
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#161821] p-4 md:p-5">
      <div className={cn("grid items-stretch gap-5 md:grid-cols-[1.2fr_0.95fr]", reverse && "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1")}>
        <div className="rounded-[16px] bg-[#12141d] p-6 md:p-8">
          <h3 className="text-2xl font-bold text-white md:text-3xl">{product.title}</h3>
          <p className="mt-3 text-lg font-semibold text-[#ffe600]">{product.value}</p>
          {product.note && <p className="mt-2 text-sm font-semibold text-[#ffe600]">{product.note}</p>}
          <p className="mt-5 text-sm leading-7 text-zinc-400 md:text-base">{product.description}</p>
          <ul className="mt-6 space-y-3">
            {product.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm leading-6 text-zinc-200">
                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#5df286]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-[260px] rounded-[16px] border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(105,115,255,0.45),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(183,91,255,0.38),transparent_35%),linear-gradient(135deg,#1b1f34,#0d1019)] p-6">
          <div className="flex h-full items-center justify-center rounded-[14px] border border-white/10 bg-black/10 backdrop-blur-sm">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <Icon className="h-11 w-11" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const comparison = [
    ["Vsi glavni produkti", true, true],
    ["AI Agenti SAAS dostop", true, true],
    ["Krediti", "€200", "€1.000"],
    ["Mesečni LIVE klici", true, true],
    ["Nagradna igra", "1x vstop", "3x vstop"],
    ["Zaprt VIP krog", false, true],
    ["1-na-1 bližji support", false, true],
  ] as const;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0d17] text-white selection:bg-[#ffe600] selection:text-black">
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,#0b0d17,#0d0f19)]" />
      <div className="fixed inset-y-0 left-0 -z-10 w-[24vw] bg-[radial-gradient(circle_at_left,rgba(86,130,255,0.22),transparent_40%),linear-gradient(180deg,transparent,rgba(132,69,255,0.14),transparent)] blur-3xl" />
      <div className="fixed inset-y-0 right-0 -z-10 w-[24vw] bg-[radial-gradient(circle_at_right,rgba(132,69,255,0.18),transparent_40%),linear-gradient(180deg,transparent,rgba(86,130,255,0.16),transparent)] blur-3xl" />

      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0b0d17]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Image src="/ai-universa-logo.png" alt="AI Universa" width={36} height={36} className="h-9 w-9 rounded-full" />
            <span className="text-sm font-semibold tracking-[0.18em] text-white/90 uppercase">AI Universa</span>
          </div>
          <div className="hidden text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-300 md:block">
            Ponudba se zaključi čez <CountdownInline />
          </div>
          <CTA onClick={() => scrollToId("pricing")}>Pridruži se</CTA>
        </div>
      </header>

      <main>
        <section className="px-4 pb-20 pt-12 md:px-6 md:pb-28 md:pt-16">
          <div className="mx-auto max-w-[920px] text-center">
            <h1 className={cn(playfair.className, "text-4xl leading-[1.04] text-white md:text-6xl lg:text-[68px]")}>
              Ustvari <span className="text-[#ffe600]">Prihodek z AI</span> z Mojim <span className="text-[#ffe600]">Preverjenim Sistemom</span>
              <span className="mt-2 block text-white/92">(Medtem ko Ostaneš Popolnoma v Ozadju)</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
              Poglej video, da razumeš kako dostopati do sistema, ki je ustvaril konkretne rezultate za naše učence — in kako lahko tudi ti zgradiš AI posel brez ugibanja.
            </p>

            <div className="mt-10 overflow-hidden rounded-[22px] border border-white/10 bg-[#161821] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-video rounded-[18px] border border-white/10 bg-[linear-gradient(135deg,#111522,#0b0d17)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(89,113,255,0.18),transparent_30%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-[18px] border border-[#ffe600]/20 bg-[#ffe600] px-5 py-4 text-left text-[#0b0d17] shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/10">
                        <Play className="h-5 w-5 fill-current" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em]">Tvoj video se je že začel</p>
                        <p className="text-sm">Klikni za poslušanje</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className={cn(playfair.className, "mt-5 text-xl text-zinc-300")}>in navijam zate.</p>
            <div className="mt-8 flex justify-center">
              <CTA onClick={() => scrollToId("pricing")}>Pridruži se zdaj</CTA>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[920px] text-center">
            <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}>
              Se nam Pridružiš za <span className="text-[#ffe600]">Rekordni Projekt</span>?
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-[#161821] p-8 text-left">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Prvič ko smo odprli ponudbo</p>
                <p className="mt-4 text-3xl font-bold leading-tight text-white">Naši učenci so ustvarili <span className="text-[#ffe600]">€41.127 v 90 dneh</span></p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-[#161821] p-8 text-left">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Drugič?</p>
                <p className="mt-4 text-3xl font-bold leading-tight text-white"><span className="text-[#ffe600]">€63.480</span> v istem obdobju</p>
              </div>
            </div>
            <p className={cn(playfair.className, "mt-8 text-2xl text-[#ffe600] md:text-3xl")}>To delamo spet.</p>
            <p className="mt-3 text-base text-zinc-400 md:text-lg">Morda si le ENO odločitev stran od rezultatov kot ti učenci:</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studentCards.map(([name, amount, label]) => (
                <div key={name} className="rounded-[18px] border border-white/10 bg-[#161821] p-5 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-sm font-bold text-white">{name.slice(1, 3).toUpperCase()}</div>
                    <div>
                      <p className="font-semibold text-white">{name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">whop profil</p>
                    </div>
                  </div>
                  <p className="mt-5 text-3xl font-bold text-[#ffe600]">{amount}</p>
                  <p className="mt-2 text-sm text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[1080px] text-center">
            <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}>Dokaz iz <span className="text-[#ffe600]">skupnosti</span></h2>
            <div className="mt-10 columns-1 gap-4 md:columns-2 lg:columns-3 [&>div:not(:first-child)]:mt-4">
              {dmProof.map((item, i) => (
                <div key={i} className="break-inside-avoid rounded-[18px] border border-white/10 bg-[#161821] p-5 text-left">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#202432] text-white"><MessageSquareText className="h-4 w-4" /></div>
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">DM dokaz</p>
                  </div>
                  <p className="text-sm leading-7 text-zinc-300">
                    {item.text.split(item.highlight).map((part, idx, arr) => (
                      <span key={idx}>
                        {part}
                        {idx < arr.length - 1 && <span className="font-semibold text-[#ffe600]">{item.highlight}</span>}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <CTA onClick={() => scrollToId("pricing")}>Pridruži se</CTA>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[920px] text-center">
            <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}>
              <span className="text-zinc-300">AI Universa:</span> <span className="text-[#ffe600]">Najboljši Začetniški AI Posel za 2026</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
              To ni še ena random zbirka lekcij. To je jasna pot, kako ustvariš AI asset, ga zrasteš in monetiziraš. Brez tega, da moraš biti programer ali influencer v klasičnem smislu.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {([
                ["Postali so strokovnjaki v svojem področju", WandSparkles],
                ["Ustvarjali so vsebine leta", Sparkles],
                ["Zgradili so občinstvo od nič", Users],
              ] as const).map(([text, Icon]) => {
                const I = Icon;
                return (
                  <div key={text} className="rounded-[18px] border border-white/10 bg-[#161821] p-6 text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a2140] text-[#92a8ff]"><I className="h-5 w-5" /></div>
                    <p className="mt-4 text-base font-semibold leading-7 text-white">{text}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 text-lg text-zinc-300">In ti bi lahko dobil/a do <span className="font-semibold text-[#ffe600]">30% njihovih potencialnih zaslužkov z AI</span> — če se odločiš zgraditi sistem prav.</p>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[920px] text-center">
            <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}><span className="text-[#ffe600]">4-Koračni Sistem</span> Za Pot od Niča do AI Zaslužka</h2>
            <p className="mt-4 text-base text-zinc-400 md:text-lg">Ta model se imenuje <span className="font-semibold text-white">AI Universa</span>.</p>

            <div className="mx-auto mt-12 max-w-3xl space-y-5 text-left">
              {([
                ["USTVARI", "Ustvari AI vplivneža in postavi osnovo svojega sistema", Sparkles],
                ["OBJAVLJAJ", "Objavljaj viralne vsebine po preverjenih formatih", Play],
                ["RASTI", "Zgradi občinstvo z dokazanimi strategijami rasti", TrendingUp],
                ["MONETIZIRAJ", "Monetiziraj z Fanvue, blagovnimi znamkami in AI agencijo", CircleDollarSign],
              ] as const).map(([step, desc, Icon]) => {
                const I = Icon;
                return (
                  <div key={step} className="flex gap-4 rounded-[20px] border border-white/10 bg-[#161821] p-5 md:p-6">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#1a2140] text-[#92a8ff]"><I className="h-6 w-6" /></div>
                    <div>
                      <p className={cn(playfair.className, "text-2xl text-[#ffe600]")}>{step}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{desc}</p>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">Vse je zgrajeno tako, da ti ni treba improvizirati. Samo slediš sistemu, ki je že dokazano deloval drugim.</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center">
              <CTA onClick={() => scrollToId("pricing")}>Pridruži se zdaj</CTA>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[1080px]">
            <div className="mx-auto max-w-[920px] text-center">
              <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}>
                Tukaj je <span className="text-[#ffe600]">Natančno</span> Kaj Dobiš Ko Se Pridružiš AI Universa:
              </h2>
            </div>
            <div className="mt-12 space-y-6">
              {products.map((product, index) => (
                <ProductCard key={product.title} product={product} reverse={index % 2 === 1} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[760px] rounded-[22px] bg-[#f5f1e8] p-6 text-[#171717] shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-8">
            <div className="flex flex-col items-center text-center">
              <Image src="/ai-universa-logo.png" alt="AI Universa" width={64} height={64} className="h-16 w-16 rounded-full" />
              <h2 className={cn(playfair.className, "mt-4 text-3xl text-[#171717] md:text-4xl")}>Quick Recap</h2>
            </div>
            <div className="mt-8 space-y-3 text-sm md:text-base">
              {[
                ["AI Vplivneži Masterclass", "€2.999"],
                ["AI Agencija Sistem", "€2.999"],
                ["AI Agenti SAAS Platforma", "€1.068"],
                ["AI Universa Skupnost", "€1.495"],
                ["Nagradna Igra", "€25.000+"],
                ["Mesečni LIVE Klici", "Neprecenljivo"],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-end gap-3">
                  <span className="font-medium">{label}</span>
                  <span className="mb-[5px] flex-1 border-b border-dotted border-black/25" />
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-lg text-zinc-600 line-through">Skupna vrednost: €33.561+</p>
              <p className="mt-2 text-4xl font-bold">Danes od <span className="text-[#c9a600]">€899.99</span></p>
              <div className="mt-6 flex justify-center">
                <CTA onClick={() => scrollToId("pricing")}>Pridruži se zdaj</CTA>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[920px] text-center">
            <Image src="/ai-universa-logo.png" alt="AI Universa" width={72} height={72} className="mx-auto h-[72px] w-[72px] rounded-full" />
            <h2 className={cn(playfair.className, "mt-6 text-3xl text-white md:text-5xl")}>Zakaj To Delam?</h2>
            <div className="mx-auto mt-8 max-w-[420px] overflow-hidden rounded-[24px] border border-white/10 bg-[#161821] p-3">
              <div className="relative aspect-[4/5] rounded-[18px] bg-[linear-gradient(135deg,#25315c,#121828)]">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">Founder photo</div>
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-3xl space-y-5 text-left text-base leading-8 text-zinc-400 md:text-lg">
              <p>Pred nekaj leti sem bil tudi sam v fazi, ko sem videl ogromno priložnost v internetu, ampak nisem imel jasnega sistema. Povsod so bili fragmenti informacij, nobene prave poti in ogromno šuma.</p>
              <p>Z AI se je to spremenilo. Ugotovil sem, da lahko posameznik z dovolj dobrim sistemom ustvari output, ki je bil prej mogoč samo ekipi. In hotel sem zgraditi nekaj, kar ljudem ne da samo teorije, ampak konkretno pot do rezultata.</p>
              <p>Zato obstaja AI Universa. Da ti skrajša čas, zmanjša nepotrebne napake in ti da realno možnost, da začneš graditi nekaj svojega z AI — na način, ki je dejansko izvedljiv.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-[18px] border border-[#3c4f8f] bg-[#121a33] p-6 text-left">
                <p className="text-sm uppercase tracking-[0.22em] text-[#8ba7ff]">Dokazan output</p>
                <p className="mt-3 text-3xl font-bold text-white">200M+ ogledov</p>
              </div>
              <div className="rounded-[18px] border border-[#3c4f8f] bg-[#121a33] p-6 text-left">
                <p className="text-sm uppercase tracking-[0.22em] text-[#8ba7ff]">Rezultati učencev</p>
                <p className="mt-3 text-3xl font-bold text-white">€41.127+ profita</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[1080px] text-center">
            <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}>Izberi svoj paket preden timer pride na <span className="text-[#ffe600]">0</span></h2>
            <div className="mx-auto mt-8 max-w-xl"><CountdownBlocks /></div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-[#161821] p-7 text-left">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Normal</p>
                <p className="mt-4 text-5xl font-bold text-white">€899.99</p>
                <p className="mt-4 text-sm leading-7 text-zinc-400">Celoten sistem za vstop v AI monetizacijo brez preplačevanja.</p>
                <div className="mt-6 space-y-3">
                  {comparison.map(([label, normal]) => (
                    <div key={label} className="flex items-center justify-between gap-4 border-b border-white/6 pb-3 text-sm text-zinc-300 last:border-b-0">
                      <span>{label}</span>
                      <span className="font-semibold text-white">{typeof normal === "boolean" ? normal ? "Da" : "Ne" : normal}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8"><CTA onClick={() => scrollToId("final-cta")}>Pridruži se zdaj</CTA></div>
              </div>

              <div className="rounded-[20px] border border-[#ffe600]/30 bg-[linear-gradient(180deg,rgba(255,230,0,0.08),rgba(22,24,33,1))] p-7 text-left shadow-[0_20px_80px_rgba(255,230,0,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-[#ffe600]">VIP</p>
                  <span className="rounded-full bg-[#ffe600] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black">priporočeno</span>
                </div>
                <p className="mt-4 text-5xl font-bold text-white">€2,499.99</p>
                <p className="mt-4 text-sm leading-7 text-zinc-300">Za tiste, ki hočejo največ podpore, največ kredita in najhitrejšo pot.</p>
                <div className="mt-6 space-y-3">
                  {comparison.map(([label, , vip]) => (
                    <div key={label} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 text-sm text-zinc-200 last:border-b-0">
                      <span>{label}</span>
                      <span className="font-semibold text-white">{typeof vip === "boolean" ? vip ? "Da" : "Ne" : vip}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8"><CTA onClick={() => scrollToId("final-cta")}>Pridruži se zdaj</CTA></div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto flex max-w-[760px] flex-col items-center rounded-[22px] border border-[#caa51c]/25 bg-[#161821] p-8 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#caa51c]/30 bg-[#caa51c]/12 px-5 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#f2d669]">
              <Shield className="h-4 w-4" /> 100% Satisfaction Guarantee
            </div>
            <div className="mt-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#caa51c]/30 bg-[#caa51c]/10 text-[#f2d669]"><BadgeCheck className="h-10 w-10" /></div>
            <h2 className={cn(playfair.className, "mt-6 text-3xl text-white md:text-5xl")}>Brez tveganja.</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">Če ugotoviš, da AI Universa ni zate, imaš 14-dnevno garancijo vračila denarja. Želimo, da vstopiš z zaupanjem — ne s stresom.</p>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[920px] text-center">
            <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}>Pogosta vprašanja</h2>
            <div className="mt-10 space-y-3 text-left">
              {faqs.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}
            </div>
          </div>
        </section>

        <section id="final-cta" className="px-4 pb-24 pt-10 md:px-6">
          <div className="mx-auto max-w-[1080px] rounded-[24px] border border-white/10 bg-[#161821] p-8 text-center md:p-10">
            <h2 className={cn(playfair.className, "text-3xl text-white md:text-5xl")}>Ponudba se zaključuje — odločitev je zdaj tvoja.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">Zakleni si mesto, dobi dostop do sistema, bonusov in SAAS infrastrukture, preden se vrata zaprejo.</p>
            <div className="mx-auto mt-8 max-w-xl"><CountdownBlocks /></div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-[#12141d] p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-zinc-500">Normal</p>
                <p className="mt-3 text-4xl font-bold text-white">€899.99</p>
                <p className="mt-3 text-sm text-zinc-400">Vsi glavni produkti + €200 kreditov</p>
                <div className="mt-6 flex justify-center"><CTA onClick={() => scrollToId("pricing")}>Pridruži se zdaj</CTA></div>
              </div>
              <div className="rounded-[18px] border border-[#ffe600]/30 bg-[#ffe600]/8 p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-[#ffe600]">VIP</p>
                <p className="mt-3 text-4xl font-bold text-white">€2,499.99</p>
                <p className="mt-3 text-sm text-zinc-300">Vse iz Normal + €1.000 kreditov + VIP support</p>
                <div className="mt-6 flex justify-center"><CTA onClick={() => scrollToId("pricing")}>Pridruži se zdaj</CTA></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
