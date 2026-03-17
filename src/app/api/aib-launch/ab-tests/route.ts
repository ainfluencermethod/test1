import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_TESTS = [
  {
    pageName: "Freebie",
    elementName: "Headline",
    variantA: "Current headline (strong — keep it)",
    variantB: "",
    notes: "Add PDF mockup image, 'what's inside' bullets, put email field on page. Current headline is strong — keep it.",
  },
  {
    pageName: "OTO",
    elementName: "Headline",
    variantA: "EXTREMELY RARE (current)",
    variantB: "",
    notes: "Replace 'EXTREMELY RARE' headline. Add 15-min countdown timer. Add 'Cheat Sheet vs Full Method' comparison.",
  },
  {
    pageName: "Upsell",
    elementName: "Headline",
    variantA: "THE LAZIEST WAY TO EARN (current)",
    variantB: "",
    notes: "Replace 'THE LAZIEST WAY TO EARN' headline. Remove 'two choices' close. Add sticky mobile CTA. Consider $1 trial.",
  },
];

async function ensureSeeded() {
  const count = await prisma.aBTest.count();
  if (count === 0) {
    await prisma.aBTest.createMany({ data: SEED_TESTS });
  }
}

export async function GET() {
  await ensureSeeded();
  const tests = await prisma.aBTest.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const test = await prisma.aBTest.create({ data });
  return NextResponse.json(test);
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const updated = await prisma.aBTest.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}
