import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const BASE_PATHS: Record<string, string> = {
  preevent: "/Users/jarvis/.openclaw/workspace/clawbot/missions/005-email-sequence/deploy",
  event: "/Users/jarvis/.openclaw/workspace/clawbot/missions/006-event-sales-emails/deploy",
  sales: "/Users/jarvis/.openclaw/workspace/clawbot/missions/006-event-sales-emails/deploy",
  urgency: "/Users/jarvis/.openclaw/workspace/clawbot/missions/006-event-sales-emails/deploy",
};

function getFilename(flow: string, num: string): string {
  switch (flow) {
    case "preevent":
      return `email-${num.padStart(2, "0")}.html`;
    case "event":
      return `event-e${num.toLowerCase()}.html`;
    case "sales":
      return `sales-s${num}.html`;
    case "urgency":
      return `urgency-u${num}.html`;
    default:
      return "";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flow = searchParams.get("flow");
  const num = searchParams.get("num");

  if (!flow || !num) {
    return NextResponse.json(
      { html: "", exists: false, error: "Missing flow or num parameter" },
      { status: 400 }
    );
  }

  const basePath = BASE_PATHS[flow];
  if (!basePath) {
    return NextResponse.json(
      { html: "", exists: false, error: "Invalid flow parameter" },
      { status: 400 }
    );
  }

  const filename = getFilename(flow, num);
  if (!filename) {
    return NextResponse.json(
      { html: "", exists: false, error: "Could not resolve filename" },
      { status: 400 }
    );
  }

  const filePath = path.join(basePath, filename);

  if (!existsSync(filePath)) {
    return NextResponse.json({ html: "", exists: false });
  }

  try {
    const html = await readFile(filePath, "utf-8");
    return NextResponse.json({ html, exists: true });
  } catch {
    return NextResponse.json(
      { html: "", exists: false, error: "Failed to read file" },
      { status: 500 }
    );
  }
}
