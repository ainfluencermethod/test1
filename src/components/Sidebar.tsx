"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { DS } from "@/styles/design-system";

// ============================================================================
// Sidebar — Minimal, Premium, Hyperliquid-inspired
// ============================================================================

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SectionOpenState {
  command: boolean;
  universa: boolean;
  aib: boolean;
  tools: boolean;
  settings: boolean;
  ltb: boolean;
}

const commandNav: NavItem[] = [
  { href: "/dashboard/command", label: "Command Center", icon: "◈" },
  { href: "/dashboard/war-room", label: "War Room", icon: "◇" },
  { href: "/dashboard/clawbot", label: "ClawBot", icon: "▸" },
  { href: "/dashboard/chat", label: "Chat with Jarvis", icon: "▹" },
];

const universaNav: NavItem[] = [
  { href: "/dashboard/aiuniversa", label: "Overview", icon: "◦" },
  { href: "/dashboard/ai-universa/assets", label: "Assets", icon: "◦" },
  { href: "/dashboard/ai-universa/analytics", label: "Analytics", icon: "◦" },
  { href: "/dashboard/ai-universa/emails", label: "Emails", icon: "◦" },
  { href: "/dashboard/ai-universa/typeform", label: "Typeform", icon: "◦" },
  { href: "/dashboard/ai-universa/whatsapp", label: "WhatsApp", icon: "◦" },
  { href: "/dashboard/ai-universa/funnel", label: "Live Funnel", icon: "◦" },
];

const aibNav: NavItem[] = [
  { href: "/dashboard/aib", label: "Overview", icon: "◦" },
  { href: "/dashboard/aib/analytics", label: "Analytics", icon: "◦" },
  { href: "/dashboard/ai-influencer/emails", label: "Emails", icon: "◦" },
  { href: "/dashboard/aib-launch", label: "Launch", icon: "◦" },
];

const toolsNav: NavItem[] = [
  { href: "/dashboard/calendar", label: "Calendar", icon: "◦" },
  { href: "/dashboard/syndicate", label: "The Syndicate", icon: "◦" },
  { href: "/dashboard/research", label: "Research", icon: "◦" },
  { href: "/dashboard/x-research", label: "X Research", icon: "◦" },
];

const settingsNav: NavItem[] = [
  { href: "/dashboard/documents", label: "Documents", icon: "◦" },
  { href: "/dashboard/memory", label: "Jarvis Memory", icon: "◦" },
];

const ltbNav: NavItem[] = [
  { href: '/dashboard/ltb', icon: '◦', label: 'LTB Overview' },
  { href: '/dashboard/ltb/invoices', icon: '◦', label: 'Invoices' },
  { href: '/dashboard/ltb/clients', icon: '◦', label: 'Clients' },
  { href: '/dashboard/ltb/finances', icon: '◦', label: 'Finances' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hasActiveItem = (items: NavItem[]) =>
    items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  const [sectionOpen, setSectionOpen] = useState<SectionOpenState>({
    command: true,
    universa: hasActiveItem(universaNav),
    aib: hasActiveItem(aibNav),
    tools: hasActiveItem(toolsNav),
    settings: hasActiveItem(settingsNav),
    ltb: hasActiveItem(ltbNav),
  });

  const LAUNCH_DATE = new Date("2026-04-15T00:00:00+02:00");
  const daysToLaunch = useMemo(() => {
    const now = new Date();
    const diff = LAUNCH_DATE.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  const totalDays = 90;
  const progress = Math.min(1, Math.max(0, (totalDays - daysToLaunch) / totalDays));

  useEffect(() => {
    setOpen(false);
    setSectionOpen((prev) => ({
      ...prev,
      command: prev.command || hasActiveItem(commandNav),
      universa: prev.universa || hasActiveItem(universaNav),
      aib: prev.aib || hasActiveItem(aibNav),
      tools: prev.tools || hasActiveItem(toolsNav),
      settings: prev.settings || hasActiveItem(settingsNav),
      ltb: prev.ltb || hasActiveItem(ltbNav),
    }));
  }, [pathname]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard/command" && pathname.startsWith(href + "/"));

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className="block"
        style={{
          padding: "0 0.75rem",
          fontSize: "0.8125rem",
          fontWeight: active ? 500 : 300,
          fontFamily: DS.fonts.body,
          color: active ? DS.colors.accent : "#555",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: 34,
          textDecoration: "none",
          transition: "color 0.15s",
          marginLeft: 4,
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.color = DS.colors.text;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.color = "#555";
          }
        }}
      >
        {/* Active underline indicator */}
        {active && (
          <span style={{
            position: "absolute",
            bottom: 2,
            left: 12,
            right: 12,
            height: 1,
            background: DS.colors.accent,
            borderRadius: 1,
          }} />
        )}
        <span style={{
          fontSize: "0.625rem",
          width: 16,
          textAlign: "center",
          flexShrink: 0,
          opacity: active ? 1 : 0.4,
          color: active ? DS.colors.accent : "#444",
        }}>
          {item.icon}
        </span>
        {item.label}
      </Link>
    );
  };

  const toggleSection = (key: keyof SectionOpenState) => {
    setSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSectionHeader = (key: keyof SectionOpenState, label: string) => {
    const isOpen = sectionOpen[key];
    return (
      <button
        type="button"
        onClick={() => toggleSection(key)}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          padding: "10px 16px 4px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{
          fontSize: "0.5625rem",
          fontWeight: 400,
          fontFamily: DS.fonts.body,
          color: "#333",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textAlign: "left",
        }}>
          {label}
        </span>
        <span style={{
          fontSize: "0.625rem",
          color: "#333",
          transition: "transform 0.2s ease",
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
        }}>
          ▸
        </span>
      </button>
    );
  };

  const divider = (
    <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "6px 16px" }} />
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 flex items-center justify-center"
        style={{
          background: DS.colors.bgCard,
          border: `1px solid ${DS.colors.border}`,
          borderRadius: 8,
          color: "#555",
          fontSize: 16,
        }}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-56 h-screen fixed left-0 top-0 flex flex-col z-50
          transition-transform duration-200 ease-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "#060606", borderRight: `1px solid ${DS.colors.border}` }}
      >
        {/* Logo area */}
        <div className="px-5 pt-6 pb-3 flex items-center justify-between">
          <div>
            <h1 style={{
              fontFamily: DS.fonts.heading,
              fontSize: "1.25rem",
              fontWeight: 400,
              color: DS.colors.text,
              letterSpacing: "0.02em",
              lineHeight: 1.2,
            }}>
              Jarvis
            </h1>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center"
            style={{ color: "#444", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Launch Countdown */}
        <div className="px-5 pb-3">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{
              fontFamily: DS.fonts.mono,
              fontSize: "0.5625rem",
              fontWeight: 500,
              color: DS.colors.accentPurple,
              letterSpacing: "0.06em",
            }}>
              {daysToLaunch}d to AI Universa
            </span>
          </div>
          <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.04)", borderRadius: 1, overflow: "hidden" }}>
            <div style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${DS.colors.accentPurple}, ${DS.colors.accent})`,
              borderRadius: 1,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "0 20px" }} />

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

          {renderSectionHeader("command", "Command")}
          {sectionOpen.command && commandNav.map((item) => renderNavItem(item))}

          {divider}

          {renderSectionHeader("universa", "AI Universa")}
          {sectionOpen.universa && universaNav.map((item) => renderNavItem(item))}

          {divider}

          {renderSectionHeader("aib", "AI Influencer Blueprint")}
          {sectionOpen.aib && aibNav.map((item) => renderNavItem(item))}

          {divider}

          {renderSectionHeader("tools", "Tools")}
          {sectionOpen.tools && toolsNav.map((item) => renderNavItem(item))}

          {divider}

          {renderSectionHeader("ltb", "LTB Limited")}
          {sectionOpen.ltb && ltbNav.map((item) => renderNavItem(item))}

          {renderSectionHeader("settings", "Settings")}
          {sectionOpen.settings && settingsNav.map((item) => renderNavItem(item))}

        </nav>

        {/* Bottom Section */}
        <div className="px-4 py-3">
          <div style={{ padding: "0 0.5rem", marginBottom: "0.5rem" }}>
            <span style={{
              fontSize: "0.5625rem",
              color: "#222",
              fontWeight: 300,
              fontFamily: DS.fonts.body,
            }}>
              Jarvis · Claude Opus 4
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-center"
            style={{
              padding: "0.375rem",
              fontSize: "0.6875rem",
              fontWeight: 400,
              fontFamily: DS.fonts.body,
              color: "#333",
              background: "transparent",
              border: `1px solid ${DS.colors.border}`,
              borderRadius: 6,
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#666"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#333"; }}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
