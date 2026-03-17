"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Config ────────────────────────────────────────────────────────────
const GATEWAY_WS_URL =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("gwUrl")
    ? new URLSearchParams(window.location.search).get("gwUrl")!
    : (process.env.NEXT_PUBLIC_GATEWAY_WS_URL || "ws://192.168.10.28:18789");

const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || "";
const SESSION_KEY = "main";

// ─── Types ─────────────────────────────────────────────────────────────
interface ContentBlock {
  type: string;
  text?: string;
  thinking?: string;
  source?: { type: string; media_type: string; data: string };
}

interface ChatMessage {
  role: string;
  content: string | ContentBlock[];
  timestamp?: number;
  toolCallId?: string;
}

interface Attachment {
  file: File;
  preview?: string;
  type: "image" | "video" | "pdf" | "other";
}

// ─── Helpers ───────────────────────────────────────────────────────────
function uuid(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function extractText(msg: ChatMessage): string {
  if (typeof msg.content === "string") return msg.content;
  if (!Array.isArray(msg.content)) return "";
  return msg.content
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text!)
    .join("\n");
}

function extractThinking(msg: ChatMessage): string | null {
  if (!Array.isArray(msg.content)) return null;
  const parts = msg.content
    .filter((b) => b.type === "thinking" && b.thinking)
    .map((b) => b.thinking!);
  return parts.length > 0 ? parts.join("\n") : null;
}

function hasImages(msg: ChatMessage): ContentBlock[] {
  if (!Array.isArray(msg.content)) return [];
  return msg.content.filter(
    (b) => b.type === "image" && b.source?.type === "base64"
  );
}

function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function stripThinkTags(text: string): string {
  return text
    .replace(/<\s*\/?(?:think(?:ing)?|thought|antthinking)\b[^>]*>/gi, "")
    .replace(/<\s*\/?final\b[^>]*>/gi, "")
    .trimStart();
}

function getAttachmentType(file: File): Attachment["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "other";
}

// ─── Simple Markdown-ish renderer ──────────────────────────────────────
function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="chat-code-block"><code>$2</code></pre>'
  );
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="chat-link">$1</a>'
  );
  // Line breaks
  html = html.replace(/\n/g, "<br>");

  return html;
}

// ─── Gateway WebSocket Hook ────────────────────────────────────────────
function useGateway() {
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<
    Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>
  >(new Map());
  const eventHandlerRef = useRef<((event: string, payload: unknown) => void) | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectSentRef = useRef(false);
  const connectNonceRef = useRef<string | null>(null);
  const closedRef = useRef(false);

  const sendRequest = useCallback(
    (method: string, params: unknown): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error("Not connected"));
          return;
        }
        const id = uuid();
        pendingRef.current.set(id, { resolve, reject });
        ws.send(JSON.stringify({ type: "req", id, method, params }));
      });
    },
    []
  );

  const sendConnect = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || connectSentRef.current) return;
    connectSentRef.current = true;

    const params = {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: "mission-control-chat",
        version: "1.0.0",
        platform: "web",
        mode: "webchat",
        instanceId: uuid(),
      },
      role: "operator",
      scopes: ["operator.admin"],
      caps: ["tool-events"],
      auth: { token: GATEWAY_TOKEN },
      userAgent: navigator.userAgent,
      locale: navigator.language,
    };

    const id = uuid();
    pendingRef.current.set(id, {
      resolve: () => setConnected(true),
      reject: (err) => {
        console.error("[gateway] connect failed:", err);
        setConnected(false);
      },
    });
    ws.send(JSON.stringify({ type: "req", id, method: "connect", params }));
  }, []);

  const connect = useCallback(() => {
    if (closedRef.current) return;
    const ws = new WebSocket(GATEWAY_WS_URL);
    wsRef.current = ws;
    connectSentRef.current = false;
    connectNonceRef.current = null;

    ws.addEventListener("open", () => {
      // Wait for connect.challenge event before sending connect
    });

    ws.addEventListener("message", (e) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(String(e.data));
      } catch {
        return;
      }

      if (data.type === "event") {
        const evt = data as { event: string; payload: unknown };
        if (evt.event === "connect.challenge") {
          const payload = evt.payload as { nonce?: string } | null;
          if (payload?.nonce) {
            connectNonceRef.current = payload.nonce;
          }
          sendConnect();
          return;
        }
        eventHandlerRef.current?.(evt.event, evt.payload);
        return;
      }

      if (data.type === "res") {
        const res = data as {
          id: string;
          ok: boolean;
          payload?: unknown;
          error?: { code: string; message: string };
        };
        const pending = pendingRef.current.get(res.id);
        if (pending) {
          pendingRef.current.delete(res.id);
          if (res.ok) pending.resolve(res.payload);
          else pending.reject(new Error(res.error?.message ?? "request failed"));
        }
      }
    });

    ws.addEventListener("close", () => {
      setConnected(false);
      wsRef.current = null;
      // Flush pending
      for (const [, p] of pendingRef.current) p.reject(new Error("disconnected"));
      pendingRef.current.clear();
      // Reconnect
      if (!closedRef.current) {
        reconnectTimerRef.current = setTimeout(() => connect(), 2000);
      }
    });

    ws.addEventListener("error", () => {});
  }, [sendConnect]);

  useEffect(() => {
    closedRef.current = false;
    connect();
    return () => {
      closedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return { connected, sendRequest, eventHandlerRef };
}

// ─── Main Chat Component ───────────────────────────────────────────────
export default function ChatPage() {
  const { connected, sendRequest, eventHandlerRef } = useGateway();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamText, setStreamText] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<"jarvis" | "airi">("jarvis");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyLoadedRef = useRef(false);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = threadRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  // Load history when connected
  useEffect(() => {
    if (!connected || historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    sendRequest("chat.history", { sessionKey: SESSION_KEY, limit: 200 })
      .then((res) => {
        const data = res as { messages?: ChatMessage[] };
        if (data?.messages) {
          setMessages(data.messages);
          setTimeout(() => scrollToBottom(), 100);
        }
      })
      .catch((err) => console.error("[chat] history error:", err));
  }, [connected, sendRequest, scrollToBottom]);

  // Handle streaming events
  useEffect(() => {
    eventHandlerRef.current = (event: string, payload: unknown) => {
      if (event !== "chat") return;
      const p = payload as {
        state: string;
        message?: ChatMessage;
        sessionKey?: string;
        runId?: string;
        errorMessage?: string;
      };
      if (p.sessionKey && p.sessionKey !== SESSION_KEY) return;

      if (p.state === "delta") {
        const text = extractText(p.message!);
        if (text) setStreamText(text);
        scrollToBottom();
      } else if (p.state === "final") {
        if (p.message && p.message.role === "assistant") {
          setMessages((prev) => [...prev, p.message!]);
        } else if (streamText) {
          // Fallback: save the streamed text as a message
        }
        setStreamText(null);
        setRunId(null);
        scrollToBottom();
        // Reload history to get the clean version
        sendRequest("chat.history", { sessionKey: SESSION_KEY, limit: 200 })
          .then((res) => {
            const data = res as { messages?: ChatMessage[] };
            if (data?.messages) setMessages(data.messages);
          })
          .catch(() => {});
      } else if (p.state === "aborted") {
        if (p.message) setMessages((prev) => [...prev, p.message!]);
        setStreamText(null);
        setRunId(null);
      } else if (p.state === "error") {
        setStreamText(null);
        setRunId(null);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ Error: ${p.errorMessage ?? "Unknown error"}`,
            timestamp: Date.now(),
          },
        ]);
      }
    };
  }, [streamText, sendRequest, scrollToBottom, eventHandlerRef]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText, scrollToBottom]);

  // Send message
  const handleSend = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    if (!connected) return;

    // Build content array
    const contentParts: ContentBlock[] = [];
    if (text) contentParts.push({ type: "text", text });

    // Handle file attachments - upload them and include URLs in message
    const uploadedFiles: string[] = [];
    for (const att of attachments) {
      try {
        const formData = new FormData();
        formData.append("file", att.file);
        const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          uploadedFiles.push(`[${att.file.name}](${data.url})`);
        }
      } catch (err) {
        console.error("[chat] upload error:", err);
      }
    }

    // Add file references to message text
    let messageText = text;
    if (uploadedFiles.length > 0) {
      messageText += (text ? "\n\n" : "") + "Attached files:\n" + uploadedFiles.join("\n");
    }

    // Convert image attachments to base64 for inline sending
    const imageAttachments: { mimeType: string; content: string }[] = [];
    for (const att of attachments) {
      if (att.type === "image") {
        try {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(att.file);
          });
          const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            imageAttachments.push({ mimeType: match[1], content: match[2] });
          }
        } catch {
          // skip
        }
      }
    }

    // Optimistic UI update
    const userMsg: ChatMessage = {
      role: "user",
      content: contentParts.length === 1 && contentParts[0].type === "text"
        ? messageText
        : contentParts,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setSending(true);

    const idempotencyKey = uuid();
    setRunId(idempotencyKey);
    setStreamText("");

    try {
      await sendRequest("chat.send", {
        sessionKey: SESSION_KEY,
        message: messageText,
        deliver: false,
        idempotencyKey,
        ...(imageAttachments.length > 0
          ? {
              attachments: imageAttachments.map((a) => ({
                type: "image",
                mimeType: a.mimeType,
                content: a.content,
              })),
            }
          : {}),
      });
    } catch (err) {
      console.error("[chat] send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Send failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          timestamp: Date.now(),
        },
      ]);
      setStreamText(null);
      setRunId(null);
    } finally {
      setSending(false);
    }

    inputRef.current?.focus();
  };

  // Abort
  const handleAbort = async () => {
    try {
      await sendRequest("chat.abort", { sessionKey: SESSION_KEY, ...(runId ? { runId } : {}) });
    } catch {
      // ignore
    }
  };

  // File handling
  const addFiles = (files: FileList | File[]) => {
    const newAtts: Attachment[] = Array.from(files).map((file) => {
      const type = getAttachmentType(file);
      let preview: string | undefined;
      if (type === "image") {
        preview = URL.createObjectURL(file);
      }
      return { file, preview, type };
    });
    setAttachments((prev) => [...prev, ...newAtts]);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      const a = prev[idx];
      if (a.preview) URL.revokeObjectURL(a.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // Check if streaming
  const isStreaming = runId !== null && streamText !== null;

  return (
    <div
      className="chat-container"
      onDragOver={activeTab === "jarvis" ? handleDragOver : undefined}
      onDragLeave={activeTab === "jarvis" ? handleDragLeave : undefined}
      onDrop={activeTab === "jarvis" ? handleDrop : undefined}
    >
      {/* Tab Bar */}
      <div className="chat-tab-bar">
        <div className="chat-tab-bar-left">
          <button
            className={`chat-tab ${activeTab === "jarvis" ? "chat-tab--active" : ""}`}
            onClick={() => setActiveTab("jarvis")}
          >
            🤖 Jarvis
          </button>
          <button
            className={`chat-tab ${activeTab === "airi" ? "chat-tab--active" : ""}`}
            onClick={() => setActiveTab("airi")}
          >
            ✨ AIRI
          </button>
          {activeTab === "airi" && (
            <a
              href="https://airi.moeru.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="chat-airi-external"
            >
              Open in new tab ↗
            </a>
          )}
        </div>
        <div className="chat-header-right">
          {activeTab === "jarvis" && (
            <>
              <span className={`chat-status ${connected ? "chat-status--connected" : "chat-status--disconnected"}`}>
                {connected ? "● Connected" : "○ Disconnected"}
              </span>
              <button
                className="chat-btn-icon"
                onClick={() => setShowThinking(!showThinking)}
                title={showThinking ? "Hide thinking" : "Show thinking"}
              >
                🧠 {showThinking ? "On" : "Off"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Jarvis Chat Panel */}
      <div className="chat-panel" style={{ display: activeTab === "jarvis" ? "flex" : "none" }}>
        {/* Drag overlay */}
        {dragOver && (
          <div className="chat-drop-overlay">
            <div className="chat-drop-overlay-inner">
              <span className="chat-drop-icon">📎</span>
              <span>Drop files to attach</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="chat-thread" ref={threadRef}>
          {messages.length === 0 && !isStreaming && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p className="chat-empty-title">Start a conversation</p>
              <p className="chat-empty-sub">
                Send a message to Jarvis. Drag & drop files to attach them.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isSystem = msg.role === "system";
            const text = stripThinkTags(extractText(msg));
            const thinking = extractThinking(msg);
            const images = hasImages(msg);

            if (!text && !thinking && images.length === 0) return null;

            return (
              <div
                key={i}
                className={`chat-msg ${isUser ? "chat-msg--user" : isSystem ? "chat-msg--system" : "chat-msg--assistant"}`}
              >
                <div className="chat-msg-avatar">
                  {isUser ? "👤" : isSystem ? "⚙️" : "🤖"}
                </div>
                <div className="chat-msg-body">
                  <div className="chat-msg-meta">
                    <span className="chat-msg-role">
                      {isUser ? "You" : isSystem ? "System" : "Jarvis"}
                    </span>
                    <span className="chat-msg-time">{formatTime(msg.timestamp)}</span>
                  </div>

                  {showThinking && thinking && (
                    <div className="chat-thinking">
                      <div className="chat-thinking-label">💭 Thinking</div>
                      <div className="chat-thinking-text">{thinking}</div>
                    </div>
                  )}

                  {text && (
                    <div
                      className="chat-msg-text"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
                    />
                  )}

                  {images.map((img, j) => (
                    <div key={j} className="chat-msg-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:${img.source!.media_type};base64,${img.source!.data}`}
                        alt="attachment"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Streaming response */}
          {isStreaming && (
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-msg-avatar">🤖</div>
              <div className="chat-msg-body">
                <div className="chat-msg-meta">
                  <span className="chat-msg-role">Jarvis</span>
                  <span className="chat-msg-typing">
                    <span className="chat-typing-dot"></span>
                    <span className="chat-typing-dot"></span>
                    <span className="chat-typing-dot"></span>
                  </span>
                </div>
                {streamText ? (
                  <div
                    className="chat-msg-text"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(stripThinkTags(streamText)),
                    }}
                  />
                ) : (
                  <div className="chat-msg-text chat-msg-thinking-indicator">
                    <span className="chat-typing-dot"></span>
                    <span className="chat-typing-dot"></span>
                    <span className="chat-typing-dot"></span>
                    <span style={{ marginLeft: 8, opacity: 0.6 }}>Thinking...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="chat-attachments">
            {attachments.map((att, i) => (
              <div key={i} className="chat-attachment-preview">
                {att.type === "image" && att.preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={att.preview} alt={att.file.name} className="chat-att-img" />
                )}
                {att.type === "video" && (
                  <div className="chat-att-file">🎬 {att.file.name}</div>
                )}
                {att.type === "pdf" && (
                  <div className="chat-att-file">📄 {att.file.name}</div>
                )}
                {att.type === "other" && (
                  <div className="chat-att-file">📎 {att.file.name}</div>
                )}
                <button
                  className="chat-att-remove"
                  onClick={() => removeAttachment(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <button
            className="chat-btn-attach"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={connected ? "Message Jarvis..." : "Connecting..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!connected}
            rows={1}
          />
          {isStreaming ? (
            <button className="chat-btn-abort" onClick={handleAbort} title="Stop">
              ⏹
            </button>
          ) : (
            <button
              className="chat-btn-send"
              onClick={handleSend}
              disabled={!connected || (!input.trim() && attachments.length === 0)}
              title="Send (Enter)"
            >
              ➤
            </button>
          )}
        </div>
      </div>

      {/* AIRI Panel */}
      <div className="chat-panel" style={{ display: activeTab === "airi" ? "flex" : "none" }}>
        <iframe
          src="https://airi.moeru.ai/"
          className="chat-airi-iframe"
          allow="microphone; camera; autoplay"
          title="Project AIRI"
        />
      </div>

      <style>{chatStyles}</style>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────
const chatStyles = `
  .chat-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 4rem);
    max-height: calc(100vh - 4rem);
    position: relative;
    overflow: hidden;
  }

  @media (min-width: 1024px) {
    .chat-container {
      height: calc(100vh - 2rem);
      max-height: calc(100vh - 2rem);
    }
  }

  /* Tab Bar */
  .chat-tab-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    background: #141619;
  }

  .chat-tab-bar-left {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .chat-tab {
    background: transparent;
    border: none;
    color: var(--text-muted);
    padding: 12px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
    font-family: inherit;
  }

  .chat-tab:hover {
    color: var(--text);
  }

  .chat-tab--active {
    color: #00D4AA;
  }

  .chat-tab--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 8px;
    right: 8px;
    height: 2px;
    background: #00D4AA;
    border-radius: 2px 2px 0 0;
  }

  .chat-airi-external {
    color: var(--text-muted);
    font-size: 0.75rem;
    text-decoration: none;
    padding: 4px 8px;
    margin-left: 8px;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
  }

  .chat-airi-external:hover {
    color: #00D4AA;
    background: rgba(0, 212, 170, 0.08);
  }

  .chat-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Panels */
  .chat-panel {
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    min-height: 0;
  }

  /* AIRI iframe */
  .chat-airi-iframe {
    width: 100%;
    height: 100%;
    border: none;
    flex: 1;
  }

  .chat-status {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 9999px;
  }

  .chat-status--connected {
    color: var(--accent);
    background: rgba(34, 197, 94, 0.1);
  }

  .chat-status--disconnected {
    color: var(--danger);
    background: rgba(239, 68, 68, 0.1);
  }

  .chat-btn-icon {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.15s;
  }
  .chat-btn-icon:hover {
    background: var(--bg-card);
    color: var(--text);
  }

  /* Thread */
  .chat-thread {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scroll-behavior: auto;
  }

  .chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
  }
  .chat-empty-icon { font-size: 3rem; margin-bottom: 12px; }
  .chat-empty-title { font-size: 1.1rem; font-weight: 600; }
  .chat-empty-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }

  /* Messages */
  .chat-msg {
    display: flex;
    gap: 10px;
    max-width: 85%;
    animation: chat-fade-in 0.2s ease-out;
  }

  @keyframes chat-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .chat-msg--user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .chat-msg--assistant {
    align-self: flex-start;
  }

  .chat-msg--system {
    align-self: center;
    max-width: 90%;
    opacity: 0.6;
  }

  .chat-msg-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .chat-msg-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .chat-msg--user .chat-msg-body {
    align-items: flex-end;
  }

  .chat-msg-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px;
  }

  .chat-msg-role {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .chat-msg-time {
    font-size: 0.65rem;
    color: var(--text-muted);
    opacity: 0.6;
  }

  .chat-msg-text {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 0.9rem;
    line-height: 1.55;
    word-break: break-word;
    max-width: 100%;
  }

  .chat-msg--user .chat-msg-text {
    background: var(--accent);
    color: #000;
    border-color: var(--accent);
    border-radius: 12px 12px 2px 12px;
  }

  .chat-msg--assistant .chat-msg-text {
    border-radius: 12px 12px 12px 2px;
  }

  .chat-msg-image img {
    max-width: 300px;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid var(--border);
    margin-top: 4px;
  }

  /* Thinking */
  .chat-thinking {
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 4px;
    font-size: 0.8rem;
  }
  .chat-thinking-label {
    font-weight: 600;
    font-size: 0.7rem;
    color: var(--info);
    margin-bottom: 4px;
  }
  .chat-thinking-text {
    color: var(--text-muted);
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
  }

  /* Typing indicator */
  .chat-msg-typing, .chat-msg-thinking-indicator {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .chat-typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
    animation: chat-bounce 1.4s infinite ease-in-out;
    display: inline-block;
  }
  .chat-typing-dot:nth-child(1) { animation-delay: 0s; }
  .chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes chat-bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* Code blocks */
  .chat-code-block {
    background: #1a1a2e;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 12px;
    overflow-x: auto;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.82rem;
    margin: 6px 0;
    line-height: 1.5;
  }
  .chat-inline-code {
    background: rgba(255,255,255,0.06);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.85em;
  }
  .chat-link {
    color: var(--info);
    text-decoration: underline;
  }

  /* Attachments */
  .chat-attachments {
    display: flex;
    gap: 8px;
    padding: 8px 16px;
    overflow-x: auto;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .chat-attachment-preview {
    position: relative;
    flex-shrink: 0;
  }

  .chat-att-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .chat-att-file {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.75rem;
    white-space: nowrap;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-att-remove {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--danger);
    color: white;
    border: none;
    font-size: 0.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  /* Drop overlay */
  .chat-drop-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .chat-drop-overlay-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--accent);
    font-size: 1.1rem;
    font-weight: 600;
    border: 2px dashed var(--accent);
    border-radius: 16px;
    padding: 40px 60px;
  }
  .chat-drop-icon { font-size: 2.5rem; }

  /* Input area */
  .chat-input-area {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
    background: var(--bg);
    flex-shrink: 0;
  }

  .chat-btn-attach {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .chat-btn-attach:hover { background: var(--bg-card); }

  .chat-input {
    flex: 1;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text);
    font-size: 0.9rem;
    font-family: inherit;
    resize: none;
    min-height: 42px;
    max-height: 160px;
    line-height: 1.5;
    outline: none;
    transition: border-color 0.15s;
  }
  .chat-input:focus {
    border-color: var(--accent);
  }
  .chat-input::placeholder {
    color: var(--text-muted);
  }
  .chat-input:disabled {
    opacity: 0.5;
  }

  .chat-btn-send, .chat-btn-abort {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  .chat-btn-send {
    background: var(--accent);
    color: #000;
  }
  .chat-btn-send:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  .chat-btn-send:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .chat-btn-abort {
    background: var(--danger);
    color: white;
  }
  .chat-btn-abort:hover {
    background: #dc2626;
  }

  .hidden { display: none; }
`;
