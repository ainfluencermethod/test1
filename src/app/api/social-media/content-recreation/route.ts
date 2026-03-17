import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

/* ------------------------------------------------------------------ */
/*  File-based persistence for content recreation items                */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "content-recreation.json");

export interface ContentRecreationItem {
  id: string;
  originalUrl: string;
  originalAuthor: string;
  description: string;
  contentType: "reel" | "carousel" | "story" | "static" | "other";
  niche: string;
  estimatedViews: string;
  priority: "high" | "medium" | "low";
  status: "queued" | "scripting" | "filming" | "editing" | "posted" | "archived";
  ourUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

async function loadItems(): Promise<ContentRecreationItem[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveItems(items: ContentRecreationItem[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(items, null, 2));
}

/* GET — list all items */
export async function GET() {
  const items = await loadItems();
  return NextResponse.json({ items });
}

/* POST — create or update an item */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  const items = await loadItems();

  if (action === "create") {
    const item: ContentRecreationItem = {
      id: crypto.randomUUID(),
      originalUrl: body.originalUrl || "",
      originalAuthor: body.originalAuthor || "",
      description: body.description || "",
      contentType: body.contentType || "reel",
      niche: body.niche || "",
      estimatedViews: body.estimatedViews || "",
      priority: body.priority || "medium",
      status: body.status || "queued",
      ourUrl: body.ourUrl || "",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.unshift(item);
    await saveItems(items);
    return NextResponse.json({ success: true, item });
  }

  if (action === "update") {
    const idx = items.findIndex((i) => i.id === body.id);
    if (idx === -1)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    items[idx] = {
      ...items[idx],
      ...body,
      action: undefined,
      updatedAt: new Date().toISOString(),
    };
    delete (items[idx] as unknown as Record<string, unknown>).action;
    await saveItems(items);
    return NextResponse.json({ success: true, item: items[idx] });
  }

  if (action === "delete") {
    const filtered = items.filter((i) => i.id !== body.id);
    if (filtered.length === items.length)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await saveItems(filtered);
    return NextResponse.json({ success: true });
  }

  if (action === "reorder") {
    // Move item to new index
    const { id, newIndex } = body;
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [item] = items.splice(idx, 1);
    items.splice(newIndex, 0, item);
    await saveItems(items);
    return NextResponse.json({ success: true, items });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
