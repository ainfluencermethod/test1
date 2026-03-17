import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/activities — recent activity feed
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const agentId = req.nextUrl.searchParams.get("agentId");

  const where = agentId ? { agentId } : {};
  const activities = await prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { agent: true },
  });

  return NextResponse.json(activities);
}

// POST /api/activities — log a new activity
export async function POST(req: NextRequest) {
  const { agentId, action, details, category, status } = await req.json();

  const activity = await prisma.activity.create({
    data: {
      agentId: agentId || null,
      action,
      details: details || null,
      category: category || null,
      status: status || "completed",
    },
    include: { agent: true },
  });

  // Update agent status if agentId provided
  if (agentId && status) {
    const agentStatus = status === "running" ? "working" : "idle";
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: agentStatus },
    });
  }

  return NextResponse.json(activity);
}
