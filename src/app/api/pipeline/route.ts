import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const runs = await prisma.pipelineRun.findMany({
    orderBy: { date: "desc" },
    include: {
      items: {
        include: { character: true },
        orderBy: { createdAt: "asc" },
      },
    },
    take: 20,
  });
  return NextResponse.json(runs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const run = await prisma.pipelineRun.create({
    data: {
      niche: body.niche,
      status: "research",
    },
  });
  return NextResponse.json(run);
}
