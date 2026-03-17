import { NextResponse } from "next/server";
import fs from "fs";

const PROFILE_PATH =
  "/Users/jarvis/.openclaw/workspace/tools/social-media-manager/behavior-profile.md";

export async function GET() {
  try {
    if (!fs.existsSync(PROFILE_PATH)) {
      return NextResponse.json({ content: null });
    }
    const content = fs.readFileSync(PROFILE_PATH, "utf-8");

    // Parse key metrics from the profile
    const swipeMedian =
      content.match(/Median:\s*([0-9.]+)s/i)?.[1] || "0.3";
    const pauseMedian =
      content.match(/Median:\s*([0-9.]+)s/)?.[1] || "0.5";
    const likeRate =
      content.match(/Like rate|liked.*?(\d+)%/i)?.[1] || "5";
    const saveRate =
      content.match(/Save rate|saved.*?(\d+\.?\d*)%/i)?.[1] || "1.5";
    const commentRate =
      content.match(/Comment rate|comment.*?(\d+)%/i)?.[1] || "2";

    return NextResponse.json({
      content,
      metrics: {
        swipeSpeed: `${swipeMedian}s`,
        pauseMedian: `${pauseMedian}s`,
        likeRate: `~${likeRate}%`,
        saveRate: `~${saveRate}%`,
        commentRate: `~${commentRate}%`,
        sessionLength: "10-30 min",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
