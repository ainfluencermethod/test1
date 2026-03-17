import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AgentEditor from "./AgentEditor";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      activities: { take: 15, orderBy: { createdAt: "desc" } },
    },
  });

  if (!agent) notFound();

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify(agent));

  return <AgentEditor agent={serialized} />;
}
