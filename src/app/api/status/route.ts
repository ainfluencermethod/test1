import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const status = JSON.parse(
      readFileSync('/Users/jarvis/.openclaw/workspace/clawbot/status.json', 'utf-8')
    );
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: 'Status file not found' }, { status: 503 });
  }
}
