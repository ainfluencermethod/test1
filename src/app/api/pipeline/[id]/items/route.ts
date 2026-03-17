import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: runId } = await params;
  const body = await req.json();

  const item = await prisma.pipelineItem.create({
    data: {
      runId,
      characterId: body.characterId || null,
      sourceUrl: body.sourceUrl || null,
      sourceAccount: body.sourceAccount || null,
      sourceViews: body.sourceViews || null,
      sourceConcept: body.sourceConcept || null,
      isTransition: body.isTransition || false,
      step: "research",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(item);
}
