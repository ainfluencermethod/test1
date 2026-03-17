import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agents — list all agents with their config
export async function GET() {
  const agents = await prisma.agent.findMany({
    include: { children: true, parent: true, activities: { take: 5, orderBy: { createdAt: "desc" } } },
    orderBy: [{ department: "asc" }, { type: "asc" }],
  });
  return NextResponse.json(agents);
}

// POST /api/agents — create or sync agents
// The old template sync was removed in the dashboard rebuild.
// Agents are now managed directly through the Agent Editor UI.
export async function POST(req: NextRequest) {
  const { action, ...data } = await req.json();

  if (action === "sync-templates") {
    // Template sync was removed — agent-templates.ts was killed in Phase 2.
    // Use the Agent Editor (/dashboard/agents/[id]) to manage agents directly.
    return NextResponse.json({
      error: "Template sync removed in dashboard rebuild. Use Agent Editor to manage agents.",
      hint: "/dashboard/agents/[id]",
    }, { status: 410 });
  }

  if (action === "create") {
    const agent = await prisma.agent.create({
      data: {
        name: data.name || "New Agent",
        role: data.role || "",
        department: data.department || "general",
        avatar: data.avatar || "",
        type: data.type || "agent",
        model: data.model || "",
        status: "idle",
      },
    });
    return NextResponse.json(agent);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
