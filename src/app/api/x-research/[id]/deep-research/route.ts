import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Trigger deep research on a specific item
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const item = await prisma.xReportItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  // Mark as researching — the actual deep research will be done by the agent
  await prisma.xReportItem.update({
    where: { id },
    data: { deepResearch: "__PENDING__" },
  });

  return NextResponse.json({ ok: true, message: "Deep research queued", itemId: id });
}

// Save deep research result
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const item = await prisma.xReportItem.update({
    where: { id },
    data: { deepResearch: body.deepResearch },
  });

  return NextResponse.json(item);
}
