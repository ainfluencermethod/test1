'use client';

import { DashboardProvider } from '@/lib/store';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
