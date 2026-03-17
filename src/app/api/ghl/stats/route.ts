import { NextResponse } from 'next/server';
export async function GET() {
  try {
    const res = await fetch('http://localhost:3003/api/ghl/stats');
    return NextResponse.json(await res.json());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
