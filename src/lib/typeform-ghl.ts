import { promises as fs } from "fs";
import path from "path";
import { TypeformSubmission } from "@/lib/typeform-lead-score";

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const DATA_DIR = path.join(process.cwd(), "data", "typeform");
const SYNC_LOG_PATH = path.join(DATA_DIR, "ghl-sync-log.jsonl");

export interface GhlSyncResult {
  ok: boolean;
  status: "disabled" | "duplicate" | "dry_run" | "synced" | "error";
  mode: "disabled" | "dry_run" | "live";
  contactId: string | null;
  duplicate: boolean;
  reason?: string;
  tags: string[];
  payload: Record<string, unknown>;
}

interface GhlContactRecord {
  id?: string;
  contactId?: string;
  email?: string;
  phone?: string;
  tags?: string[];
}

interface SyncLogEntry {
  submissionId: string;
  timestamp: string;
  status: GhlSyncResult["status"];
  mode: GhlSyncResult["mode"];
  contactId?: string | null;
  reason?: string;
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function sanitizeTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9:_-]/g, "");
}

function uniqueTags(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => (value ? sanitizeTag(value) : "")).filter(Boolean))];
}

function splitName(fullName?: string) {
  const normalized = normalizeText(fullName);
  if (!normalized) return { firstName: undefined, lastName: undefined };

  const parts = normalized.split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || undefined,
  };
}

function boolFromEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function getGhlConfig() {
  const apiKey = process.env.GHL_API_TOKEN || process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID || process.env.LOCATION_ID;
  const syncEnabled = boolFromEnv(process.env.TYPEFORM_GHL_SYNC_ENABLED, false);
  const dryRun = boolFromEnv(process.env.TYPEFORM_GHL_SYNC_DRY_RUN, true);

  return {
    apiKey,
    locationId,
    syncEnabled,
    dryRun,
  };
}

function normalizeCustomFields(customFields: Record<string, string | undefined>) {
  return Object.entries(customFields)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([id, value]) => ({ id, value: String(value) }));
}

function buildCustomFields(submission: TypeformSubmission) {
  const scoreFieldId = normalizeText(process.env.GHL_AI_UNIVERSA_SCORE_FIELD_ID);
  const gradeFieldId = normalizeText(process.env.GHL_AI_UNIVERSA_GRADE_FIELD_ID);
  const interestFieldId = normalizeText(process.env.GHL_AI_UNIVERSA_INTEREST_FIELD_ID);
  const urgencyFieldId = normalizeText(process.env.GHL_AI_UNIVERSA_URGENCY_FIELD_ID);

  return normalizeCustomFields({
    ...(scoreFieldId ? { [scoreFieldId]: submission.score !== undefined ? String(submission.score) : undefined } : {}),
    ...(gradeFieldId ? { [gradeFieldId]: submission.leadGrade } : {}),
    ...(interestFieldId ? { [interestFieldId]: submission.interest } : {}),
    ...(urgencyFieldId ? { [urgencyFieldId]: submission.urgency } : {}),
  });
}

export function buildAiUniversaTags(submission: TypeformSubmission) {
  return uniqueTags([
    "brand:ai-universa",
    "source:typeform",
    "funnel:ai-universa-quiz",
    "status:new-lead",
    submission.leadGrade ? `lead-grade:${submission.leadGrade.toLowerCase()}` : undefined,
    submission.score !== undefined ? `lead-score-band:${submission.score >= 80 ? "hot" : submission.score >= 60 ? "warm" : submission.score >= 40 ? "nurture" : "cold"}` : undefined,
    submission.interest ? `interest:${submission.interest}` : undefined,
    submission.urgency ? `urgency:${submission.urgency}` : undefined,
    submission.aiMaturity ? `ai-maturity:${submission.aiMaturity}` : undefined,
    submission.role ? `role:${submission.role}` : undefined,
  ]);
}

export function buildAiUniversaContactPayload(submission: TypeformSubmission) {
  const { locationId } = getGhlConfig();
  const { firstName, lastName } = splitName(submission.respondentName);
  const tags = buildAiUniversaTags(submission);

  return {
    locationId,
    firstName,
    lastName,
    email: normalizeText(submission.email),
    phone: normalizeText(submission.phone),
    tags,
    customFields: buildCustomFields(submission),
    source: "typeform",
  } satisfies Record<string, unknown>;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function appendSyncLog(entry: SyncLogEntry) {
  await ensureDataDir();
  await fs.appendFile(SYNC_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
}

async function getLatestSyncLog(submissionId: string) {
  try {
    const raw = await fs.readFile(SYNC_LOG_PATH, "utf8");
    const entries = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as SyncLogEntry)
      .filter((entry) => entry.submissionId === submissionId);

    return entries.at(-1) ?? null;
  } catch {
    return null;
  }
}

async function ghlRequest(endpoint: string, options: RequestInit = {}) {
  const { apiKey } = getGhlConfig();
  if (!apiKey) {
    throw new Error("Missing GHL API token. Set GHL_API_TOKEN or GHL_API_KEY locally.");
  }

  const response = await fetch(`${GHL_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: GHL_VERSION,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `GHL request failed with status ${response.status}`);
  }

  return data;
}

function extractContacts(payload: unknown) {
  if (Array.isArray(payload)) return payload as GhlContactRecord[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.contacts)) return record.contacts as GhlContactRecord[];
    if (record.data && typeof record.data === "object" && Array.isArray((record.data as Record<string, unknown>).contacts)) {
      return (record.data as Record<string, unknown>).contacts as GhlContactRecord[];
    }
  }

  return [];
}

async function findExistingContact(submission: TypeformSubmission) {
  const { locationId } = getGhlConfig();
  if (!locationId) {
    throw new Error("Missing GHL location ID. Set GHL_LOCATION_ID locally.");
  }

  const queryValue = normalizeText(submission.email) || normalizeText(submission.phone);
  if (!queryValue) return null;

  const params = new URLSearchParams({
    locationId,
    limit: "20",
    query: queryValue,
  });

  const payload = await ghlRequest(`/contacts/?${params.toString()}`);
  const contacts = extractContacts(payload);
  const normalizedEmail = normalizeText(submission.email)?.toLowerCase();
  const normalizedPhone = normalizeText(submission.phone);

  return (
    contacts.find((contact) => {
      const emailMatches = normalizedEmail && normalizeText(contact.email)?.toLowerCase() === normalizedEmail;
      const phoneMatches = normalizedPhone && normalizeText(contact.phone) === normalizedPhone;
      return emailMatches || phoneMatches;
    }) ?? null
  );
}

function getContactId(contact: GhlContactRecord | null) {
  return contact?.id || contact?.contactId || null;
}

export async function syncTypeformSubmissionToGhl(submission: TypeformSubmission): Promise<GhlSyncResult> {
  const payload = buildAiUniversaContactPayload(submission);
  const tags = Array.isArray(payload.tags) ? (payload.tags as string[]) : [];
  const { syncEnabled, dryRun, locationId } = getGhlConfig();
  const latestLog = await getLatestSyncLog(submission.id);

  if (latestLog && ["dry_run", "synced", "disabled"].includes(latestLog.status)) {
    return {
      ok: true,
      status: "duplicate",
      mode: latestLog.mode,
      contactId: latestLog.contactId ?? null,
      duplicate: true,
      reason: `Submission ${submission.id} was already processed for GHL sync`,
      tags,
      payload,
    };
  }

  if (!syncEnabled) {
    const result: GhlSyncResult = {
      ok: true,
      status: "disabled",
      mode: "disabled",
      contactId: null,
      duplicate: false,
      reason: "Set TYPEFORM_GHL_SYNC_ENABLED=true to enable live sync. Local dry preparation is ready.",
      tags,
      payload,
    };

    await appendSyncLog({
      submissionId: submission.id,
      timestamp: new Date().toISOString(),
      status: result.status,
      mode: result.mode,
      reason: result.reason,
    });

    return result;
  }

  if (!locationId) {
    const result: GhlSyncResult = {
      ok: false,
      status: "error",
      mode: dryRun ? "dry_run" : "live",
      contactId: null,
      duplicate: false,
      reason: "Missing GHL location ID. Set GHL_LOCATION_ID locally.",
      tags,
      payload,
    };

    await appendSyncLog({
      submissionId: submission.id,
      timestamp: new Date().toISOString(),
      status: result.status,
      mode: result.mode,
      reason: result.reason,
    });

    return result;
  }

  const hasPrimaryIdentifier = normalizeText(submission.email) || normalizeText(submission.phone);
  if (!hasPrimaryIdentifier) {
    const result: GhlSyncResult = {
      ok: false,
      status: "error",
      mode: dryRun ? "dry_run" : "live",
      contactId: null,
      duplicate: false,
      reason: "Submission is missing both email and phone, so GHL upsert cannot be safely performed.",
      tags,
      payload,
    };

    await appendSyncLog({
      submissionId: submission.id,
      timestamp: new Date().toISOString(),
      status: result.status,
      mode: result.mode,
      reason: result.reason,
    });

    return result;
  }

  if (dryRun) {
    const result: GhlSyncResult = {
      ok: true,
      status: "dry_run",
      mode: "dry_run",
      contactId: null,
      duplicate: false,
      reason: "Dry run active. Set TYPEFORM_GHL_SYNC_DRY_RUN=false for live local sync.",
      tags,
      payload,
    };

    await appendSyncLog({
      submissionId: submission.id,
      timestamp: new Date().toISOString(),
      status: result.status,
      mode: result.mode,
      reason: result.reason,
    });

    return result;
  }

  try {
    const existing = await findExistingContact(submission);
    const existingId = getContactId(existing);

    const response = existingId
      ? await ghlRequest(`/contacts/${existingId}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await ghlRequest("/contacts/", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    const contactId =
      getContactId(existing) ||
      getContactId((response as { contact?: GhlContactRecord }).contact ?? null) ||
      getContactId((response as { data?: GhlContactRecord }).data ?? null);

    const result: GhlSyncResult = {
      ok: true,
      status: "synced",
      mode: "live",
      contactId,
      duplicate: false,
      reason: existingId ? "Existing GHL contact updated" : "New GHL contact created",
      tags,
      payload,
    };

    await appendSyncLog({
      submissionId: submission.id,
      timestamp: new Date().toISOString(),
      status: result.status,
      mode: result.mode,
      contactId: result.contactId,
      reason: result.reason,
    });

    return result;
  } catch (error) {
    const result: GhlSyncResult = {
      ok: false,
      status: "error",
      mode: "live",
      contactId: null,
      duplicate: false,
      reason: error instanceof Error ? error.message : "GHL sync failed",
      tags,
      payload,
    };

    await appendSyncLog({
      submissionId: submission.id,
      timestamp: new Date().toISOString(),
      status: result.status,
      mode: result.mode,
      reason: result.reason,
    });

    return result;
  }
}

export async function getTypeformGhlSyncLog(submissionId: string) {
  return getLatestSyncLog(submissionId);
}
