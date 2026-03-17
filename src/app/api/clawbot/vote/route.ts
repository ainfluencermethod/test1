import { NextResponse } from "next/server";
import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const VOTES_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/recommendations/votes";
const HISTORY_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/recommendations/history";

// The ClawBot agent roster for voting
const VOTING_AGENTS = [
  { id: "wordcel", name: "Wordcel", role: "Copywriter" },
  { id: "pixel-pepe", name: "Pixel Pepe", role: "Designer" },
  { id: "layoutooor", name: "The Layoutooor", role: "Frontend Dev" },
  { id: "plumber", name: "The Plumber", role: "Backend Dev" },
  { id: "gatekeeper", name: "The Gatekeeper", role: "Reviewer/QA" },
];

// Score weights
const WEIGHTS = {
  impact: 3,
  feasibility: 2,
  urgency: 2,
  innovation: 1,
};

interface Recommendation {
  agentId: string;
  agentName: string;
  move: string;
  whyNow: string;
  expectedImpact: string;
  effort: string;
}

interface VoteScore {
  impact: number;
  feasibility: number;
  urgency: number;
  innovation: number;
  weighted: number;
}

interface AgentVote {
  voterId: string;
  voterName: string;
  scores: Record<string, VoteScore>;
}

interface VoteRound {
  mission: string;
  timestamp: string;
  status: "pending" | "voting" | "complete" | "approved" | "rejected" | "building";
  recommendations: Recommendation[];
  votes: AgentVote[];
  rankings: Array<{
    agentId: string;
    agentName: string;
    move: string;
    averageWeighted: number;
    totalWeighted: number;
    voterCount: number;
  }>;
}

async function ensureDirs() {
  if (!existsSync(VOTES_DIR)) await mkdir(VOTES_DIR, { recursive: true });
  if (!existsSync(HISTORY_DIR)) await mkdir(HISTORY_DIR, { recursive: true });
}

async function callGroqForVote(systemPrompt: string, userPrompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function getLatestVoteFile(files: string[]): string | null {
  const jsonFiles = files.filter((f) => f.endsWith(".json")).sort().reverse();
  return jsonFiles[0] || null;
}

// ============================================================================
// GET: Retrieve vote results
// ============================================================================

export async function GET(req: Request) {
  try {
    await ensureDirs();

    const { searchParams } = new URL(req.url);
    const mission = searchParams.get("mission");

    if (mission === "latest" || !mission) {
      // Return latest vote round
      const files = await readdir(VOTES_DIR).catch(() => [] as string[]);
      const latest = getLatestVoteFile(files);

      if (!latest) {
        // Check history too
        const historyFiles = await readdir(HISTORY_DIR).catch(() => [] as string[]);
        const latestHistory = getLatestVoteFile(historyFiles);

        if (!latestHistory) {
          return NextResponse.json({ round: null, message: "No vote rounds found" });
        }

        const data = await readFile(join(HISTORY_DIR, latestHistory), "utf-8");
        return NextResponse.json({ round: JSON.parse(data), source: "history" });
      }

      const data = await readFile(join(VOTES_DIR, latest), "utf-8");
      return NextResponse.json({ round: JSON.parse(data), source: "active" });
    }

    // Find specific mission
    const files = await readdir(VOTES_DIR).catch(() => [] as string[]);
    const match = files.find((f) => f.includes(mission));
    if (match) {
      const data = await readFile(join(VOTES_DIR, match), "utf-8");
      return NextResponse.json({ round: JSON.parse(data), source: "active" });
    }

    return NextResponse.json({ round: null, message: "Vote round not found" });
  } catch (err) {
    console.error("Vote GET error:", err);
    return NextResponse.json({ error: "Failed to retrieve votes" }, { status: 500 });
  }
}

// ============================================================================
// POST: Submit recommendations or run vote
// ============================================================================

export async function POST(req: Request) {
  try {
    await ensureDirs();

    const body = await req.json();
    const { action } = body as { action: string };

    // ===================== SUBMIT RECOMMENDATIONS =====================
    if (action === "submit-recommendations") {
      const { mission, recommendations } = body as {
        mission: string;
        recommendations: Recommendation[];
      };

      if (!mission || !recommendations?.length) {
        return NextResponse.json(
          { error: "Missing mission or recommendations" },
          { status: 400 }
        );
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
      const filename = `${timestamp}.json`;

      const round: VoteRound = {
        mission,
        timestamp: new Date().toISOString(),
        status: "pending",
        recommendations,
        votes: [],
        rankings: [],
      };

      await writeFile(join(VOTES_DIR, filename), JSON.stringify(round, null, 2));

      return NextResponse.json({
        success: true,
        filename,
        message: `${recommendations.length} recommendations submitted for voting`,
      });
    }

    // ===================== RUN VOTE =====================
    if (action === "run-vote") {
      const { mission } = body as { mission?: string };

      // Find the latest pending vote round
      const files = await readdir(VOTES_DIR).catch(() => [] as string[]);
      let targetFile: string | null = null;

      if (mission) {
        targetFile = files.find((f) => f.includes(mission)) || null;
      }

      if (!targetFile) {
        targetFile = getLatestVoteFile(files);
      }

      if (!targetFile) {
        return NextResponse.json(
          { error: "No pending vote round found" },
          { status: 404 }
        );
      }

      const roundData = await readFile(join(VOTES_DIR, targetFile), "utf-8");
      const round: VoteRound = JSON.parse(roundData);

      if (round.status === "complete") {
        return NextResponse.json({
          success: false,
          message: "This vote round is already complete",
          round,
        });
      }

      round.status = "voting";
      round.votes = [];

      // Each agent votes on all recommendations EXCEPT their own
      for (const voter of VOTING_AGENTS) {
        const recsToVoteOn = round.recommendations.filter(
          (r) => r.agentId !== voter.id
        );

        if (recsToVoteOn.length === 0) continue;

        const recList = recsToVoteOn
          .map(
            (r, i) =>
              `${i + 1}. [From ${r.agentName}] "${r.move}" | Why: ${r.whyNow} | Impact: ${r.expectedImpact} | Effort: ${r.effort}`
          )
          .join("\n");

        const systemPrompt = `You are ${voter.name}, the ${voter.role} of a high performance AI agent team. You are voting on team recommendations. Score each recommendation 1 to 10 on Impact, Feasibility, Urgency, Innovation. You CANNOT vote for your own recommendation. Be honest and strategic about what matters most for the €1.25M revenue goal.`;

        const userPrompt = `Here are the recommendations to vote on:\n\n${recList}\n\nScore each recommendation on these criteria (1 to 10):\n- Impact: How much does this move the needle toward €1.25M revenue?\n- Feasibility: Can we build this right now with current resources?\n- Urgency: Does this need to happen before March 25?\n- Innovation: Is this genuinely novel or creative?\n\nRespond ONLY with a JSON array, no markdown, no extra text:\n[\n  {\n    "agentId": "<recommendation author's agentId>",\n    "impact": <1 to 10>,\n    "feasibility": <1 to 10>,\n    "urgency": <1 to 10>,\n    "innovation": <1 to 10>\n  }\n]\n\nThe agentIds are: ${recsToVoteOn.map((r) => r.agentId).join(", ")}`;

        try {
          const raw = await callGroqForVote(systemPrompt, userPrompt);
          const clean = raw.replace(/```json|```/g, "").trim();
          const scores = JSON.parse(clean) as Array<{
            agentId: string;
            impact: number;
            feasibility: number;
            urgency: number;
            innovation: number;
          }>;

          const scoreMap: Record<string, VoteScore> = {};
          for (const s of scores) {
            const weighted =
              s.impact * WEIGHTS.impact +
              s.feasibility * WEIGHTS.feasibility +
              s.urgency * WEIGHTS.urgency +
              s.innovation * WEIGHTS.innovation;

            scoreMap[s.agentId] = {
              impact: s.impact,
              feasibility: s.feasibility,
              urgency: s.urgency,
              innovation: s.innovation,
              weighted,
            };
          }

          round.votes.push({
            voterId: voter.id,
            voterName: voter.name,
            scores: scoreMap,
          });
        } catch (err) {
          console.error(`Vote error for ${voter.name}:`, err);
          // Agent abstains on parse error
        }
      }

      // Tally votes and rank
      const tallyMap: Record<
        string,
        { totalWeighted: number; voterCount: number }
      > = {};

      for (const rec of round.recommendations) {
        tallyMap[rec.agentId] = { totalWeighted: 0, voterCount: 0 };
      }

      for (const vote of round.votes) {
        for (const [agentId, score] of Object.entries(vote.scores)) {
          if (tallyMap[agentId]) {
            tallyMap[agentId].totalWeighted += score.weighted;
            tallyMap[agentId].voterCount += 1;
          }
        }
      }

      round.rankings = round.recommendations
        .map((rec) => {
          const tally = tallyMap[rec.agentId] || {
            totalWeighted: 0,
            voterCount: 0,
          };
          return {
            agentId: rec.agentId,
            agentName: rec.agentName,
            move: rec.move,
            totalWeighted: tally.totalWeighted,
            voterCount: tally.voterCount,
            averageWeighted:
              tally.voterCount > 0
                ? Math.round((tally.totalWeighted / tally.voterCount) * 10) / 10
                : 0,
          };
        })
        .sort((a, b) => b.averageWeighted - a.averageWeighted);

      round.status = "complete";

      // Save updated round
      await writeFile(join(VOTES_DIR, targetFile), JSON.stringify(round, null, 2));

      return NextResponse.json({
        success: true,
        round,
        winner: round.rankings[0] || null,
      });
    }

    // ===================== UPDATE STATUS =====================
    if (action === "update-status") {
      const { status: newStatus } = body as { status: VoteRound["status"] };

      const files = await readdir(VOTES_DIR).catch(() => [] as string[]);
      const targetFile = getLatestVoteFile(files);

      if (!targetFile) {
        return NextResponse.json(
          { error: "No vote round found" },
          { status: 404 }
        );
      }

      const roundData = await readFile(join(VOTES_DIR, targetFile), "utf-8");
      const round: VoteRound = JSON.parse(roundData);
      round.status = newStatus;

      // If approved/rejected, move to history
      if (newStatus === "approved" || newStatus === "rejected") {
        await writeFile(
          join(HISTORY_DIR, targetFile),
          JSON.stringify(round, null, 2)
        );
        // Remove from active votes (best effort)
        const { unlink } = await import("fs/promises");
        await unlink(join(VOTES_DIR, targetFile)).catch(() => {});
      } else {
        await writeFile(join(VOTES_DIR, targetFile), JSON.stringify(round, null, 2));
      }

      return NextResponse.json({ success: true, round });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Vote POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
