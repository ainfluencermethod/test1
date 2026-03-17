import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
    const csvPath = join(process.cwd(), '..', 'whop-historical.csv');
    if (!existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    const raw = readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV empty' }, { status: 404 });
    }

    const header = parseCSVLine(lines[0]);
    const idx = (name: string) => header.indexOf(name);

    // Track unique emails by status
    const succeededEmails = new Set<string>();
    const churnedEmails = new Set<string>(); // refunded + resolution_lost + dispute_lost
    const failedPayments: { email: string; amount: number }[] = [];
    const successAmounts: number[] = [];
    const countryMap: Record<string, number> = {};

    // Monthly tracking
    const monthlyData: Record<string, { mrr: number; newSubs: number; churned: number }> = {};

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 10) continue;

      const substatus = cols[idx('Sub Status')] || cols[idx('Sub status')] || '';
      const email = (cols[idx('Email')] || '').toLowerCase().trim();
      const billingReason = cols[idx('Billing reason')] || '';
      const paymentAmount = parseFloat(cols[idx('Payment Amount')] || '0') || 0;
      const paidAt = cols[idx('Paid at')] || '';
      const createdAt = cols[idx('Created at')] || '';
      const country = cols[idx('Billing address country')] || '';

      if (!email) continue;

      // Country tracking
      if (country) {
        countryMap[country] = (countryMap[country] || 0) + 1;
      }

      // Succeeded payments
      if (substatus === 'succeeded') {
        succeededEmails.add(email);
        if (paymentAmount > 0) {
          successAmounts.push(paymentAmount);
        }

        // Monthly MRR
        const dateStr = paidAt || createdAt;
        const match = dateStr.match(/(\d{4})-(\d{2})/);
        if (match) {
          const month = `${match[1]}-${match[2]}`;
          if (!monthlyData[month]) monthlyData[month] = { mrr: 0, newSubs: 0, churned: 0 };
          monthlyData[month].mrr += paymentAmount;
          if (billingReason === 'subscription_create') {
            monthlyData[month].newSubs++;
          }
        }
      }

      // Churned emails
      if (['refunded', 'resolution_lost', 'dispute_lost'].includes(substatus)) {
        churnedEmails.add(email);
        const dateStr = createdAt || paidAt;
        const match = dateStr.match(/(\d{4})-(\d{2})/);
        if (match) {
          const month = `${match[1]}-${match[2]}`;
          if (!monthlyData[month]) monthlyData[month] = { mrr: 0, newSubs: 0, churned: 0 };
          monthlyData[month].churned++;
        }
      }

      // Failed payments
      if (substatus === 'failed') {
        failedPayments.push({ email, amount: paymentAmount });
      }
    }

    // Calculate metrics
    const activeSubscribers = [...succeededEmails].filter(e => !churnedEmails.has(e)).length;
    const churned = churnedEmails.size;
    const total = activeSubscribers + churned;
    const churnRate = total > 0 ? Math.round((churned / total) * 100) / 100 : 0;

    const avgOrderValue = successAmounts.length > 0
      ? Math.round((successAmounts.reduce((a, b) => a + b, 0) / successAmounts.length) * 100) / 100
      : 0;

    // Refund rate = refunded substatus count / total succeeded count
    const refundedCount = [...churnedEmails].length; // rough proxy
    const refundRate = (successAmounts.length + refundedCount) > 0
      ? Math.round((refundedCount / (successAmounts.length + refundedCount)) * 100) / 100
      : 0;

    const failedRevenue = Math.round(failedPayments.reduce((a, b) => a + b.amount, 0) * 100) / 100;

    // Monthly recurring sorted
    const monthlyRecurring = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        mrr: Math.round(data.mrr * 100) / 100,
        newSubs: data.newSubs,
        churned: data.churned,
      }));

    // Top countries sorted
    const topCountries = Object.entries(countryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([country, count]) => ({ country, count }));

    return NextResponse.json({
      activeSubscribers,
      churned,
      churnRate,
      avgOrderValue,
      refundRate,
      failedPayments: failedPayments.length,
      failedRevenue,
      monthlyRecurring,
      topCountries,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
