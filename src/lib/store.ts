'use client';

// ============================================================================
// Unified Store — React Context + Event Bus
// ============================================================================
// All modules read/write through this shared store.
// Data marked with `source: 'mock'` is placeholder — never pretend it's live.
// ============================================================================

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import React from 'react';
import type {
  TeamMember, Agent, Task, Project, Campaign, Lead, ContentItem,
  KPI, HandoffItem, CalendarEvent, UnfinishedItem, QuickAction, DataSource,
} from './types-unified';

// --- State Shape ---
export interface DashboardState {
  team: { data: TeamMember[]; source: DataSource };
  agents: { data: Agent[]; source: DataSource };
  tasks: { data: Task[]; source: DataSource };
  projects: { data: Project[]; source: DataSource };
  campaigns: { data: Campaign[]; source: DataSource };
  leads: { data: Lead[]; source: DataSource };
  content: { data: ContentItem[]; source: DataSource };
  kpis: { data: KPI[]; source: DataSource };
  handoffs: { data: HandoffItem[]; source: DataSource };
  calendar: { data: CalendarEvent[]; source: DataSource };
  unfinished: UnfinishedItem[];
  quickActions: QuickAction[];
  lastUpdated: string;
}

// --- Actions ---
type Action =
  | { type: 'SET_TEAM'; payload: TeamMember[]; source: DataSource }
  | { type: 'SET_AGENTS'; payload: Agent[]; source: DataSource }
  | { type: 'SET_TASKS'; payload: Task[]; source: DataSource }
  | { type: 'SET_PROJECTS'; payload: Project[]; source: DataSource }
  | { type: 'SET_CAMPAIGNS'; payload: Campaign[]; source: DataSource }
  | { type: 'SET_LEADS'; payload: Lead[]; source: DataSource }
  | { type: 'SET_CONTENT'; payload: ContentItem[]; source: DataSource }
  | { type: 'SET_KPIS'; payload: KPI[]; source: DataSource }
  | { type: 'SET_HANDOFFS'; payload: HandoffItem[]; source: DataSource }
  | { type: 'SET_CALENDAR'; payload: CalendarEvent[]; source: DataSource }
  | { type: 'SET_UNFINISHED'; payload: UnfinishedItem[] }
  | { type: 'SET_QUICK_ACTIONS'; payload: QuickAction[] }
  | { type: 'HYDRATE'; payload: Partial<DashboardState> };

function reducer(state: DashboardState, action: Action): DashboardState {
  const now = new Date().toISOString();
  switch (action.type) {
    case 'SET_TEAM': return { ...state, team: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_AGENTS': return { ...state, agents: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_TASKS': return { ...state, tasks: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_PROJECTS': return { ...state, projects: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_CAMPAIGNS': return { ...state, campaigns: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_LEADS': return { ...state, leads: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_CONTENT': return { ...state, content: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_KPIS': return { ...state, kpis: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_HANDOFFS': return { ...state, handoffs: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_CALENDAR': return { ...state, calendar: { data: action.payload, source: action.source }, lastUpdated: now };
    case 'SET_UNFINISHED': return { ...state, unfinished: action.payload, lastUpdated: now };
    case 'SET_QUICK_ACTIONS': return { ...state, quickActions: action.payload, lastUpdated: now };
    case 'HYDRATE': return { ...state, ...action.payload, lastUpdated: now };
    default: return state;
  }
}

// --- Event Bus ---
type EventHandler = (data: unknown) => void;
const eventBus = {
  listeners: new Map<string, Set<EventHandler>>(),
  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  },
  emit(event: string, data?: unknown) {
    this.listeners.get(event)?.forEach(handler => handler(data));
  },
};

export { eventBus };

// --- Initial Mock Data ---
// CLEARLY MARKED AS MOCK — replace with live data connections
const INITIAL_STATE: DashboardState = {
  team: {
    source: 'mock',
    data: [
      { id: 'h-luka', name: 'Luka', role: 'Content Lead', status: 'available', activeTasks: [], workload: 65, createdAt: '', updatedAt: '' },
      { id: 'h-tim', name: 'Tim', role: 'Tech Lead', status: 'busy', activeTasks: [], workload: 80, createdAt: '', updatedAt: '' },
      { id: 'h-ziva', name: 'Živa', role: 'Designer', status: 'available', activeTasks: [], workload: 40, createdAt: '', updatedAt: '' },
      { id: 'h-john', name: 'John Wick', role: 'Operations', status: 'offline', activeTasks: [], workload: 0, createdAt: '', updatedAt: '' },
    ],
  },
  agents: {
    source: 'mock',
    data: [
      { id: 'a-reddit', name: 'Xavier Blanc', handle: 'Xavier Blanc', platform: 'reddit', role: 'Reddit Growth Agent', department: 'marketing', status: 'idle', queueDepth: 0, successRate24h: 0, createdAt: '', updatedAt: '' },
      { id: 'a-twitter', name: 'Giulia Banks', handle: 'Giulia Banks', platform: 'twitter', role: 'Twitter Agent', department: 'marketing', status: 'idle', queueDepth: 0, successRate24h: 0, createdAt: '', updatedAt: '' },
      { id: 'a-youtube', name: 'Neura', handle: 'Neura', platform: 'youtube', role: 'YouTube Agent', department: 'content', status: 'idle', queueDepth: 0, successRate24h: 0, createdAt: '', updatedAt: '' },
      { id: 'a-zuyrb', name: 'Zuyrb', handle: 'Zuyrb', platform: 'multi', role: 'Multi-Platform Agent', department: 'operations', status: 'idle', queueDepth: 0, successRate24h: 0, createdAt: '', updatedAt: '' },
      { id: 'a-raffe', name: 'Raffe', handle: 'Raffe', platform: 'multi', role: 'Support Agent', department: 'operations', status: 'idle', queueDepth: 0, successRate24h: 0, createdAt: '', updatedAt: '' },
    ],
  },
  tasks: { source: 'mock', data: [] },
  projects: {
    source: 'mock',
    data: [
      { id: 'p-au', name: 'AI Universa Launch', description: 'Apr 15 live event launch', status: 'active', completionPercent: 35, ownerId: 'h-tim', ownerType: 'human', deadline: '2026-04-15', stallDays: 0, taskIds: [], createdAt: '', updatedAt: '', moduleSlug: 'ai-universa' },
      { id: 'p-aib', name: 'AI Influencer Blueprint', description: 'Funnel + content system', status: 'active', completionPercent: 50, ownerId: 'h-luka', ownerType: 'human', deadline: '2026-05-01', stallDays: 2, taskIds: [], createdAt: '', updatedAt: '', moduleSlug: 'aib-launch' },
      { id: 'p-dashboard', name: 'Dashboard Rebuild', description: 'This dashboard', status: 'active', completionPercent: 20, ownerId: 'h-tim', ownerType: 'human', deadline: '2026-03-20', stallDays: 0, taskIds: [], createdAt: '', updatedAt: '' },
      { id: 'p-reddit', name: 'Reddit Warm-up', description: 'Xavier Blanc account growth', status: 'active', completionPercent: 10, ownerId: 'a-reddit', ownerType: 'agent', deadline: '2026-03-25', stallDays: 1, taskIds: [], createdAt: '', updatedAt: '' },
    ],
  },
  campaigns: {
    source: 'mock',
    data: [
      {
        id: 'c-au-launch', name: 'AI Universa Pre-Launch', project: 'ai-universa', status: 'active',
        startDate: '2026-03-15', endDate: '2026-04-15',
        channels: [
          { channel: 'instagram', postsTarget: 8, postsActual: 0 },
          { channel: 'twitter', postsTarget: 3, postsActual: 0 },
          { channel: 'reddit', postsTarget: 2, postsActual: 0 },
          { channel: 'youtube', postsTarget: 1, postsActual: 0 },
          { channel: 'email', postsTarget: 2, postsActual: 0 },
        ],
        kpis: [
          { name: 'Email Signups', target: 500, actual: 0, unit: 'contacts' },
          { name: 'WhatsApp Joins', target: 200, actual: 0, unit: 'members' },
        ],
        createdAt: '', updatedAt: '',
      },
    ],
  },
  leads: { source: 'mock', data: [] },
  content: { source: 'mock', data: [] },
  kpis: {
    source: 'mock',
    data: [
      { id: 'kpi-revenue', name: 'Monthly Revenue', current: 0, target: 100000, unit: '$/mo', trend: 'flat', action: 'Close pending deals, launch AI Universa offer', source: 'mock' },
      { id: 'kpi-leads', name: 'Leads Today', current: 0, target: 50, unit: 'leads', trend: 'flat', action: 'Check GHL contacts, run ad campaigns', source: 'mock' },
      { id: 'kpi-posts', name: 'Posts Today', current: 0, target: 16, unit: 'posts', trend: 'flat', action: 'Queue content across IG×8, Twitter, Reddit, YouTube', source: 'mock' },
      { id: 'kpi-email', name: 'Email Active Contacts', current: 0, target: 1000, unit: 'contacts', trend: 'flat', action: 'Grow list via funnels, warm sequences', source: 'mock' },
      { id: 'kpi-whatsapp', name: 'WhatsApp Fill Level', current: 0, target: 250, unit: 'members', trend: 'flat', action: 'Drive traffic to survey → WhatsApp group', source: 'mock' },
    ],
  },
  handoffs: { source: 'mock', data: [] },
  calendar: {
    source: 'mock',
    data: [
      { id: 'ev-au-launch', title: 'AI Universa Live Event', date: '2026-04-15', type: 'launch', projectId: 'p-au', color: '#7C5CFC', createdAt: '', updatedAt: '' },
      { id: 'ev-au-prelaunch', title: 'Pre-launch Email Sequence Start', date: '2026-04-01', type: 'campaign-start', projectId: 'p-au', campaignId: 'c-au-launch', color: '#00D4AA', createdAt: '', updatedAt: '' },
    ],
  },
  unfinished: [],
  quickActions: [
    { id: 'qa-deploy', label: 'Deploy to Hostinger', description: 'SSH deploy to production', icon: '🚀', action: 'deploy-hostinger' },
    { id: 'qa-reddit', label: 'Run Reddit Warm-up', description: 'Trigger Xavier Blanc engagement', icon: '🔥', action: 'reddit-warmup' },
    { id: 'qa-ghl', label: 'Check GHL Contacts', description: 'View GoHighLevel CRM', icon: '📋', href: 'https://app.gohighlevel.com' },
    { id: 'qa-funnel', label: 'View Funnel Analytics', description: 'Quiz funnel performance', icon: '📊', href: '/dashboard/ai-universa/funnel' },
  ],
  lastUpdated: new Date().toISOString(),
};

// --- Context ---
interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<Action>;
  eventBus: typeof eventBus;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const value = React.useMemo(() => ({ state, dispatch, eventBus }), [state]);

  return React.createElement(DashboardContext.Provider, { value }, children);
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}

export function useUnfinishedBusiness(): UnfinishedItem[] {
  const { state } = useDashboard();
  // Compute unfinished items from projects
  return state.projects.data
    .filter(p => p.status === 'active' && p.completionPercent < 100)
    .map(p => ({
      id: p.id,
      title: p.name,
      module: p.moduleSlug || 'projects',
      href: p.moduleSlug ? `/dashboard/${p.moduleSlug}` : `/dashboard/projects`,
      stallDays: p.stallDays,
      ownerId: p.ownerId,
      ownerName: p.ownerId, // resolved in component
      completionPercent: p.completionPercent,
    }));
}

// --- Data Source Badge Helper ---
export function dataSourceLabel(source: DataSource): string {
  switch (source) {
    case 'live': return '● LIVE';
    case 'cached': return '◐ CACHED';
    case 'mock': return '○ MOCK';
  }
}

export function dataSourceColor(source: DataSource): string {
  switch (source) {
    case 'live': return '#00D4AA';
    case 'cached': return '#F59E0B';
    case 'mock': return '#6B7280';
  }
}
