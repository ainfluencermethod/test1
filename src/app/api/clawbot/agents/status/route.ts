import { NextResponse } from "next/server";
import { readFile } from "fs/promises";

const QUEUE_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/autonomous-queue.json";
const ARCHITECT_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/architect-state.json";

// Map from queue agent names to clawbot agent IDs
const AGENT_ID_MAP: Record<string, string> = {
  plumber: "backend",
  layoutooor: "frontend",
  copywriter: "copywriter",
  designer: "designer",
  gatekeeper: "reviewer",
  sensei: "sensei",
  oracle: "oracle",
  devil: "devil",
  wordcel: "copywriter",
};

// All known agent IDs
const ALL_AGENTS = [
  "orchestrator",
  "copywriter",
  "designer",
  "frontend",
  "backend",
  "reviewer",
  "sensei",
  "oracle",
  "devil",
];

interface AgentStatusEntry {
  agentId: string;
  status: "working" | "idle" | "complete";
  currentMission?: string;
  missionId?: string;
  lastActive?: string;
}

export async function GET() {
  try {
    // Read queue
    let queue: { queue: Array<{ id: string; title: string; agents: string[]; status: string; completedAt?: string; startedAt?: string }> } = { queue: [] };
    try {
      const raw = await readFile(QUEUE_FILE, "utf-8");
      queue = JSON.parse(raw);
    } catch {
      // Queue file missing
    }

    // Read architect state
    let architect: { lastHeartbeat?: string; lastAction?: string } = {};
    try {
      const raw = await readFile(ARCHITECT_FILE, "utf-8");
      architect = JSON.parse(raw);
    } catch {
      // Architect state missing
    }

    // Track which agents are working and on what
    const agentWork: Record<string, { missionTitle: string; missionId: string; startedAt?: string }> = {};
    const agentComplete: Record<string, { missionTitle: string; completedAt?: string }> = {};

    for (const mission of queue.queue || []) {
      if (mission.status === "in-progress") {
        for (const agentName of mission.agents || []) {
          const agentId = AGENT_ID_MAP[agentName.toLowerCase()] || agentName.toLowerCase();
          agentWork[agentId] = {
            missionTitle: mission.title,
            missionId: mission.id,
            startedAt: mission.startedAt,
          };
        }
        // Orchestrator is always working when there's an in-progress mission
        agentWork["orchestrator"] = {
          missionTitle: mission.title,
          missionId: mission.id,
          startedAt: mission.startedAt,
        };
      }
      // Track recently completed (within last hour)
      if (mission.status === "complete" && mission.completedAt) {
        const completedMs = new Date(mission.completedAt).getTime();
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        if (completedMs > oneHourAgo) {
          for (const agentName of mission.agents || []) {
            const agentId = AGENT_ID_MAP[agentName.toLowerCase()] || agentName.toLowerCase();
            agentComplete[agentId] = {
              missionTitle: mission.title,
              completedAt: mission.completedAt,
            };
          }
        }
      }
    }

    // Build response
    const agents: AgentStatusEntry[] = ALL_AGENTS.map((agentId) => {
      if (agentWork[agentId]) {
        return {
          agentId,
          status: "working" as const,
          currentMission: agentWork[agentId].missionTitle,
          missionId: agentWork[agentId].missionId,
          lastActive: agentWork[agentId].startedAt || new Date().toISOString(),
        };
      }
      if (agentComplete[agentId]) {
        return {
          agentId,
          status: "complete" as const,
          currentMission: agentComplete[agentId].missionTitle,
          lastActive: agentComplete[agentId].completedAt,
        };
      }
      return {
        agentId,
        status: "idle" as const,
        lastActive: architect.lastHeartbeat || undefined,
      };
    });

    return NextResponse.json({
      agents,
      architectLastHeartbeat: architect.lastHeartbeat || null,
      architectLastAction: architect.lastAction || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read agent status" },
      { status: 500 }
    );
  }
}
