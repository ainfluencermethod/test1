import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOGS_DIR = "/Users/jarvis/.openclaw/workspace/tools/social-media-manager/logs";

interface SessionLog {
  filename: string;
  date: string;
  time: string;
  reels: number;
  likes: number;
  saves: number;
  comments: number;
  duration: string;
  durationSec: number;
  status: "success" | "error";
  error?: string;
}

function parseLogFile(filename: string, content: string): SessionLog {
  // Extract date/time from filename: warmup-2026-03-09_1830.log
  const match = filename.match(/warmup-(\d{4}-\d{2}-\d{2})_(\d{4})\.log/);
  const date = match ? match[1] : "unknown";
  const timeRaw = match ? match[2] : "0000";
  const time = `${timeRaw.slice(0, 2)}:${timeRaw.slice(2)}`;

  // Check for errors
  const hasError = content.includes("❌ ERROR:") || content.includes("exit 1)");
  const errorMatch = content.match(/❌ ERROR: (.+)/);

  // Parse final summary line: === SESSION COMPLETE === or status lines
  const summaryMatch = content.match(
    /📊 Reels: (\d+) \| ❤️ (\d+).*\| 🔖 (\d+).*\| 💬 (\d+)/
  );

  // Parse duration from summary
  const durationMatch = content.match(/⏱️ Duration: (\d+)s \((\d+) min\)/);

  // Also try the progress lines for last state
  const progressLines = content.match(
    /📊 (\d+) reels \| (\d+)❤️ (\d+)🔖 (\d+)💬/g
  );
  const lastProgress = progressLines
    ? progressLines[progressLines.length - 1]
    : null;
  const progressMatch = lastProgress?.match(
    /📊 (\d+) reels \| (\d+)❤️ (\d+)🔖 (\d+)💬/
  );

  let reels = 0,
    likes = 0,
    saves = 0,
    comments = 0,
    durationSec = 0,
    durationStr = "0 min";

  if (summaryMatch) {
    reels = parseInt(summaryMatch[1]);
    likes = parseInt(summaryMatch[2]);
    saves = parseInt(summaryMatch[3]);
    comments = parseInt(summaryMatch[4]);
  } else if (progressMatch) {
    reels = parseInt(progressMatch[1]);
    likes = parseInt(progressMatch[2]);
    saves = parseInt(progressMatch[3]);
    comments = parseInt(progressMatch[4]);
  }

  if (durationMatch) {
    durationSec = parseInt(durationMatch[1]);
    durationStr = `${durationMatch[2]} min`;
  } else {
    // Try parsing from elapsed time in progress lines
    const elapsedMatch = content.match(/(\d+)s elapsed/g);
    if (elapsedMatch) {
      const lastElapsed = elapsedMatch[elapsedMatch.length - 1];
      const secMatch = lastElapsed.match(/(\d+)s/);
      if (secMatch) {
        durationSec = parseInt(secMatch[1]);
        durationStr = `${Math.round(durationSec / 60)} min`;
      }
    }
  }

  return {
    filename,
    date,
    time,
    reels,
    likes,
    saves,
    comments,
    duration: durationStr,
    durationSec,
    status: hasError ? "error" : "success",
    error: errorMatch ? errorMatch[1].slice(0, 100) : undefined,
  };
}

export async function GET() {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      return NextResponse.json({ sessions: [], aggregate: { reels: 0, likes: 0, saves: 0, comments: 0 } });
    }

    const files = fs
      .readdirSync(LOGS_DIR)
      .filter((f) => f.startsWith("warmup-") && f.endsWith(".log"))
      .sort()
      .reverse();

    const sessions: SessionLog[] = [];
    for (const file of files.slice(0, 20)) {
      const content = fs.readFileSync(path.join(LOGS_DIR, file), "utf-8");
      sessions.push(parseLogFile(file, content));
    }

    // Aggregate today's stats
    const today = new Date().toISOString().split("T")[0];
    const todaySessions = sessions.filter((s) => s.date === today);
    const aggregate = {
      reels: todaySessions.reduce((sum, s) => sum + s.reels, 0),
      likes: todaySessions.reduce((sum, s) => sum + s.likes, 0),
      saves: todaySessions.reduce((sum, s) => sum + s.saves, 0),
      comments: todaySessions.reduce((sum, s) => sum + s.comments, 0),
    };

    return NextResponse.json({ sessions, aggregate });
  } catch (err) {
    return NextResponse.json(
      { error: String(err), sessions: [], aggregate: { reels: 0, likes: 0, saves: 0, comments: 0 } },
      { status: 500 }
    );
  }
}
