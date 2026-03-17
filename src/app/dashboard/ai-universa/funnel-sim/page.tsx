"use client";

import { useMemo, useState } from "react";

interface StageConfig {
  id: "pre" | "event" | "cart";
  title: string;
  summary: string;
  notes: string;
  emailRefs: string[];
  whatsappRefs: string[];
  base: {
    organicReach: number;
    organicCTR: number;
    adsReach: number;
    adsCTR: number;
    listSize: number;
    emailCTR: number;
    siteConv: number;
    showRate: number;
    buyRate: number;
  };
}

const STAGES: StageConfig[] = [
  {
    id: "pre",
    title: "Pre-Event Warm-up",
    summary: "3–5 days before Day 1: organic reels go live, early ads warm cold audiences, and email list wakes up.",
    notes: "Goal: pack the WhatsApp group + remind inactive subscribers why the workshop matters.",
    emailRefs: ["Warm-Up 1", "Warm-Up 2", "Prompt Pack Drop"],
    whatsappRefs: ["WA-01", "WA-02", "WA-03", "WA-04"],
    base: {
      organicReach: 5200,
      organicCTR: 0.17,
      adsReach: 3000,
      adsCTR: 0.23,
      listSize: 2600,
      emailCTR: 0.28,
      siteConv: 0.38,
      showRate: 0.62,
      buyRate: 0.08,
    },
  },
  {
    id: "event",
    title: "Live Event Days (15–17 Apr)",
    summary: "Daily reminders (email + WhatsApp) drive live attendance. Paid retargeting scoops replay viewers.",
    notes: "Goal: maximize show-up rate and keep energy high with fast replies.",
    emailRefs: ["Day 1 Reminder", "Day 2 Replay", "Day 3 VIP Invite"],
    whatsappRefs: ["WA-05", "WA-06", "WA-07", "WA-08", "WA-09", "WA-10"],
    base: {
      organicReach: 4100,
      organicCTR: 0.22,
      adsReach: 2500,
      adsCTR: 0.27,
      listSize: 2200,
      emailCTR: 0.36,
      siteConv: 0.46,
      showRate: 0.74,
      buyRate: 0.11,
    },
  },
  {
    id: "cart",
    title: "Cart Open (17–21 Apr)",
    summary: "Sales window: retargeting + urgency email sequence + WhatsApp objection handling.",
    notes: "Goal: convert warm leads to buyers and keep churn low with VIP upsells.",
    emailRefs: ["Cart Open", "48h Warning", "Final Hours"],
    whatsappRefs: ["WA-11", "WA-12", "WA-13", "WA-14"],
    base: {
      organicReach: 3200,
      organicCTR: 0.15,
      adsReach: 4200,
      adsCTR: 0.30,
      listSize: 2600,
      emailCTR: 0.41,
      siteConv: 0.62,
      showRate: 0.88,
      buyRate: 0.17,
    },
  },
];

const CHANNELS = [
  { key: "organic", label: "Organic Content", description: "IG/TikTok reels + long-form previews" },
  { key: "ads", label: "Paid Ads", description: "Meta + YT warm & retargeting" },
  { key: "email", label: "Email List", description: "Existing subscribers" },
  { key: "whatsapp", label: "WhatsApp", description: "Automations + live replies" },
] as const;

const FLOW_COLUMNS = ["Week -1 (Pre-event)", "Week 0 (Live days)", "Week +1 (Cart open)"];
const FLOW_GRID = [
  {
    label: "Traffic + UTMs",
    cells: [
      "Organic reels + carousels pushing utm_source=ig-organic / utm_content=reel-hook",
      "Live recaps + behind-the-scenes posts w/ utm_content=live-recap",
      "Win posts + FOMO clips utm_content=cart-social",
    ],
  },
  {
    label: "Paid Ads",
    cells: [
      "5 video hooks + 2 image carousels → pre-event LP (utm_medium=meta-ads, utm_campaign=warmup)",
      "Retargeting to replay landing page (utm_campaign=event-replay)",
      "Urgency retargeting + VIP upsell (utm_campaign=cart-close)",
    ],
  },
  {
    label: "Email – existing list",
    cells: [
      "Re-engage cold subscribers w/ Warm-Up 1 & 2",
      "Daily reminders + replay drops",
      "Cart Open → 48h → Final Hours sequence",
    ],
  },
  {
    label: "Email – new visitors",
    cells: [
      "Fast nurture triggered from pre-event LP (3-part welcome)",
      "Live-day behavior tagging (attended vs missed)",
      "Conversion drips referencing their activity",
    ],
  },
  {
    label: "WhatsApp",
    cells: [
      "WA-01→04 onboarding, workbook tease",
      "WA-05→10 live reminders + Day 1 workbook automation",
      "WA-11→14 objection handling + countdown",
    ],
  },
  {
    label: "Automation / Assets",
    cells: [
      "Workbook asset staged, automation toggle armed for Day 1",
      "Auto-send workbook when keyword hits (15 Apr) + live agent queue",
      "Buyers tagged, VIP upgrade workflow + testimonial harvesting",
    ],
  },
];

const UTM_KEY = [
  "utm_source=ig-organic",
  "utm_source=yt-organic",
  "utm_medium=meta-ads",
  "utm_medium=yt-ads",
  "utm_campaign=warmup",
  "utm_campaign=event-replay",
  "utm_campaign=cart-close",
];

type ChannelKey = typeof CHANNELS[number]["key"];

export default function FunnelSimulationPage() {
  const [stageId, setStageId] = useState<StageConfig["id"]>("pre");
  const [multipliers, setMultipliers] = useState<Record<ChannelKey, number>>({
    organic: 1,
    ads: 1,
    email: 1,
    whatsapp: 1,
  });

  const stage = STAGES.find((s) => s.id === stageId)!;

  const metrics = useMemo(() => {
    const organicRegs = stage.base.organicReach * stage.base.organicCTR * multipliers.organic * stage.base.siteConv;
    const adsRegs = stage.base.adsReach * stage.base.adsCTR * multipliers.ads * stage.base.siteConv;
    const emailRegs = stage.base.listSize * stage.base.emailCTR * multipliers.email * stage.base.siteConv;
    const whatsappBoost = 1 + (multipliers.whatsapp - 1) * 0.6;

    const totalRegs = (organicRegs + adsRegs + emailRegs) * whatsappBoost;
    const attendees = totalRegs * stage.base.showRate;
    const buyers = attendees * stage.base.buyRate;

    return {
      registrations: Math.round(totalRegs),
      attendees: Math.round(attendees),
      buyers: Math.round(buyers),
    };
  }, [stage, multipliers]);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">AI Universa · Funnel Simulation</h1>
        <p className="text-sm text-slate-400 mt-2">Model the full journey from organic reach → email/WhatsApp sequences → buyers. Dial each channel to stress-test the plan you built in Mission Control.</p>
      </div>

      {/* Stage selector */}
      <div className="flex flex-wrap gap-3">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStageId(s.id)}
            className={`px-4 py-2 rounded-2xl border text-sm font-medium transition-all ${stageId === s.id ? "border-[#7C5CFC] bg-[#7C5CFC1A] text-white" : "border-white/10 text-slate-400"}`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Stage summary */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-teal-300">Scenario</p>
          <p className="text-lg text-white font-semibold mt-1">{stage.title}</p>
          <p className="text-sm text-slate-400 mt-2">{stage.summary}</p>
        </div>
        <p className="text-xs text-slate-500">{stage.notes}</p>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-black/40 rounded-2xl border border-white/5 p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Projected registrations</p>
            <p className="text-3xl font-bold text-white mt-2">{metrics.registrations.toLocaleString()}</p>
          </div>
          <div className="bg-black/40 rounded-2xl border border-white/5 p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Live attendees</p>
            <p className="text-3xl font-bold text-white mt-2">{metrics.attendees.toLocaleString()}</p>
          </div>
          <div className="bg-black/40 rounded-2xl border border-white/5 p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Buyers</p>
            <p className="text-3xl font-bold text-[#4ECDC4] mt-2">{metrics.buyers.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Controls + channels */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
          <p className="text-sm text-slate-300 font-semibold">Channel multipliers</p>
          {CHANNELS.map((channel) => (
            <div key={channel.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{channel.label}</span>
                <span>{multipliers[channel.key].toFixed(2)}×</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={multipliers[channel.key]}
                onChange={(e) => setMultipliers((prev) => ({ ...prev, [channel.key]: Number(e.target.value) }))}
                className="w-full"
              />
              <p className="text-[11px] text-slate-500">{channel.description}</p>
            </div>
          ))}
          <button
            onClick={() => setMultipliers({ organic: 1, ads: 1, email: 1, whatsapp: 1 })}
            className="mt-3 text-xs text-slate-400 hover:text-white"
          >
            Reset multipliers
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
          <p className="text-sm text-slate-300 font-semibold">Sequences in play</p>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-500">Email</p>
            <ul className="text-sm text-slate-300 mt-1 space-y-1">
              {stage.emailRefs.map((item) => (
                <li key={item}>✉️ {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-500">WhatsApp</p>
            <ul className="text-sm text-slate-300 mt-1 space-y-1">
              {stage.whatsappRefs.map((item) => (
                <li key={item}>💬 {item}</li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 mt-2">IDs reference the WhatsApp Sequence board inside Mission Control.</p>
          </div>
        </div>
      </div>

      {/* Journey board */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-sm text-slate-300 font-semibold mb-4">Journey view</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { label: "Traffic", points: ["Organic hooks", "Paid ads", "Referrals"] },
            { label: "Trust", points: ["Email storytelling", "WhatsApp voice notes", "Live Q&A"] },
            { label: "Decision", points: ["Cart page", "Objection macros", "VIP bonus"] },
          ].map((column) => (
            <div key={column.label} className="border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">{column.label}</p>
              <ul className="space-y-2 text-slate-200">
                {column.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <span className="text-[#4ECDC4] text-lg">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Visual flow */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <p className="text-sm text-slate-300 font-semibold">Visual timeline</p>
        <div className="overflow-auto">
          <table className="min-w-full text-sm border border-white/10">
            <thead>
              <tr>
                <th className="text-left text-xs uppercase tracking-[0.35em] text-slate-500 px-4 py-3 border-b border-white/10">Channel</th>
                {FLOW_COLUMNS.map((col) => (
                  <th key={col} className="text-left text-xs uppercase tracking-[0.35em] text-slate-500 px-4 py-3 border-b border-white/10">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLOW_GRID.map((row) => (
                <tr key={row.label} className="border-b border-white/5">
                  <td className="px-4 py-3 text-slate-200 font-semibold">{row.label}</td>
                  {row.cells.map((cell, idx) => (
                    <td key={idx} className="px-4 py-3 text-slate-300 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-slate-500">UTM key: {UTM_KEY.map((utm) => (
          <span key={utm} className="inline-flex items-center gap-1 bg-black/30 border border-white/5 rounded-full px-2 py-1 mr-2 mt-2">{utm}</span>
        ))}</div>
      </div>
    </div>
  );
}
