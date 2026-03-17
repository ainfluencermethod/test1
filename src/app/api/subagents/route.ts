import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://192.168.10.28:18789/tools/invoke', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'subagents',
        args: { action: 'list', recentMinutes: 1440 },
        sessionKey: 'main',
      }),
      signal: AbortSignal.timeout(10000),
    });
    const json = await res.json();
    const text = json?.result?.content?.[0]?.text;
    if (text) {
      return NextResponse.json(JSON.parse(text));
    }
    return NextResponse.json({ running: [], recent: [], queued: [] });
  } catch {
    return NextResponse.json({ running: [], recent: [], queued: [] });
  }
}
