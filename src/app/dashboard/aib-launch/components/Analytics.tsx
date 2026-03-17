"use client";

import { useState } from "react";

const PIXELS = [
  {
    name: "Meta Pixel",
    icon: "📘",
    status: "Not Installed",
    instructions: [
      "1. Go to Meta Events Manager → Data Sources → Add → Web",
      "2. Create a new Pixel (name: 'AIB Launch')",
      "3. Copy the base pixel code",
      "4. Add to <head> of all funnel pages",
      "5. Set up these events: PageView, Lead (freebie), Purchase (OTO), Subscribe (community)",
      "6. Verify with Meta Pixel Helper Chrome extension",
    ],
  },
  {
    name: "Google Analytics 4",
    icon: "📊",
    status: "Not Installed",
    instructions: [
      "1. Go to analytics.google.com → Admin → Create Property",
      "2. Set up a Web data stream",
      "3. Copy the G-XXXXXXX measurement ID",
      "4. Add the gtag.js snippet to all funnel pages",
      "5. Set up conversions: lead_signup, purchase, subscribe",
      "6. Link to Google Ads if running paid traffic",
    ],
  },
  {
    name: "TikTok Pixel",
    icon: "🎵",
    status: "Not Installed",
    instructions: [
      "1. Go to TikTok Ads Manager → Assets → Events → Web Events",
      "2. Create a new Pixel (name: 'AIB Launch')",
      "3. Choose 'Manually Install Pixel Code'",
      "4. Add base code to all funnel pages",
      "5. Set up events: ViewContent, CompleteRegistration, PlaceAnOrder",
      "6. Verify with TikTok Pixel Helper",
    ],
  },
];

export default function Analytics() {
  const [leads, setLeads] = useState(100);
  const otoConversions = Math.round(leads * 0.08);
  const otoRevenue = otoConversions * 27;
  const communityMonthly = Math.round(leads * 0.03);
  const communityYearly = Math.round(leads * 0.01);
  const communityRevenue = communityMonthly * 97 + communityYearly * 497;
  const totalRevenue = otoRevenue + communityRevenue;

  return (
    <div className="space-y-6">
      {/* Setup Status */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold mb-4">📡 Tracking Setup Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PIXELS.map((pixel) => (
            <div key={pixel.name} className="border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{pixel.icon}</span>
                <div>
                  <div className="font-medium text-sm">{pixel.name}</div>
                  <div className="text-xs text-red-400">⚠️ {pixel.status}</div>
                </div>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-[var(--accent)] hover:underline mb-2">
                  Setup Instructions
                </summary>
                <ol className="space-y-1 text-[var(--text-muted)]">
                  {pixel.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* External Dashboard Link */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold mb-2">🔗 External Dashboards</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/dashboard/aib/analytics"
            className="bg-[var(--accent)]/20 border border-[var(--accent)]/30 px-4 py-2 rounded-lg text-sm text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-colors"
          >
            📊 Tracking Dashboard
          </a>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--bg-card-hover)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Google Analytics →
          </a>
          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--bg-card-hover)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Meta Events Manager →
          </a>
        </div>
      </div>

      {/* Revenue Calculator */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold mb-4">🧮 Revenue Calculator</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--text-muted)] mb-2 block">
              Total Leads: <span className="text-[var(--accent)] font-bold">{leads}</span>
            </label>
            <input
              type="range"
              min={10}
              max={5000}
              step={10}
              value={leads}
              onChange={(e) => setLeads(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>10</span>
              <span>5,000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card-hover)] rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--text-muted)] mb-1">OTO Conversions (8%)</div>
              <div className="text-xl font-bold">{otoConversions}</div>
              <div className="text-xs text-green-400 mt-1">${otoRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-card-hover)] rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--text-muted)] mb-1">Monthly Subs (3%)</div>
              <div className="text-xl font-bold">{communityMonthly}</div>
              <div className="text-xs text-green-400 mt-1">${(communityMonthly * 97).toLocaleString()}/mo</div>
            </div>
            <div className="bg-[var(--bg-card-hover)] rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--text-muted)] mb-1">Yearly Subs (1%)</div>
              <div className="text-xl font-bold">{communityYearly}</div>
              <div className="text-xs text-green-400 mt-1">${(communityYearly * 497).toLocaleString()}</div>
            </div>
            <div className="bg-[var(--accent)]/20 border border-[var(--accent)]/30 rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--text-muted)] mb-1">Total Revenue</div>
              <div className="text-xl font-bold text-[var(--accent)]">${totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">First month</div>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            * Assumptions: 8% OTO conversion rate, 3% monthly subscription rate, 1% annual subscription rate. 
            Adjust based on actual funnel performance.
          </p>
        </div>
      </div>
    </div>
  );
}
