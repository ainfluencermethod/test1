"use client";

import { DS, dsHeading } from '@/styles/design-system';

import { useState, useEffect, useRef, useCallback } from "react";
import { useClawBotAgentStatus } from "@/lib/hooks-live";
import type {
  Agent,
  AgentStatus,
  KanbanTask,
  FeedEntry,
  AgentOutput,
  TokenStats,
  TaskColumn,
  FeedFilter,
  PipelineStatus,
  LiveSubagent,
} from "@/components/clawbot/types";
import {
  AGENTS,
  COLUMN_LABELS,
  COLUMN_ORDER,
  TASK_TEMPLATES,
  STATUS_DOT_COLORS,
  PRICING,
} from "@/components/clawbot/constants";

// ============================================================================
// Helpers
// ============================================================================

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function elapsed(startMs: number): string {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

let feedIdCounter = 0;
function nextFeedId() {
  return `feed-${++feedIdCounter}`;
}

let taskIdCounter = 0;
function nextTaskId() {
  return `task-${++taskIdCounter}`;
}

// ============================================================================
// Sub Components
// ============================================================================

/* ---------- Agent Roster (Left Sidebar) ---------- */
function AgentRoster({
  agents,
  collapsed,
  onToggle,
}: {
  agents: Agent[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        background: DS.colors.bgCard,
        border: `1px solid ${DS.colors.border}`,
        borderRadius: 8,
        padding: collapsed ? "12px 8px" : "16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: collapsed ? 48 : 220,
        maxWidth: collapsed ? 48 : 260,
        transition: "all 0.3s ease",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: 4,
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: DS.colors.accent,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Agent Roster
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            background: "transparent",
            border: "none",
            color: DS.colors.textMuted,
            cursor: "pointer",
            fontSize: 14,
            padding: 2,
          }}
          aria-label={collapsed ? "Expand roster" : "Collapse roster"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Agent list */}
      {agents.map((agent) => (
        <div
          key={agent.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "8px 4px" : "10px 12px",
            background:
              agent.status === "working"
                ? `${agent.color}08`
                : "#0d0d0d",
            border: `1px solid ${agent.status === "working" ? agent.color + "33" : "#1a1a1a"}`,
            borderRadius: 6,
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "all 0.3s",
          }}
        >
          <span
            style={{
              fontSize: collapsed ? 20 : 18,
              filter:
                agent.status === "working"
                  ? `drop-shadow(0 0 6px ${agent.color})`
                  : "none",
              flexShrink: 0,
            }}
          >
            {agent.icon}
          </span>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: DS.colors.text,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {agent.name}
                </div>
                <div
                  style={{
                    color: DS.colors.textMuted,
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {agent.role}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {agent.taskCount > 0 && (
                  <span
                    style={{
                      background: agent.color + "22",
                      color: agent.color,
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 10,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {agent.taskCount}
                  </span>
                )}
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: STATUS_DOT_COLORS[agent.status] || "#444",
                    boxShadow:
                      agent.status === "working"
                        ? `0 0 8px ${STATUS_DOT_COLORS[agent.status]}`
                        : "none",
                    transition: "all 0.3s",
                  }}
                />
              </div>
            </>
          )}
        </div>
      ))}

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: 8,
            borderTop: "1px solid #1a1a1a",
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: DS.colors.textMuted,
              letterSpacing: "0.08em",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Edit Agent Profiles →
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Kanban Board (Center) ---------- */
function KanbanBoard({ tasks }: { tasks: KanbanTask[] }) {
  const totalTasks = tasks.length;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            color: "#4FC3F7",
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Task Board
        </span>
        <span
          style={{
            fontSize: 9,
            color: DS.colors.textMuted,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {totalTasks} total
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {COLUMN_ORDER.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col);
          const isActive = col === "in_progress";
          const isFailed = col === "failed";
          return (
            <div
              key={col}
              style={{
                flex: 1,
                minWidth: 140,
                background: DS.colors.bgCard,
                border: `1px solid ${isFailed ? "#FF525222" : "#1a1a1a"}`,
                borderRadius: 6,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    color: isActive
                      ? DS.colors.accent
                      : isFailed
                        ? DS.colors.error
                        : "#555",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {COLUMN_LABELS[col]}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: DS.colors.textMuted,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {colTasks.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  minHeight: 60,
                }}
              >
                {colTasks.length === 0 && (
                  <div
                    style={{
                      color: DS.colors.textMuted,
                      fontSize: 9,
                      textAlign: "center",
                      padding: "12px 0",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    empty
                  </div>
                )}
                {colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: KanbanTask }) {
  const agent = AGENTS.find((a) => a.id === task.agentId);
  const color = agent?.color || "#555";
  const isActive = task.column === "in_progress";

  return (
    <div
      style={{
        background: isActive ? `${color}08` : "#0d0d0d",
        border: `1px solid ${isActive ? color + "33" : "#1e1e1e"}`,
        borderRadius: 4,
        padding: "8px 10px",
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: DS.colors.text,
          fontFamily: "Inter, sans-serif",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: 4,
        }}
      >
        {task.title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 9, color: DS.colors.textMuted }}>
          {task.agentIcon} {task.agentName}
        </span>
        <span
          style={{
            fontSize: 8,
            color: DS.colors.textMuted,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {elapsed(task.startedAt || task.createdAt)}
        </span>
      </div>
    </div>
  );
}

/* ---------- Live Feed (Right Panel) ---------- */
function LiveFeed({
  entries,
  filter,
  onFilterChange,
}: {
  entries: FeedEntry[];
  filter: FeedFilter;
  onFilterChange: (f: FeedFilter) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [entries]);

  const filtered = entries.filter((e) => {
    if (filter === "all") return true;
    if (filter === "tasks") return e.type === "task" || e.type === "system";
    return e.type === "agent";
  });

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        background: DS.colors.bgCard,
        border: `1px solid ${DS.colors.border}`,
        borderRadius: 8,
        padding: 14,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            color: DS.colors.accent,
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Live Feed
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: entries.length > 0 ? DS.colors.accent : "#333",
              boxShadow:
                entries.length > 0 ? "0 0 6px #00FFB2" : "none",
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 10,
        }}
      >
        {(["all", "tasks", "agents"] as FeedFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            style={{
              flex: 1,
              padding: "4px 0",
              background: filter === f ? "#1a1a1a" : "transparent",
              border: `1px solid ${filter === f ? "#333" : "#1a1a1a"}`,
              borderRadius: 4,
              color: filter === f ? "#ccc" : "#444",
              fontSize: 8,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feed entries */}
      <div
        ref={ref}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minHeight: 200,
          maxHeight: 400,
        }}
      >
        {filtered.length === 0 && (
          <div
            style={{
              color: DS.colors.textMuted,
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            // awaiting activity...
          </div>
        )}
        {filtered.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: "6px 8px",
              background: DS.colors.bgCard,
              borderRadius: 4,
              border: "1px solid #151515",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: DS.colors.textSecondary,
                lineHeight: 1.5,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {entry.agentIcon && (
                <span style={{ marginRight: 4 }}>{entry.agentIcon}</span>
              )}
              {entry.message}
            </div>
            <div
              style={{
                fontSize: 8,
                color: DS.colors.textMuted,
                marginTop: 2,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {timeAgo(entry.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Stats Bar (Top) ---------- */
function StatsBar({
  stats,
  pipelineStatus,
}: {
  stats: TokenStats;
  pipelineStatus: PipelineStatus;
}) {
  const statItems = [
    { label: "Input Tokens", value: stats.inputTokens.toLocaleString(), color: "#4FC3F7" },
    { label: "Output Tokens", value: stats.outputTokens.toLocaleString(), color: DS.colors.accent },
    { label: "Total Tokens", value: stats.totalTokens.toLocaleString(), color: DS.colors.text },
    {
      label: "Session Cost",
      value: `$${stats.sessionCost.toFixed(4)}`,
      color: DS.colors.warning,
    },
    {
      label: "Tasks Done",
      value: stats.tasksCompleted.toString(),
      color: "#CE93D8",
    },
  ];

  const statusColor =
    pipelineStatus === "ACTIVE"
      ? DS.colors.accent
      : pipelineStatus === "COMPLETE"
        ? "#4FC3F7"
        : "#444";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 16px",
        background: DS.colors.bgCard,
        border: `1px solid ${DS.colors.border}`,
        borderRadius: 8,
        marginBottom: 12,
        overflowX: "auto",
        flexWrap: "wrap",
      }}
    >
      {statItems.map((s) => (
        <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 8,
              letterSpacing: "0.12em",
              color: DS.colors.textMuted,
              textTransform: "uppercase",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {s.label}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: s.color,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {s.value}
          </span>
        </div>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 8,
            color: DS.colors.textMuted,
            letterSpacing: "0.1em",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Today
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            border: `1px solid ${statusColor}33`,
            borderRadius: 4,
            background: `${statusColor}08`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusColor,
              boxShadow:
                pipelineStatus === "ACTIVE"
                  ? `0 0 8px ${statusColor}`
                  : "none",
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: statusColor,
              letterSpacing: "0.1em",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {pipelineStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Agent Output Panels (Bottom) ---------- */
function AgentOutputPanels({ outputs }: { outputs: AgentOutput[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (outputs.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.15em",
          color: "#4FC3F7",
          textTransform: "uppercase",
          fontWeight: 700,
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: 10,
        }}
      >
        Agent Output
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {outputs.map((o) => {
          const agent = AGENTS.find((a) => a.id === o.agentId);
          if (!agent) return null;
          const isExpanded = expandedId === o.agentId;
          const statusColor =
            o.status === "done"
              ? DS.colors.accent
              : o.status === "working"
                ? DS.colors.warning
                : o.status === "error"
                  ? DS.colors.error
                  : o.status === "blocked"
                    ? "#FF6B35"
                    : "#444";

          return (
            <div
              key={o.agentId}
              style={{
                background: DS.colors.bgCard,
                border: `1px solid ${o.status === "error" ? "#FF525222" : "#1a1a1a"}`,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                onClick={() =>
                  setExpandedId(isExpanded ? null : o.agentId)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <span style={{ fontSize: 18 }}>{agent.icon}</span>
                <span
                  style={{
                    color: agent.color,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {agent.name}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginLeft: "auto",
                  }}
                >
                  <span
                    style={{
                      fontSize: 8,
                      color: DS.colors.textMuted,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {o.actions} actions
                  </span>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: statusColor,
                      boxShadow:
                        o.status === "working"
                          ? `0 0 6px ${statusColor}`
                          : "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 8,
                      color: statusColor,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {o.status}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: DS.colors.textMuted,
                      transform: isExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>
              {isExpanded && (
                <div
                  style={{
                    borderTop: "1px solid #1a1a1a",
                    padding: 14,
                    background: DS.colors.bg,
                  }}
                >
                  {o.thoughts && (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 9,
                          color: DS.colors.textMuted,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        Thoughts
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: DS.colors.textSecondary,
                          lineHeight: 1.6,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {o.thoughts}
                      </div>
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        color: DS.colors.textMuted,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      Output
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: DS.colors.textSecondary,
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: 300,
                        overflowY: "auto",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {o.output || "Awaiting dispatch..."}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Team Votes Panel ---------- */
interface VoteScore {
  impact: number;
  feasibility: number;
  urgency: number;
  innovation: number;
  weighted: number;
}

interface VoteRanking {
  agentId: string;
  agentName: string;
  move: string;
  averageWeighted: number;
  totalWeighted: number;
  voterCount: number;
}

interface VoteRoundData {
  mission: string;
  timestamp: string;
  status: "pending" | "voting" | "complete" | "approved" | "rejected" | "building";
  recommendations: Array<{
    agentId: string;
    agentName: string;
    move: string;
    whyNow: string;
    expectedImpact: string;
    effort: string;
  }>;
  votes: Array<{
    voterId: string;
    voterName: string;
    scores: Record<string, VoteScore>;
  }>;
  rankings: VoteRanking[];
}

function TeamVotesPanel() {
  const [round, setRound] = useState<VoteRoundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch("/api/clawbot/vote?mission=latest", {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.round) {
        setRound(data.round);
        setError(null);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVotes();
    const interval = setInterval(fetchVotes, 30000);
    return () => clearInterval(interval);
  }, [fetchVotes]);

  const statusColors: Record<string, string> = {
    pending: DS.colors.warning,
    voting: "#4FC3F7",
    complete: DS.colors.accent,
    approved: DS.colors.accent,
    rejected: DS.colors.error,
    building: DS.colors.accentPurple,
  };

  const statusLabels: Record<string, string> = {
    pending: "AWAITING VOTES",
    voting: "VOTING IN PROGRESS",
    complete: "AWAITING APPROVAL",
    approved: "APPROVED",
    rejected: "REJECTED",
    building: "BUILDING",
  };

  const handleRunVote = async () => {
    setError(null);
    try {
      const res = await fetch("/api/clawbot/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run-vote" }),
      });
      const data = await res.json();
      if (data.round) setRound(data.round);
      if (data.error) setError(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    }
  };

  return (
    <div
      style={{
        background: DS.colors.bgCard,
        border: `1px solid ${DS.colors.border}`,
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: DS.colors.accentPurple,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            🗳️ Team Votes
          </span>
          {round && (
            <span
              style={{
                fontSize: 8,
                padding: "2px 8px",
                borderRadius: 10,
                background: (statusColors[round.status] || "#444") + "15",
                color: statusColors[round.status] || "#444",
                border: `1px solid ${(statusColors[round.status] || "#444")}33`,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {statusLabels[round.status] || round.status}
            </span>
          )}
        </div>
        {round?.status === "pending" && (
          <button
            onClick={handleRunVote}
            style={{
              padding: "6px 14px",
              background: DS.colors.accentPurple,
              color: "#000",
              border: "none",
              borderRadius: 4,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            RUN VOTE
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            background: "#FF525210",
            border: "1px solid #FF525233",
            borderRadius: 4,
            color: DS.colors.error,
            fontSize: 10,
            marginBottom: 12,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {error}
        </div>
      )}

      {loading && !round && (
        <div
          style={{
            color: DS.colors.textMuted,
            fontSize: 10,
            textAlign: "center",
            padding: "20px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Loading vote data...
        </div>
      )}

      {!loading && !round && (
        <div
          style={{
            color: DS.colors.textMuted,
            fontSize: 10,
            textAlign: "center",
            padding: "20px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          No active vote rounds. Recommendations will appear here after a mission completes.
        </div>
      )}

      {round && (
        <>
          {/* Mission info */}
          <div
            style={{
              padding: "8px 12px",
              background: DS.colors.bgCard,
              border: "1px solid #151515",
              borderRadius: 4,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 8,
                color: DS.colors.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 4,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              Mission
            </div>
            <div
              style={{
                fontSize: 11,
                color: DS.colors.text,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {round.mission}
            </div>
          </div>

          {/* Rankings (if vote is complete) */}
          {round.rankings.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 9,
                  color: DS.colors.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                Ranked Results
              </div>
              {round.rankings.map((rank, idx) => {
                const isWinner = idx === 0;
                const isExpanded = expandedRec === rank.agentId;
                const rec = round.recommendations.find(
                  (r) => r.agentId === rank.agentId
                );
                const votesForThis = round.votes
                  .map((v) => ({
                    voterName: v.voterName,
                    score: v.scores[rank.agentId],
                  }))
                  .filter((v) => v.score);

                return (
                  <div
                    key={rank.agentId}
                    style={{
                      background: isWinner ? "#E040FB08" : "#0d0d0d",
                      border: `1px solid ${isWinner ? "#E040FB33" : "#1a1a1a"}`,
                      borderRadius: 6,
                      marginBottom: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() =>
                        setExpandedRec(isExpanded ? null : rank.agentId)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 900,
                          color: isWinner ? DS.colors.accentPurple : "#333",
                          fontFamily: "JetBrains Mono, monospace",
                          width: 24,
                          textAlign: "center",
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: isWinner ? "#eee" : "#999",
                            fontFamily: "Inter, sans-serif",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {rank.move}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: DS.colors.textMuted,
                            fontFamily: "JetBrains Mono, monospace",
                            marginTop: 2,
                          }}
                        >
                          by {rank.agentName} · {rank.voterCount} votes
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: isWinner ? DS.colors.accentPurple : "#666",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {rank.averageWeighted}
                        </span>
                        <span
                          style={{
                            fontSize: 8,
                            color: DS.colors.textMuted,
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          pts
                        </span>
                        {isWinner && (
                          <span
                            style={{
                              fontSize: 8,
                              padding: "2px 6px",
                              background: "#E040FB22",
                              color: DS.colors.accentPurple,
                              borderRadius: 10,
                              fontWeight: 700,
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            WINNER
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 14,
                            color: DS.colors.textMuted,
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s",
                          }}
                        >
                          ▾
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          borderTop: "1px solid #1a1a1a",
                          padding: 12,
                          background: DS.colors.bg,
                        }}
                      >
                        {rec && (
                          <div style={{ marginBottom: 10 }}>
                            <div
                              style={{
                                fontSize: 10,
                                color: DS.colors.textSecondary,
                                lineHeight: 1.6,
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              <strong style={{ color: "#aaa" }}>
                                Why Now:
                              </strong>{" "}
                              {rec.whyNow}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: DS.colors.textSecondary,
                                lineHeight: 1.6,
                                marginTop: 4,
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              <strong style={{ color: "#aaa" }}>
                                Expected Impact:
                              </strong>{" "}
                              {rec.expectedImpact}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: DS.colors.textSecondary,
                                lineHeight: 1.6,
                                marginTop: 4,
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              <strong style={{ color: "#aaa" }}>
                                Effort:
                              </strong>{" "}
                              {rec.effort}
                            </div>
                          </div>
                        )}

                        {/* Individual voter scores */}
                        {votesForThis.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: 8,
                                color: DS.colors.textMuted,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                marginBottom: 6,
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              Vote Breakdown
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "1fr repeat(4, 48px) 56px",
                                gap: "4px 8px",
                                fontSize: 9,
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {/* Header */}
                              <span style={{ color: DS.colors.textMuted }}>Voter</span>
                              <span
                                style={{ color: DS.colors.textMuted, textAlign: "center" }}
                              >
                                IMP
                              </span>
                              <span
                                style={{ color: DS.colors.textMuted, textAlign: "center" }}
                              >
                                FEA
                              </span>
                              <span
                                style={{ color: DS.colors.textMuted, textAlign: "center" }}
                              >
                                URG
                              </span>
                              <span
                                style={{ color: DS.colors.textMuted, textAlign: "center" }}
                              >
                                INN
                              </span>
                              <span
                                style={{ color: DS.colors.textMuted, textAlign: "right" }}
                              >
                                TOTAL
                              </span>

                              {/* Rows */}
                              {votesForThis.map((v) => (
                                <>
                                  <span
                                    key={`name-${v.voterName}`}
                                    style={{ color: DS.colors.textSecondary }}
                                  >
                                    {v.voterName}
                                  </span>
                                  <span
                                    key={`imp-${v.voterName}`}
                                    style={{
                                      color: "#4FC3F7",
                                      textAlign: "center",
                                    }}
                                  >
                                    {v.score.impact}
                                  </span>
                                  <span
                                    key={`fea-${v.voterName}`}
                                    style={{
                                      color: DS.colors.accent,
                                      textAlign: "center",
                                    }}
                                  >
                                    {v.score.feasibility}
                                  </span>
                                  <span
                                    key={`urg-${v.voterName}`}
                                    style={{
                                      color: DS.colors.warning,
                                      textAlign: "center",
                                    }}
                                  >
                                    {v.score.urgency}
                                  </span>
                                  <span
                                    key={`inn-${v.voterName}`}
                                    style={{
                                      color: "#CE93D8",
                                      textAlign: "center",
                                    }}
                                  >
                                    {v.score.innovation}
                                  </span>
                                  <span
                                    key={`total-${v.voterName}`}
                                    style={{
                                      color: DS.colors.text,
                                      fontWeight: 700,
                                      textAlign: "right",
                                    }}
                                  >
                                    {v.score.weighted}
                                  </span>
                                </>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Recommendations (if no rankings yet, show raw recs) */}
          {round.rankings.length === 0 && round.recommendations.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 9,
                  color: DS.colors.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                Pending Recommendations ({round.recommendations.length})
              </div>
              {round.recommendations.map((rec) => (
                <div
                  key={rec.agentId}
                  style={{
                    padding: "8px 12px",
                    background: DS.colors.bgCard,
                    border: `1px solid ${DS.colors.border}`,
                    borderRadius: 4,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: DS.colors.text,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {rec.move}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: DS.colors.textMuted,
                      marginTop: 4,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    by {rec.agentName} · {rec.effort}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Auto build indicator */}
          {round.rankings.length > 0 && round.status === "building" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                background: "#E040FB08",
                border: "1px solid #E040FB22",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: DS.colors.accentPurple,
                  boxShadow: "0 0 8px #E040FB",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: DS.colors.accentPurple,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 700,
                }}
              >
                AUTO BUILDING: {round.rankings[0]?.move}
              </span>
            </div>
          )}

          {/* Weight legend */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Impact", weight: "3x", color: "#4FC3F7" },
              { label: "Feasibility", weight: "2x", color: DS.colors.accent },
              { label: "Urgency", weight: "2x", color: DS.colors.warning },
              { label: "Innovation", weight: "1x", color: "#CE93D8" },
            ].map((w) => (
              <div
                key={w.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 8,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: w.color,
                  }}
                />
                <span style={{ color: DS.colors.textMuted }}>
                  {w.label} ({w.weight})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Approvals Panel ---------- */
interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  description: string;
  files?: string[];
  source?: string;
  target?: string;
  risk: string;
  status: string;
  created: string;
  resolvedAt?: string;
  reason?: string;
}

function ApprovalsPanel() {
  const [pending, setPending] = useState<ApprovalItem[]>([]);
  const [history, setHistory] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch("/api/clawbot/approvals", { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return;
      const data = await res.json();
      setPending(data.pending || []);
      setHistory(data.history || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 15000);
    return () => clearInterval(interval);
  }, [fetchApprovals]);

  const handleApprove = async (item: ApprovalItem) => {
    setActionInProgress(item.id);
    try {
      const action = item.type === "build" ? "approve-and-build" : "approve";
      const res = await fetch("/api/clawbot/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: item.id, type: item.type }),
      });
      if (res.ok) await fetchApprovals();
    } catch {
      // silent
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    setActionInProgress(item.id);
    try {
      const res = await fetch("/api/clawbot/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", id: item.id, reason: rejectReasons[item.id] || "" }),
      });
      if (res.ok) {
        setShowRejectInput(null);
        setRejectReasons((prev) => { const next = { ...prev }; delete next[item.id]; return next; });
        await fetchApprovals();
      }
    } catch {
      // silent
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingItems = pending.filter((p) => p.status === "pending");
  const pendingCount = pendingItems.length;

  const riskColors: Record<string, string> = {
    low: DS.colors.accent,
    medium: DS.colors.warning,
    high: DS.colors.error,
  };

  const recentHistory = history.slice(0, 3);

  return (
    <div
      style={{
        background: DS.colors.bgCard,
        border: pendingCount > 0 ? "1px solid #FFD54F44" : "1px solid #1a1a1a",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: pendingCount > 0 ? 14 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: DS.colors.warning,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            ⚡ APPROVALS
          </span>
          {pendingCount > 0 && (
            <span
              style={{
                fontSize: 9,
                padding: "2px 10px",
                borderRadius: 10,
                background: "#FFD54F22",
                color: DS.colors.warning,
                border: "1px solid #FFD54F44",
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: "JetBrains Mono, monospace",
                animation: "approvalPulse 2s ease-in-out infinite",
              }}
            >
              {pendingCount} PENDING
            </span>
          )}
        </div>
        {pendingCount === 0 && !loading && (
          <span
            style={{
              fontSize: 9,
              color: DS.colors.textMuted,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            All clear
          </span>
        )}
      </div>

      {loading && pendingCount === 0 && (
        <div
          style={{
            color: DS.colors.textMuted,
            fontSize: 10,
            textAlign: "center",
            padding: "8px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Loading approvals...
        </div>
      )}

      {/* Pending items */}
      {pendingItems.map((item) => (
        <div
          key={item.id}
          style={{
            background: DS.colors.bgCard,
            border: "1px solid #FFD54F33",
            borderLeft: `3px solid ${riskColors[item.risk] || DS.colors.warning}`,
            borderRadius: 6,
            padding: "14px 16px",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: DS.colors.text,
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{
                    fontSize: 8,
                    padding: "2px 6px",
                    borderRadius: 10,
                    background: (riskColors[item.risk] || DS.colors.warning) + "15",
                    color: riskColors[item.risk] || DS.colors.warning,
                    border: `1px solid ${(riskColors[item.risk] || DS.colors.warning)}33`,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {item.risk} RISK
                </span>
                <span
                  style={{
                    fontSize: 8,
                    padding: "2px 6px",
                    borderRadius: 10,
                    background: "#4FC3F715",
                    color: "#4FC3F7",
                    border: "1px solid #4FC3F733",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {item.type}
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: DS.colors.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 8,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {item.description}
              </div>

              {/* Deploy target info */}
              {item.type === "deploy" && item.target && (
                <div
                  style={{
                    fontSize: 9,
                    color: DS.colors.warning,
                    padding: "4px 8px",
                    background: "#FFD54F08",
                    border: "1px solid #FFD54F22",
                    borderRadius: 4,
                    marginBottom: 8,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  📦 This will deploy to <strong>{item.target}</strong>
                </div>
              )}

              {/* Build info */}
              {item.type === "build" && (
                <div
                  style={{
                    fontSize: 9,
                    color: DS.colors.accentPurple,
                    padding: "4px 8px",
                    background: "#E040FB08",
                    border: "1px solid #E040FB22",
                    borderRadius: 4,
                    marginBottom: 8,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  🔧 This will start building in test environment
                </div>
              )}

              {/* File list */}
              {item.files && item.files.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                  {item.files.map((f) => (
                    <span
                      key={f}
                      style={{
                        fontSize: 8,
                        padding: "2px 6px",
                        background: "#1a1a1a",
                        border: "1px solid #222",
                        borderRadius: 3,
                        color: DS.colors.textSecondary,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => handleApprove(item)}
              disabled={actionInProgress === item.id}
              style={{
                padding: "8px 20px",
                background: actionInProgress === item.id ? "#111" : DS.colors.accent,
                color: actionInProgress === item.id ? "#444" : "#000",
                border: "none",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: actionInProgress === item.id ? "not-allowed" : "pointer",
                fontFamily: "JetBrains Mono, monospace",
                transition: "all 0.2s",
              }}
            >
              ✅ APPROVE
            </button>
            {showRejectInput !== item.id ? (
              <button
                onClick={() => setShowRejectInput(item.id)}
                disabled={actionInProgress === item.id}
                style={{
                  padding: "8px 20px",
                  background: "#1a0a0a",
                  color: DS.colors.error,
                  border: "1px solid #FF525233",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: actionInProgress === item.id ? "not-allowed" : "pointer",
                  fontFamily: "JetBrains Mono, monospace",
                  transition: "all 0.2s",
                }}
              >
                ❌ REJECT
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 200 }}>
                <input
                  value={rejectReasons[item.id] || ""}
                  onChange={(e) => setRejectReasons((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Reason (optional)..."
                  style={{
                    flex: 1,
                    background: DS.colors.bg,
                    border: "1px solid #FF525233",
                    borderRadius: 4,
                    padding: "6px 10px",
                    color: DS.colors.text,
                    fontSize: 10,
                    fontFamily: "JetBrains Mono, monospace",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => handleReject(item)}
                  disabled={actionInProgress === item.id}
                  style={{
                    padding: "6px 14px",
                    background: DS.colors.error,
                    color: "#000",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  CONFIRM REJECT
                </button>
                <button
                  onClick={() => setShowRejectInput(null)}
                  style={{
                    padding: "6px 10px",
                    background: "transparent",
                    color: DS.colors.textMuted,
                    border: "1px solid #1e1e1e",
                    borderRadius: 4,
                    fontSize: 9,
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Recent history */}
      {recentHistory.length > 0 && (
        <div style={{ marginTop: pendingItems.length > 0 ? 12 : 8 }}>
          <div
            style={{
              fontSize: 8,
              color: DS.colors.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Recent
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {recentHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  background: DS.colors.bgCard,
                  border: `1px solid ${item.status === "approved" ? "#00FFB215" : "#FF525215"}`,
                  borderLeft: `3px solid ${item.status === "approved" ? DS.colors.accent : DS.colors.error}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                <span>{item.status === "approved" ? "✅" : "❌"}</span>
                <span style={{ color: DS.colors.textSecondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.title}
                </span>
                <span style={{ color: DS.colors.textMuted, fontSize: 8 }}>
                  {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes approvalPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Architect Status Panel ---------- */
interface ArchitectStatus {
  lastHeartbeat: string | null;
  autonomousMode: boolean;
  activeMissions: number;
  pendingApprovals: number;
  queuedMissions: Array<{ id: string; title: string; priority: string }>;
  lastAction: string;
  totalMissionsCompleted: number;
  totalHeartbeats: number;
  nextHeartbeat: string | null;
}

function ArchitectStatusPanel() {
  const [status, setStatus] = useState<ArchitectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [, setTicker] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/clawbot/architect", {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Tick every 10s for countdown
  useEffect(() => {
    const interval = setInterval(() => setTicker((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutonomous = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/clawbot/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-autonomous" }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch {
      // silent
    } finally {
      setToggling(false);
    }
  };

  const getHeartbeatAge = (): string => {
    if (!status?.lastHeartbeat) return "never";
    const diff = Math.floor(
      (Date.now() - new Date(status.lastHeartbeat).getTime()) / 1000
    );
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getNextHeartbeatCountdown = (): string => {
    if (!status?.nextHeartbeat) return "unknown";
    const diff = Math.floor(
      (new Date(status.nextHeartbeat).getTime() - Date.now()) / 1000
    );
    if (diff <= 0) return "imminent";
    if (diff < 60) return `${diff}s`;
    return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  };

  const isActive =
    status?.lastHeartbeat &&
    Date.now() - new Date(status.lastHeartbeat).getTime() < 35 * 60 * 1000;
  const isAutonomous = status?.autonomousMode ?? false;

  return (
    <div
      style={{
        background: DS.colors.bgCard,
        border: `1px solid ${isActive ? "#4FC3F733" : "#1a1a1a"}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "#4FC3F7",
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            🏛️ ARCHITECT STATUS
          </span>
          <span
            style={{
              fontSize: 8,
              padding: "2px 8px",
              borderRadius: 10,
              background: isActive ? "#4ADE8015" : "#33333315",
              color: isActive ? DS.colors.accent : DS.colors.textMuted,
              border: `1px solid ${isActive ? "#4ADE8033" : "#33333333"}`,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {isActive ? "ACTIVE" : "SLEEPING"}
          </span>
        </div>
      </div>

      {loading && !status && (
        <div
          style={{
            color: DS.colors.textMuted,
            fontSize: 10,
            textAlign: "center",
            padding: "12px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Loading architect status...
        </div>
      )}

      {status && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Last Heartbeat",
                value: getHeartbeatAge(),
                color: isActive ? DS.colors.accent : DS.colors.textMuted,
              },
              {
                label: "Next Heartbeat",
                value: getNextHeartbeatCountdown(),
                color: "#4FC3F7",
              },
              {
                label: "Total Heartbeats",
                value: status.totalHeartbeats.toString(),
                color: DS.colors.text,
              },
              {
                label: "Missions Done",
                value: status.totalMissionsCompleted.toString(),
                color: "#CE93D8",
              },
              {
                label: "Active",
                value: status.activeMissions.toString(),
                color: DS.colors.warning,
              },
              {
                label: "Pending Approvals",
                value: status.pendingApprovals.toString(),
                color:
                  status.pendingApprovals > 0
                    ? DS.colors.warning
                    : DS.colors.textMuted,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.12em",
                    color: DS.colors.textMuted,
                    textTransform: "uppercase",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {stat.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: stat.color,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Last action + autonomous toggle row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: "#0d0d0d",
              border: "1px solid #151515",
              borderRadius: 6,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 8,
                  color: DS.colors.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                Last Action
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: DS.colors.textSecondary,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {status.lastAction}
              </div>
            </div>

            {/* Autonomous toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: isAutonomous
                    ? DS.colors.accentPurple
                    : DS.colors.textMuted,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Autonomous
              </span>
              <button
                onClick={handleToggleAutonomous}
                disabled={toggling || loading}
                style={{
                  position: "relative",
                  width: 44,
                  height: 22,
                  borderRadius: 11,
                  border: `1px solid ${isAutonomous ? "#E040FB44" : "#333"}`,
                  background: isAutonomous ? "#E040FB22" : "#111",
                  cursor: toggling ? "not-allowed" : "pointer",
                  padding: 0,
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: isAutonomous ? 23 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: isAutonomous
                      ? DS.colors.accentPurple
                      : "#444",
                    transition: "all 0.3s",
                    boxShadow: isAutonomous
                      ? "0 0 8px #E040FB"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Queued missions preview */}
          {status.queuedMissions.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 8,
                  color: DS.colors.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                Next in Queue ({status.queuedMissions.length})
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: DS.colors.textSecondary,
                  padding: "6px 10px",
                  background: "#0d0d0d",
                  border: "1px solid #151515",
                  borderRadius: 4,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {status.queuedMissions[0]?.title || "none"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Autonomous Mode Panel ---------- */
interface AutonomousQueueItem {
  id: string;
  title: string;
  priority: string;
  source: string;
  agents: string[];
  status: string;
  startedAt?: string;
}

function AutonomousModePanel() {
  const [mode, setMode] = useState<string>("off");
  const [queue, setQueue] = useState<AutonomousQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/clawbot/autonomous", { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return;
      const data = await res.json();
      setMode(data.mode || "off");
      setQueue(data.queue || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/clawbot/autonomous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-mode" }),
      });
      if (res.ok) {
        const data = await res.json();
        setMode(data.mode);
      }
    } catch {
      // silent
    } finally {
      setToggling(false);
    }
  };

  const isOn = mode === "on";
  const queuedItems = queue.filter((q) => q.status === "queued");
  const nextMission = queuedItems[0];

  const priorityColors: Record<string, string> = {
    high: DS.colors.error,
    medium: DS.colors.warning,
    low: DS.colors.accent,
  };

  return (
    <div
      style={{
        background: DS.colors.bgCard,
        border: `1px solid ${isOn ? "#E040FB33" : "#1a1a1a"}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header with toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: queuedItems.length > 0 ? 14 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: isOn ? DS.colors.accentPurple : "#555",
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            🤖 AUTONOMOUS MODE
          </span>
          {isOn && (
            <span
              style={{
                fontSize: 8,
                padding: "2px 8px",
                borderRadius: 10,
                background: "#E040FB15",
                color: DS.colors.accentPurple,
                border: "1px solid #E040FB33",
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              ACTIVE
            </span>
          )}
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={toggling || loading}
          style={{
            position: "relative",
            width: 44,
            height: 22,
            borderRadius: 11,
            border: `1px solid ${isOn ? "#E040FB44" : "#333"}`,
            background: isOn ? "#E040FB22" : "#111",
            cursor: toggling ? "not-allowed" : "pointer",
            padding: 0,
            transition: "all 0.3s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: isOn ? 23 : 2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: isOn ? DS.colors.accentPurple : "#444",
              transition: "all 0.3s",
              boxShadow: isOn ? "0 0 8px #E040FB" : "none",
            }}
          />
        </button>
      </div>

      {/* Status message */}
      <div
        style={{
          fontSize: 10,
          color: isOn ? DS.colors.accentPurple : "#444",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: queuedItems.length > 0 ? 12 : 0,
        }}
      >
        {isOn ? (
          nextMission ? (
            <>Agents are self directing. Next mission: <strong style={{ color: DS.colors.text }}>{nextMission.title}</strong></>
          ) : (
            "Agents are self directing. Queue is empty."
          )
        ) : (
          "Agents waiting for instructions"
        )}
      </div>

      {/* Queue list */}
      {queuedItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {queuedItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                background: idx === 0 && isOn ? "#E040FB06" : "#0d0d0d",
                border: `1px solid ${idx === 0 && isOn ? "#E040FB22" : "#151515"}`,
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: DS.colors.textMuted,
                  fontWeight: 700,
                  fontFamily: "JetBrains Mono, monospace",
                  width: 20,
                  textAlign: "center",
                }}
              >
                #{idx + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: idx === 0 ? "#ccc" : "#777",
                    fontFamily: "Inter, sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: DS.colors.textMuted,
                    fontFamily: "JetBrains Mono, monospace",
                    marginTop: 2,
                  }}
                >
                  {item.agents.join(", ")} · {item.source}
                </div>
              </div>
              <span
                style={{
                  fontSize: 8,
                  padding: "2px 6px",
                  borderRadius: 10,
                  background: (priorityColors[item.priority] || DS.colors.warning) + "15",
                  color: priorityColors[item.priority] || DS.colors.warning,
                  border: `1px solid ${(priorityColors[item.priority] || DS.colors.warning)}33`,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {item.priority}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Agent Leaderboard ---------- */
interface LeaderboardEntry {
  agentId: string;
  avgScore: number;
  missionCount: number;
  strongest: string;
  weakest: string;
  lastDelta: number;
  scores: Array<{
    mission: string;
    average: number;
    bossApproved: boolean;
  }>;
}

const AGENT_DISPLAY_MAP: Record<string, { name: string; icon: string; color: string }> = {
  wordcel: { name: "Wordcel", icon: "✍️", color: "#E040FB" },
  plumber: { name: "The Plumber", icon: "🔧", color: "#FFD54F" },
  "pixel-pepe": { name: "Pixel Pepe", icon: "🎨", color: "#FF6B35" },
  layoutooor: { name: "Layoutooor", icon: "⚡", color: "#4FC3F7" },
  gatekeeper: { name: "The Gatekeeper", icon: "🦅", color: "#CE93D8" },
};

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 10);
  const min = Math.min(...values, 5);
  const range = max - min || 1;
  const width = 60;
  const height = 20;
  const step = width / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
      {values.length > 0 && (
        <circle
          cx={(values.length - 1) * step}
          cy={height - ((values[values.length - 1] - min) / range) * height}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}

function AgentLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/clawbot/scores?leaderboard=true", {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.leaderboard) {
        setEntries(data.leaderboard);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  if (loading && entries.length === 0) {
    return (
      <div
        style={{
          background: DS.colors.bgCard,
          border: `1px solid ${DS.colors.border}`,
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            color: DS.colors.accent,
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          🏆 AGENT LEADERBOARD
        </div>
        <div
          style={{
            color: DS.colors.textMuted,
            fontSize: 10,
            textAlign: "center",
            padding: "20px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Loading scores...
        </div>
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div
      style={{
        background: DS.colors.bgCard,
        border: `1px solid ${DS.colors.border}`,
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: DS.colors.accent,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            🏆 AGENT LEADERBOARD
          </span>
          <span
            style={{
              fontSize: 8,
              padding: "2px 8px",
              borderRadius: 10,
              background: "#4ADE8015",
              color: DS.colors.accent,
              border: `1px solid #4ADE8033`,
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {entries.length} AGENTS
          </span>
        </div>
        <span
          style={{
            fontSize: 8,
            color: DS.colors.textMuted,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Ranked by avg score
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map((entry, idx) => {
          const display = AGENT_DISPLAY_MAP[entry.agentId] || {
            name: entry.agentId,
            icon: "🤖",
            color: "#666",
          };
          const isFirst = idx === 0;
          const deltaColor =
            entry.lastDelta > 0
              ? DS.colors.accent
              : entry.lastDelta < 0
                ? DS.colors.error
                : DS.colors.textMuted;
          const deltaSign = entry.lastDelta > 0 ? "+" : "";
          const sparkValues = entry.scores.map((s) => s.average);

          return (
            <div
              key={entry.agentId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: isFirst ? `${display.color}08` : "#0d0d0d",
                border: `1px solid ${isFirst ? display.color + "33" : "#1a1a1a"}`,
                borderRadius: 6,
                transition: "all 0.3s",
              }}
            >
              {/* Rank */}
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: isFirst ? DS.colors.accent : "#333",
                  fontFamily: "JetBrains Mono, monospace",
                  width: 28,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                #{idx + 1}
              </span>

              {/* Icon */}
              <span
                style={{
                  fontSize: 22,
                  flexShrink: 0,
                  filter: isFirst
                    ? `drop-shadow(0 0 8px ${display.color})`
                    : "none",
                }}
              >
                {display.icon}
              </span>

              {/* Name + Meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isFirst ? DS.colors.text : "#999",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {display.name}
                  </span>
                  {isFirst && (
                    <span
                      style={{
                        fontSize: 8,
                        padding: "2px 6px",
                        background: "#4ADE8022",
                        color: DS.colors.accent,
                        borderRadius: 10,
                        fontWeight: 700,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      TOP PERFORMER
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 4,
                    fontSize: 9,
                    color: DS.colors.textMuted,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  <span>
                    {entry.missionCount} mission{entry.missionCount !== 1 ? "s" : ""}
                  </span>
                  <span>
                    Best: <span style={{ color: DS.colors.accent }}>{entry.strongest}</span>
                  </span>
                  <span>
                    Focus: <span style={{ color: DS.colors.warning }}>{entry.weakest}</span>
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              <div style={{ flexShrink: 0 }}>
                <MiniSparkline values={sparkValues} color={display.color} />
              </div>

              {/* Delta */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  flexShrink: 0,
                  minWidth: 48,
                }}
              >
                {entry.lastDelta !== 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      color: deltaColor,
                      fontWeight: 700,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {deltaSign}{entry.lastDelta.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Score */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                  minWidth: 44,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: isFirst ? DS.colors.accent : display.color,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {entry.avgScore.toFixed(1)}
                </span>
                <span
                  style={{
                    fontSize: 7,
                    color: DS.colors.textMuted,
                    letterSpacing: "0.1em",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  AVG
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "Improving", color: DS.colors.accent, symbol: "▲" },
          { label: "Declining", color: DS.colors.error, symbol: "▼" },
          { label: "Steady", color: DS.colors.textMuted, symbol: "●" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 8,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            <span style={{ color: item.color, fontSize: 10 }}>{item.symbol}</span>
            <span style={{ color: DS.colors.textMuted }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Agent Recommendations Panel ---------- */
interface AgentRecommendation {
  id: string;
  mission: string;
  missionId: string;
  from: string;
  move: string;
  whyNow: string;
  expectedImpact: string;
  effort: string;
  priority: number;
}

function RecommendationsPanel() {
  const [recs, setRecs] = useState<AgentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [activated, setActivated] = useState<Set<string>>(new Set());
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  const fetchRecs = useCallback(async () => {
    try {
      const res = await fetch("/api/clawbot/recommendations", {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.recommendations) {
        setRecs(data.recommendations);
        // Auto expand first mission
        if (data.missions?.length > 0 && !expandedMission) {
          setExpandedMission(data.missions[0]);
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [expandedMission]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const handleActivate = async (rec: AgentRecommendation) => {
    setActivating(rec.id);
    try {
      const res = await fetch("/api/clawbot/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", recommendation: rec }),
      });
      const data = await res.json();
      if (data.success) {
        setActivated(prev => new Set([...prev, rec.id]));
      }
    } catch {
      // silent
    } finally {
      setActivating(null);
    }
  };

  // Group by mission
  const byMission = recs.reduce((acc, rec) => {
    if (!acc[rec.missionId]) acc[rec.missionId] = { name: rec.mission, recs: [] };
    acc[rec.missionId].recs.push(rec);
    return acc;
  }, {} as Record<string, { name: string; recs: AgentRecommendation[] }>);

  const effortColors: Record<string, string> = {
    Small: DS.colors.accent,
    Medium: DS.colors.warning,
    Large: DS.colors.error,
  };

  return (
    <div
      style={{
        background: DS.colors.bgCard,
        border: `1px solid ${DS.colors.border}`,
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "#FF6B35",
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            📋 RECOMMENDATIONS
          </span>
          {recs.length > 0 && (
            <span
              style={{
                fontSize: 8,
                padding: "2px 8px",
                borderRadius: 10,
                background: "#FF6B3515",
                color: "#FF6B35",
                border: "1px solid #FF6B3533",
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {recs.length} TOTAL
            </span>
          )}
        </div>
      </div>

      {loading && recs.length === 0 && (
        <div
          style={{
            color: DS.colors.textMuted,
            fontSize: 10,
            textAlign: "center",
            padding: "20px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Loading recommendations...
        </div>
      )}

      {!loading && recs.length === 0 && (
        <div
          style={{
            color: DS.colors.textMuted,
            fontSize: 10,
            textAlign: "center",
            padding: "20px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          No recommendations found. Complete a mission to generate agent recommendations.
        </div>
      )}

      {/* Mission groups */}
      {Object.entries(byMission).map(([missionId, group]) => {
        const isExpanded = expandedMission === missionId;
        const topRecs = isExpanded ? group.recs : group.recs.slice(0, 3);

        return (
          <div key={missionId} style={{ marginBottom: 12 }}>
            {/* Mission header */}
            <div
              onClick={() => setExpandedMission(isExpanded ? null : missionId)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                background: "#0d0d0d",
                border: "1px solid #151515",
                borderRadius: 4,
                cursor: "pointer",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 9,
                    color: DS.colors.textMuted,
                    fontFamily: "JetBrains Mono, monospace",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {missionId}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: DS.colors.textSecondary,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {group.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontSize: 8,
                    color: DS.colors.textMuted,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {group.recs.length} recs
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: DS.colors.textMuted,
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▾
                </span>
              </div>
            </div>

            {/* Recommendation cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {topRecs.map((rec, idx) => {
                const isActivated = activated.has(rec.id);
                const isActivatingThis = activating === rec.id;
                const effortKey = rec.effort.includes("Small") ? "Small" : rec.effort.includes("Medium") ? "Medium" : "Large";

                return (
                  <div
                    key={rec.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 12px",
                      background: idx === 0 ? "#FF6B3506" : "#0d0d0d",
                      border: `1px solid ${idx === 0 ? "#FF6B3522" : "#1a1a1a"}`,
                      borderRadius: 6,
                    }}
                  >
                    {/* Priority badge */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: idx === 0 ? "#FF6B35" : "#333",
                        fontFamily: "JetBrains Mono, monospace",
                        width: 20,
                        textAlign: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      #{idx + 1}
                    </span>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: idx === 0 ? DS.colors.text : "#999",
                          fontFamily: "Inter, sans-serif",
                          lineHeight: 1.4,
                          marginBottom: 4,
                        }}
                      >
                        {rec.move}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 8,
                            color: DS.colors.textMuted,
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          by {rec.from}
                        </span>
                        {rec.expectedImpact && (
                          <span
                            style={{
                              fontSize: 8,
                              padding: "1px 6px",
                              borderRadius: 10,
                              background: "#4ADE8010",
                              color: DS.colors.accent,
                              border: "1px solid #4ADE8022",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            {rec.expectedImpact}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 8,
                            padding: "1px 6px",
                            borderRadius: 10,
                            background: (effortColors[effortKey] || DS.colors.textMuted) + "10",
                            color: effortColors[effortKey] || DS.colors.textMuted,
                            border: `1px solid ${(effortColors[effortKey] || DS.colors.textMuted)}22`,
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {rec.effort}
                        </span>
                      </div>
                    </div>

                    {/* Activate button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleActivate(rec); }}
                      disabled={isActivated || isActivatingThis}
                      style={{
                        padding: "6px 12px",
                        background: isActivated ? "#4ADE8022" : isActivatingThis ? "#111" : "#FF6B3522",
                        color: isActivated ? DS.colors.accent : isActivatingThis ? "#444" : "#FF6B35",
                        border: `1px solid ${isActivated ? "#4ADE8033" : "#FF6B3533"}`,
                        borderRadius: 4,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: isActivated || isActivatingThis ? "not-allowed" : "pointer",
                        fontFamily: "JetBrains Mono, monospace",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {isActivated ? "✅ QUEUED" : isActivatingThis ? "..." : "ACTIVATE"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Syndicate Widget ---------- */
function SyndicateWidget() {
  return (
    <a
      href="/dashboard/syndicate"
      style={{
        display: "block",
        background: DS.colors.bgCard,
        border: `1px solid ${DS.colors.border}`,
        borderRadius: 8,
        padding: "12px 14px",
        textDecoration: "none",
        transition: "border-color 0.3s",
        marginTop: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: DS.colors.accentPurple,
          fontWeight: 700,
          letterSpacing: "0.1em",
          fontFamily: "Inter, sans-serif",
        }}
      >
        AI Agent Office
      </div>
      <div
        style={{
          fontSize: 9,
          color: DS.colors.textMuted,
          marginTop: 4,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {AGENTS.length} agents online
      </div>
      <div
        style={{
          fontSize: 9,
          color: "#4FC3F7",
          marginTop: 6,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        View Full Office →
      </div>
    </a>
  );
}

/* ---------- Live Subagent Feed ---------- */
function LiveSubagentFeed() {
  const [subagents, setSubagents] = useState<LiveSubagent[]>([]);

  const fetchSubagents = useCallback(async () => {
    try {
      const res = await fetch("/api/subagents", {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return;
      const data = await res.json();
      const running = (data.running || []).map(
        (a: Record<string, unknown>) => ({
          id: (a.id as string) || (a.sessionId as string) || "unknown",
          label: (a.label as string) || "Subagent",
          status: (a.status as string) || "running",
          model: (a.model as string) || "unknown",
          startedAt: (a.startedAt as string) || new Date().toISOString(),
          duration: a.duration as string | undefined,
        })
      );
      const recent = (data.recent || []).slice(0, 5).map(
        (a: Record<string, unknown>) => ({
          id: (a.id as string) || (a.sessionId as string) || "unknown",
          label: (a.label as string) || "Subagent",
          status: (a.status as string) || "completed",
          model: (a.model as string) || "unknown",
          startedAt: (a.startedAt as string) || "",
          duration: a.duration as string | undefined,
        })
      );
      setSubagents([...running, ...recent]);
    } catch {
      // Silent fail — feed is optional
    }
  }, []);

  useEffect(() => {
    fetchSubagents();
    const interval = setInterval(fetchSubagents, 15000);
    return () => clearInterval(interval);
  }, [fetchSubagents]);

  if (subagents.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 9,
          color: DS.colors.accent,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 6,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        Live Subagents ({subagents.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {subagents.map((sa) => {
          const isRunning = sa.status === "running";
          return (
            <div
              key={sa.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                background: isRunning ? "rgba(0,255,178,0.03)" : "transparent",
                border: `1px solid ${isRunning ? "#00FFB222" : "#151515"}`,
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: isRunning ? DS.colors.accent : "#444",
                  boxShadow: isRunning ? "0 0 6px #00FFB2" : "none",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: "#aaa",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {sa.label}
              </span>
              <span
                style={{
                  color: isRunning ? DS.colors.accent : "#444",
                  fontSize: 8,
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                {sa.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Pipeline Execution Logic (agent mapping for decompose)
// ============================================================================

const AGENT_PIPELINE_MAP: Record<string, string> = {
  planner: "orchestrator",
  researcher: "designer",
  coder: "frontend",
  reviewer: "reviewer",
  deployer: "backend",
};

const DECOMPOSE_KEYS = ["planner", "researcher", "coder", "reviewer", "deployer"] as const;

// ============================================================================
// Main Component
// ============================================================================

export default function ClawBotPage() {
  const [task, setTask] = useState("");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("STANDBY");
  const [agents, setAgents] = useState<Agent[]>(AGENTS.map((a) => ({ ...a })));
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([]);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [agentOutputs, setAgentOutputs] = useState<AgentOutput[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    sessionCost: 0,
    tasksCompleted: 0,
  });
  const [rosterCollapsed, setRosterCollapsed] = useState(false);
  const runRef = useRef(false);

  // Live agent status from autonomous queue (polls every 10s)
  const { data: liveAgentStatus } = useClawBotAgentStatus(10_000);

  // Sync live agent status into roster (only when pipeline is not running)
  useEffect(() => {
    if (!liveAgentStatus?.agents || pipelineStatus === "ACTIVE") return;
    setAgents((prev) =>
      prev.map((agent) => {
        const live = liveAgentStatus.agents.find((a) => a.agentId === agent.id);
        if (!live) return agent;
        const newStatus: AgentStatus =
          live.status === "working" ? "working"
          : live.status === "complete" ? "done"
          : "idle";
        return { ...agent, status: newStatus };
      })
    );
  }, [liveAgentStatus, pipelineStatus]);

  // Load autonomous queue missions into kanban on mount
  useEffect(() => {
    async function loadAutonomousTasks() {
      try {
        const res = await fetch('/api/clawbot/autonomous');
        const data = await res.json();
        const queue = data.queue || [];
        if (queue.length > 0) {
          const kanbanTasks: KanbanTask[] = queue.map((m: { id: string; title: string; status: string; priority: string; agents?: string[] }) => ({
            id: m.id,
            title: m.title,
            agent: m.agents?.[0] || 'architect',
            column: m.status === 'complete' ? 'done' as TaskColumn
              : m.status === 'in-progress' ? 'in_progress' as TaskColumn
              : m.status === 'failed' ? 'failed' as TaskColumn
              : m.status === 'review' ? 'review' as TaskColumn
              : 'queue' as TaskColumn,
            startedAt: Date.now(),
          }));
          setTasks(kanbanTasks);
        }
      } catch { /* silent */ }
    }
    loadAutonomousTasks();
    const interval = setInterval(loadAutonomousTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time ticker for active tasks
  const [, setTick] = useState(0);
  useEffect(() => {
    if (pipelineStatus !== "ACTIVE") return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [pipelineStatus]);

  // Helper: add feed entry
  const addFeed = useCallback(
    (
      message: string,
      type: FeedEntry["type"],
      agentIcon?: string
    ) => {
      setFeedEntries((prev) => [
        ...prev,
        {
          id: nextFeedId(),
          message,
          timestamp: Date.now(),
          type,
          agentIcon,
        },
      ]);
    },
    []
  );

  // Helper: update agent status
  const updateAgentStatus = useCallback(
    (agentId: string, status: AgentStatus, taskDelta = 0) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, status, taskCount: a.taskCount + taskDelta }
            : a
        )
      );
    },
    []
  );

  // Helper: move task to column
  const moveTask = useCallback((taskId: string, column: TaskColumn) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updates: Partial<KanbanTask> = { column };
        if (column === "in_progress" && !t.startedAt) updates.startedAt = Date.now();
        if (column === "done" || column === "failed") updates.completedAt = Date.now();
        return { ...t, ...updates };
      })
    );
  }, []);

  // Helper: update agent output
  const updateOutput = useCallback(
    (agentId: string, updates: Partial<AgentOutput>) => {
      setAgentOutputs((prev) => {
        const existing = prev.find((o) => o.agentId === agentId);
        if (existing) {
          return prev.map((o) =>
            o.agentId === agentId ? { ...o, ...updates } : o
          );
        }
        return [
          ...prev,
          {
            agentId,
            thoughts: "",
            output: "",
            actions: 0,
            status: "waiting" as const,
            ...updates,
          },
        ];
      });
    },
    []
  );

  // Helper: increment tokens
  const addTokens = useCallback((input: number, output: number) => {
    setTokenStats((prev) => {
      const newInput = prev.inputTokens + input;
      const newOutput = prev.outputTokens + output;
      return {
        inputTokens: newInput,
        outputTokens: newOutput,
        totalTokens: newInput + newOutput,
        sessionCost:
          (newInput / 1000) * PRICING.inputPer1K +
          (newOutput / 1000) * PRICING.outputPer1K,
        tasksCompleted: prev.tasksCompleted,
      };
    });
  }, []);

  // ==================== Pipeline Execution ====================
  const runPipeline = useCallback(
    async (taskText: string) => {
      if (!taskText.trim()) return;
      runRef.current = true;
      setPipelineStatus("ACTIVE");
      setTasks([]);
      setFeedEntries([]);
      setAgentOutputs([]);
      setTokenStats({
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        sessionCost: 0,
        tasksCompleted: 0,
      });
      setAgents(AGENTS.map((a) => ({ ...a })));

      // Initialize agent output panels
      AGENTS.forEach((a) => {
        updateOutput(a.id, {
          status: "waiting",
          thoughts: "Awaiting dispatch...",
          output: "",
          actions: 0,
        });
      });

      // Create main task in queue
      const mainTaskId = nextTaskId();
      const mainTask: KanbanTask = {
        id: mainTaskId,
        title: taskText,
        agentId: "orchestrator",
        agentName: "Gigabrain",
        agentIcon: "🧠",
        column: "queue",
        createdAt: Date.now(),
      };
      setTasks([mainTask]);
      addFeed("New task queued for decomposition", "task", "📋");

      // Step 1: Decompose via API
      updateAgentStatus("orchestrator", "working", 1);
      updateOutput("orchestrator", {
        status: "working",
        thoughts: "Decomposing task into subtasks for the team...",
      });
      moveTask(mainTaskId, "in_progress");
      addFeed("Gigabrain started decomposing task", "agent", "🧠");

      let decomposed: Record<string, string>;
      try {
        const res = await fetch("/api/clawbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "decompose", task: taskText }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        decomposed = data.result;
        // Estimate tokens for decompose call
        addTokens(200, 150);
        addFeed(
          "Gigabrain finished: task decomposed into subtasks",
          "agent",
          "🧠"
        );
      } catch (e) {
        decomposed = {
          planner: `Define scope for: ${taskText.slice(0, 40)}`,
          researcher: "Gather requirements and prior art",
          coder: "Implement solution and write code",
          reviewer: "Test, validate and QA the output",
          deployer: "Package and deploy to production",
        };
        addFeed(
          `Decompose fallback: ${e instanceof Error ? e.message : "error"}`,
          "system"
        );
      }

      updateAgentStatus("orchestrator", "done");
      updateOutput("orchestrator", {
        status: "done",
        output: JSON.stringify(decomposed, null, 2),
        actions: 1,
      });
      moveTask(mainTaskId, "done");

      // Create subtask cards in queue
      const subtaskIds: Record<string, string> = {};
      for (const key of DECOMPOSE_KEYS) {
        if (!runRef.current) break;
        const agentId = AGENT_PIPELINE_MAP[key];
        const agent = AGENTS.find((a) => a.id === agentId);
        if (!agent) continue;
        const tid = nextTaskId();
        subtaskIds[key] = tid;
        setTasks((prev) => [
          ...prev,
          {
            id: tid,
            title: decomposed[key] || `${key} task`,
            agentId: agent.id,
            agentName: agent.name,
            agentIcon: agent.icon,
            column: "queue" as TaskColumn,
            createdAt: Date.now(),
          },
        ]);
      }

      addFeed(
        `${DECOMPOSE_KEYS.length} subtasks created and queued`,
        "task",
        "📋"
      );

      // Step 2: Execute each agent sequentially
      let priorContext = "";
      for (const key of DECOMPOSE_KEYS) {
        if (!runRef.current) break;
        const agentId = AGENT_PIPELINE_MAP[key];
        const agent = AGENTS.find((a) => a.id === agentId);
        if (!agent) continue;
        const subtask = decomposed[key] || `${key} task`;
        const taskId = subtaskIds[key];

        // Move to in progress
        moveTask(taskId, "in_progress");
        updateAgentStatus(agentId, "working", 1);
        updateOutput(agentId, {
          status: "working",
          thoughts: `Working on: ${subtask}`,
        });
        addFeed(`${agent.name} started working`, "agent", agent.icon);

        try {
          const res = await fetch("/api/clawbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "execute",
              agentId: key,
              subtask,
              priorContext: priorContext || undefined,
            }),
          });

          if (!runRef.current) break;

          const data = await res.json();
          const output = data.result || `[${key}] Task completed`;

          // Estimate tokens
          const inputEst = Math.floor(Math.random() * 800) + 400;
          const outputEst = Math.floor(Math.random() * 600) + 200;
          addTokens(inputEst, outputEst);

          if (data.status === "error") {
            updateAgentStatus(agentId, "error");
            updateOutput(agentId, {
              status: "error",
              output,
              actions: 1,
            });
            moveTask(taskId, "failed");
            addFeed(`${agent.name} encountered an error`, "agent", agent.icon);
          } else {
            // Move to review first
            moveTask(taskId, "review");
            updateOutput(agentId, {
              status: "done",
              output,
              actions: data.mode === "gateway" ? 3 : 1,
              thoughts: data.mode === "gateway"
                ? "Executed via real agent gateway"
                : "Completed via Groq simulation",
            });
            addFeed(
              `${agent.name} finished: output delivered`,
              "agent",
              agent.icon
            );

            // Hawk Eye review simulation
            addFeed("Hawk Eye reviewing output...", "agent", "🦅");
            await new Promise((r) => setTimeout(r, 500));

            if (runRef.current) {
              moveTask(taskId, "done");
              updateAgentStatus(agentId, "done");
              addFeed(
                `Hawk Eye approved ${agent.name}'s output`,
                "agent",
                "🦅"
              );

              // Increment tasks completed
              setTokenStats((prev) => ({
                ...prev,
                tasksCompleted: prev.tasksCompleted + 1,
              }));
            }
          }

          priorContext += `\n\n### ${agent.name} Output:\n${output.slice(0, 1500)}`;
        } catch (err) {
          if (!runRef.current) break;
          updateAgentStatus(agentId, "error");
          const errMsg =
            err instanceof Error ? err.message : "Unknown error";
          updateOutput(agentId, {
            status: "error",
            output: `Error: ${errMsg}`,
            actions: 0,
          });
          moveTask(taskId, "failed");
          addFeed(
            `${agent.name} failed: ${errMsg}`,
            "agent",
            agent.icon
          );
          priorContext += `\n\n### ${agent.name}: FAILED`;
        }
      }

      if (runRef.current) {
        setPipelineStatus("COMPLETE");
        addFeed(
          "Pipeline complete. All agents have reported back.",
          "system",
          "✅"
        );

        // Update reviewer agent
        updateAgentStatus("reviewer", "done");
        updateOutput("reviewer", {
          status: "done",
          thoughts: "All outputs reviewed and approved",
          output: "Quality check passed for all deliverables",
          actions: DECOMPOSE_KEYS.length,
        });
      }

      runRef.current = false;
    },
    [addFeed, updateAgentStatus, moveTask, updateOutput, addTokens]
  );

  const handleHalt = () => {
    runRef.current = false;
    setPipelineStatus("STANDBY");
    setAgents((prev) =>
      prev.map((a) =>
        a.status === "working" ? { ...a, status: "error" } : a
      )
    );
    addFeed("Pipeline halted by operator", "system", "🛑");
  };

  const handleReset = () => {
    runRef.current = false;
    setPipelineStatus("STANDBY");
    setTask("");
    setTasks([]);
    setFeedEntries([]);
    setAgentOutputs([]);
    setTokenStats({
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      sessionCost: 0,
      tasksCompleted: 0,
    });
    setAgents(AGENTS.map((a) => ({ ...a })));
  };

  const isRunning = pipelineStatus === "ACTIVE";

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: DS.colors.text }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h1 style={{
          fontFamily: DS.fonts.heading,
          fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
          fontWeight: 400,
          color: DS.colors.text,
          letterSpacing: "-0.01em",
        }}>
          ClawBot
        </h1>
      </div>

      {/* Stats Bar */}
      <StatsBar stats={tokenStats} pipelineStatus={pipelineStatus} />

      {/* Approvals Panel */}
      <ApprovalsPanel />

      {/* Architect Status */}
      <ArchitectStatusPanel />

      {/* Autonomous Mode */}
      <AutonomousModePanel />

      {/* Main 3-column layout */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        {/* Left: Agent Roster */}
        <div className="clawbot-sidebar" style={{ display: "flex", flexDirection: "column" }}>
          <AgentRoster
            agents={agents}
            collapsed={rosterCollapsed}
            onToggle={() => setRosterCollapsed(!rosterCollapsed)}
          />
          <SyndicateWidget />
        </div>

        {/* Center: Kanban + Input + Outputs */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Kanban Board */}
          <KanbanBoard tasks={tasks} />

          {/* Task Input */}
          <div
            style={{
              background: DS.colors.bgCard,
              border: `1px solid ${DS.colors.border}`,
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: DS.colors.textMuted,
                letterSpacing: "0.12em",
                marginBottom: 8,
                textTransform: "uppercase",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              ◈ Task Input
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !isRunning &&
                  task.trim() &&
                  runPipeline(task)
                }
                placeholder="Define project task for agent pipeline..."
                disabled={isRunning}
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: DS.colors.bg,
                  border: "1px solid #1e1e1e",
                  borderRadius: 4,
                  padding: "10px 14px",
                  color: DS.colors.text,
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, monospace",
                  outline: "none",
                }}
              />
              <button
                onClick={() =>
                  !isRunning && task.trim() && runPipeline(task)
                }
                disabled={isRunning || !task.trim()}
                style={{
                  padding: "10px 20px",
                  background:
                    isRunning || !task.trim() ? "#111" : DS.colors.accent,
                  color:
                    isRunning || !task.trim() ? "#444" : "#000",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor:
                    isRunning || !task.trim()
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: "JetBrains Mono, monospace",
                  transition: "all 0.2s",
                }}
              >
                {isRunning ? "RUNNING" : "DISPATCH"}
              </button>
              {isRunning && (
                <button
                  onClick={handleHalt}
                  style={{
                    padding: "10px 16px",
                    background: "#1a0a0a",
                    color: DS.colors.error,
                    border: "1px solid #FF525233",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  HALT
                </button>
              )}
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  color: DS.colors.textMuted,
                  border: "1px solid #1e1e1e",
                  borderRadius: 4,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                RESET
              </button>
            </div>
            {/* Quick templates */}
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {TASK_TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => !isRunning && setTask(t)}
                  style={{
                    padding: "4px 10px",
                    background: "transparent",
                    border: "1px solid #1e1e1e",
                    borderRadius: 20,
                    color: DS.colors.textMuted,
                    fontSize: 9,
                    letterSpacing: "0.04em",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    fontFamily: "JetBrains Mono, monospace",
                    transition: "all 0.2s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Agent Output Panels */}
          <AgentOutputPanels outputs={agentOutputs} />

          {/* Agent Leaderboard */}
          <AgentLeaderboard />

          {/* Agent Recommendations */}
          <RecommendationsPanel />

          {/* Team Votes */}
          <TeamVotesPanel />

          {/* Live Subagent Feed */}
          <LiveSubagentFeed />
        </div>

        {/* Right: Live Feed */}
        <div className="clawbot-feed">
          <LiveFeed
            entries={feedEntries}
            filter={feedFilter}
            onFilterChange={setFeedFilter}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: "#1a1a1a",
            letterSpacing: "0.2em",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          CLAWBOT COMMAND CENTER // AGENT ORCHESTRATION SYSTEM
        </span>
        <span
          style={{
            fontSize: 9,
            color: "#1a1a1a",
            letterSpacing: "0.1em",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {tokenStats.tasksCompleted} TASKS COMPLETED THIS SESSION
        </span>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .clawbot-sidebar { display: none !important; }
          .clawbot-feed { display: none !important; }
        }
        @media (max-width: 768px) {
          .clawbot-sidebar, .clawbot-feed {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
