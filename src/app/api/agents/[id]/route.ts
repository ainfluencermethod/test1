import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agents/:id — get single agent with full details
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      activities: { take: 20, orderBy: { createdAt: "desc" } },
    },
  });

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

// PATCH /api/agents/:id — update agent config
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // Fields that can be updated
  const allowed = [
    "name", "role", "department", "avatar", "status", "currentTask",
    "skills", "type", "cronSchedule", "restrictions", "systemPrompt",
    "model", "parentId",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const agent = await prisma.agent.update({ where: { id }, data });

  // Log the update
  await prisma.activity.create({
    data: {
      agentId: id,
      action: `config updated: ${Object.keys(data).join(", ")}`,
      category: "config",
    },
  });

  return NextResponse.json(agent);
}
