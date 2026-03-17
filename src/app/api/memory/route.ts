import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || "/Users/jarvis/.openclaw/workspace";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const files: Array<{ name: string; date: string; content: string; size: number }> = [];

  // Read MEMORY.md
  try {
    const memPath = join(WORKSPACE, "MEMORY.md");
    const content = await readFile(memPath, "utf-8");
    const s = await stat(memPath);
    files.push({ name: "MEMORY.md", date: "Long-Term Memory", content, size: s.size });
  } catch {}

  // Read memory/*.md files
  try {
    const memDir = join(WORKSPACE, "memory");
    const entries = await readdir(memDir);
    const mdFiles = entries.filter(f => f.endsWith(".md")).sort().reverse();
    for (const f of mdFiles) {
      try {
        const content = await readFile(join(memDir, f), "utf-8");
        const s = await stat(join(memDir, f));
        const date = f.replace(".md", "");
        files.push({ name: f, date, content, size: s.size });
      } catch {}
    }
  } catch {}

  return NextResponse.json(files);
}
