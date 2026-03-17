import { NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN || "";
const ACTOR_ID = "apify~instagram-scraper";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in ms

const TARGET_ACCOUNTS = [
  "avabellereels",
  "bella.saintclaire",
  "emilyytrapp",
  "odessarosalive",
  "kaylamanousselis",
];

interface IGProfile {
  username: string;
  followersCount: number;
  postsCount: number;
  avgEngagementRate: number;
  topPosts: { url: string; likes: number; comments: number; timestamp: string }[];
  isMock: boolean;
}

// In-memory cache
let cachedData: { profiles: IGProfile[]; timestamp: number } | null = null;

function getMockProfiles(): IGProfile[] {
  return [
    { username: "avabellereels", followersCount: 124500, postsCount: 342, avgEngagementRate: 4.2, topPosts: [{ url: "https://instagram.com/p/mock1", likes: 8200, comments: 145, timestamp: "2026-03-14T12:00:00Z" }], isMock: true },
    { username: "bella.saintclaire", followersCount: 89200, postsCount: 218, avgEngagementRate: 3.8, topPosts: [{ url: "https://instagram.com/p/mock2", likes: 5400, comments: 92, timestamp: "2026-03-13T15:00:00Z" }], isMock: true },
    { username: "emilyytrapp", followersCount: 203000, postsCount: 567, avgEngagementRate: 5.1, topPosts: [{ url: "https://instagram.com/p/mock3", likes: 15300, comments: 287, timestamp: "2026-03-15T10:00:00Z" }], isMock: true },
    { username: "odessarosalive", followersCount: 67800, postsCount: 156, avgEngagementRate: 3.5, topPosts: [{ url: "https://instagram.com/p/mock4", likes: 3800, comments: 67, timestamp: "2026-03-12T18:00:00Z" }], isMock: true },
    { username: "kaylamanousselis", followersCount: 156700, postsCount: 423, avgEngagementRate: 4.7, topPosts: [{ url: "https://instagram.com/p/mock5", likes: 11200, comments: 198, timestamp: "2026-03-14T09:00:00Z" }], isMock: true },
  ];
}

async function scrapeWithApify(): Promise<IGProfile[] | null> {
  if (!APIFY_TOKEN) {
    console.error("No APIFY_API_TOKEN set");
    return null;
  }

  try {
    // Start the actor run
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: TARGET_ACCOUNTS.map((u) => `https://www.instagram.com/${u}/`),
          resultsType: "details",
          resultsLimit: 5,
          searchType: "user",
        }),
      }
    );

    if (!runRes.ok) {
      console.error(`Apify run failed: ${runRes.status}`);
      return null;
    }

    const runData = await runRes.json();
    const runId = runData?.data?.id;
    if (!runId) return null;

    // Wait for completion (max 2 min)
    let status = "RUNNING";
    let attempts = 0;
    while (status === "RUNNING" && attempts < 24) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      );
      const statusData = await statusRes.json();
      status = statusData?.data?.status || "FAILED";
      attempts++;
    }

    if (status !== "SUCCEEDED") {
      console.error(`Apify run status: ${status}`);
      return null;
    }

    // Fetch results
    const datasetId = runData?.data?.defaultDatasetId;
    if (!datasetId) return null;

    const resultsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
    );
    const results = await resultsRes.json();

    if (!Array.isArray(results)) return null;

    // Map Apify results to our format
    const profiles: IGProfile[] = TARGET_ACCOUNTS.map((username) => {
      const profile = results.find(
        (r: Record<string, unknown>) =>
          (r.username as string)?.toLowerCase() === username.toLowerCase() ||
          (r.ownerUsername as string)?.toLowerCase() === username.toLowerCase()
      );

      if (profile) {
        const followers = (profile.followersCount as number) || (profile.followedByCount as number) || 0;
        const posts = (profile.postsCount as number) || 0;
        const latestPosts = ((profile.latestPosts as Array<Record<string, unknown>>) || []).slice(0, 5);
        const totalEngagement = latestPosts.reduce((sum: number, p: Record<string, unknown>) => {
          return sum + ((p.likesCount as number) || 0) + ((p.commentsCount as number) || 0);
        }, 0);
        const avgEng = followers > 0 && latestPosts.length > 0
          ? (totalEngagement / latestPosts.length / followers) * 100
          : 0;

        return {
          username,
          followersCount: followers,
          postsCount: posts,
          avgEngagementRate: Math.round(avgEng * 10) / 10,
          topPosts: latestPosts.map((p: Record<string, unknown>) => ({
            url: (p.url as string) || "",
            likes: (p.likesCount as number) || 0,
            comments: (p.commentsCount as number) || 0,
            timestamp: (p.timestamp as string) || "",
          })),
          isMock: false,
        };
      }

      // Fallback for missing profiles
      const mock = getMockProfiles().find((m) => m.username === username);
      return mock || { username, followersCount: 0, postsCount: 0, avgEngagementRate: 0, topPosts: [], isMock: true };
    });

    return profiles;
  } catch (err) {
    console.error("Apify scrape error:", err);
    return null;
  }
}

export async function GET() {
  // Check cache
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json({
      success: true,
      cached: true,
      cacheAge: Math.round((Date.now() - cachedData.timestamp) / 60000),
      data: {
        profiles: cachedData.profiles,
        summary: buildSummary(cachedData.profiles),
        lastUpdated: new Date(cachedData.timestamp).toISOString(),
      },
    });
  }

  // Try live scrape
  const liveProfiles = await scrapeWithApify();

  if (liveProfiles) {
    cachedData = { profiles: liveProfiles, timestamp: Date.now() };
    return NextResponse.json({
      success: true,
      cached: false,
      data: {
        profiles: liveProfiles,
        summary: buildSummary(liveProfiles),
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  // Fallback to mock
  const mockProfiles = getMockProfiles();
  return NextResponse.json({
    success: true,
    cached: false,
    _note: "MOCK: Apify scrape failed or token missing. Using projected data.",
    data: {
      profiles: mockProfiles,
      summary: buildSummary(mockProfiles),
      lastUpdated: new Date().toISOString(),
    },
  });
}

function buildSummary(profiles: IGProfile[]) {
  const totalFollowers = profiles.reduce((a, p) => a + p.followersCount, 0);
  const avgEngagement = profiles.reduce((a, p) => a + p.avgEngagementRate, 0) / profiles.length;
  const totalPosts = profiles.reduce((a, p) => a + p.postsCount, 0);
  return {
    totalFollowers,
    avgEngagementRate: Math.round(avgEngagement * 10) / 10,
    totalPosts,
    accountCount: profiles.length,
  };
}
