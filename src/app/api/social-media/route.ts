import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory stores (would be DB tables in production)
let activityLog: Array<{
  id: string;
  action: string;
  platform: string;
  detail: string;
  timestamp: string;
}> = [];

let pendingPosts: Array<{
  id: string;
  platform: string;
  type: string;
  caption: string;
  mediaPath?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}> = [];

// GET /api/social-media — return full social media dashboard data
export async function GET() {
  // Get the Social Media Manager agent
  let agent = await prisma.agent.findFirst({
    where: { name: "Social Media Manager" },
  });

  // If agent doesn't exist, create it
  if (!agent) {
    agent = await prisma.agent.create({
      data: {
        name: "Social Media Manager",
        role: "agent",
        department: "Content Creation",
        status: "idle",
        avatar: "📱",
        skills: "instagram,tiktok,engagement,posting",
        type: "agent",
      },
    });
  }

  return NextResponse.json({
    agentStatus: agent.status,
    currentTask: agent.currentTask,
    phoneConnected: false, // Will be true when Appium detects a device
    instagram: {
      connected: false,
      warmup: null, // Will be populated from warmup-state.json
      todayActivity: { likes: 0, comments: 0, storyViews: 0, sessions: 0 },
      stats: { followers: "—", engagement: "—", posts: "—" },
    },
    tiktok: {
      connected: false,
      warmup: null,
      todayActivity: { likes: 0, comments: 0, storyViews: 0, sessions: 0 },
      stats: { followers: "—", engagement: "—", posts: "—" },
    },
    activityLog: activityLog.slice(0, 50),
    pendingPosts,
  });
}

// POST /api/social-media — manage posts queue and actions
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // Queue a new post
  if (action === "queue-post") {
    const { platform, type, caption, mediaPath } = body;
    const post = {
      id: crypto.randomUUID(),
      platform: platform || "instagram",
      type: type || "reel",
      caption: caption || "",
      mediaPath,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };
    pendingPosts.push(post);
    return NextResponse.json({ success: true, post });
  }

  // Approve a pending post
  if (action === "approve") {
    const { postId } = body;
    const post = pendingPosts.find((p) => p.id === postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    post.status = "approved";

    activityLog.unshift({
      id: crypto.randomUUID(),
      action: `Post approved: ${post.type}`,
      platform: post.platform,
      detail: post.caption.slice(0, 50),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, post });
  }

  // Reject a pending post
  if (action === "reject") {
    const { postId } = body;
    const post = pendingPosts.find((p) => p.id === postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    post.status = "rejected";
    return NextResponse.json({ success: true, post });
  }

  // Log activity (called by the automation scripts)
  if (action === "log-activity") {
    const { platform, actionName, detail } = body;
    const entry = {
      id: crypto.randomUUID(),
      action: actionName || "unknown",
      platform: platform || "instagram",
      detail: detail || "",
      timestamp: new Date().toISOString(),
    };
    activityLog.unshift(entry);
    if (activityLog.length > 200) activityLog = activityLog.slice(0, 200);
    return NextResponse.json({ success: true, entry });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
