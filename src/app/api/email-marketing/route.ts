import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/email-marketing — list newsletter drafts & agent status
export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get Email Marketing agents
  const agents = await prisma.agent.findMany({
    where: { department: "Email Marketing" },
    include: {
      activities: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });

  // Get newsletter-related activities (drafts, sends, etc.)
  const newsletters = await prisma.activity.findMany({
    where: {
      category: "newsletter",
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { agent: true },
  });

  // Separate latest draft from history
  const latestDraft = newsletters.find((n) => n.status === "draft") || null;
  const history = newsletters.filter((n) => n.status !== "draft");

  return NextResponse.json({
    agents,
    latestDraft,
    history,
  });
}

// POST /api/email-marketing — create newsletter content
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, subject, content, agentId, status } = body;

  if (action === "create-draft") {
    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    // Find Email Copywriter if no agentId provided
    let writerId = agentId;
    if (!writerId) {
      const writer = await prisma.agent.findFirst({
        where: { name: "Email Copywriter" },
      });
      writerId = writer?.id || null;
    }

    const newsletter = await prisma.activity.create({
      data: {
        agentId: writerId,
        action: subject,
        details: content,
        category: "newsletter",
        status: status || "draft",
      },
    });

    return NextResponse.json({ success: true, newsletter });
  }

  if (action === "update-status") {
    const { id, newStatus } = body;
    if (!id || !newStatus) {
      return NextResponse.json(
        { error: "id and newStatus are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, newsletter: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
