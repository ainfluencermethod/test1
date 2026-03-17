import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  try {
    const limit = req.nextUrl.searchParams.get('limit') || '50';
    const res = await fetch(`http://localhost:3003/api/ghl/contacts?limit=${limit}`);
    return NextResponse.json(await res.json());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
