"use client";

const COMPETITORS = [
  { name: "Ghost Creator Method", price: "$75/$359", community: "Small", threat: "Medium", diff: "Spanish market focus", color: "text-yellow-400" },
  { name: "AI Method", price: "Unknown", community: "Tiny", threat: "Low", diff: "Minimal online presence", color: "text-green-400" },
  { name: "Waviboy", price: "$100-200", community: "Medium", threat: "Medium", diff: "Mixed reviews, inconsistent quality", color: "text-yellow-400" },
  { name: "GenHQ (Skool)", price: "Free", community: "8K+", threat: "Low", diff: "Free community only, no paid product", color: "text-green-400" },
  { name: "Ohneis", price: "$999 lifetime", community: "Growing", threat: "HIGH", diff: "Stunning visuals, strong brand", color: "text-red-400" },
];

const ADVANTAGES = [
  "800M+ total views — largest proven track record in the space",
  "€820K single launch case study — unmatched monetization proof",
  "2,000+ active community members across 30+ countries",
  "Weekly live strategy updates (competitors use static courses)",
  "Full funnel system: character → content → growth → monetization",
  "Affordable entry: $27 method + $97/mo community (vs $999 lifetime elsewhere)",
  "Dual founders (Tim + Luka) = more bandwidth, more perspectives",
];

const RECOMMENDATIONS = [
  { icon: "🎯", title: "Differentiate on Results", desc: "Lead with the 800M views and €820K case study. No competitor can match these numbers." },
  { icon: "👁️", title: "Watch Ohneis Closely", desc: "They're the only real threat. Monitor their pricing, community growth, and content quality monthly." },
  { icon: "💰", title: "Price Anchoring", desc: "Position the $27 OTO against Ohneis's $999 lifetime — we're 37x cheaper to start." },
  { icon: "🌍", title: "Go Global First", desc: "Ghost Creator has Spanish market. We should own English + expand to other languages before anyone else does." },
  { icon: "📱", title: "Content Velocity", desc: "Our community generates more content than all competitors combined. Leverage UGC and member success stories." },
  { icon: "🔄", title: "Recurring Revenue Moat", desc: "Our $97/mo model creates stickiness. Ohneis lifetime = one-time revenue. We compound." },
];

export default function CompetitionIntel() {
  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 overflow-x-auto">
        <h3 className="font-semibold mb-4">🏆 Competitor Landscape</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="pb-3 pr-4">Competitor</th>
              <th className="pb-3 pr-4">Price</th>
              <th className="pb-3 pr-4">Community</th>
              <th className="pb-3 pr-4">Threat</th>
              <th className="pb-3">Key Differentiator</th>
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map((c) => (
              <tr key={c.name} className="border-b border-[var(--border)]/50">
                <td className="py-3 pr-4 font-medium">{c.name}</td>
                <td className="py-3 pr-4">{c.price}</td>
                <td className="py-3 pr-4">{c.community}</td>
                <td className={`py-3 pr-4 font-semibold ${c.color}`}>{c.threat}</td>
                <td className="py-3 text-[var(--text-muted)]">{c.diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Threat Alert */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="font-semibold text-red-400 mb-2">⚠️ Primary Threat: Ohneis</h3>
        <p className="text-sm text-[var(--text-muted)]">
          Ohneis is the only competitor with comparable visual quality and growing community engagement. 
          Their $999 lifetime price creates a different value proposition. Monitor their growth closely 
          and ensure our launch messaging emphasizes results + community support over just course content.
        </p>
      </div>

      {/* Our Advantages */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold mb-4">💪 Our Competitive Advantages</h3>
        <div className="space-y-2">
          {ADVANTAGES.map((adv, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{adv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold mb-4">🧠 Strategic Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECOMMENDATIONS.map((rec) => (
            <div key={rec.title} className="border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{rec.icon}</span>
                <span className="font-medium text-sm">{rec.title}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
