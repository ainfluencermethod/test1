"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Overview = dynamic(() => import("./components/Overview"), { ssr: false });
const FunnelBuilder = dynamic(() => import("./components/FunnelBuilder"), { ssr: false });
const EmailFlows = dynamic(() => import("./components/EmailFlows"), { ssr: false });
const LandingPages = dynamic(() => import("./components/LandingPages"), { ssr: false });
const CompetitionIntel = dynamic(() => import("./components/CompetitionIntel"), { ssr: false });
const Analytics = dynamic(() => import("./components/Analytics"), { ssr: false });

const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "funnel", label: "Funnel Builder", icon: "🔬" },
  { id: "emails", label: "Email Flows", icon: "📧" },
  { id: "pages", label: "Landing Pages", icon: "🌐" },
  { id: "competition", label: "Competition", icon: "🏆" },
  { id: "analytics", label: "Analytics", icon: "📈" },
];

export default function AIBLaunchPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🚀 AIB Launch Command Center
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          AI Influencer Blueprint — Launch Date: March 13, 2026
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--accent)] text-black"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && <Overview />}
        {activeTab === "funnel" && <FunnelBuilder />}
        {activeTab === "emails" && <EmailFlows />}
        {activeTab === "pages" && <LandingPages />}
        {activeTab === "competition" && <CompetitionIntel />}
        {activeTab === "analytics" && <Analytics />}
      </div>
    </div>
  );
}
