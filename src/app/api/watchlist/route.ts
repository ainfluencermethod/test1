import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const characterId = req.nextUrl.searchParams.get("characterId");

  const items = await prisma.watchlistItem.findMany({
    where: characterId ? { characterId } : undefined,
    include: { character: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { characterId, profileUrl, notes } = body;

  // Extract username from Instagram URL
  let username = profileUrl;
  try {
    const url = new URL(profileUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length > 0) username = parts[0];
  } catch {
    // If not a URL, treat as username directly
    username = profileUrl.replace(/^@/, "");
  }

  const item = await prisma.watchlistItem.create({
    data: {
      characterId,
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      notes: notes || null,
    },
    include: { character: true },
  });
  return NextResponse.json(item);
}
