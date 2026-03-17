import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_EMAILS = [
  { day: 0, subject: "I need to tell you something", sendTime: "Tuesday 10:00 AM", ctaLink: "" },
  { day: 1, subject: "your AI Character GPS is inside", sendTime: "Wednesday 10:00 AM", ctaLink: "Lead magnet + $27 OTO" },
  { day: 2, subject: "I moved back in with my parents at 25...", sendTime: "Thursday 10:00 AM", ctaLink: "$27 OTO / Blueprint" },
  { day: 3, subject: "months of failure. then this happened.", sendTime: "Friday 10:00 AM", ctaLink: "Blueprint" },
  { day: 4, subject: "the content formula behind 800 million views", sendTime: "Saturday 9:00 AM", ctaLink: "Blueprint membership" },
  { day: 5, subject: "€820,000 in 5 days...", sendTime: "Sunday 10:00 AM", ctaLink: "Blueprint membership" },
  { day: 6, subject: "I used to work 14-hour days...", sendTime: "Monday 10:00 AM", ctaLink: "Blueprint membership" },
  { day: 7, subject: "from that bedroom in Ljubljana...", sendTime: "Tuesday 10:00 AM", ctaLink: "Blueprint membership" },
  { day: 8, subject: "this is it.", sendTime: "Wednesday 8:00 AM", ctaLink: "Blueprint membership" },
  { day: 9, subject: "You're in. Here's what happens now.", sendTime: "Immediately after purchase", ctaLink: "Dashboard / Module 1" },
];

async function ensureSeeded() {
  const count = await prisma.launchEmail.count();
  if (count === 0) {
    await prisma.launchEmail.createMany({
      data: SEED_EMAILS.map((e) => ({
        ...e,
        previewText: "",
        body: "",
        status: "draft",
      })),
    });
  }
}

export async function GET() {
  await ensureSeeded();
  const emails = await prisma.launchEmail.findMany({
    orderBy: { day: "asc" },
  });
  return NextResponse.json(emails);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const email = await prisma.launchEmail.create({ data });
  return NextResponse.json(email);
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const updated = await prisma.launchEmail.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}
