import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

const LEDGER_PATH = join(process.cwd(), '..', 'memory', 'claw-knowledge-ledger.jsonl');

// ============================================================================
// CLAW Knowledge Ledger API
// Append-only log of learnings from each analytics cycle
// ============================================================================

function loadLedger(): Array<Record<string, unknown>> {
  try {
    if (!existsSync(LEDGER_PATH)) return [];
    const raw = readFileSync(LEDGER_PATH, 'utf-8');
    return raw.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

export async function GET() {
  const entries = loadLedger();
  return NextResponse.json({
    count: entries.length,
    entries,
    path: LEDGER_PATH,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const required = ['agent', 'category', 'learning', 'evidence', 'applicability', 'confidence'];
    const missing = required.filter(f => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Valid categories
    const validCategories = ['data_quality', 'methodology', 'strategy', 'process', 'failure_mode'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: `Invalid category. Use: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Valid confidence levels
    const validConfidence = ['HIGH', 'MEDIUM', 'TENTATIVE'];
    if (!validConfidence.includes(body.confidence)) {
      return NextResponse.json(
        { error: `Invalid confidence. Use: ${validConfidence.join(', ')}` },
        { status: 400 }
      );
    }

    // Get next ID
    const existing = loadLedger();
    const maxId = existing.length > 0
      ? Math.max(...existing.map(e => (e.id as number) || 0))
      : 0;

    const entry = {
      id: maxId + 1,
      date: new Date().toISOString().slice(0, 10),
      agent: body.agent,
      category: body.category,
      learning: body.learning,
      evidence: body.evidence,
      applicability: body.applicability,
      confidence: body.confidence,
    };

    const line = JSON.stringify(entry) + '\n';
    appendFileSync(LEDGER_PATH, line, 'utf-8');

    return NextResponse.json({ success: true, entry });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to append ledger entry' },
      { status: 500 }
    );
  }
}
