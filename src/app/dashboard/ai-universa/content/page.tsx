"use client";

import { useState } from "react";

/* ─── TYPES ─── */

interface ScriptSection {
  title: string;
  content: string;
}

interface VSLScript {
  id: string;
  tab: string;
  duration: string;
  audience: string;
  platform: string;
  tone: string;
  sections: ScriptSection[];
}

interface StudentWin {
  name: string;
  age: number;
  city: string;
  result: string;
}

/* ─── DATA ─── */

const vslScripts: VSLScript[] = [
  {
    id: "proof",
    tab: "The Proof",
    duration: "~4:35",
    audience: "Topla publika (pozna Picija, rabi push)",
    platform: "Retargeting oglase, Instagram Reels/YouTube Ads",
    tone: "Samozavesten, konkreten, naboj dokazov",
    sections: [
      {
        title: "HOOK — 0:00–0:15",
        content: `[Pici govori v kamero, blizu. Hiter rez na screenshot zaslužka.]

€1,840 na mesec. 12,300 sledilcev. V šestih tednih. To ni moj rezultat — to je rezultat 22-letnega študenta iz Maribora, ki je začel brez izkušenj, brez publike, brez obraz pred kamero.

[Na ekranu: screenshot Lukovega profila + zaslužki]

In on ni edini. Ostani do konca, ker ti bom pokazal točno, kako se pridružiš — brezplačno.`,
      },
      {
        title: "THE OPPORTUNITY — 0:15–1:00",
        content: `[B-roll: AI dashboard, grafi rasti, montaža AI orodij]

Poslušaj. AI ni prihodnost — AI je zdaj. Vsak dan nastajajo novi načini zaslužka, ki jih večina ljudi sploh ne pozna. Medtem ko se drugi sprašujejo, ali je "prepozno" — moji študentje že zaslužijo.

[Tekst na ekranu: "€41,127+ zaslužka študentov"]

In ne govorim o teoriji. Govorim o navadnih ljudeh iz Slovenije, ki so v zadnjih mesecih zgradili realne prihodke z AI — brez ekipe, brez pisarne, brez predhodnega znanja.

Razlika med njimi in vsemi ostalimi? Odločili so se, da bodo začeli. Točno to priložnost imaš zdaj tudi ti.`,
      },
      {
        title: "PROOF STACK — 1:00–2:15",
        content: `[Pici govori v kamero, nato rezi na screenshote za vsako testimonial]

Naj ti povem o konkretnih ljudeh.

[Na ekranu: Lukova slika + rezultati]

Luka Kovač. 22 let, študent iz Maribora. Začel je z ničlo. V 6 tednih — 12,300 sledilcev in €1,840 na mesec. Dela 2 uri na dan.

[Na ekranu: Anina slika + rezultati]

Ana Horvat. 34 let, mama dveh otrok iz Ljubljane. Prvi mesec — €780. Po treh mesecih? €2,100 na mesec. Ob otrocih.

[Na ekranu: Matejeva slika + rezultati]

Matej Zupan. 28 let, programer iz Celja. Odprl je AI agencijo poleg redne službe. €4,750 v dveh mesecih — brez da bi dal odpoved.

[Na ekranu: Ninina slika + rezultati]

Nina Krajnc. 20 let, študentka iz Kopra. 23,000+ sledilcev na TikToku. Podpisuje sponzorske pogodbe. Pri dvajsetih.

[Na ekranu: Gregorjeva slika + rezultati]

Gregor Vidmar. 41 let. Bil je brezposeln. Iz Novega mesta. Od dobesednega niča do €2,300 na mesec v treh mesecih.

[Na ekranu: Tinina slika + rezultati]

In Tina Novak. 31 let, podjetnica iz Kranja. Prihrani 15 ur na teden in zasluži €1,600 na mesec pasivnega prihodka.

[Pici govori v kamero]

Ti ljudje niso genije. Niso imeli sreče. Uporabili so sistem, ki ti ga bom pokazal — brezplačno — čez 35 dni.`,
      },
      {
        title: "THE EVENT — 2:15–3:15",
        content: `[Tekst na ekranu: "AI UNIVERSA — 15.–17. april 2026"]

Organiziram 3-dnevni brezplačni workshop v živo na YouTubu. Ime: AI Universa.

[Grafika: Dan 1, Dan 2, Dan 3 razdelek]

Dan 1 — AI Influencer Workflows. Pokazal ti bom, kako zaslužiti z vsebinami brez da pokažeš obraz. Točno tako, kot je naredil Luka.

Dan 2 — AI Agency Workflows. Kako zgradiš agencijo brez ekipe in brez pisarne. Isto, kar dela Matej poleg službe.

Dan 3 — AI Agenti & Claw Bot V ŽIVO. Pred tvojimi očmi bom zgradil AI agenta v realnem času. Plus — žrebanje za avto.

[Pici govori v kamero, intenzivno]

To ni posnetek. To ni webinar, ki si ga lahko pogledaš kadarkoli. To je V ŽIVO. Replay bo na voljo 24 ur — potem izgine.`,
      },
      {
        title: "AUTHORITY — 3:15–3:35",
        content: `[Tekst na ekranu: "200M+ ogledov | 155,000+ sledilcev | 1,000+ študentov"]

Zakaj bi mi zaupal? Ker imam 200 milijonov ogledov, 155,000+ sledilcev, in več kot 1,000 študentov, ki so skupaj zaslužili več kot €41,000. Številke ne lažejo.`,
      },
      {
        title: "BONUSES — 3:35–3:55",
        content: `[Grafika: prompt pack + nagradna igra]

Vsak, ki se prijavi, dobi brezplačen prompt pack — nabor AI promptov, ki jih lahko takoj uporabiš.

In ker želim, da bo to nepozabno — med prijavljenimi žrebam: avto kot glavno nagrado, 3x MacBook Pro in iPhone.

[Tekst na ekranu: "Avto + 3x MacBook Pro + iPhone"]

Samo za prijavljene. Samo za tiste, ki se odločijo zdaj.`,
      },
      {
        title: "URGENCY — 3:55–4:20",
        content: `[Pici govori v kamero, resen ton]

Naslednji 35 dni bo minilo tako ali tako. Vprašanje je samo — ali boš čez 35 dni na istem mestu, ali boš na AI Universi, z vsemi orodji in znanjem, da začneš zaslužiti?

Mesta so omejena. Workshop je v živo. Ko se zapolni — se zapolni.`,
      },
      {
        title: "CTA — 4:20–4:35",
        content: `[Tekst na ekranu: "aiuniversa.si — BREZPLAČNO"]

Klikni spodaj in rezerviraj svoje brezplačno mesto. Brezplačno. Nič ne tvegaš. Dobiš prompt pack, udeležiš se žrebanja za avto, in za tri dni dobiš vse, kar rabiš, da začneš zaslužiti z AI.

[Pici pogleda v kamero]

Vidimo se 15. aprila. Klikni zdaj.`,
      },
    ],
  },
  {
    id: "wakeup",
    tab: "The Wake-Up Call",
    duration: "~4:35",
    audience: "Hladna publika (ne pozna, ampak čuti FOMO)",
    platform: "Facebook/YouTube cold ads, širši reach",
    tone: "Urgenčen, provokativen, \"ne dovoli si zamuditi\"",
    sections: [
      {
        title: "HOOK — 0:00–0:15",
        content: `[Pici govori v kamero, resen izraz. Temnejša osvetlitev.]

V naslednjih 12 mesecih bo AI nadomestil več delovnih mest kot celotna industrijska revolucija. To ni moje mnenje — to je realnost. Vprašanje ni, ali bo AI spremenil tvoje življenje. Vprašanje je — ali boš na pravi strani spremembe?

Ostani do konca.`,
      },
      {
        title: "THE OPPORTUNITY — 0:15–1:15",
        content: `[B-roll: AI avtomatizacija, prazne pisarne, grafi rasti AI industrije]

Vsak teden berem iste novice. AI zamenja X delovnih mest. AI naredi Y posel nepotreben. Ljudje se pritožujejo, panično delijo članke, in... ne naredijo nič.

[Pici govori v kamero]

Medtem pa manjša skupina Slovencev — navadni ljudje, ne programerji, ne influencerji — tiho gradi povsem nove prihodke z AI. In to počnejo v prostem času, ob službi, ob študiju, ob otrocih.

[Tekst na ekranu: "€41,127+ zaslužka študentov v zadnjih mesecih"]

Razlika med tistimi, ki bodo v redu, in tistimi, ki bodo ostali zadaj? Odločitev. Ena sama odločitev, da se začneš učiti, kako AI deluje ZA tebe — namesto PROTI tebi.

In če ti čakanje na "pravi trenutek" zveni logično — poslušaj. Pravi trenutek je bil včeraj. Drugi najboljši trenutek je danes.`,
      },
      {
        title: "PROOF STACK — 1:15–2:15",
        content: `[Na ekranu: screenshoti in rezultati študentov]

Naj ti pokažem, kaj se zgodi, ko se ljudje nehajo izgovarjati.

Gregor Vidmar. 41 let. Brezposeln. Iz Novega mesta. Tri mesece nazaj ni imel nič. Danes zasluži €2,300 na mesec. Z AI.

[Na ekranu: Gregorjevi rezultati]

Ana Horvat. 34 let, mama dveh otrok. Vsi so ji rekli, da nima časa. Prvi mesec — €780. Zdaj? €2,100 na mesec.

[Na ekranu: Anini rezultati]

Luka Kovač. 22-letni študent. 12,300 sledilcev in €1,840 na mesec v 6 tednih. Dela 2 uri na dan.

[Na ekranu: Lukovi rezultati]

Matej Zupan. Programer. Odprl AI agencijo poleg službe. €4,750 v dveh mesecih.

[Na ekranu: Matejevi rezultati]

Tina Novak. Podjetnica. €1,600 pasivnega prihodka in 15 ur manj dela na teden.

[Pici govori v kamero]

To so ljudje, ki so se odločili. Ki so rekli — jaz bom na pravi strani. Zdaj je vprašanje samo: ali boš tudi ti?`,
      },
      {
        title: "THE EVENT — 2:15–3:10",
        content: `[Tekst na ekranu: "AI UNIVERSA — 15.–17. april 2026 — BREZPLAČNO"]

Zato sem ustvaril AI Universo. 3-dnevni brezplačni workshop v živo na YouTubu. 15., 16. in 17. april. Ob 19:00.

[Grafika: Dan 1–3 breakdown]

Dan 1 — pokažem ti, kako AI influencerji zaslužijo brez da pokažejo obraz. Celoten workflow od A do Ž.

Dan 2 — kako zgradiš AI agencijo brez ekipe in brez pisarne. Točno to, kar delajo najhitreje rastoči podjetniki v Sloveniji.

Dan 3 — AI agenti. V živo pred tabo zgradim AI agenta od začetka. Plus — žrebanje za avto.

[Pici govori v kamero]

To ni webinar, kjer ti prodajam sanje. To je živ workshop, kjer delaš skupaj z mano. Replay? 24 ur in potem ga ni več. Zato bodi tam v živo.`,
      },
      {
        title: "AUTHORITY — 3:10–3:25",
        content: `[Tekst na ekranu: "200M+ ogledov | 155,000+ sledilcev | 1,000+ študentov"]

To ni teorija. To izhaja iz 200 milijonov ogledov, 155,000+ sledilcev in dela z več kot 1,000 študenti. Vem, kaj deluje, ker to počnem vsak dan.`,
      },
      {
        title: "BONUSES — 3:25–3:45",
        content: `[Grafika: prompt pack + nagrade]

Ob prijavi dobiš brezplačen AI prompt pack — takoj uporaben, ne neke generične bedarije.

Plus — nagradna igra za vse prijavljene: avto, 3x MacBook Pro, iPhone.

[Tekst na ekranu: avto + MacBook + iPhone grafika]

Ampak samo, če se prijaviš. Samo, če narediš ta korak.`,
      },
      {
        title: "URGENCY — 3:45–4:15",
        content: `[Pici govori v kamero, direkten pogled]

Poglej. Čez 35 dni boš na enem od dveh mest. Ali boš sedel na AI Universi, z znanjem in orodji, da začneš graditi — ali boš še vedno scrollal telefon in se spraševal "kaj pa če".

Jaz ne morem te odločitve sprejeti namesto tebe. Ampak ti lahko povem, da vsaka oseba, ki jo vidiš na teh screenshotih, je bila točno tam, kjer si ti zdaj. In se je odločila.

Mesta so omejena. Ko je polno, je polno.`,
      },
      {
        title: "CTA — 4:15–4:35",
        content: `[Tekst na ekranu: "aiuniversa.si — REZERVIRAJ BREZPLAČNO MESTO"]

Klikni spodaj. Prijavi se brezplačno. Dobiš prompt pack, udeležiš se žrebanja za avto, in za tri dni ti pokažem, kako AI spremeniš v svoj dohodek.

[Pici pogleda v kamero]

Ne čakaj. Klikni zdaj. Vidimo se 15. aprila.`,
      },
    ],
  },
  {
    id: "system",
    tab: "The System",
    duration: "~4:30",
    audience: "Analitični tipi (hoče razumeti KAKO)",
    platform: "Google oglase, email sezname, YouTube predvajanje",
    tone: "Logičen, strukturiran, jasen korak-po-korak",
    sections: [
      {
        title: "HOOK — 0:00–0:15",
        content: `[Pici govori v kamero, miren ton, samozavesten]

Zgradil sem sistem, ki navadnim Slovencem omogoča, da zaslužijo z AI — brez predhodnega znanja, brez ekipe, brez da pokažejo obraz. In zdaj ti bom ta sistem v treh dneh pokazal v živo — brezplačno.

Ostani do konca, da ti razložim, kako.`,
      },
      {
        title: "THE OPPORTUNITY — 0:15–1:00",
        content: `[B-roll: AI orodja v akciji, grafi rasti, Pici dela na računalniku]

AI je ustvaril tri povsem nove načine zaslužka, ki pred letom dni sploh niso obstajali.

[Tekst na ekranu: "1. AI Influencer | 2. AI Agencija | 3. AI Agenti"]

Prvič — lahko ustvariš vsebine in zgradiš občinstvo brez da pokažeš obraz. AI naredi vse — od skript do vizualov.

Drugič — lahko ponujaš AI storitve podjetjem in zaslužiš kot agencija. Brez ekipe. Brez pisarne. Sam.

Tretjič — lahko zgradiš AI agente, ki delajo namesto tebe. Avtomatizacija, ki ti prinaša denar, medtem ko spiš.

[Pici govori v kamero]

Večina ljudi ve, da je AI priložnost. Nihče pa jim ne pokaže, KAKO. Točno to bom naredil — v treh dneh, v živo, brezplačno.`,
      },
      {
        title: "THE EVENT — 1:00–2:15",
        content: `[Tekst na ekranu: "AI UNIVERSA — 3-dnevni workshop V ŽIVO"]

Event se imenuje AI Universa. 3-dnevni brezplačni workshop v živo na YouTubu. 15., 16. in 17. april, ob 19:00 CEST.

[Grafika: strukturiran prikaz treh dni]

Dan 1: AI Influencer Workflows
Pokazal ti bom celoten sistem — kako najti nišo, kako AI ustvari vsebine, kako zgradiš občinstvo in monetiziraš. Brez da se pojaviš pred kamero. Točno to je naredil Luka — 22-letni študent iz Maribora, ki je v 6 tednih dobil 12,300 sledilcev in €1,840 na mesec.

[Na ekranu: Lukovi rezultati]

Dan 2: AI Agency Workflows
Kako začneš ponujati AI storitve podjetjem — danes. Brez izkušenj, brez ekipe, brez pisarne. Matej Zupan je poleg redne službe zaslužil €4,750 v dveh mesecih s tem modelom.

[Na ekranu: Matejevi rezultati]

Dan 3: AI Agenti & Claw Bot — V ŽIVO
Pred tabo bom v živo zgradil AI agenta. Od začetka do konca. Plus — žrebanje za avto med vsemi prijavljenimi.

[Pici govori v kamero]

Vsak dan je zasnovan tako, da ti da specifično znanje IN akcijski načrt. To ni predavanje. To je delavnica. Prideš, narediš, odneseš.`,
      },
      {
        title: "PROOF STACK — 2:15–3:05",
        content: `[Na ekranu: montaža vseh testimonialov]

In ta sistem že deluje. Poglej rezultate:

[Tekst na ekranu: rezultati enega za drugim]

Ana Horvat, mama dveh otrok — od €780 do €2,100/mesec v treh mesecih.
Nina Krajnc, 20-letna študentka — 23,000+ sledilcev, sponzorske pogodbe.
Gregor Vidmar, 41 let, brezposeln — od €0 do €2,300/mesec v 3 mesecih.
Tina Novak, podjetnica — 15 ur prihranka na teden + €1,600 pasivno.

[Pici govori v kamero]

Skupaj so moji študentje zaslužili več kot €41,000. In nobeden od njih ni imel predhodnih izkušenj z AI, ko je začel.`,
      },
      {
        title: "AUTHORITY — 3:05–3:20",
        content: `[Tekst na ekranu: "200M+ ogledov | 155,000+ sledilcev | 1,000+ študentov"]

To ni moj prvi rodeo. 200 milijonov ogledov. 155,000+ sledilcev. Več kot 1,000 študentov. AI ni moj hobi — je moj posel. In ta sistem sem gradil mesece, da ga zdaj lahko deliš z mano — brezplačno.`,
      },
      {
        title: "BONUSES — 3:20–3:40",
        content: `[Grafika: prompt pack + nagradna igra]

Vsak, ki se prijavi, takoj dobi brezplačen AI prompt pack — to so točno tisti prompti, ki jih jaz uporabljam vsak dan.

Plus — med prijavljenimi žrebam: avto, 3x MacBook Pro in iPhone.

[Tekst na ekranu: lista nagrad]

Prijava je brezplačna. Prompt pack je brezplačen. In imaš še šanso za avto. Zakaj ne bi kliknil?`,
      },
      {
        title: "URGENCY — 3:40–4:10",
        content: `[Pici govori v kamero]

Poglejmo realno. Naslednji 35 dni bo minilo. Ali boš čez 35 dni vedel, kako zaslužiti z AI — ali boš še vedno razmišljal o tem?

Workshop je v živo. Replay je na voljo 24 ur — potem ga ni več. Mesta so omejena. To ni stvar, ki bo "vedno tam." To je enkratna priložnost, da v treh dneh dobiš celoten sistem.

[Tekst na ekranu: "15.–17. april 2026 | 19:00 CEST"]`,
      },
      {
        title: "CTA — 4:10–4:30",
        content: `[Tekst na ekranu: "aiuniversa.si — BREZPLAČNO MESTO"]

Klikni spodaj. Vpišeš se v 10 sekundah. Dobiš prompt pack, možnost za avto, in tri dni, ki ti lahko spremenijo, kako zaslužiš.

[Pici pogleda v kamero, nasmeh]

Sistem deluje. Vidimo se 15. aprila. Klikni zdaj.`,
      },
    ],
  },
];

const studentWins: StudentWin[] = [
  { name: "Luka Kovač", age: 22, city: "Maribor", result: "12,300 sledilcev, €1,840/mesec" },
  { name: "Ana Horvat", age: 34, city: "Ljubljana", result: "€780 → €2,100/mesec" },
  { name: "Matej Zupan", age: 28, city: "Celje", result: "€4,750 v 2 mesecih" },
  { name: "Nina Krajnc", age: 20, city: "Koper", result: "23,000+ sledilcev" },
  { name: "Gregor Vidmar", age: 41, city: "Novo mesto", result: "€0 → €2,300/mesec" },
  { name: "Tina Novak", age: 31, city: "Kranj", result: "15 ur/teden + €1,600/mesec" },
];

/* ─── HELPERS ─── */

function formatScriptLine(text: string) {
  // Split into lines and render stage directions differently
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height: 12 }} />;

    // Stage directions: [like this]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return (
        <div key={i} style={{
          fontStyle: "italic",
          color: "#6B7280",
          fontSize: "0.8125rem",
          padding: "2px 0",
          lineHeight: 1.6,
        }}>
          {trimmed}
        </div>
      );
    }

    // Check for inline stage directions
    const parts = trimmed.split(/(\[[^\]]+\])/g);
    const hasDirection = parts.length > 1;

    if (hasDirection) {
      return (
        <div key={i} style={{ lineHeight: 1.7, padding: "1px 0" }}>
          {parts.map((part, j) => {
            if (part.startsWith("[") && part.endsWith("]")) {
              return (
                <span key={j} style={{ fontStyle: "italic", color: "#6B7280", fontSize: "0.8125rem" }}>
                  {part}
                </span>
              );
            }
            return <span key={j} style={{ color: "#E0E0E5" }}>{part}</span>;
          })}
        </div>
      );
    }

    // Bold lines (Dan 1, Dan 2, etc.)
    if (trimmed.startsWith("Dan ") || trimmed.startsWith("**")) {
      const cleaned = trimmed.replace(/\*\*/g, "");
      return (
        <div key={i} style={{
          fontWeight: 600,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1.7,
          padding: "2px 0",
        }}>
          {cleaned}
        </div>
      );
    }

    // Regular text
    return (
      <div key={i} style={{ color: "#E0E0E5", lineHeight: 1.7, padding: "1px 0" }}>
        {trimmed}
      </div>
    );
  });
}

/* ─── COMPONENTS ─── */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: "1.125rem",
      fontWeight: 600,
      color: "rgba(255,255,255,0.92)",
      marginBottom: 16,
      letterSpacing: "-0.01em",
    }}>
      {children}
    </h2>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#1A1D23",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: "24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; color: string; label: string }> = {
    "not-started": { bg: "rgba(255,255,255,0.04)", color: "#6B7280", label: "Not Started" },
    "in-progress": { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", label: "In Progress" },
    "done": { bg: "rgba(16,185,129,0.12)", color: "#10B981", label: "Done" },
  };
  const c = configs[status] || configs["not-started"];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      borderRadius: 9999,
      fontSize: "0.6875rem",
      fontWeight: 500,
      background: c.bg,
      color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />
      {c.label}
    </span>
  );
}

function DeployButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 8,
        border: "1px solid #00D4AA",
        background: "transparent",
        color: "#00D4AA",
        fontSize: "0.8125rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0,212,170,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </button>
  );
}

function VSLSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const script = vslScripts[activeTab];

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const copyFullScript = () => {
    const text = script.sections.map((s) => `### ${s.title}\n\n${s.content}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <SectionHeader>📝 VSL Scripts</SectionHeader>
      <Card>
        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          background: "rgba(255,255,255,0.03)",
          borderRadius: 8,
          padding: 4,
        }}>
          {vslScripts.map((v, i) => (
            <button
              key={v.id}
              onClick={() => { setActiveTab(i); setCollapsed({}); }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: "0.8125rem",
                fontWeight: i === activeTab ? 600 : 400,
                color: i === activeTab ? "rgba(255,255,255,0.92)" : "#6B7280",
                background: i === activeTab ? "rgba(0,212,170,0.15)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {v.tab}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          padding: "14px 16px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 8,
          marginBottom: 20,
          alignItems: "center",
        }}>
          <div>
            <span style={{ fontSize: "0.6875rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Duration</span>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: "rgba(255,255,255,0.92)", marginTop: 2 }}>{script.duration}</div>
          </div>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
          <div>
            <span style={{ fontSize: "0.6875rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Target Audience</span>
            <div style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginTop: 2 }}>{script.audience}</div>
          </div>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
          <div>
            <span style={{ fontSize: "0.6875rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Best Platform</span>
            <div style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginTop: 2 }}>{script.platform}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={copyFullScript}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.1)",
                background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                color: copied ? "#10B981" : "#9CA3AF",
                fontSize: "0.75rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {copied ? "✓ Copied" : "📋 Copy Script"}
            </button>
          </div>
        </div>

        {/* Script sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {script.sections.map((section) => {
            const isCollapsed = collapsed[section.title] === true;
            // Default: expanded
            return (
              <div key={section.title} style={{
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                overflow: "hidden",
              }}>
                <button
                  onClick={() => toggleSection(section.title)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.92)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    color: "#6B7280",
                    fontSize: "0.75rem",
                    transition: "transform 0.15s",
                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    display: "inline-block",
                  }}>
                    ▼
                  </span>
                  {section.title}
                </button>
                {!isCollapsed && (
                  <div style={{
                    padding: "12px 16px 16px 36px",
                    fontSize: "0.875rem",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {formatScriptLine(section.content)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function YouTubeTrailerSection() {
  return (
    <div>
      <SectionHeader>🎬 YouTube Trailer</SectionHeader>
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 8 }}>
              Pre-Event Hype Video
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <StatusBadge status="not-started" />
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>·</span>
              <span style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>60–90 seconds</span>
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>·</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.8125rem",
                color: "#F59E0B",
              }}>
                Release: Mar 25, 2026
              </span>
            </div>
          </div>
          <DeployButton
            label="⚡ Generate Script"
            onClick={() => alert("This would generate a 60-90 second trailer script using AI, covering:\n\n• Fast-cut montage of AI tools in action\n• Student result highlights (Luka, Ana, Matej)\n• Event dates & what they'll learn each day\n• Sweepstakes teaser (avto + MacBooks)\n• CTA: aiuniversa.si\n\nTarget: YouTube + Instagram Reels pre-roll")}
          />
        </div>
        <div style={{
          padding: "16px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Brief / Notes
          </div>
          <div style={{ fontSize: "0.8125rem", color: "#9CA3AF", lineHeight: 1.7 }}>
            3-week pre-event hype video designed to build anticipation. Fast-paced editing with AI tool demos, student results flashing on screen, event countdown, and sweepstakes reveal. Should feel energetic, modern, and slightly cinematic. Launches same day as paid ads (Mar 25) to maximize initial momentum. Will be pinned on YouTube channel and used as ad creative.
          </div>
        </div>
      </Card>
    </div>
  );
}

function StudentWinsSection() {
  return (
    <div>
      <SectionHeader>🏆 Student Wins Compilation</SectionHeader>
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 8 }}>
              Student Success Stories
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <StatusBadge status="not-started" />
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>·</span>
              <span style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>Social proof compilation</span>
            </div>
          </div>
          <DeployButton
            label="⚡ Generate Script"
            onClick={() => alert("This would generate a student wins compilation script covering all 6 students:\n\n• Individual story arcs (before → after)\n• Screen recordings of results\n• Voiceover connecting their journeys\n• Emotional hooks for each story\n• CTA tying back to AI Universa event\n\nFormat: 3-5 min video for YouTube + cut-downs for Reels/TikTok")}
          />
        </div>

        {/* Student grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {studentWins.map((student) => (
            <div key={student.name} style={{
              padding: "16px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(0,212,170,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#00D4AA",
                  flexShrink: 0,
                }}>
                  {student.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                    {student.age} let, {student.city}
                  </div>
                </div>
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.8125rem",
                color: "#10B981",
                fontWeight: 500,
              }}>
                {student.result}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WinnersInterviewSection() {
  return (
    <div>
      <SectionHeader>🎤 Winners Interview</SectionHeader>
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 8 }}>
              Post-Event Winner Interviews
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <StatusBadge status="not-started" />
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>·</span>
              <span style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>Post-event content</span>
            </div>
          </div>
          <DeployButton
            label="⚡ Generate Interview Questions"
            onClick={() => alert("This would generate a set of interview questions for top students, including:\n\n• Background & starting point questions\n• \"What changed\" moment\n• Specific results & timeline\n• Day-in-the-life workflow\n• Advice for beginners\n• Emotional transformation story\n\nFormat: Both short-form (60s Reels) and long-form (10-15 min YouTube) versions")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div style={{
            padding: "16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
          }}>
            <div style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
              Short-Form
            </div>
            <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.92)", marginBottom: 4 }}>
              IG Reels / TikTok
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#9CA3AF", lineHeight: 1.6 }}>
              60-second highlight clips per student. Hook → transformation → result → CTA. Vertical format, subtitled, fast cuts.
            </div>
          </div>
          <div style={{
            padding: "16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
          }}>
            <div style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
              Long-Form
            </div>
            <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.92)", marginBottom: 4 }}>
              YouTube
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#9CA3AF", lineHeight: 1.6 }}>
              10-15 min in-depth interviews. Sit-down format, screen shares of results, full story arc. Used for retargeting & evergreen content.
            </div>
          </div>
        </div>

        <div style={{
          padding: "14px 16px",
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 8,
          marginTop: 16,
          fontSize: "0.8125rem",
          color: "#F59E0B",
        }}>
          📋 Interviews scheduled post-event (after Apr 17). Top performers from sweepstakes and course enrollees will be contacted for filming.
        </div>
      </Card>
    </div>
  );
}

/* ─── PAGE ─── */

export default function ContentHubPage() {
  return (
    <div className="max-w-5xl mx-auto" style={{ paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}>
          <span style={{ color: "rgba(255,255,255,0.92)" }}>Content</span>{" "}
          <span style={{ color: "#6B7280" }}>Hub</span>
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: 4 }}>
          Content hub · VSL scripts, trailer, student wins, interviews
        </p>
      </div>

      {/* Content overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 32 }}>
        {[
          { label: "VSL Scripts", value: "3", color: "#00D4AA" },
          { label: "Videos", value: "3", color: "#F59E0B" },
          { label: "Ready", value: "0", color: "#10B981" },
          { label: "Not Started", value: "6", color: "#6B7280" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#1A1D23",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "16px 20px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: stat.color,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 4, fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Landing Page Preview */}
      <div style={{
        background: "#1A1D23",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 32,
      }}>
        <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>🌐 Landing Page Preview</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>Pre-Event LP · aiuniversa.si</div>
          </div>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 10px",
            borderRadius: 9999,
            fontSize: "0.6875rem",
            fontWeight: 500,
            background: "rgba(16,185,129,0.12)",
            color: "#10B981",
          }}>
            🟢 Live
          </span>
        </div>
        <div style={{
          width: "100%",
          height: 220,
          overflow: "hidden",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#0D0F14",
          position: "relative",
        }}>
          <iframe
            src="/lp/ai-universa"
            style={{
              width: "1440px",
              height: "900px",
              transform: "scale(0.22)",
              transformOrigin: "top left",
              border: "none",
              pointerEvents: "none",
            }}
            title="Pre-Event Landing Page Preview"
          />
        </div>
        <div style={{ padding: "12px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href="/lp/ai-universa"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(0,212,170,0.12)",
                border: "1px solid rgba(0,212,170,0.25)",
                color: "#00D4AA",
                fontSize: "0.75rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Open LP →
            </a>
            <a
              href="/ai-universa-v3.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#9CA3AF",
                fontSize: "0.75rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Standalone HTML →
            </a>
          </div>
          <a
            href="/dashboard/ai-universa"
            style={{
              fontSize: "0.75rem",
              color: "#00D4AA",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View in Dashboard →
          </a>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <VSLSection />
        <YouTubeTrailerSection />
        <StudentWinsSection />
        <WinnersInterviewSection />
      </div>
    </div>
  );
}
