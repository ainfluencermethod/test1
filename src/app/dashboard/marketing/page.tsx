"use client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const TODAY_INDEX = (() => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
})();

type StatusTone = "green" | "yellow" | "gray" | "red";
type CalendarState = "posted" | "scheduled" | "notYet";

type PlatformOverview = {
  name: string;
  icon: string;
  accounts: number;
  dailyTarget: string;
  managedRatio: string;
  health: string;
  healthTone: StatusTone;
  accent: string;
  accentSoft: string;
};

type Account = {
  id: string;
  name: string;
  platform: "Instagram" | "Twitter/X" | "Reddit" | "YouTube" | "Email";
  icon: string;
  manager: string;
  managementType: string;
  status: string;
  statusTone: StatusTone;
  postsToday: string;
  postsWeek: string;
  targetToday: number;
  targetWeek: number;
  lastPosted: string;
  scheduleLabel: string;
  goal?: string;
  calendar: CalendarState[];
  accent: string;
};

const summaryStats = [
  { label: "Total accounts", value: "12", detail: "All channels in one view" },
  { label: "Daily posts target", value: "19+", detail: "16 IG + X + Reddit" },
  { label: "Weekly YouTube", value: "1–2", detail: "Videos per week" },
  { label: "Automated emails", value: "8", detail: "Published nurture sequence" },
  { label: "AI-managed", value: "3", detail: "Reddit, X, YouTube" },
  { label: "Human-managed", value: "8", detail: "Instagram accounts" },
];

const channelOverview: PlatformOverview[] = [
  {
    name: "Instagram",
    icon: "📸",
    accounts: 8,
    dailyTarget: "16 posts/day",
    managedRatio: "0 AI / 8 Human",
    health: "🟢 Active",
    healthTone: "green",
    accent: "linear-gradient(135deg, #F56040 0%, #E1306C 50%, #833AB4 100%)",
    accentSoft: "rgba(225, 48, 108, 0.16)",
  },
  {
    name: "Twitter/X",
    icon: "🐦",
    accounts: 1,
    dailyTarget: "2–3 tweets/day",
    managedRatio: "1 AI / 0 Human",
    health: "🟢 Active",
    healthTone: "green",
    accent: "#1D9BF0",
    accentSoft: "rgba(29, 155, 240, 0.16)",
  },
  {
    name: "Reddit",
    icon: "👽",
    accounts: 1,
    dailyTarget: "3 comments/day",
    managedRatio: "1 AI / 0 Human",
    health: "🟡 Warming up",
    healthTone: "yellow",
    accent: "#FF4500",
    accentSoft: "rgba(255, 69, 0, 0.16)",
  },
  {
    name: "YouTube",
    icon: "▶️",
    accounts: 1,
    dailyTarget: "1–2 videos/week",
    managedRatio: "1 AI / 0 Human",
    health: "🟢 Active",
    healthTone: "green",
    accent: "#FF0033",
    accentSoft: "rgba(255, 0, 51, 0.16)",
  },
  {
    name: "Email",
    icon: "✉️",
    accounts: 1,
    dailyTarget: "8-email nurture",
    managedRatio: "Automated",
    health: "🟢 Published",
    healthTone: "green",
    accent: "#14B8A6",
    accentSoft: "rgba(20, 184, 166, 0.16)",
  },
];

const dayPattern: CalendarState[] = [
  "posted",
  "scheduled",
  "scheduled",
  "scheduled",
  "notYet",
  "notYet",
  "notYet",
];

const accounts: Account[] = [
  {
    id: "reddit-xavier",
    name: "Xavier Blanc",
    platform: "Reddit",
    icon: "👽",
    manager: "🤖 Jarvis",
    managementType: "AI-managed warm-up bot",
    status: "Warming up · Day 1 of 7",
    statusTone: "yellow",
    postsToday: "1/3",
    postsWeek: "1/21",
    targetToday: 3,
    targetWeek: 21,
    lastPosted: "Today · 9:14 AM",
    scheduleLabel: "Daily · 3 comments/day",
    goal: "Build karma → start AIB promotion after Day 7",
    calendar: ["posted", "scheduled", "scheduled", "scheduled", "scheduled", "notYet", "notYet"],
    accent: "#FF4500",
  },
  {
    id: "x-giulia",
    name: "Giulia Banks",
    platform: "Twitter/X",
    icon: "🐦",
    manager: "🤖 Jarvis",
    managementType: "AI-managed content + replies",
    status: "New account",
    statusTone: "green",
    postsToday: "2/3",
    postsWeek: "8/21",
    targetToday: 3,
    targetWeek: 21,
    lastPosted: "Today · 1:42 PM",
    scheduleLabel: "Daily · 2–3 tweets + replies",
    goal: "Build AI influencer brand presence, drive traffic to AIB",
    calendar: ["posted", "posted", "scheduled", "scheduled", "scheduled", "notYet", "notYet"],
    accent: "#1D9BF0",
  },
  {
    id: "ig-mia",
    name: "Mia Bannet",
    platform: "Instagram",
    icon: "📸",
    manager: "Mia",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "1/2",
    postsWeek: "8/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Today · 8:23 AM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: dayPattern,
    accent: "#E1306C",
  },
  {
    id: "ig-xavier",
    name: "Xavier Blanc",
    platform: "Instagram",
    icon: "📸",
    manager: "Xavier",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "1/2",
    postsWeek: "9/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Today · 8:36 AM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: ["posted", "posted", "scheduled", "scheduled", "scheduled", "notYet", "notYet"],
    accent: "#C13584",
  },
  {
    id: "ig-celine",
    name: "Celine",
    platform: "Instagram",
    icon: "📸",
    manager: "Celine",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "2/2",
    postsWeek: "10/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Today · 1:08 PM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: ["posted", "posted", "posted", "scheduled", "scheduled", "notYet", "notYet"],
    accent: "#F56040",
  },
  {
    id: "ig-azzuro",
    name: "Azzuro",
    platform: "Instagram",
    icon: "📸",
    manager: "Azzuro",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "1/2",
    postsWeek: "7/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Today · 8:51 AM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: dayPattern,
    accent: "#833AB4",
  },
  {
    id: "ig-giulia",
    name: "Giulia Banks",
    platform: "Instagram",
    icon: "📸",
    manager: "Giulia",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "1/2",
    postsWeek: "8/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Today · 9:05 AM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: ["posted", "scheduled", "scheduled", "scheduled", "scheduled", "notYet", "notYet"],
    accent: "#E1306C",
  },
  {
    id: "ig-motion",
    name: "Motion does AI",
    platform: "Instagram",
    icon: "📸",
    manager: "Motion team",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "0/2",
    postsWeek: "6/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Yesterday · 6:41 PM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: ["posted", "scheduled", "scheduled", "notYet", "notYet", "notYet", "notYet"],
    accent: "#D946EF",
  },
  {
    id: "ig-ziva",
    name: "Podcast Ziva",
    platform: "Instagram",
    icon: "📸",
    manager: "Ziva",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "1/2",
    postsWeek: "7/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Today · 8:12 AM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: dayPattern,
    accent: "#FB7185",
  },
  {
    id: "ig-johnwick",
    name: "John Wick Acc 2",
    platform: "Instagram",
    icon: "📸",
    manager: "John Wick team",
    managementType: "Human managed",
    status: "Active",
    statusTone: "green",
    postsToday: "1/2",
    postsWeek: "8/14",
    targetToday: 2,
    targetWeek: 14,
    lastPosted: "Today · 8:44 AM",
    scheduleLabel: "Daily · 2 posts/day",
    calendar: ["posted", "posted", "scheduled", "scheduled", "notYet", "notYet", "notYet"],
    accent: "#A855F7",
  },
  {
    id: "youtube-giulia",
    name: "Giulia Banks",
    platform: "YouTube",
    icon: "▶️",
    manager: "🤖 Neura agent",
    managementType: "AI-managed",
    status: "Active",
    statusTone: "green",
    postsToday: "0/1",
    postsWeek: "1/2",
    targetToday: 1,
    targetWeek: 2,
    lastPosted: "Wed · 4:30 PM",
    scheduleLabel: "Weekly · 1–2 videos/week",
    calendar: ["notYet", "scheduled", "posted", "scheduled", "posted", "notYet", "notYet"],
    accent: "#FF0033",
  },
  {
    id: "email-nurture",
    name: "Freebie Nurture",
    platform: "Email",
    icon: "✉️",
    manager: "GHL Automation",
    managementType: "Automated",
    status: "Published ✅",
    statusTone: "green",
    postsToday: "8/8",
    postsWeek: "8/8",
    targetToday: 8,
    targetWeek: 8,
    lastPosted: "Auto sequence live",
    scheduleLabel: "8 emails over 7 days",
    calendar: ["posted", "posted", "posted", "posted", "posted", "posted", "posted"],
    accent: "#14B8A6",
  },
];

const scheduleBlocks = [
  {
    title: "Morning",
    time: "8–10 AM",
    icon: "🌤️",
    items: ["IG Post #1 × 8 accounts", "Twitter/X · 1 tweet", "Reddit · 1 comment"],
  },
  {
    title: "Afternoon",
    time: "1–3 PM",
    icon: "☀️",
    items: ["IG Post #2 × 8 accounts", "Twitter/X · 1 tweet + reply to comments", "Reddit · 1 comment"],
  },
  {
    title: "Evening",
    time: "6–8 PM",
    icon: "🌙",
    items: ["Twitter/X · 1 tweet", "Reddit · 1 comment"],
  },
];

function toneClasses(tone: StatusTone) {
  if (tone === "green") return "bg-emerald-500/12 text-emerald-300 border-emerald-500/20";
  if (tone === "yellow") return "bg-amber-500/12 text-amber-300 border-amber-500/20";
  if (tone === "red") return "bg-red-500/12 text-red-300 border-red-500/20";
  return "bg-white/5 text-zinc-300 border-white/10";
}

function calendarClasses(state: CalendarState) {
  if (state === "posted") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/25";
  if (state === "scheduled") return "bg-amber-500/16 text-amber-300 border-amber-500/25";
  return "bg-zinc-800/70 text-zinc-500 border-white/5";
}

export default function MarketingDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-white/6 bg-[#13151A] p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                📊 Marketing Command Center
              </span>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Marketing Channels & Weekly Schedule
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">
                  One dark-mode view of every social account, post cadence, automation lane,
                  and weekly execution target across AIB marketing.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {summaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
                >
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">{stat.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Channel Overview</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Platform-level health, ownership split, and posting load.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {channelOverview.map((channel) => (
              <div
                key={channel.name}
                className="rounded-3xl border border-white/6 bg-[#13151A] p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                    style={{ background: channel.accentSoft }}
                  >
                    {channel.icon}
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClasses(channel.healthTone)}`}>
                    {channel.health}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{channel.name}</div>
                    <div className="text-sm text-zinc-400">{channel.accounts} account{channel.accounts > 1 ? "s" : ""}</div>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Daily target</div>
                    <div className="mt-1 text-sm font-medium text-white">{channel.dailyTarget}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>AI vs Human</span>
                    <span className="font-medium text-zinc-200">{channel.managedRatio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/6 bg-[#13151A] p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">Daily Schedule</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Daily publishing rhythm across Instagram, Twitter/X, and Reddit.
              </p>
            </div>
            <div className="space-y-4">
              {scheduleBlocks.map((block, index) => (
                <div key={block.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-lg">
                      {block.icon}
                    </div>
                    {index !== scheduleBlocks.length - 1 && (
                      <div className="mt-2 h-full w-px bg-white/8" />
                    )}
                  </div>
                  <div className="flex-1 rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-medium text-white">{block.title}</h3>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                        {block.time}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {block.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-white/6 bg-[#0F1116] px-3 py-2 text-sm text-zinc-300"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/6 bg-[#13151A] p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">Execution Notes</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Fast read on what matters this week.
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
                <div className="font-medium">Reddit warm-up in progress</div>
                <div className="mt-1 text-amber-200/80">
                  Xavier Blanc is on Day 1 of 7. Goal is karma growth before any AIB promotion.
                </div>
              </div>
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sky-100">
                <div className="font-medium">Twitter/X requires active replies</div>
                <div className="mt-1 text-sky-200/80">
                  Giulia Banks posts 2–3 times daily and should reply to every comment.
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
                <div className="font-medium">Email nurture is already live</div>
                <div className="mt-1 text-emerald-200/80">
                  GHL automation is published with 8 emails delivered over a 7-day sequence.
                </div>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-100">
                <div className="font-medium">YouTube upload windows</div>
                <div className="mt-1 text-rose-200/80">
                  Giulia Banks videos are typically planned for Wednesday or Friday.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/6 bg-[#13151A] p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Weekly Calendar View</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Green = posted, yellow = scheduled, gray = not yet. Current day is highlighted.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Posted
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Scheduled
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-zinc-600" /> Not yet
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[220px_repeat(7,minmax(88px,1fr))] gap-2">
                <div className="rounded-2xl border border-white/6 bg-[#0F1116] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Account
                </div>
                {DAYS.map((day, index) => (
                  <div
                    key={day}
                    className={`rounded-2xl border px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] ${
                      index === TODAY_INDEX
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                        : "border-white/6 bg-[#0F1116] text-zinc-500"
                    }`}
                  >
                    {day}
                  </div>
                ))}

                {accounts.map((account) => (
                  <>
                    <div
                      key={`${account.id}-label`}
                      className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-base"
                        style={{ backgroundColor: `${account.accent}22` }}
                      >
                        {account.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{account.name}</div>
                        <div className="truncate text-xs text-zinc-500">{account.platform}</div>
                      </div>
                    </div>
                    {account.calendar.map((state, index) => (
                      <div
                        key={`${account.id}-${DAYS[index]}`}
                        className={`rounded-2xl border px-3 py-3 ${calendarClasses(state)} ${
                          index === TODAY_INDEX ? "ring-1 ring-cyan-400/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2 text-xs font-medium">
                          <span className="h-2.5 w-2.5 rounded-full border border-white/10 bg-current" />
                          {state === "posted"
                            ? "Posted"
                            : state === "scheduled"
                            ? "Scheduled"
                            : "Not yet"}
                        </div>
                        {account.platform === "YouTube" && (index === 2 || index === 4) && (
                          <div className="mt-2 text-center text-[11px] font-medium text-rose-200">
                            Upload window
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 pb-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Account Cards</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Detailed status by account, manager, cadence, and recent activity.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-3xl border border-white/6 bg-[#13151A] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                      style={{ backgroundColor: `${account.accent}22` }}
                    >
                      {account.icon}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{account.name}</div>
                      <div className="text-sm text-zinc-500">{account.platform}</div>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClasses(account.statusTone)}`}>
                    {account.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Manager</div>
                    <div className="mt-1 font-medium text-white">{account.manager}</div>
                    <div className="mt-1 text-zinc-400">{account.managementType}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/6 bg-[#0F1116] p-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Posts today</div>
                      <div className="mt-1 text-lg font-semibold text-white">{account.postsToday}</div>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-[#0F1116] p-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Posts this week</div>
                      <div className="mt-1 text-lg font-semibold text-white">{account.postsWeek}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3 text-zinc-300">
                    <span>Schedule</span>
                    <span className="font-medium text-white">{account.scheduleLabel}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3 text-zinc-300">
                    <span>Last posted</span>
                    <span className="font-medium text-white">{account.lastPosted}</span>
                  </div>

                  {account.goal && (
                    <div className="rounded-2xl border border-white/6 bg-[#0F1116] p-3 text-zinc-300">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Goal</div>
                      <div className="mt-1 text-sm text-zinc-300">{account.goal}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
