import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";

const SCORES_DIR = "/Users/jarvis/.openclaw/workspace/clawbot/scores";
const PATTERNS_FILE = "/Users/jarvis/.openclaw/workspace/clawbot/patterns/winners.json";

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

async function readPatterns(): Promise<WinnerPattern[]> {
  try {
    const raw = await readFile(PATTERNS_FILE, "utf-8");
    return JSON.parse(raw) as WinnerPattern[];
  } catch {
    return [];
  }
}

async function writePatterns(patterns: WinnerPattern[]) {
  await mkdir("/Users/jarvis/.openclaw/workspace/clawbot/patterns", { recursive: true }).catch(() => {});
  await writeFile(PATTERNS_FILE, JSON.stringify(patterns, null, 2), "utf-8");
}

// GET — return all patterns
export async function GET() {
  try {
    const patterns = await readPatterns();
    return NextResponse.json({ patterns, count: patterns.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read patterns" },
      { status: 500 }
    );
  }
}

// POST — extract new patterns from scores
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    if (action !== "extract") {
      return NextResponse.json({ error: "Unknown action. Use action: 'extract'" }, { status: 400 });
    }

    const existingPatterns = await readPatterns();
    const existingKeys = new Set(
      existingPatterns.map((p) => `${p.agent}:${p.mission}:${p.dimension}`)
    );

    // Scan all agent scores
    let files: string[];
    try {
      files = await readdir(SCORES_DIR);
    } catch {
      files = [];
    }

    const newPatterns: WinnerPattern[] = [];
    let nextId = existingPatterns.length + 1;

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const agentId = file.replace(".json", "");

      let scores: ScoreEntry[];
      try {
        const raw = await readFile(join(SCORES_DIR, file), "utf-8");
        scores = JSON.parse(raw);
      } catch {
        continue;
      }

      for (const entry of scores) {
        for (const [dim, val] of Object.entries(entry.scores)) {
          if (val >= 9) {
            const key = `${agentId}:${entry.mission}:${dim}`;
            if (!existingKeys.has(key)) {
              // Generate pattern description from notes
              const pattern = entry.notes
                ? `Excellence in ${dim}: ${entry.notes}`
                : `Scored ${val}/10 on ${dim} during ${entry.mission}`;

              newPatterns.push({
                id: `pat-${String(nextId++).padStart(3, "0")}`,
                agent: agentId,
                mission: entry.mission,
                dimension: dim,
                score: val,
                pattern,
                applicableTo: ["all"],
                date: entry.date,
              });
              existingKeys.add(key);
            }
          }
        }
      }
    }

    if (newPatterns.length > 0) {
      const allPatterns = [...existingPatterns, ...newPatterns];
      await writePatterns(allPatterns);
      return NextResponse.json({
        ok: true,
        newPatterns: newPatterns.length,
        totalPatterns: allPatterns.length,
        extracted: newPatterns,
      });
    }

    return NextResponse.json({
      ok: true,
      newPatterns: 0,
      totalPatterns: existingPatterns.length,
      message: "No new patterns found. All 9+ scores already have patterns.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to extract patterns" },
      { status: 500 }
    );
  }
}
