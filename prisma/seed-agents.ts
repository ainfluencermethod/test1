import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear existing agents
  await prisma.activity.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.agent.deleteMany();

  // === LEADERSHIP ===
  const boss = await prisma.agent.create({
    data: {
      name: "Boss",
      role: "CEO",
      department: "Leadership",
      type: "human",
      avatar: "👑",
      status: "working",
      skills: "Strategy,Vision,Decisions",
    },
  });

  const jarvis = await prisma.agent.create({
    data: {
      name: "Jarvis",
      role: "Chief Strategy Officer",
      department: "Leadership",
      type: "lead",
      avatar: "⚡",
      status: "working",
      skills: "Delegation,Planning,Analysis,Orchestration",
      parentId: boss.id,
      currentTask: "Building Mission Control",
    },
  });

  // === RESEARCH DEPARTMENT ===
  const researchLead = await prisma.agent.create({
    data: {
      name: "Research Lead",
      role: "Head of Research",
      department: "Research",
      type: "lead",
      avatar: "🔍",
      status: "idle",
      skills: "Coordination,Analysis,Reporting",
      parentId: jarvis.id,
    },
  });

  for (const agent of [
    { name: "Web Researcher", role: "Web Research Specialist", avatar: "🌐", skills: "Web Scraping,Trend Analysis" },
    { name: "Instagram Researcher", role: "IG Research Specialist", avatar: "📸", skills: "Instagram API,Reel Analysis,Competitor Tracking" },
    { name: "X Researcher", role: "X/Twitter Research Specialist", avatar: "🐦", skills: "X API,Sentiment Analysis,News Aggregation" },
    { name: "TikTok Researcher", role: "TikTok Research Specialist", avatar: "🎵", skills: "TikTok Trends,Viral Analysis,Audio Tracking" },
    { name: "YouTube Researcher", role: "YouTube Long Form Specialist", avatar: "📺", skills: "YouTube API,Video Analysis,SEO Research" },
  ]) {
    await prisma.agent.create({
      data: {
        ...agent,
        department: "Research",
        type: "agent",
        status: "idle",
        parentId: researchLead.id,
      },
    });
  }

  // === DEVELOPMENT DEPARTMENT ===
  const devLead = await prisma.agent.create({
    data: {
      name: "Main Dev",
      role: "Head of Development",
      department: "Development",
      type: "lead",
      avatar: "💻",
      status: "idle",
      skills: "Full-Stack,Next.js,APIs,Database",
      parentId: jarvis.id,
    },
  });

  await prisma.agent.create({
    data: {
      name: "QA Dev",
      role: "Quality Assurance",
      department: "Development",
      type: "agent",
      avatar: "🧪",
      status: "idle",
      skills: "Testing,Bug Detection,Code Review",
      parentId: devLead.id,
    },
  });

  // === PRODUCT DEPARTMENT ===
  const productUpdates = await prisma.agent.create({
    data: {
      name: "Product Updates",
      role: "Product Updates Analyst",
      department: "Product",
      type: "lead",
      avatar: "📦",
      status: "idle",
      skills: "Whop Analysis,Feature Tracking,User Feedback",
      parentId: jarvis.id,
      restrictions: "Checks Whop daily, finds 2 necessary updates",
    },
  });

  await prisma.agent.create({
    data: {
      name: "Product Upgrades",
      role: "Product Upgrades Strategist",
      department: "Product",
      type: "agent",
      avatar: "🚀",
      status: "idle",
      skills: "Strategy,Innovation,Cross-Dept Communication",
      parentId: productUpdates.id,
      restrictions: "Communicates with Research dept, suggests 2 upgrades daily",
    },
  });

  // === COPY DEPARTMENT ===
  const copyLead = await prisma.agent.create({
    data: {
      name: "YT Script Writer",
      role: "YouTube Long Form Scriptwriter",
      department: "Copy",
      type: "lead",
      avatar: "✍️",
      status: "idle",
      skills: "Scriptwriting,Storytelling,Voiceover Direction,Scene Planning",
      parentId: jarvis.id,
      restrictions: "Talks to Research dept. Scripts must include voiceover, scenes, animations, transitions. Must be fast-paced.",
    },
  });

  await prisma.agent.create({
    data: {
      name: "Sales Copywriter",
      role: "VSL & Sales Copy Specialist",
      department: "Copy",
      type: "agent",
      avatar: "💰",
      status: "idle",
      skills: "VSL Scripts,Landing Pages,Site Copy,Persuasion",
      parentId: copyLead.id,
    },
  });

  // === CONTENT CREATION DEPARTMENT ===
  const contentLead = await prisma.agent.create({
    data: {
      name: "YT Producer",
      role: "YouTube Long Form Producer",
      department: "Content Creation",
      type: "lead",
      avatar: "🎬",
      status: "idle",
      skills: "Video Production,Editing Direction,Thumbnail Design",
      parentId: jarvis.id,
      restrictions: "Gets scripts from Copy dept, produces full videos",
    },
  });

  await prisma.agent.create({
    data: {
      name: "Short-Form Creator",
      role: "Short-Form Content Specialist",
      department: "Content Creation",
      type: "agent",
      avatar: "📱",
      status: "idle",
      skills: "Reels,TikTok,AI Characters,Trend Recreation",
      parentId: contentLead.id,
      restrictions: "Communicates with Research, recreates trends with AI character in different environments/clothing",
    },
  });

  // === AB TESTING DEPARTMENT ===
  await prisma.agent.create({
    data: {
      name: "AB Tester",
      role: "AB Testing Specialist",
      department: "AB Testing",
      type: "lead",
      avatar: "⚖️",
      status: "idle",
      skills: "Split Testing,Analytics,Conversion Optimization",
      parentId: jarvis.id,
      restrictions: "After approval, communicates with Dev dept to implement",
    },
  });

  // === SEED SOME INITIAL ACTIVITIES ===
  const allAgents = await prisma.agent.findMany();
  const jarvisAgent = allAgents.find((a) => a.name === "Jarvis")!;

  await prisma.activity.createMany({
    data: [
      { agentId: jarvisAgent.id, action: "initialized Mission Control dashboard", category: "system" },
      { agentId: jarvisAgent.id, action: "seeded org structure with 15 agents across 6 departments", category: "system" },
      { agentId: jarvisAgent.id, action: "configured department hierarchy", category: "system" },
    ],
  });

  console.log(`✅ Seeded ${allAgents.length} agents across ${new Set(allAgents.map(a => a.department)).size} departments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
