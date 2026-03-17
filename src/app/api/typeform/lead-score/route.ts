import { NextRequest, NextResponse } from "next/server";
import { getLeadScoreDashboardData } from "@/lib/typeform-lead-score";

function getBaseUrl(request: NextRequest) {
  return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

export async function GET(request: NextRequest) {
  try {
    const data = await getLeadScoreDashboardData(getBaseUrl(request));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Typeform lead score API error", error);
    return NextResponse.json(
      {
        connected: false,
        source: "none",
        sourcePath: null,
        error: "Failed to load Typeform lead score data",
      },
      { status: 500 },
    );
  }
}
