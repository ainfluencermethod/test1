'use client';

import { useEffect, useState } from 'react';

interface StatusData {
  lastUpdated: string;
  infrastructure: {
    dashboard: { status: string };
    tunnel: { status: string };
    publicDashboard: { status: string };
  };
  apis: Record<string, { status: string }>;
  alerts: unknown[];
  autoFixes: unknown[];
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function StatusBar() {
  const [status, setStatus] = useState<StatusData | null>(null);

  useEffect(() => {
    const fetchStatus = () =>
      fetch('/api/status')
        .then(r => r.ok ? r.json() : null)
        .then(setStatus)
        .catch(() => setStatus(null));
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const infra = status.infrastructure;
  const dashOk = infra.dashboard.status === 'up';
  const tunnelOk = infra.tunnel.status === 'up';
  const apiEntries = Object.values(status.apis || {});
  const apiOk = apiEntries.filter(a => a.status === 'ok').length;
  const apiTotal = apiEntries.filter(a => a.status !== 'unchecked').length;
  const issueCount = status.alerts.length + status.autoFixes.length;
  const allGood = issueCount === 0 && dashOk && tunnelOk;

  return (
    <div className="w-full bg-zinc-900/80 border-b border-zinc-800 px-4 py-1 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${allGood ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {allGood ? 'All systems operational' : `${issueCount} issue${issueCount !== 1 ? 's' : ''} detected`}
        </span>
        <span className="text-zinc-600">|</span>
        <span>Updated {timeAgo(status.lastUpdated)}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>Dashboard {dashOk ? '✅' : '❌'}</span>
        <span>Tunnel {tunnelOk ? '✅' : '❌'}</span>
        <span>APIs {apiOk}/{apiTotal}</span>
      </div>
    </div>
  );
}
