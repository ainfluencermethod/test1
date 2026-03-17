import type { Agent } from "./types";

export const AGENTS: Agent[] = [
  { id: "orchestrator", name: "Gigabrain", role: "Orchestration Lead", icon: "🧠", color: "#00FFB2", status: "idle", taskCount: 0 },
  { id: "copywriter", name: "Wordcel", role: "Copy Specialist", icon: "✍️", color: "#E040FB", status: "idle", taskCount: 0 },
  { id: "designer", name: "Pixel Picasso", role: "Design Lead", icon: "🎨", color: "#FF6B35", status: "idle", taskCount: 0 },
  { id: "frontend", name: "DOM Destroyer", role: "Frontend Specialist", icon: "⚡", color: "#4FC3F7", status: "idle", taskCount: 0 },
  { id: "backend", name: "The Plumber", role: "Backend Specialist", icon: "🔧", color: "#FFD54F", status: "idle", taskCount: 0 },
  { id: "reviewer", name: "Hawk Eye", role: "QA Lead", icon: "🦅", color: "#CE93D8", status: "idle", taskCount: 0 },
  { id: "sensei", name: "The Sensei", role: "Agent Training", icon: "🥋", color: "#FF9800", status: "idle", taskCount: 0 },
  { id: "oracle", name: "The Oracle", role: "Analytics & Insights", icon: "🔮", color: "#E040FB", status: "idle", taskCount: 0 },
  { id: "devil", name: "Devil's Advocate", role: "Contrarian Intelligence", icon: "🔥", color: "#FF6B35", status: "idle", taskCount: 0 },
];

export const COLUMN_LABELS: Record<string, string> = {
  queue: "QUEUE",
  in_progress: "IN PROGRESS",
  review: "REVIEW",
  done: "DONE",
  failed: "FAILED",
};

export const COLUMN_ORDER = ["queue", "in_progress", "review", "done", "failed"] as const;

export const TASK_TEMPLATES = [
  "Build a REST API for user authentication",
  "Analyze competitor pricing strategies",
  "Create a CI/CD pipeline for deployment",
  "Generate unit tests for payment module",
  "Design database schema for new feature",
];

export const STATUS_DOT_COLORS: Record<string, string> = {
  idle: "#444",
  working: "#00FFB2",
  done: "#4FC3F7",
  error: "#FF5252",
  reviewing: "#FFD54F",
  waiting: "#555",
};

// Pricing per 1K tokens
export const PRICING = {
  inputPer1K: 0.003,
  outputPer1K: 0.015,
};
