import { NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ============================================================================
// CLAW Daily Briefing Generator
// Calls the CLAW analyze endpoint, then reformats as a morning briefing
// ============================================================================

const BRIEFING_SYSTEM_PROMPT = `You are CLAW's Daily Briefing Generator.
You receive a full CLAW analytics report and must distill it into a concise morning briefing.

RULES:
  No dashes in copy. Use periods, commas, or rewrite.
  Be extremely concise. This is a 60 second read.
  Every metric change must include direction (up/down/flat) and magnitude.
  Priorities must be actionable within the next 24 hours.

Respond in this EXACT JSON structure:
{
  "greeting": "Good morning! Here is your briefing for [date].",
  "topPriorities": [
    { "priority": "...", "why": "...", "urgency": "critical|high|normal" }
  ],
  "metricChanges": [
    { "metric": "...", "current": "...", "change": "...", "direction": "up|down|flat" }
  ],
  "alerts": [
    { "type": "warning|info|success", "message": "..." }
  ],
  "oneLiner": "Single sentence summary of the day's focus"
}

Return ONLY valid JSON. No markdown, no code fences. Maximum 3 priorities, 5 metric changes, 3 alerts.`;

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not configured' },
      { status: 503 }
    );
  }

  // Call the CLAW analyze endpoint for full analysis
  let clawReport;
  try {
    const res = await fetch('http://localhost:3000/api/claw/analyze?focus=all', {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return NextResponse.json(
        { error: 'CLAW analysis failed', detail: errData },
        { status: 502 }
      );
    }
    clawReport = await res.json();
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch CLAW analysis' },
      { status: 500 }
    );
  }

  // Send to Groq for briefing distillation
  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: BRIEFING_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.\n\nFull CLAW Report:\n${JSON.stringify(clawReport.report, null, 2)}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json(
        { error: `Groq API error: ${groqRes.status}`, detail: errText },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const rawContent = groqData.choices?.[0]?.message?.content || '';

    let briefing;
    try {
      const cleaned = rawContent.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      briefing = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse briefing response', rawResponse: rawContent },
        { status: 500 }
      );
    }

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      briefing,
      dataSourcesAvailable: clawReport.dataSourcesAvailable,
      model: GROQ_MODEL,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Briefing generation failed' },
      { status: 500 }
    );
  }
}
