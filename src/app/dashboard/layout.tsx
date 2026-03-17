import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
// VoiceOrb removed per boss directive
import { DashboardShell } from "@/components/DashboardShell";
import StatusBar from "@/components/StatusBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen">
      <StatusBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-screen p-4 pt-16 lg:pt-8 lg:ml-56 lg:p-8">
          <DashboardShell>{children}</DashboardShell>
        </main>
        {/* VoiceOrb removed */}
      </div>
    </div>
  );
}
