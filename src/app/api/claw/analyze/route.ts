import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const LEDGER_PATH = join(process.cwd(), '..', 'memory', 'claw-knowledge-ledger.jsonl');

// ============================================================================
// CLAW Analysis Engine
// Gathers all available data, sends to Groq with CLAW system prompt,
// returns structured analytics report
// ============================================================================

interface DataContext {
  revenue: Record<string, unknown> | null;
  subscriptionHealth: Record<string, unknown> | null;
  ghlStats: Record<string, unknown> | null;
  quizFunnel: Record<string, unknown> | null;
  whatsappStats: Record<string, unknown> | null;
  aiUniversaRegistrations: Record<string, unknown> | null;
  knowledgeLedger: Array<Record<string, unknown>>;
  collectedAt: string;
}

async function fetchSafe(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function loadLedger(): Array<Record<string, unknown>> {
  try {
    if (!existsSync(LEDGER_PATH)) return [];
    const raw = readFileSync(LEDGER_PATH, 'utf-8');
    return raw.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

function appendLedgerEntry(entry: Record<string, unknown>) {
  try {
    const line = JSON.stringify(entry) + '\n';
    appendFileSync(LEDGER_PATH, line, 'utf-8');
  } catch {
    // non-critical, silently fail
  }
}

function buildFocusPrompt(focus: string, data: DataContext): string {
  const ledgerSummary = data.knowledgeLedger.length > 0
    ? `\n\nKNOWLEDGE LEDGER (${data.knowledgeLedger.length} prior learnings):\n${data.knowledgeLedger.map(e => `  [${e.agent}/${e.confidence}] ${e.learning}`).join('\n')}`
    : '';

  const dataBlock = `
COLLECTED DATA (${data.collectedAt}):

REVENUE DATA:
${data.revenue ? JSON.stringify(data.revenue, null, 2) : 'Not available'}

SUBSCRIPTION HEALTH:
${data.subscriptionHealth ? JSON.stringify(data.subscriptionHealth, null, 2) : 'Not available'}

GHL LEAD/CONTACT STATS:
${data.ghlStats ? JSON.stringify(data.ghlStats, null, 2) : 'Not available'}

QUIZ FUNNEL STATS:
${data.quizFunnel ? JSON.stringify(data.quizFunnel, null, 2) : 'Not available'}

WHATSAPP GROUP STATS:
${data.whatsappStats ? JSON.stringify(data.whatsappStats, null, 2) : 'Not available'}

AI UNIVERSA REGISTRATIONS:
${data.aiUniversaRegistrations ? JSON.stringify(data.aiUniversaRegistrations, null, 2) : 'Not available'}
${ledgerSummary}
`;

  const focusInstructions: Record<string, string> = {
    aib: `FOCUS: AI Influencer Blueprint (AIB) analysis.
Analyze the evergreen recurring business ($97/mo + $497/yr Whop subscriptions).
Key areas: MRR trajectory, churn rate vs benchmarks, failed payment recovery opportunity, 
quiz funnel conversion rates, GHL lead pipeline health, content velocity impact on acquisition.
Identify the single highest impact action to grow MRR toward the $100K/mo target.`,

    aiuniversa: `FOCUS: AI Universa pre-event analysis.
Analyze readiness for the April 15, 2026 live event (€899.99 Normal / €2,499.99 VIP).
Key areas: Registration pipeline (LP → Survey → WhatsApp → Registration), WhatsApp group fill rates,
pre-launch email/content readiness, projected ticket sales based on current funnel metrics.
Identify blockers and the single most impactful action before launch.`,

    simulation: `FOCUS: AI Universa funnel simulation.
Run a projection model for the April 15 event:
  Given current registration numbers, WhatsApp members, and conversion benchmarks,
  project: Best case, Base case, Worst case scenarios for ticket sales and revenue.
  Factor in: Time remaining, marketing intensity needed, conversion rate assumptions.
  Be explicit about every assumption and its confidence level.`,

    all: `FOCUS: Full business analysis across both products.
Analyze BOTH AI Influencer Blueprint (evergreen recurring) and AI Universa (event launch).
Provide a unified strategic view: Where should time and resources be allocated right now?
Consider: Revenue urgency, launch timeline pressure, team capacity, data quality gaps.
Rank the top 3 priorities across the entire business.`,
  };

  return `${focusInstructions[focus] || focusInstructions.all}\n\n${dataBlock}`;
}

const CLAW_SYSTEM_PROMPT = `You are CLAW (Cognitive Learning & Analytics Workforce), a multi-agent analytics system.

Your team:
  NEXUS (Orchestrator): Task decomposition, delegation, synthesis
  FORGE (Data Engineer): Data quality assessment, cleaning, pipeline construction
  LENS (Analyst): Statistical analysis, hypothesis testing, pattern detection
  COMPASS (Strategist): Business context, recommendations, scenario planning
  SENTINEL (Reviewer): Quality assurance, bias detection, learning extraction

RULES:
  No hallucinated data. Only use numbers from the provided data.
  No false precision. Round appropriately.
  Every finding MUST have a confidence tag: HIGH / MEDIUM / LOW
  No dashes in copy. Use periods, commas, or rewrite sentences.
  Be direct and actionable. No fluff.
  Frame recommendations as decisions with expected outcomes.

Respond in this EXACT JSON structure:
{
  "executiveSummary": "2 to 4 sentences: the single most important finding and its implication",
  "keyFindings": [
    { "finding": "...", "confidence": "HIGH|MEDIUM|LOW", "agent": "FORGE|LENS|COMPASS|SENTINEL", "evidence": "..." }
  ],
  "recommendations": [
    { "action": "...", "expectedOutcome": "...", "priority": "urgent|important|opportunity", "assignee": "Boss|Jarvis|Team" }
  ],
  "methodology": "Brief description of data sources and methods used",
  "limitations": ["...", "..."],
  "confidenceDashboard": [
    { "claim": "...", "confidence": "HIGH|MEDIUM|LOW", "rationale": "..." }
  ],
  "lessonsLearned": [
    { "agent": "...", "category": "data_quality|methodology|strategy|process|failure_mode", "learning": "...", "evidence": "...", "applicability": "...", "confidence": "HIGH|MEDIUM|TENTATIVE" }
  ]
}

Return ONLY valid JSON. No markdown wrapping, no code fences.`;

export async function GET(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not configured. Add it to .env.local' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const focus = searchParams.get('focus') || 'all';

  if (!['aib', 'aiuniversa', 'simulation', 'all'].includes(focus)) {
    return NextResponse.json(
      { error: 'Invalid focus. Use: aib, aiuniversa, simulation, or all' },
      { status: 400 }
    );
  }

  const baseUrl = 'http://localhost:3000';

  // Gather all data in parallel
  const [revenue, subscriptionHealth, ghlStats, quizFunnel, whatsappStats, aiUniversaRegistrations] =
    await Promise.all([
      fetchSafe(`${baseUrl}/api/whop/revenue`),
      fetchSafe(`${baseUrl}/api/whop/health`),
      fetchSafe(`${baseUrl}/api/ghl/stats`),
      fetchSafe(`${baseUrl}/api/health`),
      fetchSafe(`${baseUrl}/api/whatsapp/stats`),
      fetchSafe(`${baseUrl}/api/ai-universa/registrations`),
    ]);

  const knowledgeLedger = loadLedger();

  const dataContext: DataContext = {
    revenue,
    subscriptionHealth,
    ghlStats,
    quizFunnel,
    whatsappStats,
    aiUniversaRegistrations,
    knowledgeLedger,
    collectedAt: new Date().toISOString(),
  };

  const userPrompt = buildFocusPrompt(focus, dataContext);

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
          { role: 'system', content: CLAW_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4000,
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

    // Parse the JSON response
    let report;
    try {
      // Strip any markdown code fences if present
      const cleaned = rawContent.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      report = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error: 'Failed to parse CLAW response as JSON',
          rawResponse: rawContent,
        },
        { status: 500 }
      );
    }

    // Auto-append lessons to knowledge ledger
    if (report.lessonsLearned && Array.isArray(report.lessonsLearned)) {
      const existingIds = knowledgeLedger.map(e => e.id as number);
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

      report.lessonsLearned.forEach((lesson: Record<string, unknown>, idx: number) => {
        appendLedgerEntry({
          id: maxId + idx + 1,
          date: new Date().toISOString().slice(0, 10),
          agent: lesson.agent || 'SENTINEL',
          category: lesson.category || 'process',
          learning: lesson.learning,
          evidence: lesson.evidence,
          applicability: lesson.applicability,
          confidence: lesson.confidence || 'MEDIUM',
        });
      });
    }

    return NextResponse.json({
      focus,
      analyzedAt: dataContext.collectedAt,
      dataSourcesAvailable: {
        revenue: !!revenue,
        subscriptionHealth: !!subscriptionHealth,
        ghlStats: !!ghlStats,
        quizFunnel: !!quizFunnel,
        whatsappStats: !!whatsappStats,
        aiUniversaRegistrations: !!aiUniversaRegistrations,
      },
      report,
      model: GROQ_MODEL,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error calling Groq' },
      { status: 500 }
    );
  }
}
