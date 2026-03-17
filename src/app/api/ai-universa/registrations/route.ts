import { NextResponse } from "next/server";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_TOKEN = process.env.GHL_API_TOKEN || "";
const LOCATION_ID = "TGsyH70nsz7y3hijuqTn";
const TARGET_TAG = "source:ai-universa-apr2026";
const PREVIOUS_DB_COUNT = 21292;

interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateAdded?: string;
  tags?: string[];
  source?: string;
}

interface GHLResponse {
  contacts: GHLContact[];
  meta?: { total?: number; nextPageUrl?: string; startAfterId?: string; startAfter?: number };
}

async function fetchAllContacts(): Promise<GHLContact[]> {
  const allContacts: GHLContact[] = [];
  let startAfterId: string | undefined;
  let page = 0;
  const MAX_PAGES = 50; // Safety limit

  while (page < MAX_PAGES) {
    const params = new URLSearchParams({
      locationId: LOCATION_ID,
      limit: "100",
      query: TARGET_TAG,
    });
    if (startAfterId) {
      params.set("startAfterId", startAfterId);
    }

    try {
      const res = await fetch(`${GHL_API}/contacts/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${GHL_TOKEN}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 min
      });

      if (!res.ok) {
        console.error(`GHL API error: ${res.status} ${res.statusText}`);
        break;
      }

      const data: GHLResponse = await res.json();
      if (!data.contacts || data.contacts.length === 0) break;

      allContacts.push(...data.contacts);

      // Check for more pages
      if (data.meta?.startAfterId) {
        startAfterId = data.meta.startAfterId;
      } else if (data.contacts.length < 100) {
        break;
      } else {
        // Use last contact ID as cursor
        startAfterId = data.contacts[data.contacts.length - 1].id;
      }

      page++;
    } catch (err) {
      console.error("GHL fetch error:", err);
      break;
    }
  }

  return allContacts;
}

function getDailyBreakdown(contacts: GHLContact[]): Record<string, number> {
  const daily: Record<string, number> = {};
  for (const c of contacts) {
    if (c.dateAdded) {
      const day = c.dateAdded.substring(0, 10); // YYYY-MM-DD
      daily[day] = (daily[day] || 0) + 1;
    }
  }
  return daily;
}

export async function GET() {
  try {
    const contacts = await fetchAllContacts();

    // Filter for contacts with the target tag or created after March 15, 2026
    const cutoffDate = new Date("2026-03-15T00:00:00Z");
    const filtered = contacts.filter((c) => {
      const hasTag = c.tags?.some((t) => t.toLowerCase().includes("ai-universa-apr2026"));
      const isRecent = c.dateAdded ? new Date(c.dateAdded) >= cutoffDate : false;
      return hasTag || isRecent;
    });

    const dailyBreakdown = getDailyBreakdown(filtered);

    // Sort daily breakdown
    const sortedDays = Object.entries(dailyBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Recent signups (last 20)
    const recentSignups = filtered
      .sort((a, b) => {
        const da = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const db = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return db - da;
      })
      .slice(0, 20)
      .map((c) => ({
        id: c.id,
        name: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown",
        email: c.email || "",
        date: c.dateAdded || "",
        source: c.source || "direct",
      }));

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations: filtered.length,
        previousDatabase: PREVIOUS_DB_COUNT,
        combinedTotal: filtered.length + PREVIOUS_DB_COUNT,
        target: 5000,
        progressPercent: Math.min(100, (filtered.length / 5000) * 100),
        dailyBreakdown: sortedDays,
        recentSignups,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch registration data",
        data: {
          totalRegistrations: 0,
          previousDatabase: PREVIOUS_DB_COUNT,
          combinedTotal: PREVIOUS_DB_COUNT,
          target: 5000,
          progressPercent: 0,
          dailyBreakdown: [],
          recentSignups: [],
          lastUpdated: new Date().toISOString(),
          _note: "LIVE: API returned error, showing fallback",
        },
      },
      { status: 500 }
    );
  }
}
