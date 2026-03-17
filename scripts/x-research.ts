/**
 * X Research Script — runs daily at midnight
 * Searches X (Twitter) API for AI content/tools topics
 * Generates a summary report and stores in database
 * 
 * Usage: npx tsx scripts/x-research.ts [--date YYYY-MM-DD]
 * 
 * Requires: X_BEARER_TOKEN in .env.local
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Consolidated queries (4 instead of 8) to conserve API credits
// Each query uses OR to cover multiple topics in one call
const SEARCH_QUERIES = [
  "(AI influencer OR AI avatar OR virtual influencer) (tool OR strategy OR growth) -is:retweet lang:en",
  "(AI video generation OR Kling OR SeeDance OR Veo OR Wan) (new OR update OR release) -is:retweet lang:en",
  "(AI content creation OR AI workflow OR AI short form) (viral OR tutorial OR pipeline) -is:retweet lang:en",
  "(AI image generation OR \"Nano Banana\" OR Flux OR Midjourney) (update OR new OR workflow) -is:retweet lang:en",
];

const CATEGORIES = [
  "New Tool",
  "Tool Update",
  "Workflow",
  "Case Study",
  "Strategy",
  "Industry News",
];

interface Tweet {
  id: string;
  text: string;
  author_id?: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
}

interface UserMap {
  [id: string]: { name: string; username: string };
}

async function searchX(query: string, bearerToken: string): Promise<{ tweets: Tweet[]; users: UserMap }> {
  const params = new URLSearchParams({
    query,
    max_results: "15",
    "tweet.fields": "author_id,public_metrics,created_at",
    expansions: "author_id",
    "user.fields": "name,username",
    sort_order: "relevancy",
  });

  const res = await fetch(`https://api.x.com/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`X API error for "${query}": ${res.status} ${err}`);
    return { tweets: [], users: {} };
  }

  const data = await res.json();
  const tweets: Tweet[] = data.data || [];
  const users: UserMap = {};
  
  if (data.includes?.users) {
    for (const u of data.includes.users) {
      users[u.id] = { name: u.name, username: u.username };
    }
  }

  return { tweets, users };
}

function categorize(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("just launched") || lower.includes("introducing") || lower.includes("new tool") || lower.includes("just released")) return "New Tool";
  if (lower.includes("update") || lower.includes("v2") || lower.includes("v3") || lower.includes("now supports")) return "Tool Update";
  if (lower.includes("workflow") || lower.includes("pipeline") || lower.includes("how i") || lower.includes("tutorial")) return "Workflow";
  if (lower.includes("case study") || lower.includes("results") || lower.includes("grew to") || lower.includes("followers")) return "Case Study";
  if (lower.includes("strategy") || lower.includes("growth") || lower.includes("monetize") || lower.includes("tips")) return "Strategy";
  return "Industry News";
}

function summarize(text: string): string {
  // Simple extractive summary — take first 2 sentences, clean up
  const clean = text.replace(/https?:\/\/\S+/g, "").replace(/\n+/g, " ").trim();
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 2).join(". ").trim() + ".";
}

function engagementScore(metrics?: Tweet["public_metrics"]): number {
  if (!metrics) return 0;
  return (metrics.like_count * 1) + (metrics.retweet_count * 3) + (metrics.reply_count * 2);
}

async function main() {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    console.error("Missing X_BEARER_TOKEN in environment");
    process.exit(1);
  }

  // Parse date arg
  const dateIdx = process.argv.indexOf("--date");
  const dateFromFlag = process.argv.find(a => a.startsWith("--date="))?.split("=")[1];
  const dateFromNext = dateIdx >= 0 ? process.argv[dateIdx + 1] : undefined;
  const dateArg = dateFromFlag || dateFromNext || new Date().toISOString().split("T")[0];
  
  const reportDate = new Date(`${dateArg}T00:00:00.000Z`);
  if (isNaN(reportDate.getTime())) {
    console.error(`Invalid date: ${dateArg}`);
    process.exit(1);
  }
  console.log(`Generating X research report for ${dateArg}...`);

  // Collect all tweets
  const allTweets: Array<{
    tweet: Tweet;
    author: string;
    authorHandle: string;
    category: string;
    engagement: number;
  }> = [];

  const seen = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    console.log(`  Searching: "${query.slice(0, 50)}..."`);
    const { tweets, users } = await searchX(query, bearerToken);
    
    for (const tweet of tweets) {
      if (seen.has(tweet.id)) continue;
      seen.add(tweet.id);
      
      const user = tweet.author_id ? users[tweet.author_id] : undefined;
      allTweets.push({
        tweet,
        author: user?.name || "Unknown",
        authorHandle: user?.username || "unknown",
        category: categorize(tweet.text),
        engagement: engagementScore(tweet.public_metrics),
      });
    }

    // Rate limit: wait 1s between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // Sort by engagement and deduplicate similar content
  allTweets.sort((a, b) => b.engagement - a.engagement);
  const topTweets = allTweets.slice(0, 30);

  console.log(`  Found ${allTweets.length} unique tweets, keeping top ${topTweets.length}`);

  // Create or update report
  let report = await prisma.xReport.findUnique({ where: { date: reportDate } });
  
  if (report) {
    // Delete old items and recreate
    await prisma.xReportItem.deleteMany({ where: { reportId: report.id } });
    report = await prisma.xReport.update({
      where: { id: report.id },
      data: { status: "complete", summary: null },
    });
  } else {
    report = await prisma.xReport.create({
      data: { date: reportDate, status: "complete" },
    });
  }

  // Create items
  for (const entry of topTweets) {
    const metrics = entry.tweet.public_metrics;
    const engStr = metrics
      ? `${metrics.like_count}❤️ ${metrics.retweet_count}🔁 ${metrics.reply_count}💬`
      : "";

    await prisma.xReportItem.create({
      data: {
        reportId: report.id,
        tweetId: entry.tweet.id,
        author: entry.author,
        authorHandle: entry.authorHandle,
        content: entry.tweet.text,
        summary: summarize(entry.tweet.text),
        category: entry.category,
        url: `https://x.com/${entry.authorHandle}/status/${entry.tweet.id}`,
        engagement: engStr,
      },
    });
  }

  // Generate overall summary
  const categoryCounts: Record<string, number> = {};
  for (const entry of topTweets) {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
  }
  
  const summaryParts = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `${count} ${cat.toLowerCase()}`);

  await prisma.xReport.update({
    where: { id: report.id },
    data: {
      summary: `Found ${topTweets.length} relevant items: ${summaryParts.join(", ")}.`,
    },
  });

  console.log(`✅ Report generated: ${topTweets.length} items`);
  console.log(`   Categories: ${JSON.stringify(categoryCounts)}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
