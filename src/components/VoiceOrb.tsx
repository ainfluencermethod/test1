"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Config ────────────────────────────────────────────────────────────
const GATEWAY_WS_URL = process.env.NEXT_PUBLIC_GATEWAY_WS_URL || "ws://192.168.10.28:18789";
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || "";
const SESSION_KEY = "main";

// ─── Types ─────────────────────────────────────────────────────────────
type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface ContentBlock {
  type: string;
  text?: string;
}

interface ChatMessage {
  role: string;
  content: string | ContentBlock[];
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

function stripMarkdown(text: string): string {
  return text
    .replace(/<\s*\/?(?:think(?:ing)?|thought|antthinking)\b[^>]*>/gi, "")
    .replace(/<\s*\/?final\b[^>]*>/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Speech Recognition types ──────────────────────────────────────────
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

// ─── Gateway WebSocket Hook (mirrors chat page protocol) ───────────────
function useVoiceGateway() {
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<
    Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>
  >(new Map());
  const eventHandlerRef = useRef<((event: string, payload: unknown) => void) | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectSentRef = useRef(false);
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
        id: "mission-control-voice",
        version: "1.0.0",
        platform: "web",
        mode: "webchat",
        instanceId: uuid(),
      },
      role: "operator",
      scopes: ["operator.admin"],
      caps: ["tool-events"],
      auth: { token: GATEWAY_TOKEN },
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      locale: typeof navigator !== "undefined" ? navigator.language : "en-US",
    };

    const id = uuid();
    pendingRef.current.set(id, {
      resolve: () => setConnected(true),
      reject: (err) => {
        console.error("[voice-gateway] connect failed:", err);
        setConnected(false);
      },
    });
    ws.send(JSON.stringify({ type: "req", id, method: "connect", params }));
  }, []);

  const connect = useCallback(() => {
    if (closedRef.current) return;
    // Skip WebSocket on HTTPS (tunnel) — can't connect to ws:// from https://
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      console.warn('VoiceOrb: skipping ws:// connection on HTTPS page');
      return;
    }
    const ws = new WebSocket(GATEWAY_WS_URL);
    wsRef.current = ws;
    connectSentRef.current = false;

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
      for (const [, p] of pendingRef.current) p.reject(new Error("disconnected"));
      pendingRef.current.clear();
      if (!closedRef.current) {
        reconnectTimerRef.current = setTimeout(() => connect(), 3000);
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

// ─── Main VoiceOrb Component ───────────────────────────────────────────
export default function VoiceOrb() {
  const { connected, sendRequest, eventHandlerRef } = useVoiceGateway();
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [expanded, setExpanded] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [supported, setSupported] = useState(true);
  const [hotwordEnabled, setHotwordEnabled] = useState(false);
  const [hotwordStatus, setHotwordStatus] = useState<"idle" | "listening" | "error">("idle");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const streamTextRef = useRef("");
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef<string | null>(null);
  const hotwordRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const hotwordRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check browser support
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !window.SpeechRecognition &&
      !window.webkitSpeechRecognition
    ) {
      setSupported(false);
    }
  }, []);

  // Load persisted hotword preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("jarvisHotwordEnabled");
    if (stored === "1") {
      setHotwordEnabled(true);
    }
  }, []);

  // Persist hotword preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("jarvisHotwordEnabled", hotwordEnabled ? "1" : "0");
  }, [hotwordEnabled]);

  // Handle Gateway streaming events
  useEffect(() => {
    eventHandlerRef.current = (event: string, payload: unknown) => {
      if (event !== "chat") return;
      const p = payload as {
        state: string;
        message?: ChatMessage;
        sessionKey?: string;
        errorMessage?: string;
      };
      if (p.sessionKey && p.sessionKey !== SESSION_KEY) return;

      if (p.state === "delta") {
        const text = extractText(p.message!);
        if (text) {
          streamTextRef.current = text;
          setResponse(text);
        }
      } else if (p.state === "final") {
        const finalText = p.message
          ? extractText(p.message)
          : streamTextRef.current;
        if (finalText) {
          setResponse(finalText);
          speakResponse(finalText);
        }
        runIdRef.current = null;
        streamTextRef.current = "";
      } else if (p.state === "aborted" || p.state === "error") {
        setOrbState("idle");
        runIdRef.current = null;
        streamTextRef.current = "";
        if (p.state === "error") {
          setResponse(`Error: ${p.errorMessage ?? "Something went wrong"}`);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventHandlerRef]);

  // Typewriter effect for response
  useEffect(() => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);

    if (!response) {
      setDisplayedResponse("");
      return;
    }

    let i = displayedResponse.length;
    if (i >= response.length) {
      setDisplayedResponse(response);
      return;
    }

    const tick = () => {
      i++;
      setDisplayedResponse(response.slice(0, i));
      if (i < response.length) {
        typewriterRef.current = setTimeout(tick, 12);
      }
    };
    typewriterRef.current = setTimeout(tick, 12);

    return () => {
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  // Speak response via TTS
  const speakResponse = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const clean = stripMarkdown(text);
    if (!clean) return;

    setOrbState("speaking");

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Daniel") ||
        v.name.includes("Alex") ||
        v.name.includes("Google UK English Male") ||
        v.name.includes("Samantha")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setOrbState("idle");
    };
    utterance.onerror = () => {
      setOrbState("idle");
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop hotword listener
  const stopHotword = useCallback(() => {
    if (hotwordRestartTimerRef.current) {
      clearTimeout(hotwordRestartTimerRef.current);
      hotwordRestartTimerRef.current = null;
    }
    if (hotwordRecognitionRef.current) {
      try {
        hotwordRecognitionRef.current.onresult = null;
        hotwordRecognitionRef.current.onerror = null;
        hotwordRecognitionRef.current.onend = null;
        hotwordRecognitionRef.current.stop();
      } catch (err) {
        console.warn("[voice] hotword stop error", err);
      }
      hotwordRecognitionRef.current = null;
    }
    setHotwordStatus("idle");
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!supported || !connected) return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    // Cancel any ongoing speech
    window.speechSynthesis?.cancel();
    stopHotword();

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    setTranscript("");
    setInterimTranscript("");
    setResponse("");
    setDisplayedResponse("");
    setOrbState("listening");
    setExpanded(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Get the final transcript and send it
      setTranscript((prev) => {
        const finalText = prev.trim();
        if (finalText && connected) {
          sendToGateway(finalText);
        } else if (!finalText) {
          setOrbState("idle");
          setExpanded(false);
        }
        return prev;
      });
      setInterimTranscript("");
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("[voice] recognition error:", event.error);
      if (event.error !== "no-speech") {
        setOrbState("idle");
      }
      recognitionRef.current = null;
    };

    recognition.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, connected, hotwordEnabled, stopHotword]);

  // Send transcribed text to Gateway
  const sendToGateway = useCallback(
    async (text: string) => {
      if (!text.trim() || !connected) return;

      setOrbState("thinking");
      const idempotencyKey = uuid();
      runIdRef.current = idempotencyKey;
      streamTextRef.current = "";

      try {
        await sendRequest("chat.send", {
          sessionKey: SESSION_KEY,
          message: text,
          deliver: false,
          idempotencyKey,
        });
      } catch (err) {
        console.error("[voice] send error:", err);
        setResponse(
          `Send failed: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        setOrbState("idle");
        runIdRef.current = null;
      }
    },
    [connected, sendRequest]
  );

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  // Toggle voice
  const handleOrbClick = useCallback(() => {
    if (orbState === "listening") {
      stopListening();
    } else if (orbState === "speaking") {
      window.speechSynthesis?.cancel();
      setOrbState("idle");
    } else if (orbState === "idle") {
      startListening();
    }
    // Don't interrupt thinking state
  }, [orbState, startListening, stopListening]);

  // Close expanded view
  const handleClose = useCallback(() => {
    stopListening();
    window.speechSynthesis?.cancel();
    setOrbState("idle");
    setExpanded(false);
    setTranscript("");
    setInterimTranscript("");
    setResponse("");
    setDisplayedResponse("");
  }, [stopListening]);

  // Hotword listener ("Jarvis")
  const startHotword = useCallback(() => {
    if (!hotwordEnabled || !supported || !connected) return;
    if (typeof window === "undefined") return;
    if (orbState !== "idle") return;
    if (hotwordRecognitionRef.current) return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = false;
      hotwordRecognitionRef.current = recognition;
      setHotwordStatus("listening");

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
            .toLowerCase()
            .replace(/[^a-z\s]/g, "")
            .trim();
          if (
            transcript.includes("jarvis") ||
            transcript.includes("hey jarvis") ||
            transcript.includes("ok jarvis")
          ) {
            recognition.onresult = null;
            recognition.onend = null;
            recognition.onerror = null;
            recognition.stop();
            hotwordRecognitionRef.current = null;
            setHotwordStatus("idle");
            setTimeout(() => {
              setExpanded(true);
              startListening();
            }, 200);
            return;
          }
        }
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error === "no-speech") return;
        setHotwordStatus("error");
        hotwordRecognitionRef.current = null;
      };

      recognition.onend = () => {
        hotwordRecognitionRef.current = null;
        if (hotwordEnabled && orbState === "idle") {
          hotwordRestartTimerRef.current = setTimeout(() => {
            startHotword();
          }, 500);
        } else {
          setHotwordStatus("idle");
        }
      };

      recognition.start();
    } catch (err) {
      console.error("[voice] hotword start error", err);
      setHotwordStatus("error");
    }
  }, [connected, hotwordEnabled, orbState, startListening, supported]);

  useEffect(() => {
    if (!hotwordEnabled) {
      stopHotword();
      return;
    }
    if (orbState === "idle") {
      startHotword();
    } else {
      stopHotword();
    }
    return () => {
      stopHotword();
    };
  }, [hotwordEnabled, orbState, startHotword, stopHotword]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      window.speechSynthesis?.cancel();
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
      stopHotword();
    };
  }, [stopHotword]);

  const toggleHotword = useCallback(() => {
    setHotwordEnabled((prev) => !prev);
  }, []);

  const hotwordStatusLabel = !hotwordEnabled
    ? "Hands-free off"
    : hotwordStatus === "error"
      ? "Mic unavailable"
      : hotwordStatus === "listening"
        ? "Listening for \"Jarvis\""
        : "Ready";

  if (!supported) {
    return (
      <>
        <div className="voice-orb-fab voice-orb-fab--unsupported" title="Voice not supported in this browser">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <span className="voice-orb-label">JARVIS</span>
        </div>
        <style>{voiceOrbStyles}</style>
      </>
    );
  }

  return (
    <>
      {/* Expanded Panel Overlay */}
      {expanded && (
        <div className="voice-panel-backdrop" onClick={handleClose}>
          <div className="voice-panel" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button className="voice-panel-close" onClick={handleClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Large Orb */}
            <div className="voice-panel-orb-wrap">
              <button
                className={`voice-orb voice-orb--large voice-orb--${orbState}`}
                onClick={handleOrbClick}
              >
                {/* Listening rings */}
                {orbState === "listening" && (
                  <>
                    <div className="voice-ring voice-ring--1" />
                    <div className="voice-ring voice-ring--2" />
                    <div className="voice-ring voice-ring--3" />
                  </>
                )}

                {/* Thinking spinner */}
                {orbState === "thinking" && <div className="voice-spinner" />}

                {/* Speaking wave bars */}
                {orbState === "speaking" && (
                  <div className="voice-wave-bars">
                    <span className="voice-bar" />
                    <span className="voice-bar" />
                    <span className="voice-bar" />
                    <span className="voice-bar" />
                    <span className="voice-bar" />
                  </div>
                )}

                {/* Inner orb */}
                <div className={`voice-orb-inner voice-orb-inner--${orbState}`}>
                  {orbState === "listening" ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="1" width="6" height="11" rx="3" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : orbState === "thinking" ? (
                    <div className="voice-thinking-dots">
                      <span /><span /><span />
                    </div>
                  ) : orbState === "speaking" ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="1" width="6" height="11" rx="3" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </div>
              </button>
              <span className="voice-orb-label voice-orb-label--large">JARVIS</span>
            </div>

            {/* Status text */}
            <div className="voice-panel-status">
              {orbState === "idle" && "Tap to speak"}
              {orbState === "listening" && "Listening..."}
              {orbState === "thinking" && "Processing..."}
              {orbState === "speaking" && "Speaking..."}
            </div>

            {/* Transcript */}
            {(transcript || interimTranscript) && (
              <div className="voice-panel-transcript">
                {transcript && <span className="voice-text-final">{transcript}</span>}
                {interimTranscript && (
                  <span className="voice-text-interim">{interimTranscript}</span>
                )}
              </div>
            )}

            {/* Response */}
            {displayedResponse && (
              <div className="voice-panel-response">
                {stripMarkdown(displayedResponse)}
                {displayedResponse.length < response.length && (
                  <span className="voice-cursor">▊</span>
                )}
              </div>
            )}

            {/* Connection status */}
            <div className={`voice-panel-conn ${connected ? "voice-panel-conn--ok" : "voice-panel-conn--err"}`}>
              {connected ? "● Connected" : "○ Disconnected"}
            </div>

            <div className="voice-hotword-toggle">
              <label className="voice-switch">
                <input type="checkbox" checked={hotwordEnabled} onChange={toggleHotword} />
                <span className="voice-switch-track">
                  <span className="voice-switch-thumb" />
                </span>
                <span className="voice-switch-label">Hands-free "Jarvis"</span>
              </label>
              <span className={`voice-hotword-status voice-hotword-status--${hotwordStatus}`}>{hotwordStatusLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating FAB (when not expanded) */}
      {!expanded && (
        <div className="voice-orb-fab-container">
          <button
            className={`voice-orb-fab voice-orb-fab--${orbState}`}
            onClick={handleOrbClick}
            title={connected ? "Talk to JARVIS" : "Not connected"}
          >
            {orbState === "listening" && (
              <>
                <div className="voice-ring-sm voice-ring-sm--1" />
                <div className="voice-ring-sm voice-ring-sm--2" />
              </>
            )}
            {orbState === "thinking" && <div className="voice-spinner-sm" />}
            <div className="voice-fab-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="1" width="6" height="11" rx="3" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
          </button>
          <span className="voice-orb-label">JARVIS</span>
        </div>
      )}

      <style>{voiceOrbStyles}</style>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────
const voiceOrbStyles = `
  /* ── FAB Container ─────────────────────────────────── */
  .voice-orb-fab-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .voice-orb-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    color: rgba(0, 212, 170, 0.6);
    text-transform: uppercase;
    pointer-events: none;
  }

  .voice-orb-label--large {
    font-size: 0.75rem;
    color: rgba(0, 212, 170, 0.8);
    margin-top: 12px;
  }

  /* ── FAB Button ────────────────────────────────────── */
  .voice-orb-fab {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1px solid rgba(0, 212, 170, 0.2);
    background: rgba(13, 15, 20, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow:
      0 0 20px rgba(0, 212, 170, 0.15),
      0 0 60px rgba(0, 212, 170, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    animation: voice-breathe 3s ease-in-out infinite;
  }

  .voice-orb-fab:hover {
    transform: scale(1.08);
    box-shadow:
      0 0 30px rgba(0, 212, 170, 0.3),
      0 0 80px rgba(0, 212, 170, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 212, 170, 0.4);
  }

  .voice-orb-fab--unsupported {
    opacity: 0.4;
    cursor: not-allowed;
    animation: none;
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(13, 15, 20, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .voice-orb-fab--listening {
    animation: none;
    transform: scale(1.05);
    border-color: rgba(0, 212, 170, 0.5);
    box-shadow:
      0 0 30px rgba(0, 212, 170, 0.4),
      0 0 80px rgba(0, 212, 170, 0.15);
  }

  .voice-orb-fab--thinking {
    animation: none;
    border-color: rgba(124, 92, 252, 0.5);
    box-shadow:
      0 0 30px rgba(124, 92, 252, 0.3),
      0 0 60px rgba(0, 212, 170, 0.1);
  }

  .voice-orb-fab--speaking {
    animation: voice-speak-pulse 0.8s ease-in-out infinite;
    border-color: rgba(0, 212, 170, 0.6);
    box-shadow:
      0 0 40px rgba(0, 212, 170, 0.4),
      0 0 80px rgba(0, 212, 170, 0.15);
  }

  .voice-fab-inner {
    color: #00D4AA;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  @keyframes voice-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes voice-speak-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }

  /* ── FAB Rings (small) ─────────────────────────────── */
  .voice-ring-sm {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1.5px solid rgba(0, 212, 170, 0.4);
    animation: voice-ring-expand 2s ease-out infinite;
  }

  .voice-ring-sm--2 {
    animation-delay: 0.6s;
  }

  /* ── FAB Spinner (small) ───────────────────────────── */
  .voice-spinner-sm {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #7C5CFC;
    border-right-color: #00D4AA;
    animation: voice-spin 1s linear infinite;
  }

  /* ── Panel Backdrop ────────────────────────────────── */
  .voice-panel-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: voice-fade-in 0.3s ease;
  }

  @keyframes voice-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ── Panel ─────────────────────────────────────────── */
  .voice-panel {
    position: relative;
    width: 420px;
    max-width: 90vw;
    max-height: 80vh;
    background: rgba(13, 15, 20, 0.95);
    border: 1px solid rgba(0, 212, 170, 0.15);
    border-radius: 24px;
    padding: 40px 32px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    box-shadow:
      0 0 80px rgba(0, 212, 170, 0.08),
      0 24px 48px rgba(0, 0, 0, 0.5);
    animation: voice-panel-in 0.3s ease;
    overflow-y: auto;
  }

  @keyframes voice-panel-in {
    from { opacity: 0; transform: scale(0.92) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .voice-panel-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .voice-panel-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  /* ── Large Orb ─────────────────────────────────────── */
  .voice-panel-orb-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .voice-orb {
    position: relative;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    padding: 0;
  }

  .voice-orb--large {
    width: 140px;
    height: 140px;
  }

  .voice-orb-inner {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(13, 15, 20, 0.9);
    border: 2px solid rgba(0, 212, 170, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00D4AA;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    box-shadow:
      0 0 40px rgba(0, 212, 170, 0.15),
      inset 0 0 30px rgba(0, 212, 170, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .voice-orb-inner--idle {
    animation: voice-breathe 3s ease-in-out infinite;
  }

  .voice-orb-inner--listening {
    border-color: rgba(0, 212, 170, 0.6);
    box-shadow:
      0 0 50px rgba(0, 212, 170, 0.3),
      0 0 100px rgba(0, 212, 170, 0.1),
      inset 0 0 40px rgba(0, 212, 170, 0.1);
    transform: scale(1.05);
  }

  .voice-orb-inner--thinking {
    border-color: rgba(124, 92, 252, 0.5);
    box-shadow:
      0 0 50px rgba(124, 92, 252, 0.2),
      0 0 80px rgba(0, 212, 170, 0.1),
      inset 0 0 30px rgba(124, 92, 252, 0.08);
    animation: voice-wobble 2s ease-in-out infinite;
  }

  .voice-orb-inner--speaking {
    border-color: rgba(0, 212, 170, 0.7);
    box-shadow:
      0 0 60px rgba(0, 212, 170, 0.35),
      0 0 120px rgba(0, 212, 170, 0.1),
      inset 0 0 40px rgba(0, 212, 170, 0.12);
    animation: voice-morph 3s ease-in-out infinite;
  }

  @keyframes voice-wobble {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.02) rotate(1deg); }
    50% { transform: scale(0.98) rotate(-1deg); }
    75% { transform: scale(1.01) rotate(0.5deg); }
  }

  @keyframes voice-morph {
    0%, 100% {
      border-radius: 50%;
      transform: scale(1);
    }
    25% {
      border-radius: 48% 52% 50% 50% / 50% 48% 52% 50%;
      transform: scale(1.03);
    }
    50% {
      border-radius: 50% 48% 52% 48% / 52% 50% 48% 52%;
      transform: scale(0.97);
    }
    75% {
      border-radius: 52% 50% 48% 52% / 48% 52% 50% 48%;
      transform: scale(1.02);
    }
  }

  /* ── Listening Rings ───────────────────────────────── */
  .voice-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid rgba(0, 212, 170, 0.5);
    animation: voice-ring-expand 2.4s ease-out infinite;
  }

  .voice-ring--2 {
    animation-delay: 0.8s;
  }

  .voice-ring--3 {
    animation-delay: 1.6s;
  }

  @keyframes voice-ring-expand {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(1.8);
      opacity: 0;
    }
  }

  /* ── Thinking Spinner ──────────────────────────────── */
  .voice-spinner {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2.5px solid transparent;
    border-top-color: #7C5CFC;
    border-right-color: #00D4AA;
    animation: voice-spin 1.2s linear infinite;
    z-index: 1;
  }

  @keyframes voice-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Thinking Dots ─────────────────────────────────── */
  .voice-thinking-dots {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .voice-thinking-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7C5CFC;
    animation: voice-dot-bounce 1.4s ease-in-out infinite;
  }

  .voice-thinking-dots span:nth-child(1) { animation-delay: 0s; }
  .voice-thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
  .voice-thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes voice-dot-bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1.2); opacity: 1; }
  }

  /* ── Speaking Wave Bars ────────────────────────────── */
  .voice-wave-bars {
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    z-index: 1;
  }

  .voice-bar {
    width: 3px;
    background: #00D4AA;
    border-radius: 3px;
    animation: voice-bar-wave 0.8s ease-in-out infinite;
  }

  .voice-bar:nth-child(1) { height: 16px; animation-delay: 0s; }
  .voice-bar:nth-child(2) { height: 24px; animation-delay: 0.1s; }
  .voice-bar:nth-child(3) { height: 32px; animation-delay: 0.2s; }
  .voice-bar:nth-child(4) { height: 24px; animation-delay: 0.3s; }
  .voice-bar:nth-child(5) { height: 16px; animation-delay: 0.4s; }

  @keyframes voice-bar-wave {
    0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
    50% { transform: scaleY(1.2); opacity: 1; }
  }

  /* ── Hotword Toggle ──────────────────────────────── */
  .voice-hotword-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: -4px;
  }

  .voice-switch {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.75);
  }

  .voice-switch input {
    display: none;
  }

  .voice-switch-track {
    width: 42px;
    height: 22px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.15);
    position: relative;
    transition: background 0.2s ease, border 0.2s ease;
  }

  .voice-switch-thumb {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .voice-switch input:checked + .voice-switch-track {
    background: rgba(0, 212, 170, 0.25);
    border-color: rgba(0, 212, 170, 0.4);
  }

  .voice-switch input:checked + .voice-switch-track .voice-switch-thumb {
    transform: translateX(20px);
    background: #00D4AA;
  }

  .voice-switch-label {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .voice-hotword-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
  }

  .voice-hotword-status--listening {
    border-color: rgba(0, 212, 170, 0.35);
    color: #00D4AA;
  }

  .voice-hotword-status--error {
    border-color: rgba(239, 68, 68, 0.35);
    color: #f87171;
  }

  /* ── Panel Text ────────────────────────────────────── */
  .voice-panel-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.05em;
  }

  .voice-panel-transcript {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    line-height: 1.5;
    text-align: center;
    max-width: 100%;
    word-break: break-word;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .voice-text-final {
    color: rgba(255, 255, 255, 0.9);
  }

  .voice-text-interim {
    color: rgba(255, 255, 255, 0.35);
    font-style: italic;
  }

  .voice-panel-response {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #00D4AA;
    text-align: center;
    max-width: 100%;
    word-break: break-word;
    padding: 16px;
    border-radius: 12px;
    background: rgba(0, 212, 170, 0.04);
    border: 1px solid rgba(0, 212, 170, 0.1);
    max-height: 200px;
    overflow-y: auto;
  }

  .voice-cursor {
    animation: voice-blink 0.8s step-end infinite;
    color: #00D4AA;
  }

  @keyframes voice-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .voice-panel-conn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    padding: 4px 12px;
    border-radius: 20px;
  }

  .voice-panel-conn--ok {
    color: #00D4AA;
    background: rgba(0, 212, 170, 0.08);
  }

  .voice-panel-conn--err {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
  }

  /* ── Responsive ────────────────────────────────────── */
  @media (max-width: 480px) {
    .voice-panel {
      width: 95vw;
      padding: 32px 20px 24px;
    }

    .voice-orb-inner {
      width: 100px;
      height: 100px;
    }

    .voice-orb--large {
      width: 120px;
      height: 120px;
    }
  }
`;
