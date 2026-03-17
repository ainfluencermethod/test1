import { NextResponse } from "next/server";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MISSIONS_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/missions";
const AUTONOMOUS_QUEUE_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/recommendations/autonomous-queue.json";

interface ParsedRecommendation {
  id: string;
  mission: string;
  missionId: string;
  from: string;
  move: string;
  whyNow: string;
  expectedImpact: string;
  effort: string;
  priority: number;
}

function parseRecommendationsMd(content: string, missionDir: string): ParsedRecommendation[] {
  const recs: ParsedRecommendation[] = [];
  const missionId = missionDir.split("/").pop() || "";
  
  // Extract mission name from first heading
  const missionMatch = content.match(/^#\s+.*?Mission\s+\d+[:\s]+(.+)/im);
  const missionName = missionMatch ? missionMatch[1].trim() : missionId;

  // Parse numbered recommendations (## #1, ## #2, etc.)
  const sections = content.split(/^##\s+#(\d+)/m);
  
  let priority = 0;
  for (let i = 1; i < sections.length; i += 2) {
    priority++;
    const block = sections[i + 1] || "";
    
    const fromMatch = block.match(/\*\*From:\*\*\s*(.+)/i);
    const moveMatch = block.match(/\*\*The Move:\*\*\s*(.+)/i);
    const whyMatch = block.match(/\*\*Why Now:\*\*\s*(.+)/i);
    const impactMatch = block.match(/\*\*Expected Impact:\*\*\s*(.+)/i);
    const effortMatch = block.match(/\*\*Effort:\*\*\s*(.+)/i);

    if (moveMatch) {
      recs.push({
        id: `${missionId}-rec-${priority}`,
        mission: missionName,
        missionId,
        from: fromMatch ? fromMatch[1].trim() : "Unknown",
        move: moveMatch[1].trim(),
        whyNow: whyMatch ? whyMatch[1].trim() : "",
        expectedImpact: impactMatch ? impactMatch[1].trim() : "",
        effort: effortMatch ? effortMatch[1].trim() : "",
        priority,
      });
    }
  }

  // Also parse "Individual Agent Recommendations" section
  const individualSection = content.split(/^## Individual Agent Recommendations/m)[1];
  if (individualSection) {
    const agentBlocks = individualSection.split(/^### /m).filter(Boolean);
    for (const block of agentBlocks) {
      const nameMatch = block.match(/^(.+?)(?:\s+💡|\n)/);
      const moveMatch = block.match(/\*\*The Move:\*\*\s*(.+)/i);
      const whyMatch = block.match(/\*\*Why Now:\*\*\s*(.+)/i);
      const impactMatch = block.match(/\*\*Expected Impact:\*\*\s*(.+)/i);
      const effortMatch = block.match(/\*\*Effort:\*\*\s*(.+)/i);

      if (moveMatch && nameMatch) {
        const agentName = nameMatch[1].trim();
        // Skip if already captured in numbered section
        const alreadyExists = recs.some(r => r.from === agentName && r.move === moveMatch[1].trim());
        if (!alreadyExists) {
          priority++;
          recs.push({
            id: `${missionId}-agent-${priority}`,
            mission: missionName,
            missionId,
            from: agentName,
            move: moveMatch[1].trim(),
            whyNow: whyMatch ? whyMatch[1].trim() : "",
            expectedImpact: impactMatch ? impactMatch[1].trim() : "",
            effort: effortMatch ? effortMatch[1].trim() : "",
            priority: priority + 10, // Lower priority for non-ranked recs
          });
        }
      }
    }
  }

  return recs;
}

// GET: Aggregate recommendations from all missions
export async function GET() {
  try {
    const missionDirs = await readdir(MISSIONS_DIR);
    const allRecs: ParsedRecommendation[] = [];

    for (const dir of missionDirs) {
      const recPath = join(MISSIONS_DIR, dir, "agent-recommendations.md");
      if (!existsSync(recPath)) continue;

      try {
        const content = await readFile(recPath, "utf-8");
        const recs = parseRecommendationsMd(content, join(MISSIONS_DIR, dir));
        allRecs.push(...recs);
      } catch {
        // Skip unreadable files
      }
    }

    // Sort: by mission (newest first based on dir name), then by priority
    allRecs.sort((a, b) => {
      const missionCmp = b.missionId.localeCompare(a.missionId);
      if (missionCmp !== 0) return missionCmp;
      return a.priority - b.priority;
    });

    return NextResponse.json({
      success: true,
      recommendations: allRecs,
      count: allRecs.length,
      missions: [...new Set(allRecs.map(r => r.missionId))],
    });
  } catch (err) {
    console.error("Recommendations GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}

// POST: Activate a recommendation (add to autonomous queue)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, recommendation } = body as { action: string; recommendation: ParsedRecommendation };

    if (action === "activate") {
      if (!recommendation?.id || !recommendation?.move) {
        return NextResponse.json({ error: "Missing recommendation data" }, { status: 400 });
      }

      // Load or create queue
      const queueDir = join(AUTONOMOUS_QUEUE_FILE, "..");
      if (!existsSync(queueDir)) await mkdir(queueDir, { recursive: true });

      let queue: Array<{ id: string; title: string; source: string; addedAt: string; status: string; priority: string; agents: string[] }> = [];
      if (existsSync(AUTONOMOUS_QUEUE_FILE)) {
        try {
          const data = await readFile(AUTONOMOUS_QUEUE_FILE, "utf-8");
          queue = JSON.parse(data);
        } catch { /* fresh queue */ }
      }

      // Check for duplicates
      if (queue.some(q => q.id === recommendation.id)) {
        return NextResponse.json({ success: false, error: "Already in queue" });
      }

      queue.push({
        id: recommendation.id,
        title: recommendation.move,
        source: `${recommendation.mission} (${recommendation.from})`,
        addedAt: new Date().toISOString(),
        status: "queued",
        priority: recommendation.priority <= 3 ? "high" : "medium",
        agents: [recommendation.from.toLowerCase().replace(/\s+/g, "-")],
      });

      await writeFile(AUTONOMOUS_QUEUE_FILE, JSON.stringify(queue, null, 2));

      return NextResponse.json({
        success: true,
        message: `Activated: ${recommendation.move.slice(0, 60)}...`,
        queueLength: queue.length,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Recommendations POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
