'use client';

// ============================================================================
// Live Data Hooks — Real API connections
// ============================================================================
// Every hook fetches on mount + refreshes every 30s.
// Returns { data, loading, error, source: 'live' | 'error' }
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { DataSource } from './types-unified';

// --- Generic fetch hook ---
interface LiveData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  source: DataSource | 'error';
  lastFetched: number | null;
  refetch: () => void;
}

function useLiveFetch<T>(url: string, opts?: RequestInit, refreshMs = 30_000): LiveData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastFetched(Date.now());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    doFetch();
    const interval = setInterval(doFetch, refreshMs);
    return () => clearInterval(interval);
  }, [doFetch, refreshMs]);

  return {
    data,
    loading,
    error,
    source: error ? 'error' as const : data ? 'live' : 'mock',
    lastFetched,
    refetch: doFetch,
  };
}

// ============================================================================
// GHL Contacts
// ============================================================================
export interface GHLContact {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  dateAdded?: string;
  source?: string;
}

export interface GHLStats {
  totalContacts: number;
  recentSignups: number;
  tags: Record<string, number>;
}

export function useGHLContacts(limit = 100) {
  return useLiveFetch<{ contacts: GHLContact[] }>(
    `/api/ghl/contacts?limit=${limit}`
  );
}

export function useGHLStats() {
  return useLiveFetch<GHLStats>('/api/ghl/stats');
}

// ============================================================================
// WhatsApp Groups
// ============================================================================
export interface WhatsAppStats {
  totalGroups: number;
  totalMembers: number;
  activeGroup: string;
  groups: { name: string; members: number; capacity: number }[];
  fillPercentage: number;
}

export function useWhatsAppStats() {
  return useLiveFetch<WhatsAppStats>('/api/whatsapp/stats');
}

// ============================================================================
// Quiz Funnel Health + Leads
// ============================================================================
export interface QuizHealth {
  status: string;
  uptime?: number;
  totalLeads?: number;
  totalAudits?: number;
}

export function useQuizHealth() {
  return useLiveFetch<QuizHealth>('/api/health');
}

// ============================================================================
// Subagent Activity (OpenClaw)
// ============================================================================
export interface SubagentTask {
  index: number;
  runId: string;
  label: string;
  task: string;
  status: 'running' | 'done' | 'error' | 'killed';
  runtime: string;
  runtimeMs: number;
  model: string;
  totalTokens?: number;
  startedAt: number;
  endedAt?: number;
}

export interface SubagentData {
  running: SubagentTask[];
  recent: SubagentTask[];
  queued: SubagentTask[];
}

export function useSubagentActivity() {
  const [data, setData] = useState<SubagentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch('/api/subagents', { signal: AbortSignal.timeout(10_000) });
      const parsed = await res.json();
      setData(parsed);
      setError(null);
      setLastFetched(Date.now());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const interval = setInterval(doFetch, 30_000);
    return () => clearInterval(interval);
  }, [doFetch]);

  return {
    data,
    loading,
    error,
    source: (error ? 'error' : data ? 'live' : 'mock') as DataSource | 'error',
    lastFetched,
    refetch: doFetch,
  };
}

// ============================================================================
// ClawBot Agent Status (from autonomous queue)
// ============================================================================
export interface ClawBotAgentStatus {
  agentId: string;
  status: 'working' | 'idle' | 'complete';
  currentMission?: string;
  missionId?: string;
  lastActive?: string;
}

export interface ClawBotAgentStatusResponse {
  agents: ClawBotAgentStatus[];
  architectLastHeartbeat: string | null;
  architectLastAction: string | null;
  timestamp: string;
}

export function useClawBotAgentStatus(refreshMs = 10_000) {
  return useLiveFetch<ClawBotAgentStatusResponse>(
    '/api/clawbot/agents/status',
    undefined,
    refreshMs
  );
}

// ============================================================================
// Combined Dashboard Data — aggregates all sources
// ============================================================================
export interface DashboardLiveData {
  ghlStats: ReturnType<typeof useGHLStats>;
  ghlContacts: ReturnType<typeof useGHLContacts>;
  whatsapp: ReturnType<typeof useWhatsAppStats>;
  quiz: ReturnType<typeof useQuizHealth>;
  subagents: ReturnType<typeof useSubagentActivity>;
}

export function useDashboardLiveData(): DashboardLiveData {
  return {
    ghlStats: useGHLStats(),
    ghlContacts: useGHLContacts(),
    whatsapp: useWhatsAppStats(),
    quiz: useQuizHealth(),
    subagents: useSubagentActivity(),
  };
}

// ============================================================================
// Helpers
// ============================================================================

/** Segment GHL contacts by tag */
export function segmentContacts(contacts: GHLContact[]): { aib: GHLContact[]; aius: GHLContact[]; other: GHLContact[] } {
  const aib: GHLContact[] = [];
  const aius: GHLContact[] = [];
  const other: GHLContact[] = [];

  for (const c of contacts) {
    const tags = (c.tags || []).map(t => t.toLowerCase());
    if (tags.some(t => t.includes('aib') || t.includes('influencer') || t.includes('blueprint'))) {
      aib.push(c);
    } else if (tags.some(t => t.includes('universa') || t.includes('aius') || t.includes('ai-universa'))) {
      aius.push(c);
    } else {
      other.push(c);
    }
  }

  return { aib, aius, other };
}

/** Count today's completed subagent tasks */
export function todaysCompletedTasks(tasks: SubagentTask[]): SubagentTask[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  return tasks.filter(t => t.status === 'done' && t.endedAt && t.endedAt >= todayMs);
}

/** Count running subagent tasks */
export function runningTasks(data: SubagentData | null): number {
  if (!data) return 0;
  return (data.running || []).length;
}
