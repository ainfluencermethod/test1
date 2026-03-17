import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";

const APPROVALS_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/approvals";
const SCORES_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/scores";
const PENDING_FILE = join(APPROVALS_DIR, "pending.json");
const HISTORY_FILE = join(APPROVALS_DIR, "history.json");

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  description: string;
  files?: string[];
  source?: string;
  target?: string;
  risk: string;
  status: string;
  created: string;
  resolvedAt?: string;
  reason?: string;
}

async function ensureDir() {
  try {
    await mkdir(APPROVALS_DIR, { recursive: true });
  } catch {
    // exists
  }
}

async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(filePath: string, data: unknown) {
  await ensureDir();
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// GET — return all pending approvals
export async function GET() {
  try {
    const pending = await readJSON<ApprovalItem[]>(PENDING_FILE, []);
    const history = await readJSON<ApprovalItem[]>(HISTORY_FILE, []);
    return NextResponse.json({ pending, history, count: pending.filter(p => p.status === "pending").length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read approvals" },
      { status: 500 }
    );
  }
}

// POST — approve, reject, or approve-and-build
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, reason } = body;

    if (!action || !id) {
      return NextResponse.json({ error: "Missing action or id" }, { status: 400 });
    }

    const pending = await readJSON<ApprovalItem[]>(PENDING_FILE, []);
    const history = await readJSON<ApprovalItem[]>(HISTORY_FILE, []);

    const idx = pending.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: `Item ${id} not found in pending` }, { status: 404 });
    }

    const item = { ...pending[idx] };
    const now = new Date().toISOString();

    if (action === "approve" || action === "approve-and-build") {
      item.status = "approved";
      item.resolvedAt = now;
    } else if (action === "reject") {
      item.status = "rejected";
      item.resolvedAt = now;
      if (reason) item.reason = reason;
    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Remove from pending, add to history
    pending.splice(idx, 1);
    history.unshift(item);

    await writeJSON(PENDING_FILE, pending);
    await writeJSON(HISTORY_FILE, history);

    // Boss Feedback Amplifier: update agent scores based on approval/rejection
    // Extract mission ID from the approval item (title or id)
    const missionId = item.id?.split("-approval")?.[0] || item.id;
    try {
      const scoreFiles = await readdir(SCORES_DIR).catch(() => [] as string[]);
      for (const file of scoreFiles) {
        if (!file.endsWith(".json")) continue;
        const filePath = join(SCORES_DIR, file);
        const raw = await readFile(filePath, "utf-8").catch(() => "[]");
        const agentScores = JSON.parse(raw) as Array<{
          mission: string;
          scores: Record<string, number>;
          average: number;
          bossApproved: boolean;
          bossNote: string;
          [key: string]: unknown;
        }>;

        let updated = false;
        for (const entry of agentScores) {
          // Match by mission prefix
          if (entry.mission.startsWith(missionId) || missionId.startsWith(entry.mission.split("-")[0])) {
            if (action === "approve" || action === "approve-and-build") {
              entry.bossApproved = true;
              entry.bossNote = "";
              // Boost scores by 0.5, capped at 10
              for (const dim of Object.keys(entry.scores)) {
                entry.scores[dim] = Math.min(10, Math.round((entry.scores[dim] + 0.5) * 10) / 10);
              }
              // Recalculate average
              const vals = Object.values(entry.scores);
              entry.average = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
            } else if (action === "reject") {
              entry.bossApproved = false;
              entry.bossNote = reason || "Rejected by boss";
              // Subtract 0.5 from all scores, floor at 1
              for (const dim of Object.keys(entry.scores)) {
                entry.scores[dim] = Math.max(1, Math.round((entry.scores[dim] - 0.5) * 10) / 10);
              }
              const vals = Object.values(entry.scores);
              entry.average = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
            }
            updated = true;
          }
        }

        if (updated) {
          await writeFile(filePath, JSON.stringify(agentScores, null, 2), "utf-8");
        }
      }
    } catch (amplifierErr) {
      console.error("[Boss Feedback Amplifier] Error updating scores:", amplifierErr);
      // Non-blocking: approval still succeeds even if score update fails
    }

    return NextResponse.json({
      ok: true,
      action,
      item,
      pendingCount: pending.filter(p => p.status === "pending").length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process approval" },
      { status: 500 }
    );
  }
}
