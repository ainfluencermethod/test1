import { redirect } from 'next/navigation';

// Main dashboard now redirects to Command Center — the one brain.
// All previous Mission Control content has been absorbed into /dashboard/command.
export default function DashboardPage() {
  redirect('/dashboard/command');
}
