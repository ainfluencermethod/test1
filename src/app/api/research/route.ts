import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readdir, readFile } from "fs/promises";
import path from "path";

const REPORTS_DIR = "/Users/jarvis/.openclaw/workspace/tools/ig-scraper/reports";

interface ReportSet {
  date: string;
  igReports: { hour: string; data: unknown[] }[];
  webXYTReports: { hour: string; content: string }[];
  leadReports: { type: string; content: string }[];
}

async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function getReportDates(): Promise<string[]> {
  let files: string[];
  try {
    files = await readdir(REPORTS_DIR);
  } catch {
    return [];
  }

  const dates = new Set<string>();
  for (const f of files) {
    // Match YYYY-MM-DD from various filename patterns
    const m = f.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) dates.add(m[1]);
  }

  return Array.from(dates).sort().reverse();
}

async function getReportsForDate(date: string): Promise<ReportSet> {
  let files: string[];
  try {
    files = await readdir(REPORTS_DIR);
  } catch {
    files = [];
  }

  const igReports: ReportSet["igReports"] = [];
  const webXYTReports: ReportSet["webXYTReports"] = [];
  const leadReports: ReportSet["leadReports"] = [];

  for (const f of files) {
    const filePath = path.join(REPORTS_DIR, f);

    // IG scraper JSON: YYYY-MM-DD-HH.json
    const igMatch = f.match(new RegExp(`^${date}-(\\d{2})\\.json$`));
    if (igMatch) {
      const raw = await safeReadFile(filePath);
      if (raw) {
        try {
          igReports.push({ hour: igMatch[1], data: JSON.parse(raw) });
        } catch { /* skip malformed */ }
      }
      continue;
    }

    // Web/X/YT research: research-web-x-yt-YYYY-MM-DD-HH.md
    const webMatch = f.match(new RegExp(`^research-web-x-yt-${date}-(\\d{2})\\.md$`));
    if (webMatch) {
      const raw = await safeReadFile(filePath);
      if (raw) webXYTReports.push({ hour: webMatch[1], content: raw });
      continue;
    }

    // Research lead reports: research-lead-YYYY-MM-DD-noon.md / midnight.md
    const leadMatch = f.match(new RegExp(`^research-lead-${date}-(noon|midnight|test)\\.md$`));
    if (leadMatch) {
      const raw = await safeReadFile(filePath);
      if (raw) leadReports.push({ type: leadMatch[1], content: raw });
      continue;
    }
  }

  return { date, igReports, webXYTReports, leadReports };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");
  const latest = req.nextUrl.searchParams.get("latest");

  if (dateParam) {
    const data = await getReportsForDate(dateParam);
    return NextResponse.json(data);
  }

  if (latest === "true") {
    const dates = await getReportDates();
    if (dates.length === 0)
      return NextResponse.json({ date: null, igReports: [], webXYTReports: [], leadReports: [] });
    const data = await getReportsForDate(dates[0]);
    return NextResponse.json(data);
  }

  // Return list of dates with report counts
  const dates = await getReportDates();
  const summary = [];
  for (const d of dates) {
    const reports = await getReportsForDate(d);
    summary.push({
      date: d,
      igCount: reports.igReports.length,
      webXYTCount: reports.webXYTReports.length,
      leadCount: reports.leadReports.length,
      totalReports:
        reports.igReports.length +
        reports.webXYTReports.length +
        reports.leadReports.length,
    });
  }

  return NextResponse.json({ dates: summary });
}
