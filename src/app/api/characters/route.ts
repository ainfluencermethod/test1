import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(characters);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const character = await prisma.character.create({
    data: {
      name: body.name,
      niche: body.niche,
      referenceImage: body.referenceImage,
      driveLink: body.driveLink,
      description: body.description,
    },
  });
  return NextResponse.json(character);
}
