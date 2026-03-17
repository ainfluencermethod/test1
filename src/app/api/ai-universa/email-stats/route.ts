import { NextResponse } from "next/server";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_TOKEN = process.env.GHL_API_TOKEN || "";
const LOCATION_ID = "TGsyH70nsz7y3hijuqTn";

interface WorkflowStats {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  unsubRate: number;
  isMock: boolean;
}

async function fetchWorkflows() {
  try {
    const res = await fetch(`${GHL_API}/workflows/?locationId=${LOCATION_ID}`, {
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      console.error(`GHL Workflows API: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("GHL Workflows fetch error:", err);
    return null;
  }
}

function getMockData(): WorkflowStats[] {
  return [
    { name: "Pre Event Warm Up (E1)", sent: 21292, opened: 8942, clicked: 2555, unsubscribed: 213, openRate: 42.0, clickRate: 12.0, unsubRate: 1.0, isMock: true },
    { name: "Value Bomb (E2)", sent: 21079, opened: 7378, clicked: 1897, unsubscribed: 169, openRate: 35.0, clickRate: 9.0, unsubRate: 0.8, isMock: true },
    { name: "Social Proof (E3)", sent: 20910, opened: 6482, clicked: 1464, unsubscribed: 147, openRate: 31.0, clickRate: 7.0, unsubRate: 0.7, isMock: true },
    { name: "Urgency Builder (E4)", sent: 20763, opened: 5814, clicked: 1246, unsubscribed: 125, openRate: 28.0, clickRate: 6.0, unsubRate: 0.6, isMock: true },
    { name: "Last Chance (E5)", sent: 20638, opened: 5366, clicked: 1032, unsubscribed: 103, openRate: 26.0, clickRate: 5.0, unsubRate: 0.5, isMock: true },
    { name: "Day of Event (E6)", sent: 20535, opened: 4928, clicked: 924, unsubscribed: 82, openRate: 24.0, clickRate: 4.5, unsubRate: 0.4, isMock: true },
    { name: "Post Event Follow Up (E7)", sent: 20453, opened: 4500, clicked: 818, unsubscribed: 61, openRate: 22.0, clickRate: 4.0, unsubRate: 0.3, isMock: true },
  ];
}

export async function GET() {
  const workflows = await fetchWorkflows();
  let stats: WorkflowStats[];
  let isLive = false;

  if (workflows?.workflows && Array.isArray(workflows.workflows)) {
    // Try to extract real stats
    // GHL workflow API may not expose email stats directly
    // If workflows exist but no stats, fall back to mock
    const realStats = workflows.workflows
      .filter((w: { name?: string }) => w.name?.toLowerCase().includes("universa") || w.name?.toLowerCase().includes("email"))
      .map((w: { name?: string; id?: string }) => ({
        name: w.name || "Unknown Workflow",
        sent: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        unsubRate: 0,
        isMock: false,
      }));

    if (realStats.length > 0 && realStats.some((s: WorkflowStats) => s.sent > 0)) {
      stats = realStats;
      isLive = true;
    } else {
      stats = getMockData();
    }
  } else {
    stats = getMockData();
  }

  const avgOpenRate = stats.reduce((a, s) => a + s.openRate, 0) / stats.length;
  const avgClickRate = stats.reduce((a, s) => a + s.clickRate, 0) / stats.length;
  const totalSent = stats.reduce((a, s) => a + s.sent, 0);
  const totalUnsubscribed = stats.reduce((a, s) => a + s.unsubscribed, 0);

  return NextResponse.json({
    success: true,
    isLive,
    _note: isLive ? "Live data from GHL" : "MOCK: GHL workflow API does not expose email stats. Data is projected based on industry benchmarks.",
    data: {
      workflows: stats,
      summary: {
        avgOpenRate: Math.round(avgOpenRate * 10) / 10,
        avgClickRate: Math.round(avgClickRate * 10) / 10,
        totalSent,
        totalUnsubscribed,
        unsubRate: totalSent > 0 ? Math.round((totalUnsubscribed / totalSent) * 1000) / 10 : 0,
      },
      lastUpdated: new Date().toISOString(),
    },
  });
}
