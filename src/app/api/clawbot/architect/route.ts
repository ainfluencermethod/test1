import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";

const STATE_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/architect-state.json";
const QUEUE_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/autonomous-queue.json";
const APPROVALS_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/approvals/pending.json";

interface ArchitectState {
  lastHeartbeat: string | null;
  autonomousMode: boolean;
  activeMissions: number;
  pendingApprovals: number;
  lastAction: string;
  totalMissionsCompleted: number;
  totalHeartbeats: number;
}

async function readState(): Promise<ArchitectState> {
  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    return JSON.parse(raw) as ArchitectState;
  } catch {
    return {
      lastHeartbeat: null,
      autonomousMode: false,
      activeMissions: 0,
      pendingApprovals: 0,
      lastAction: "initialized",
      totalMissionsCompleted: 0,
      totalHeartbeats: 0,
    };
  }
}

async function writeState(state: ArchitectState) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

// GET — return The Architect's current status with live data
export async function GET() {
  try {
    const state = await readState();

    // Enrich with live data from queue and approvals
    let queuedMissions: Array<{ id: string; title: string; priority: string }> = [];
    let autonomousMode = state.autonomousMode;
    let activeMissions = 0;
    try {
      const queueRaw = await readFile(QUEUE_FILE, "utf-8");
      const queue = JSON.parse(queueRaw);
      autonomousMode = queue.mode === "on";
      queuedMissions = (queue.queue || [])
        .filter((q: { status: string }) => q.status === "queued")
        .map((q: { id: string; title: string; priority: string }) => ({
          id: q.id,
          title: q.title,
          priority: q.priority,
        }));
      activeMissions = (queue.queue || []).filter(
        (q: { status: string }) => q.status === "in-progress"
      ).length;
    } catch {
      // Queue file missing or invalid
    }

    let pendingApprovals = 0;
    try {
      const approvalsRaw = await readFile(APPROVALS_FILE, "utf-8");
      const approvals = JSON.parse(approvalsRaw);
      pendingApprovals = Array.isArray(approvals)
        ? approvals.filter((a: { status: string }) => a.status === "pending").length
        : 0;
    } catch {
      // Approvals file missing
    }

    // Calculate next heartbeat (every 30 min from last)
    let nextHeartbeat: string | null = null;
    if (state.lastHeartbeat) {
      const lastMs = new Date(state.lastHeartbeat).getTime();
      const nextMs = lastMs + 30 * 60 * 1000;
      nextHeartbeat = new Date(nextMs).toISOString();
    }

    return NextResponse.json({
      lastHeartbeat: state.lastHeartbeat,
      autonomousMode,
      activeMissions,
      pendingApprovals,
      queuedMissions,
      lastAction: state.lastAction,
      totalMissionsCompleted: state.totalMissionsCompleted,
      totalHeartbeats: state.totalHeartbeats,
      nextHeartbeat,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read architect state" },
      { status: 500 }
    );
  }
}

// POST — update architect state (called by heartbeat or dashboard)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const state = await readState();

    if (action === "heartbeat") {
      // Record a heartbeat
      state.lastHeartbeat = new Date().toISOString();
      state.totalHeartbeats += 1;
      if (body.lastAction) state.lastAction = body.lastAction;
      if (typeof body.activeMissions === "number") state.activeMissions = body.activeMissions;
      if (typeof body.pendingApprovals === "number") state.pendingApprovals = body.pendingApprovals;
      if (typeof body.totalMissionsCompleted === "number") state.totalMissionsCompleted = body.totalMissionsCompleted;
      await writeState(state);
      return NextResponse.json({ ok: true, state });
    }

    if (action === "toggle-autonomous") {
      // Toggle autonomous mode in both state and queue
      try {
        const queueRaw = await readFile(QUEUE_FILE, "utf-8");
        const queue = JSON.parse(queueRaw);
        queue.mode = queue.mode === "on" ? "off" : "on";
        state.autonomousMode = queue.mode === "on";
        await writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2), "utf-8");
      } catch {
        state.autonomousMode = !state.autonomousMode;
      }
      await writeState(state);
      return NextResponse.json({ ok: true, autonomousMode: state.autonomousMode });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update state" },
      { status: 500 }
    );
  }
}
