// ClawBot Command Center Types

export type AgentStatus = "idle" | "working" | "done" | "error" | "reviewing";
export type PipelineStatus = "STANDBY" | "ACTIVE" | "COMPLETE";
export type TaskColumn = "queue" | "in_progress" | "review" | "done" | "failed";
export type FeedFilter = "all" | "tasks" | "agents";

export interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  status: AgentStatus;
  taskCount: number;
}

export interface KanbanTask {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  agentIcon: string;
  column: TaskColumn;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface FeedEntry {
  id: string;
  message: string;
  timestamp: number;
  type: "task" | "agent" | "system";
  agentIcon?: string;
}

export interface AgentOutput {
  agentId: string;
  thoughts: string;
  output: string;
  actions: number;
  status: "waiting" | "working" | "done" | "blocked" | "error";
}

export interface TokenStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  sessionCost: number;
  tasksCompleted: number;
}

export interface LiveSubagent {
  id: string;
  label: string;
  status: string;
  model: string;
  startedAt: string;
  duration?: string;
}
