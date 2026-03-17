import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";

const SCORES_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/scores";

interface ScoreEntry {
  mission: string;
  date: string;
  scores: {
    accuracy: number;
    quality: number;
    brand: number;
    innovation: number;
    efficiency: number;
  };
  average: number;
  notes: string;
  bossApproved: boolean;
  bossNote: string;
}

async function ensureDir() {
  try {
    await mkdir(SCORES_DIR, { recursive: true });
  } catch {
    // exists
  }
}

async function readScores(agentId: string): Promise<ScoreEntry[]> {
  try {
    const raw = await readFile(join(SCORES_DIR, `${agentId}.json`), "utf-8");
    return JSON.parse(raw) as ScoreEntry[];
  } catch {
    return [];
  }
}

async function writeScores(agentId: string, scores: ScoreEntry[]) {
  await ensureDir();
  await writeFile(join(SCORES_DIR, `${agentId}.json`), JSON.stringify(scores, null, 2), "utf-8");
}

async function getAllAgentIds(): Promise<string[]> {
  try {
    const files = await readdir(SCORES_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

function computeAverage(scores: ScoreEntry["scores"]): number {
  const vals = Object.values(scores);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

// GET — query scores
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const agentParam = url.searchParams.get("agent");
    const missionParam = url.searchParams.get("mission");
    const leaderboard = url.searchParams.get("leaderboard");
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Leaderboard mode
    if (leaderboard === "true") {
      const agentIds = await getAllAgentIds();
      const leaderboardData: Array<{
        agentId: string;
        avgScore: number;
        missionCount: number;
        strongest: string;
        weakest: string;
        lastDelta: number;
        scores: ScoreEntry[];
      }> = [];

      for (const id of agentIds) {
        const scores = await readScores(id);
        if (scores.length === 0) continue;

        // Compute dimension averages
        const dims: Record<string, number[]> = {
          accuracy: [],
          quality: [],
          brand: [],
          innovation: [],
          efficiency: [],
        };
        let totalAvg = 0;

        for (const entry of scores) {
          totalAvg += entry.average;
          for (const [dim, val] of Object.entries(entry.scores)) {
            if (dims[dim]) dims[dim].push(val);
          }
        }

        const avgScore = Math.round((totalAvg / scores.length) * 10) / 10;

        const dimAvgs = Object.entries(dims).map(([dim, vals]) => ({
          dim,
          avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
        }));
        dimAvgs.sort((a, b) => b.avg - a.avg);

        const strongest = dimAvgs[0]?.dim || "none";
        const weakest = dimAvgs[dimAvgs.length - 1]?.dim || "none";

        // Delta from last mission
        let lastDelta = 0;
        if (scores.length >= 2) {
          lastDelta = Math.round((scores[scores.length - 1].average - scores[scores.length - 2].average) * 10) / 10;
        }

        leaderboardData.push({
          agentId: id,
          avgScore,
          missionCount: scores.length,
          strongest,
          weakest,
          lastDelta,
          scores,
        });
      }

      leaderboardData.sort((a, b) => b.avgScore - a.avgScore);
      return NextResponse.json({ leaderboard: leaderboardData });
    }

    // By agent
    if (agentParam) {
      const scores = await readScores(agentParam);
      const limited = scores.slice(-limit);
      return NextResponse.json({ agent: agentParam, scores: limited });
    }

    // By mission
    if (missionParam) {
      const agentIds = await getAllAgentIds();
      const missionScores: Array<{ agentId: string; entry: ScoreEntry }> = [];

      for (const id of agentIds) {
        const scores = await readScores(id);
        const match = scores.find((s) => s.mission === missionParam || s.mission.startsWith(missionParam));
        if (match) {
          missionScores.push({ agentId: id, entry: match });
        }
      }

      return NextResponse.json({ mission: missionParam, scores: missionScores });
    }

    // Default: return all
    const agentIds = await getAllAgentIds();
    const all: Record<string, ScoreEntry[]> = {};
    for (const id of agentIds) {
      all[id] = await readScores(id);
    }
    return NextResponse.json({ scores: all });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read scores" },
      { status: 500 }
    );
  }
}

// POST — store a score
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, agent, mission, scores, notes } = body as {
      action: string;
      agent: string;
      mission: string;
      scores: ScoreEntry["scores"];
      notes?: string;
    };

    if (action !== "score") {
      return NextResponse.json({ error: "Unknown action. Use action: 'score'" }, { status: 400 });
    }

    if (!agent || !mission || !scores) {
      return NextResponse.json({ error: "Missing agent, mission, or scores" }, { status: 400 });
    }

    const average = computeAverage(scores);
    const entry: ScoreEntry = {
      mission,
      date: new Date().toISOString().split("T")[0],
      scores,
      average,
      notes: notes || "",
      bossApproved: false,
      bossNote: "",
    };

    const existing = await readScores(agent);

    // Update if same mission exists, otherwise append
    const idx = existing.findIndex((e) => e.mission === mission);
    if (idx >= 0) {
      existing[idx] = entry;
    } else {
      existing.push(entry);
    }

    await writeScores(agent, existing);

    return NextResponse.json({ ok: true, entry, agentTotal: existing.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to store score" },
      { status: 500 }
    );
  }
}
