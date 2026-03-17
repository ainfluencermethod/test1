import { prisma } from "@/lib/prisma";
import Link from "next/link";

const deptColors: Record<string, string> = {
  Leadership: "border-purple-500/50 bg-purple-500/5",
  Research: "border-blue-500/50 bg-blue-500/5",
  Development: "border-cyan-500/50 bg-cyan-500/5",
  Product: "border-orange-500/50 bg-orange-500/5",
  Copy: "border-pink-500/50 bg-pink-500/5",
  "Content Creation": "border-green-500/50 bg-green-500/5",
  "AB Testing": "border-yellow-500/50 bg-yellow-500/5",
};

const deptIcons: Record<string, string> = {
  Leadership: "👑",
  Research: "🔍",
  Development: "💻",
  Product: "📦",
  Copy: "✍️",
  "Content Creation": "🎬",
  "AB Testing": "🧪",
};

const statusDot: Record<string, string> = {
  working: "bg-green-500",
  idle: "bg-yellow-500",
  offline: "bg-gray-500",
};

export default async function OrgPage() {
  const agents = await prisma.agent.findMany({
    include: { children: true, parent: true },
    orderBy: { createdAt: "asc" },
  });

  // Build hierarchy
  const boss = agents.find((a) => a.type === "human");
  const jarvis = agents.find((a) => a.name === "Jarvis");
  const departments = new Map<string, typeof agents>();

  for (const agent of agents) {
    if (agent.type === "human" || agent.department === "Leadership") continue;
    const dept = agent.department;
    if (!departments.has(dept)) departments.set(dept, []);
    departments.get(dept)!.push(agent);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Organization</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Agent hierarchy and department structure
        </p>
      </div>

      {/* Top of hierarchy */}
      <div className="flex flex-col items-center gap-4">
        {/* Boss */}
        {boss && (
          <div className="card !p-4 border-2 border-purple-500/50 bg-purple-500/5 text-center min-w-[200px]">
            <div className="text-3xl mb-2">{boss.avatar || "👤"}</div>
            <p className="font-bold">{boss.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{boss.role}</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${statusDot[boss.status]}`} />
              <span className="text-xs text-[var(--text-muted)] capitalize">{boss.status}</span>
            </div>
          </div>
        )}

        {/* Connector */}
        <div className="w-px h-8 bg-[var(--border)]" />

        {/* Jarvis */}
        {jarvis && (
          <div className="card !p-4 border-2 border-purple-500/50 bg-purple-500/5 text-center min-w-[200px]">
            <div className="text-3xl mb-2">{jarvis.avatar || "⚡"}</div>
            <p className="font-bold">{jarvis.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{jarvis.role}</p>
            {jarvis.skills && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {jarvis.skills.split(",").map((s) => (
                  <span key={s} className="badge badge-blue text-[10px]">
                    {s.trim()}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${statusDot[jarvis.status]}`} />
              <span className="text-xs text-[var(--text-muted)] capitalize">{jarvis.status}</span>
            </div>
          </div>
        )}

        {/* Connector to departments */}
        <div className="w-px h-8 bg-[var(--border)]" />
        <div className="w-3/4 h-px bg-[var(--border)]" />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from(departments.entries()).map(([dept, deptAgents]) => {
          const lead = deptAgents.find((a) => a.type === "lead");
          const members = deptAgents.filter((a) => a.type !== "lead");
          const color = deptColors[dept] || "border-[var(--border)]";
          const icon = deptIcons[dept] || "📂";

          return (
            <div key={dept} className={`card border-2 ${color}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{icon}</span>
                <div>
                  <h3 className="font-bold text-sm">{dept}</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {deptAgents.length} agent{deptAgents.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Department Lead */}
              {lead && (
                <Link href={`/dashboard/agents/${lead.id}`} className="block mb-3 pb-3 border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] -mx-2 px-2 py-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-sm">
                      {lead.avatar || "🤖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{lead.role}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${statusDot[lead.status]}`} />
                  </div>
                </Link>
              )}

              {/* Members */}
              <div className="space-y-2">
                {members.map((agent) => (
                  <Link key={agent.id} href={`/dashboard/agents/${agent.id}`} className="flex items-center gap-2 hover:bg-[var(--bg-card-hover)] -mx-2 px-2 py-1 rounded-lg transition-colors">
                    <div className="w-7 h-7 rounded-full bg-[var(--bg)] flex items-center justify-center text-xs">
                      {agent.avatar || "🤖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{agent.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{agent.role}</p>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[agent.status]}`} />
                  </Link>
                ))}
              </div>

              {deptAgents.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">
                  No agents assigned
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {departments.size === 0 && !boss && !jarvis && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🏢</p>
          <p className="text-lg font-medium">No agents configured yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Agents will appear here once seeded
          </p>
        </div>
      )}
    </div>
  );
}
