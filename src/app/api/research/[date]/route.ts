import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readdir, readFile } from "fs/promises";
import path from "path";

const REPORTS_DIR = "/Users/jarvis/.openclaw/workspace/tools/ig-scraper/reports";

async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  let files: string[];
  try {
    files = await readdir(REPORTS_DIR);
  } catch {
    return NextResponse.json({
      date,
      igReports: [],
      webXYTReports: [],
      leadReports: [],
    });
  }

  const igReports: { hour: string; data: unknown[] }[] = [];
  const webXYTReports: { hour: string; content: string }[] = [];
  const leadReports: { type: string; content: string }[] = [];

  for (const f of files) {
    const filePath = path.join(REPORTS_DIR, f);

    const igMatch = f.match(new RegExp(`^${date}-(\\d{2})\\.json$`));
    if (igMatch) {
      const raw = await safeReadFile(filePath);
      if (raw) {
        try {
          igReports.push({ hour: igMatch[1], data: JSON.parse(raw) });
        } catch { /* skip */ }
      }
      continue;
    }

    const webMatch = f.match(new RegExp(`^research-web-x-yt-${date}-(\\d{2})\\.md$`));
    if (webMatch) {
      const raw = await safeReadFile(filePath);
      if (raw) webXYTReports.push({ hour: webMatch[1], content: raw });
      continue;
    }

    const leadMatch = f.match(new RegExp(`^research-lead-${date}-(noon|midnight|test)\\.md$`));
    if (leadMatch) {
      const raw = await safeReadFile(filePath);
      if (raw) leadReports.push({ type: leadMatch[1], content: raw });
      continue;
    }
  }

  return NextResponse.json({ date, igReports, webXYTReports, leadReports });
}
