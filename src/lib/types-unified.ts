// ============================================================================
// Unified Type System — Single Source of Truth
// ============================================================================
// Every entity has: id, timestamps, status, assignee, related entities
// Mark MOCK data clearly — never pretend it's live
// ============================================================================

export type DataSource = 'live' | 'mock' | 'cached';

// --- Base Entity ---
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// --- Team Members (Human) ---
export type HumanStatus = 'available' | 'busy' | 'deep-work' | 'offline';

export interface TeamMember extends BaseEntity {
  name: string;
  role: string;
  avatar?: string;
  status: HumanStatus;
  activeTasks: string[]; // task IDs
  workload: number; // 0-100
  email?: string;
}

// --- AI Agents ---
export type AgentStatus = 'running' | 'idle' | 'waiting-approval' | 'error' | 'offline';

export interface Agent extends BaseEntity {
  name: string;
  handle: string; // e.g. "Xavier Blanc"
  platform: string; // reddit, twitter, youtube, etc.
  role: string;
  department: string;
  status: AgentStatus;
  currentTask?: string;
  queueDepth: number;
  successRate24h: number; // 0-100
  avatar?: string;
}

// --- Tasks ---
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; // human or agent ID
  assigneeType?: 'human' | 'agent';
  projectId?: string;
  dueDate?: string;
  completedAt?: string;
  stallDays: number; // days since last status change
  tags: string[];
}

// --- Projects ---
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: ProjectStatus;
  completionPercent: number; // 0-100
  ownerId: string;
  ownerType: 'human' | 'agent';
  deadline?: string;
  stallDays: number;
  taskIds: string[];
  moduleSlug?: string; // links to dashboard module
}

// --- Campaigns ---
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

export interface Campaign extends BaseEntity {
  name: string;
  project: 'ai-universa' | 'aib' | 'ltb' | 'other';
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  channels: ChannelAssignment[];
  kpis: CampaignKPI[];
}

export interface ChannelAssignment {
  channel: 'instagram' | 'twitter' | 'reddit' | 'youtube' | 'email' | 'whatsapp';
  agentId?: string;
  postsTarget: number;
  postsActual: number;
}

export interface CampaignKPI {
  name: string;
  target: number;
  actual: number;
  unit: string;
}

// --- Leads ---
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead extends BaseEntity {
  name?: string;
  email?: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  score: number; // 0-100
  campaignId?: string;
  notes?: string;
}

// --- Content ---
export type ContentStatus = 'idea' | 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface ContentItem extends BaseEntity {
  title: string;
  type: 'post' | 'reel' | 'video' | 'email' | 'thread' | 'article';
  channel: string;
  status: ContentStatus;
  assigneeId?: string;
  assigneeType?: 'human' | 'agent';
  scheduledFor?: string;
  publishedAt?: string;
  campaignId?: string;
  metrics?: ContentMetrics;
}

export interface ContentMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

// --- KPIs ---
export interface KPI {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  action: string; // "so what?" — what action does this drive?
  source: DataSource;
}

// --- Handoff / Approval ---
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface HandoffItem extends BaseEntity {
  type: 'approval' | 'review' | 'escalation';
  fromId: string;
  fromType: 'human' | 'agent';
  toId: string;
  toType: 'human' | 'agent';
  status: ApprovalStatus;
  itemType: string; // what's being handed off
  itemId: string;
  description: string;
  priority: TaskPriority;
}

// --- Calendar Event ---
export interface CalendarEvent extends BaseEntity {
  title: string;
  date: string;
  endDate?: string;
  type: 'campaign-start' | 'campaign-end' | 'content-drop' | 'deadline' | 'meeting' | 'launch';
  projectId?: string;
  campaignId?: string;
  color?: string;
}

// --- Unfinished Business ---
export interface UnfinishedItem {
  id: string;
  title: string;
  module: string;
  href: string;
  stallDays: number;
  ownerId: string;
  ownerName: string;
  completionPercent: number;
}

// --- Quick Action ---
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href?: string;
  action?: string; // for programmatic actions
  dangerous?: boolean;
}
