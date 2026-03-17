import { NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 10_000;

const SCORES_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/scores";
const PATTERNS_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/patterns/winners.json";
const GATEWAY_URL = "http://192.168.10.28:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";
const AGENTS_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/agents";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 120; // 6 minutes max

// ============================================================================
// Helpers
// ============================================================================

async function readAgentFile(agentId: string, filename: string): Promise<string | null> {
  try {
    const filePath = join(AGENTS_DIR, agentId, filename);
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function callGroq(prompt: string, timeoutMs = TIMEOUT_MS): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", res.status, errText);
      throw new Error(`Groq API returned ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function isGatewayReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${GATEWAY_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function spawnSubagent(task: string, label: string): Promise<{ sessionId: string }> {
  const res = await fetch(`${GATEWAY_URL}/v1/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GATEWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task,
      model: "anthropic/claude-opus-4-6",
      mode: "run",
      label: `clawbot:${label}`,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gateway returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return { sessionId: data.sessionId || data.id || data.session_id };
}

async function pollSession(sessionId: string): Promise<{ status: string; output: string }> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${GATEWAY_URL}/v1/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${GATEWAY_TOKEN}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        // Try alternative endpoint via tools/invoke
        try {
          const toolRes = await fetch(`${GATEWAY_URL}/tools/invoke`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GATEWAY_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tool: "subagents",
              args: { action: "list", recentMinutes: 30 },
              sessionKey: "main",
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (toolRes.ok) {
            const toolData = await toolRes.json();
            const text = toolData?.result?.content?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              const allSessions = [...(parsed.running || []), ...(parsed.recent || [])];
              const session = allSessions.find(
                (s: Record<string, unknown>) =>
                  s.id === sessionId || s.sessionId === sessionId
              );
              if (session) {
                const status = (session.status as string) || "unknown";
                if (status === "completed" || status === "done" || status === "finished") {
                  return {
                    status: "completed",
                    output: (session.result as string) || (session.output as string) || "Task completed successfully.",
                  };
                }
                if (status === "error" || status === "failed") {
                  return {
                    status: "error",
                    output: (session.error as string) || "Agent encountered an error.",
                  };
                }
              }
            }
          }
        } catch {
          // Ignore tool invoke errors, continue polling
        }

        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        continue;
      }

      const data = await res.json();
      const status = data.status || data.state || "unknown";

      if (status === "completed" || status === "done" || status === "finished") {
        const output =
          data.result ||
          data.output ||
          data.response ||
          data.messages?.slice(-1)?.[0]?.content ||
          "Task completed successfully.";
        return { status: "completed", output: typeof output === "string" ? output : JSON.stringify(output) };
      }

      if (status === "error" || status === "failed") {
        return {
          status: "error",
          output: data.error || data.message || "Agent encountered an error.",
        };
      }

      // Still running
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    } catch {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  return { status: "timeout", output: "Agent execution timed out after 6 minutes." };
}

// ============================================================================
// Memory Replay Builder
// ============================================================================

interface ScoreEntry {
  mission: string;
  date: string;
  scores: Record<string, number>;
  average: number;
  notes: string;
  bossApproved: boolean;
  bossNote: string;
}

interface WinnerPattern {
  id: string;
  agent: string;
  mission: string;
  dimension: string;
  score: number;
  pattern: string;
  applicableTo: string[];
  date: string;
}

// Map pipeline agent IDs to score file names
const SCORE_AGENT_MAP: Record<string, string> = {
  planner: "wordcel",
  researcher: "pixel-pepe",
  coder: "layoutooor",
  reviewer: "gatekeeper",
  deployer: "plumber",
  copywriter: "wordcel",
  designer: "pixel-pepe",
  frontend: "layoutooor",
  backend: "plumber",
  orchestrator: "gatekeeper",
  wordcel: "wordcel",
  "pixel-pepe": "pixel-pepe",
  layoutooor: "layoutooor",
  gatekeeper: "gatekeeper",
  plumber: "plumber",
};

async function buildMemoryReplay(agentId: string): Promise<string> {
  const scoreAgentId = SCORE_AGENT_MAP[agentId] || agentId;

  // Read agent scores
  let scores: ScoreEntry[] = [];
  try {
    const raw = await readFile(join(SCORES_DIR, `${scoreAgentId}.json`), "utf-8");
    scores = JSON.parse(raw);
  } catch {
    // No scores yet
  }

  if (scores.length === 0) return "";

  // Take last 5
  const recent = scores.slice(-5).reverse();

  let replay = "## Your Recent Performance (Memory Replay)\n\n";

  // Boss approved entries first (3x weight visual indicator)
  const bossApproved = recent.filter((s) => s.bossApproved);
  if (bossApproved.length > 0) {
    replay += "### ⭐ BOSS APPROVED (High Priority Feedback)\n\n";
    for (const entry of bossApproved) {
      const missionName = entry.mission.replace(/-/g, " ").replace(/^\d+\s*/, "");
      replay += `**${entry.mission}** (${missionName}): avg ${entry.average}/10\n`;
      replay += `  Accuracy: ${entry.scores.accuracy}, Quality: ${entry.scores.quality}, Brand: ${entry.scores.brand}, Innovation: ${entry.scores.innovation}, Efficiency: ${entry.scores.efficiency}\n`;
      if (entry.bossNote) replay += `  Boss Note: "${entry.bossNote}"\n`;
      if (entry.notes) replay += `  Note: "${entry.notes}"\n`;
      replay += "\n";
    }
  }

  // All entries
  replay += "### Mission History\n\n";
  for (const entry of recent) {
    if (entry.bossApproved) continue; // Already shown above
    const missionName = entry.mission.replace(/-/g, " ").replace(/^\d+\s*/, "");
    replay += `${entry.mission} (${missionName}): avg ${entry.average}/10\n`;
    replay += `  Accuracy: ${entry.scores.accuracy}, Quality: ${entry.scores.quality}, Brand: ${entry.scores.brand}, Innovation: ${entry.scores.innovation}, Efficiency: ${entry.scores.efficiency}\n`;
    if (entry.notes) replay += `  Note: "${entry.notes}"\n`;
    replay += "\n";
  }

  // Compute dimension averages
  const dims: Record<string, number[]> = {};
  for (const entry of scores) {
    for (const [dim, val] of Object.entries(entry.scores)) {
      if (!dims[dim]) dims[dim] = [];
      dims[dim].push(val);
    }
  }

  const dimAvgs = Object.entries(dims)
    .map(([dim, vals]) => ({
      dim,
      avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    }))
    .sort((a, b) => b.avg - a.avg);

  if (dimAvgs.length > 0) {
    const strongest = dimAvgs[0];
    const weakest = dimAvgs[dimAvgs.length - 1];
    replay += `Your strongest dimension: ${strongest.dim} (${strongest.avg} avg)\n`;
    replay += `Your weakest dimension: ${weakest.dim} (${weakest.avg} avg)\n`;
    replay += `FOCUS THIS MISSION: Improve ${weakest.dim} while maintaining ${strongest.dim}.\n\n`;
  }

  // Read winner patterns applicable to this agent
  try {
    const patternsRaw = await readFile(PATTERNS_FILE, "utf-8");
    const allPatterns: WinnerPattern[] = JSON.parse(patternsRaw);
    const applicable = allPatterns.filter(
      (p) => p.applicableTo.includes("all") || p.applicableTo.includes(scoreAgentId)
    );

    if (applicable.length > 0) {
      // Show top 5 most recent patterns
      const recentPatterns = applicable.slice(-5);
      replay += "### Team Excellence Patterns\n\n";
      for (const p of recentPatterns) {
        replay += `[${p.agent}/${p.dimension}] ${p.pattern}\n`;
      }
      replay += "\n";
    }
  } catch {
    // No patterns file yet
  }

  return replay;
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    // ===================== DECOMPOSE =====================
    if (action === "decompose") {
      const { task } = body as { task: string };
      if (!task) {
        return NextResponse.json({ error: "Missing task" }, { status: 400 });
      }

      const prompt = `You are Claw Bot's AI orchestrator. Break this task into exactly 5 micro-tasks for these agents in order: Planner, Researcher, Coder, Reviewer, Deployer.
Task: "${task}"
Respond ONLY with a JSON object, no markdown, no extra text:
{
  "planner": "short specific task for Planner (max 60 chars)",
  "researcher": "short specific task for Researcher (max 60 chars)",
  "coder": "short specific task for Coder (max 60 chars)",
  "reviewer": "short specific task for Reviewer (max 60 chars)",
  "deployer": "short specific task for Deployer (max 60 chars)"
}`;

      try {
        const raw = await callGroq(prompt);
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        return NextResponse.json({ result: parsed });
      } catch {
        return NextResponse.json({
          result: {
            planner: `Define scope and milestones for: ${task.slice(0, 40)}`,
            researcher: "Gather requirements and prior art",
            coder: "Implement solution and write code",
            reviewer: "Test, validate and QA the output",
            deployer: "Package and deploy to production",
          },
          fallback: true,
        });
      }
    }

    // ===================== EXECUTE =====================
    if (action === "execute") {
      const { agentId, subtask, priorContext } = body as {
        agentId: string;
        subtask: string;
        priorContext?: string;
      };

      if (!agentId || !subtask) {
        return NextResponse.json(
          { error: "Missing agentId or subtask" },
          { status: 400 }
        );
      }

      // Agent ID mapping: pipeline roles → agent profile dirs
      const AGENT_MAP: Record<string, string> = {
        planner: "copywriter",
        researcher: "designer",
        coder: "frontend",
        reviewer: "reviewer",
        deployer: "backend",
      };
      const profileId = AGENT_MAP[agentId] || agentId;

      // Read agent profile
      const systemPrompt = await readAgentFile(profileId, "PROMPT.md");
      const memory = await readAgentFile(profileId, "memory.md");
      const profileFound = !!systemPrompt;

      // Build memory replay for this agent
      const memoryReplay = await buildMemoryReplay(agentId);

      // Build the full task prompt
      let fullTask = "";

      if (systemPrompt) {
        fullTask += systemPrompt + "\n\n";
      } else {
        fullTask += `You are a skilled ${agentId} agent. Complete the assigned task thoroughly and provide actionable output.\n\n`;
        console.log(`[ClawBot] Agent profile not found for ${profileId}, using generic prompt`);
      }

      // Inject memory replay BEFORE the mission brief
      if (memoryReplay) {
        fullTask += memoryReplay + "\n\n";
      }

      if (memory) {
        fullTask += `## Agent Memory\n${memory}\n\n`;
      }

      if (priorContext) {
        fullTask += `## Context From Previous Agents\n${priorContext}\n\n`;
      }

      fullTask += `## Your Task\n${subtask}\n\nProvide your complete output. Be specific, actionable, and thorough. Do not use dashes in your response.`;

      // Try real gateway first
      const gatewayUp = await isGatewayReachable();

      if (gatewayUp) {
        try {
          console.log(`[ClawBot] Spawning real subagent for ${agentId} (profile: ${profileId})`);
          const { sessionId } = await spawnSubagent(fullTask, agentId);
          console.log(`[ClawBot] Session ${sessionId} created for ${agentId}`);

          // Poll for result
          const result = await pollSession(sessionId);
          console.log(`[ClawBot] Session ${sessionId} finished with status: ${result.status}`);

          return NextResponse.json({
            result: result.output,
            status: result.status,
            sessionId,
            mode: "gateway",
            profileFound,
          });
        } catch (err) {
          console.error(`[ClawBot] Gateway execution failed for ${agentId}:`, err);
          // Fall through to Groq simulation
        }
      }

      // Fallback: Groq simulation
      console.log(`[ClawBot] Gateway unreachable or failed, using Groq simulation for ${agentId}`);
      try {
        const simPrompt = `${fullTask}\n\nIMPORTANT: Keep your response concise (under 500 words). Provide actionable output only.`;
        const simResult = await callGroq(simPrompt, 30000);
        return NextResponse.json({
          result: simResult || `[${agentId}] Task completed: ${subtask}`,
          status: "completed",
          mode: "simulation",
          profileFound,
          warning: "Gateway unreachable, using simulation mode",
        });
      } catch (groqErr) {
        console.error(`[ClawBot] Groq simulation also failed for ${agentId}:`, groqErr);
        return NextResponse.json({
          result: `[${agentId}] Simulation unavailable. Task: ${subtask}`,
          status: "error",
          mode: "fallback",
          profileFound,
          error: "Both gateway and Groq unavailable",
        });
      }
    }

    // ===================== SUMMARIZE =====================
    if (action === "summarize") {
      const { task, completedAgents } = body as {
        task: string;
        completedAgents?: string[];
      };

      const prompt = `You are Claw Bot. The following task was just completed by your AI agent pipeline:
Task: "${task}"
Agents completed: ${completedAgents?.join(" → ") || "Planner → Researcher → Coder → Reviewer → Deployer"}
Write a brief 2 sentence executive summary of what was accomplished and the outcome. Be specific and confident. No bullet points. No dashes.`;

      try {
        const result = await callGroq(prompt);
        return NextResponse.json({
          result:
            result ||
            `Pipeline execution complete. All 5 agents processed "${task}" through the full lifecycle.`,
        });
      } catch {
        return NextResponse.json({
          result: `Pipeline execution complete. All 5 agents successfully processed "${task}" through the full development lifecycle.`,
        });
      }
    }

    // ===================== STATUS =====================
    if (action === "status") {
      const gatewayUp = await isGatewayReachable();
      return NextResponse.json({
        gateway: gatewayUp ? "online" : "offline",
        groq: !!GROQ_API_KEY,
        agentsDir: AGENTS_DIR,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("ClawBot API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
