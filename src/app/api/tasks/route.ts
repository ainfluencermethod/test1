import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tasks = await prisma.task.findMany({ include: { project: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const task = await prisma.task.create({ data: { title: body.title, description: body.description, status: body.status || "todo", priority: body.priority || "medium", assignee: body.assignee, projectId: body.projectId || null, dueDate: body.dueDate ? new Date(body.dueDate) : null } });
  return NextResponse.json(task);
}
