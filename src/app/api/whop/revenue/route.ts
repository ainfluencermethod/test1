import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Parse Whop historical CSV export
function parseHistoricalCSV(): {
  gross: number;
  refunds: number;
  net: number;
  paidCount: number;
  byMonth: Record<string, { gross: number; refunds: number; net: number; count: number }>;
  byProduct: Record<string, { name: string; gross: number; refunds: number; count: number }>;
} {
  const csvPath = join(process.cwd(), '..', 'whop-historical.csv');
  if (!existsSync(csvPath)) {
    return { gross: 0, refunds: 0, net: 0, paidCount: 0, byMonth: {}, byProduct: {} };
  }

  const raw = readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { gross: 0, refunds: 0, net: 0, paidCount: 0, byMonth: {}, byProduct: {} };

  // Parse header
  const header = parseCSVLine(lines[0]);
  const idx = (name: string) => header.indexOf(name);

  let gross = 0;
  let refunds = 0;
  let paidCount = 0;
  const byMonth: Record<string, { gross: number; refunds: number; net: number; count: number }> = {};
  const byProduct: Record<string, { name: string; gross: number; refunds: number; count: number }> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 10) continue;

    const status = cols[idx('Status')] || '';
    const substatus = cols[idx('Sub Status')] || '';
    const description = cols[idx('Description')] || '';
    const productId = cols[idx('Product ID')] || 'unknown';
    const paidAt = cols[idx('Paid at')] || '';
    const createdAt = cols[idx('Created at')] || '';
    
    // Payment amount (what customer paid)
    const paymentAmount = parseFloat(cols[idx('Payment Amount')] || '0') || 0;
    const refundedAmount = parseFloat(cols[idx('Refunded amount')] || '0') || 0;
    const totalUSD = parseFloat(cols[idx('Total Amount USD (Including Fees)')] || '0') || 0;
    const totalAmount = parseFloat(cols[idx('Total Amount (Including Fees)')] || '0') || 0;

    // Only count succeeded/paid payments
    if (substatus !== 'succeeded' && substatus !== 'paid' && status !== 'paid') continue;

    // Use the best available amount
    const amount = totalUSD > 0 ? totalUSD : totalAmount > 0 ? totalAmount : paymentAmount;
    if (amount <= 0) continue;

    paidCount++;
    gross += amount;
    refunds += refundedAmount;

    // Month from paid_at or created_at
    const dateStr = paidAt || createdAt;
    let month = 'unknown';
    if (dateStr) {
      // Format: "2025-10-03 21:36:04 +0300" or similar
      const match = dateStr.match(/(\d{4})-(\d{2})/);
      if (match) month = `${match[1]}-${match[2]}`;
    }

    if (!byMonth[month]) byMonth[month] = { gross: 0, refunds: 0, net: 0, count: 0 };
    byMonth[month].gross += amount;
    byMonth[month].refunds += refundedAmount;
    byMonth[month].net += (amount - refundedAmount);
    byMonth[month].count++;

    if (!byProduct[productId]) byProduct[productId] = { name: description, gross: 0, refunds: 0, count: 0 };
    byProduct[productId].gross += amount;
    byProduct[productId].refunds += refundedAmount;
    byProduct[productId].count++;
  }

  const net = gross - refunds;
  return { gross: Math.round(gross * 100) / 100, refunds: Math.round(refunds * 100) / 100, net: Math.round(net * 100) / 100, paidCount, byMonth, byProduct };
}

// CSV line parser that handles quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function GET() {
  try {
    // 1. Parse historical CSV
    const historical = parseHistoricalCSV();

    // 2. Fetch live webhook data
    let live = { total_events: 0, total_revenue: 0, revenue_events: 0, by_product: {} as Record<string, { name: string; count: number; revenue: number }>, by_month: {} as Record<string, number>, by_event_type: {} as Record<string, number>, recent: [] as Array<Record<string, unknown>> };
    try {
      const res = await fetch('https://ainfluencerblueprint.com/api/whop-stats.php', {
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      });
      if (res.ok) {
        live = await res.json();
      }
    } catch {
      // Live data unavailable, continue with historical only
    }

    // 3. Combine monthly data
    const combinedMonths: Record<string, { gross: number; count: number }> = {};
    
    // Add historical months
    for (const [month, data] of Object.entries(historical.byMonth)) {
      if (month === 'unknown') continue;
      combinedMonths[month] = { gross: data.net, count: data.count };
    }

    // Add live months
    if (live.by_month && typeof live.by_month === 'object') {
      for (const [month, amount] of Object.entries(live.by_month)) {
        if (!combinedMonths[month]) combinedMonths[month] = { gross: 0, count: 0 };
        combinedMonths[month].gross += amount as number;
      }
    }

    // Sort months
    const sortedMonths = Object.entries(combinedMonths)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, revenue: Math.round(data.gross * 100) / 100, count: data.count }));

    // 4. Combine product data
    const combinedProducts: Record<string, { name: string; revenue: number; count: number }> = {};
    for (const [pid, data] of Object.entries(historical.byProduct)) {
      combinedProducts[pid] = { name: data.name, revenue: data.gross - data.refunds, count: data.count };
    }
    if (live.by_product && typeof live.by_product === 'object') {
      for (const [pid, data] of Object.entries(live.by_product)) {
        const d = data as { name: string; count: number; revenue: number };
        if (!combinedProducts[pid]) combinedProducts[pid] = { name: d.name || pid, revenue: 0, count: 0 };
        combinedProducts[pid].revenue += d.revenue;
        combinedProducts[pid].count += d.count;
      }
    }

    return NextResponse.json({
      historical: {
        gross: historical.gross,
        refunds: historical.refunds,
        net: historical.net,
        paidCount: historical.paidCount,
      },
      live: {
        revenue: live.total_revenue,
        events: live.total_events,
        revenueEvents: live.revenue_events,
        eventTypes: live.by_event_type,
        recent: live.recent,
      },
      combined: {
        totalRevenue: Math.round((historical.net + live.total_revenue) * 100) / 100,
        totalTransactions: historical.paidCount + (live.revenue_events || 0),
        monthlyRevenue: sortedMonths,
        products: Object.entries(combinedProducts).map(([id, d]) => ({
          id, name: d.name, revenue: Math.round(d.revenue * 100) / 100, count: d.count,
        })).sort((a, b) => b.revenue - a.revenue),
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
