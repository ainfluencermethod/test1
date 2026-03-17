import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Advisor API — Now proxies to CLAW analyze engine
// Kept for backward compatibility with the Command Center advisor button
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Call CLAW analyze with focus=all
    const clawRes = await fetch('http://localhost:3000/api/claw/analyze?focus=all', {
      signal: AbortSignal.timeout(30000),
    });

    if (!clawRes.ok) {
      const errData = await clawRes.json().catch(() => ({ error: `HTTP ${clawRes.status}` }));
      // If CLAW is not configured, fall back to basic logic
      if (clawRes.status === 503) {
        return fallbackAdvisor(req);
      }
      return NextResponse.json(errData, { status: clawRes.status });
    }

    const data = await clawRes.json();
    return NextResponse.json(data);
  } catch {
    // If CLAW unreachable, fall back to basic advisor
    return fallbackAdvisor(req);
  }
}

async function fallbackAdvisor(req: NextRequest) {
  try {
    const body = await req.json();
    const daysToLaunch = Math.max(0, Math.ceil(
      (new Date('2026-04-15').getTime() - Date.now()) / 86400000
    ));

    // Simple priority logic
    let recommendation;
    if (daysToLaunch <= 14) {
      recommendation = {
        priority: 'urgent',
        action: 'Focus all energy on AI Universa launch preparation. Cart opens soon.',
        impact: `Only ${daysToLaunch} days to launch. Every day counts.`,
        assignee: 'Full Team',
        reasoning: `With ${daysToLaunch} days remaining, pre-launch email sequences and ad campaigns must be priority #1.`,
      };
    } else if ((body.waFill ?? 0) < 50) {
      recommendation = {
        priority: 'important',
        action: 'Drive more survey traffic to fill WhatsApp groups for AI Universa.',
        impact: `WhatsApp groups at ${body.waFill?.toFixed(0) ?? 0}% capacity. Higher fill = more social proof + engagement.`,
        assignee: 'Jarvis',
        reasoning: 'WhatsApp group engagement is a leading indicator of event ticket sales.',
      };
    } else {
      recommendation = {
        priority: 'opportunity',
        action: 'Publish 3 pieces of content today across IG accounts to drive quiz funnel traffic.',
        impact: 'Each post has ~2% chance of going viral. Volume creates opportunities.',
        assignee: 'Content Team',
        reasoning: `${body.quizAudits ?? 0} quiz completions so far. More top of funnel content = more audits = more conversions.`,
      };
    }

    return NextResponse.json({ recommendation, daysToLaunch, source: 'fallback' });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Advisor error' },
      { status: 500 }
    );
  }
}
