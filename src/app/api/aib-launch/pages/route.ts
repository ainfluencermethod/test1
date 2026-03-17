import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_PAGES = [
  {
    pageName: "Freebie",
    sectionName: "Hero",
    content: "AI Character GPS — Free Download",
    suggestions: "Add PDF mockup image above the fold. Add 'what's inside' bullet list. Put email capture field directly on the page instead of redirecting.",
  },
  {
    pageName: "Freebie",
    sectionName: "Body",
    content: "Download your free AI Character GPS guide",
    suggestions: "Add social proof (number of downloads). Add testimonial snippet.",
  },
  {
    pageName: "OTO",
    sectionName: "Hero",
    content: "The AI Influencer Method — $27",
    suggestions: "Replace 'EXTREMELY RARE' headline with benefit-driven copy. Add 15-minute countdown timer. Add 'Cheat Sheet vs Full Method' comparison table.",
  },
  {
    pageName: "OTO",
    sectionName: "Pricing",
    content: "$27 one-time",
    suggestions: "Add strikethrough original price. Show value stack. Add guarantee badge.",
  },
  {
    pageName: "Upsell",
    sectionName: "Hero",
    content: "AI Influencer Blueprint Community",
    suggestions: "Replace 'THE LAZIEST WAY TO EARN' headline. Remove 'two choices' close. Add sticky mobile CTA button. Consider offering $1 trial.",
  },
  {
    pageName: "Upsell",
    sectionName: "Pricing",
    content: "$97/mo or $497/yr",
    suggestions: "Emphasize yearly savings more prominently. Add member count social proof. Add 'cancel anytime' reassurance.",
  },
];

async function ensureSeeded() {
  const count = await prisma.pageEdit.count();
  if (count === 0) {
    await prisma.pageEdit.createMany({ data: SEED_PAGES });
  }
}

export async function GET() {
  await ensureSeeded();
  const pages = await prisma.pageEdit.findMany({
    orderBy: { pageName: "asc" },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const page = await prisma.pageEdit.create({ data });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const updated = await prisma.pageEdit.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}
