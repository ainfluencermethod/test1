import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [members, mission] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.missionStatement.findFirst({ orderBy: { updatedAt: "desc" } }),
  ]);
  return NextResponse.json({ members, mission });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.type === "mission") {
    const existing = await prisma.missionStatement.findFirst();
    if (existing) {
      const mission = await prisma.missionStatement.update({ where: { id: existing.id }, data: { content: body.content } });
      return NextResponse.json(mission);
    }
    const mission = await prisma.missionStatement.create({ data: { content: body.content } });
    return NextResponse.json(mission);
  }

  const member = await prisma.teamMember.create({ data: { name: body.name, role: body.role, type: body.memberType || "agent", avatar: body.avatar, description: body.description } });
  return NextResponse.json(member);
}
