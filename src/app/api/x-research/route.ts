import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "30");

  const reports = await prisma.xReport.findMany({
    orderBy: { date: "desc" },
    include: {
      items: { orderBy: { createdAt: "asc" } },
    },
    take: limit,
  });
  return NextResponse.json(reports);
}

// Manual trigger for generating a report
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const dateStr = body.date || new Date().toISOString().split("T")[0];
  const date = new Date(dateStr + "T00:00:00.000Z");

  // Check if report already exists
  const existing = await prisma.xReport.findUnique({ where: { date } });
  if (existing) {
    return NextResponse.json({ error: "Report already exists for this date", report: existing }, { status: 409 });
  }

  // Create pending report — the cron/script will fill it
  const report = await prisma.xReport.create({
    data: {
      date,
      status: "pending",
    },
  });

  return NextResponse.json(report);
}
