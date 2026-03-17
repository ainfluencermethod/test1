import { promises as fs } from "fs";
import path from "path";

export type LeadGrade = "A" | "B" | "C" | "D";

export interface TypeformSubmission {
  id: string;
  submittedAt: string;
  respondentName?: string;
  email?: string;
  phone?: string;
  interest?: string;
  aiMaturity?: string;
  budget?: string;
  urgency?: string;
  blocker?: string;
  role?: string;
  score?: number;
  leadGrade?: LeadGrade;
  raw?: unknown;
}

export interface BreakdownItem {
  label: string;
  count: number;
}

export interface LeadScoreBucket {
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface LeadVolumePoint {
  date: string;
  count: number;
}

export interface LeadScoreDashboardData {
  connected: boolean;
  source: "jsonl" | "json" | "none";
  sourcePath: string | null;
  setup: {
    webhookUrl: string;
    jsonlPath: string;
    jsonPath: string;
    nextSteps: string[];
  };
  totals: {
    submissions: number;
    scoredSubmissions: number;
    averageScore: number;
  };
  gradeDistribution: Record<LeadGrade, number>;
  scoreBuckets: LeadScoreBucket[];
  responseVolume: LeadVolumePoint[];
  breakdowns: {
    interest: BreakdownItem[];
    aiMaturity: BreakdownItem[];
    budget: BreakdownItem[];
    urgency: BreakdownItem[];
    blocker: BreakdownItem[];
    role: BreakdownItem[];
  };
  latestSubmissions: TypeformSubmission[];
  submissions: TypeformSubmission[];
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), "data", "typeform");
const JSONL_PATH = path.join(DATA_DIR, "submissions.jsonl");
const JSON_PATH = path.join(DATA_DIR, "submissions.json");

function toTitleCase(value: string) {
  return value
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function gradeFromScore(score: number): LeadGrade {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

function scoreInterest(value?: string) {
  const key = value?.toLowerCase() ?? "";
  if (/(implement|done for you|consult|automation|client|sales|growth|system)/.test(key)) return 20;
  if (/(learn|training|education|strategy|support)/.test(key)) return 14;
  if (/(explore|curious|research)/.test(key)) return 8;
  return 6;
}

function scoreAiMaturity(value?: string) {
  const key = value?.toLowerCase() ?? "";
  if (/(scaled|system|team|production|advanced)/.test(key)) return 18;
  if (/(using|active|intermediate|implemented)/.test(key)) return 14;
  if (/(testing|beginner|starting)/.test(key)) return 9;
  return 5;
}

function scoreBudget(value?: string) {
  const key = value?.toLowerCase() ?? "";
  if (/(10000|10k|15000|15k|20000|20k|50000|50k|enterprise)/.test(key)) return 20;
  if (/(5000|5k|7500|7\.5k|8000|8k)/.test(key)) return 16;
  if (/(2000|2k|3000|3k|4000|4k)/.test(key)) return 11;
  if (/(1000|1k|under 1000|under 1k|small)/.test(key)) return 6;
  return 4;
}

function scoreUrgency(value?: string) {
  const key = value?.toLowerCase() ?? "";
  if (/(now|immediately|this week|urgent|asap)/.test(key)) return 18;
  if (/(this month|30 days|soon)/.test(key)) return 14;
  if (/(quarter|later|researching)/.test(key)) return 8;
  return 5;
}

function scoreRole(value?: string) {
  const key = value?.toLowerCase() ?? "";
  if (/(founder|owner|ceo|director)/.test(key)) return 16;
  if (/(manager|lead|head)/.test(key)) return 12;
  if (/(freelancer|consultant|operator)/.test(key)) return 10;
  return 7;
}

function blockerAdjustment(value?: string) {
  const key = value?.toLowerCase() ?? "";
  if (!key) return 0;
  if (/(no budget|cannot afford|too expensive)/.test(key)) return -10;
  if (/(no time|bandwidth)/.test(key)) return -6;
  if (/(need approval|team buy in|partner)/.test(key)) return -4;
  if (/(implementation|technical|clarity|strategy)/.test(key)) return -2;
  return -1;
}

export function computeLeadScore(submission: Partial<TypeformSubmission>) {
  const baseScore =
    scoreInterest(submission.interest) +
    scoreAiMaturity(submission.aiMaturity) +
    scoreBudget(submission.budget) +
    scoreUrgency(submission.urgency) +
    scoreRole(submission.role) +
    blockerAdjustment(submission.blocker);

  return clampScore(baseScore);
}

export function normalizeSubmission(input: Partial<TypeformSubmission> & { raw?: unknown }): TypeformSubmission {
  const submittedAt = normalizeText(input.submittedAt) ?? new Date().toISOString();
  const score = typeof input.score === "number" ? clampScore(input.score) : computeLeadScore(input);
  const leadGrade = input.leadGrade ?? gradeFromScore(score);

  return {
    id: normalizeText(input.id) ?? crypto.randomUUID(),
    submittedAt,
    respondentName: normalizeText(input.respondentName),
    email: normalizeText(input.email),
    phone: normalizeText(input.phone),
    interest: normalizeText(input.interest),
    aiMaturity: normalizeText(input.aiMaturity),
    budget: normalizeText(input.budget),
    urgency: normalizeText(input.urgency),
    blocker: normalizeText(input.blocker),
    role: normalizeText(input.role),
    score,
    leadGrade,
    raw: input.raw,
  };
}

function safeArrayValue(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim().length > 0);
      const normalized = normalizeText(first);
      if (normalized) return normalized;
      continue;
    }

    const normalized = normalizeText(value);
    if (normalized) return normalized;
  }

  return undefined;
}

function extractAnswerText(answer: Record<string, unknown>) {
  return safeArrayValue(
    answer.text,
    answer.email,
    answer.phone_number,
    answer.choice && typeof answer.choice === "object" ? (answer.choice as Record<string, unknown>).label : undefined,
    answer.boolean === true ? "Yes" : answer.boolean === false ? "No" : undefined,
    typeof answer.number === "number" ? String(answer.number) : undefined,
    answer.url,
    answer.file_url,
    answer.date,
    answer.choices && typeof answer.choices === "object"
      ? ((answer.choices as Record<string, unknown>).labels as string[] | undefined)?.join(", ")
      : undefined,
  );
}

function mapTypeformAnswers(payload: Record<string, unknown>) {
  const formResponse = (payload.form_response as Record<string, unknown> | undefined) ?? payload;
  const answers = Array.isArray(formResponse.answers) ? (formResponse.answers as Array<Record<string, unknown>>) : [];
  const hidden = (formResponse.hidden as Record<string, unknown> | undefined) ?? {};

  const mapped: Record<string, string | undefined> = {};

  for (const answer of answers) {
    const field = answer.field as Record<string, unknown> | undefined;
    const key = normalizeText(String(field?.ref ?? field?.id ?? ""))?.toLowerCase();
    const title = normalizeText(String(field?.title ?? ""))?.toLowerCase();
    const value = extractAnswerText(answer);
    if (!value) continue;

    const allKeys = [key, title].filter(Boolean) as string[];
    const match = allKeys.join(" ");

    if (!mapped.respondentName && /(name|full name)/.test(match)) mapped.respondentName = value;
    if (!mapped.email && /email/.test(match)) mapped.email = value;
    if (!mapped.phone && /(phone|whatsapp|mobile)/.test(match)) mapped.phone = value;
    if (!mapped.interest && /(interest|goal|need|service)/.test(match)) mapped.interest = value;
    if (!mapped.aiMaturity && /(ai maturity|maturity|experience|current ai|current use)/.test(match)) mapped.aiMaturity = value;
    if (!mapped.budget && /budget|investment/.test(match)) mapped.budget = value;
    if (!mapped.urgency && /(urgency|timeline|when)/.test(match)) mapped.urgency = value;
    if (!mapped.blocker && /(blocker|challenge|obstacle|concern)/.test(match)) mapped.blocker = value;
    if (!mapped.role && /(role|job title|position)/.test(match)) mapped.role = value;
  }

  return {
    id: normalizeText(String(formResponse.token ?? payload.event_id ?? "")) ?? crypto.randomUUID(),
    submittedAt: normalizeText(String(formResponse.submitted_at ?? payload.submitted_at ?? "")) ?? new Date().toISOString(),
    respondentName: mapped.respondentName ?? safeArrayValue(hidden.name),
    email: mapped.email ?? safeArrayValue(hidden.email),
    phone: mapped.phone ?? safeArrayValue(hidden.phone),
    interest: mapped.interest ?? safeArrayValue(hidden.interest),
    aiMaturity: mapped.aiMaturity ?? safeArrayValue(hidden.aiMaturity),
    budget: mapped.budget ?? safeArrayValue(hidden.budget),
    urgency: mapped.urgency ?? safeArrayValue(hidden.urgency),
    blocker: mapped.blocker ?? safeArrayValue(hidden.blocker),
    role: mapped.role ?? safeArrayValue(hidden.role),
    raw: payload,
  } satisfies Partial<TypeformSubmission> & { raw?: unknown };
}

export function submissionFromWebhookPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Webhook payload must be an object");
  }

  const mapped = mapTypeformAnswers(payload as Record<string, unknown>);
  return normalizeSubmission(mapped);
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonlFile(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => normalizeSubmission(JSON.parse(line) as Partial<TypeformSubmission>));
}

async function readJsonFile(filePath: string) {
  const raw = JSON.parse(await fs.readFile(filePath, "utf8")) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => normalizeSubmission(entry as Partial<TypeformSubmission>));
}

function sortByNewest(submissions: TypeformSubmission[]) {
  return [...submissions].sort((a, b) => {
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
}

function countBy<T extends string>(values: Array<T | undefined>) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = value ? toTitleCase(value) : "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function buildScoreBuckets(submissions: TypeformSubmission[]): LeadScoreBucket[] {
  const buckets: LeadScoreBucket[] = [
    { label: "0 to 24", min: 0, max: 24, count: 0 },
    { label: "25 to 49", min: 25, max: 49, count: 0 },
    { label: "50 to 74", min: 50, max: 74, count: 0 },
    { label: "75 to 100", min: 75, max: 100, count: 0 },
  ];

  for (const submission of submissions) {
    const score = submission.score ?? 0;
    const bucket = buckets.find((item) => score >= item.min && score <= item.max);
    if (bucket) bucket.count += 1;
  }

  return buckets;
}

function buildResponseVolume(submissions: TypeformSubmission[]): LeadVolumePoint[] {
  const counts = new Map<string, number>();
  for (const submission of submissions) {
    const date = submission.submittedAt.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildGradeDistribution(submissions: TypeformSubmission[]): Record<LeadGrade, number> {
  const distribution: Record<LeadGrade, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const submission of submissions) {
    distribution[submission.leadGrade ?? gradeFromScore(submission.score ?? 0)] += 1;
  }
  return distribution;
}

export async function appendSubmission(submission: TypeformSubmission) {
  await ensureDataDir();

  const existing = await findStoredSubmissionById(submission.id);
  if (existing) {
    return existing;
  }

  await fs.appendFile(JSONL_PATH, `${JSON.stringify(submission)}\n`, "utf8");
  return submission;
}

export async function findStoredSubmissionById(id: string) {
  const normalizedId = normalizeText(id);
  if (!normalizedId) return null;

  const store = await loadStoredSubmissions();
  return store.submissions.find((submission) => submission.id === normalizedId) ?? null;
}

export async function loadStoredSubmissions() {
  try {
    const jsonlStats = await fs.stat(JSONL_PATH);
    if (jsonlStats.isFile()) {
      return {
        source: "jsonl" as const,
        sourcePath: JSONL_PATH,
        submissions: sortByNewest(await readJsonlFile(JSONL_PATH)),
      };
    }
  } catch {}

  try {
    const jsonStats = await fs.stat(JSON_PATH);
    if (jsonStats.isFile()) {
      return {
        source: "json" as const,
        sourcePath: JSON_PATH,
        submissions: sortByNewest(await readJsonFile(JSON_PATH)),
      };
    }
  } catch {}

  return {
    source: "none" as const,
    sourcePath: null,
    submissions: [] as TypeformSubmission[],
  };
}

export async function getLeadScoreDashboardData(baseUrl: string): Promise<LeadScoreDashboardData> {
  const store = await loadStoredSubmissions();
  const submissions = store.submissions;
  const scored = submissions.filter((item) => typeof item.score === "number");
  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, item) => sum + (item.score ?? 0), 0) / scored.length)
    : 0;

  const setup = {
    webhookUrl: `${baseUrl}/api/typeform/webhook`,
    jsonlPath: JSONL_PATH,
    jsonPath: JSON_PATH,
    nextSteps: [
      "Create a Typeform webhook that posts responses to the local webhook route.",
      "Or save normalized submissions in the local JSONL file.",
      "Each stored record should include score fields or the dashboard will score it automatically.",
    ],
  };

  if (!submissions.length) {
    return {
      connected: false,
      source: store.source,
      sourcePath: store.sourcePath,
      setup,
      totals: {
        submissions: 0,
        scoredSubmissions: 0,
        averageScore: 0,
      },
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0 },
      scoreBuckets: buildScoreBuckets([]),
      responseVolume: [],
      breakdowns: {
        interest: [],
        aiMaturity: [],
        budget: [],
        urgency: [],
        blocker: [],
        role: [],
      },
      latestSubmissions: [],
      submissions: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    connected: true,
    source: store.source,
    sourcePath: store.sourcePath,
    setup,
    totals: {
      submissions: submissions.length,
      scoredSubmissions: scored.length,
      averageScore,
    },
    gradeDistribution: buildGradeDistribution(submissions),
    scoreBuckets: buildScoreBuckets(submissions),
    responseVolume: buildResponseVolume(submissions),
    breakdowns: {
      interest: countBy(submissions.map((item) => item.interest)),
      aiMaturity: countBy(submissions.map((item) => item.aiMaturity)),
      budget: countBy(submissions.map((item) => item.budget)),
      urgency: countBy(submissions.map((item) => item.urgency)),
      blocker: countBy(submissions.map((item) => item.blocker)),
      role: countBy(submissions.map((item) => item.role)),
    },
    latestSubmissions: submissions.slice(0, 12),
    submissions,
    lastUpdated: new Date().toISOString(),
  };
}
