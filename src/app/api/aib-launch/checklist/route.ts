import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_ITEMS = [
  "Install Meta Pixel",
  "Install GA4",
  "Set up GoHighLevel automations",
  "Load email sequence",
  "Fix freebie page (add mockup, bullets, inline form)",
  "Rewrite OTO headline",
  "Add countdown timer to OTO",
  "Build downsell page",
  "Rewrite upsell headline",
  "QA funnel on mobile",
  "Test email automations",
  "Schedule launch emails",
  "Send Day 0 warm-up email",
];

async function ensureSeeded() {
  const count = await prisma.launchChecklist.count();
  if (count === 0) {
    await prisma.launchChecklist.createMany({
      data: SEED_ITEMS.map((item) => ({ item })),
    });
  }
}

export async function GET() {
  await ensureSeeded();
  const items = await prisma.launchChecklist.findMany({
    orderBy: { updatedAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { id, checked } = await req.json();
  const updated = await prisma.launchChecklist.update({
    where: { id },
    data: { checked },
  });
  return NextResponse.json(updated);
}
