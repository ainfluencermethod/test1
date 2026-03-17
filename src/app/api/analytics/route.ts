import { NextResponse } from 'next/server';

// Proxy to quiz-funnel server for custom analytics pixel data
// Falls back to returning empty data if server is unreachable

export async function GET() {
  try {
    // Try quiz-funnel server first (it may expose analytics)
    const res = await fetch('http://localhost:3003/api/analytics', {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
    // If no analytics endpoint, return placeholder structure
    return NextResponse.json({
      totalViews: 0,
      todayViews: 0,
      byPage: { free: 0, lp: 0, main: 0 },
      utmSources: {},
      referrers: {},
      recentVisitors: [],
      source: 'unavailable',
    });
  } catch {
    return NextResponse.json({
      totalViews: 0,
      todayViews: 0,
      byPage: { free: 0, lp: 0, main: 0 },
      utmSources: {},
      referrers: {},
      recentVisitors: [],
      source: 'unavailable',
    });
  }
}
