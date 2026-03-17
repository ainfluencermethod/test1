import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const QUEUE_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/autonomous-queue.json";
const APPROVALS_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/approvals";

interface QueueItem {
  id: string;
  title: string;
  priority: string;
  source: string;
  agents: string[];
  status: string;
  startedAt?: string;
}

interface QueueData {
  mode: string;
  queue: QueueItem[];
}

async function readQueue(): Promise<QueueData> {
  try {
    const raw = await readFile(QUEUE_FILE, "utf-8");
    return JSON.parse(raw) as QueueData;
  } catch {
    return { mode: "off", queue: [] };
  }
}

async function writeQueue(data: QueueData) {
  await writeFile(QUEUE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET — return current autonomous queue and mode
export async function GET() {
  try {
    const data = await readQueue();
    const nextMission = data.queue.find((q) => q.status === "queued");
    return NextResponse.json({
      mode: data.mode,
      queue: data.queue,
      nextMission: nextMission || null,
      queuedCount: data.queue.filter((q) => q.status === "queued").length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read queue" },
      { status: 500 }
    );
  }
}

// POST — queue new mission, start next, toggle mode
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const data = await readQueue();

    if (action === "toggle-mode") {
      data.mode = data.mode === "on" ? "off" : "on";
      await writeQueue(data);
      return NextResponse.json({ ok: true, mode: data.mode });
    }

    if (action === "queue") {
      const { mission } = body;
      if (!mission || !mission.title) {
        return NextResponse.json({ error: "Missing mission data" }, { status: 400 });
      }
      const newItem: QueueItem = {
        id: mission.id || `auto-${Date.now()}`,
        title: mission.title,
        priority: mission.priority || "medium",
        source: mission.source || "manual",
        agents: mission.agents || [],
        status: "queued",
      };
      data.queue.push(newItem);
      await writeQueue(data);
      return NextResponse.json({ ok: true, queued: newItem });
    }

    if (action === "start-next") {
      const next = data.queue.find((q) => q.status === "queued");
      if (!next) {
        return NextResponse.json({ error: "No queued missions" }, { status: 404 });
      }
      next.status = "in-progress";
      next.startedAt = new Date().toISOString();
      await writeQueue(data);

      // Also add to pending approvals so boss sees the result
      try {
        await mkdir(APPROVALS_DIR, { recursive: true });
        const pendingPath = join(APPROVALS_DIR, "pending.json");
        let pending = [];
        try {
          pending = JSON.parse(await readFile(pendingPath, "utf-8"));
        } catch { /* empty */ }
        pending.push({
          id: `${next.id}-result`,
          type: "build",
          title: `Build Result: ${next.title}`,
          description: `Autonomous build started for: ${next.title}`,
          files: [],
          risk: next.priority === "high" ? "medium" : "low",
          status: "pending",
          created: new Date().toISOString(),
        });
        await writeFile(pendingPath, JSON.stringify(pending, null, 2), "utf-8");
      } catch {
        // Non-fatal
      }

      return NextResponse.json({ ok: true, started: next });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process" },
      { status: 500 }
    );
  }
}
