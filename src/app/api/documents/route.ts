import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("search");
  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { content: { contains: search, mode: "insensitive" } }];
  const docs = await prisma.document.findMany({ where, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const doc = await prisma.document.create({ data: { title: body.title, content: body.content, category: body.category || "general", tags: body.tags } });
  return NextResponse.json(doc);
}
