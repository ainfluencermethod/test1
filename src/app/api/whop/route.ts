import { NextResponse } from 'next/server';

const WHOP_KEY = process.env.WHOP_API_KEY || 'apik_wpvyaTyZ1m2PM_C3253700_C_54c8f49ee7a6e2a6f46a353e5910b847668629d970c0c5f19efaf089e1a60c';
const BASE = 'https://api.whop.com/api/v5';
const headers = { Authorization: `Bearer ${WHOP_KEY}` };

export async function GET() {
  try {
    const [companyRes, membershipsRes, productsRes] = await Promise.all([
      fetch(`${BASE}/company`, { headers, signal: AbortSignal.timeout(8000) }),
      fetch(`${BASE}/company/memberships?per=1`, { headers, signal: AbortSignal.timeout(8000) }),
      fetch(`${BASE}/company/products`, { headers, signal: AbortSignal.timeout(8000) }),
    ]);

    const company = companyRes.ok ? await companyRes.json() : null;
    const memberships = membershipsRes.ok ? await membershipsRes.json() : null;
    const products = productsRes.ok ? await productsRes.json() : null;

    const totalMembers = memberships?.pagination?.total ?? null;
    const productList = products?.data ?? products ?? [];

    return NextResponse.json({
      company: company ? { title: company.title, id: company.id } : null,
      totalMembers,
      products: Array.isArray(productList)
        ? productList.map((p: Record<string, unknown>) => ({
            id: p.id, name: p.name || p.title, visibility: p.visibility,
          }))
        : [],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
