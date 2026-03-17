"use client";
import { useEffect, useState } from "react";

interface Task { id: string; title: string; status: string; priority: string; assignee: string | null; dueDate: string | null; }

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { fetch("/api/tasks").then(r => r.json()).then(d => { setTasks(d); setLoading(false); }); }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function getTasksForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-muted)]">Loading...</div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Calendar</h1><p className="text-[var(--text-muted)] text-sm mt-1">Scheduled tasks & cron jobs</p></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="btn btn-secondary">←</button>
          <span className="text-sm font-medium">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="btn btn-secondary">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="bg-[var(--bg-card)] p-2 text-center text-xs font-medium text-[var(--text-muted)]">{d}</div>
        ))}
        {days.map((day, i) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayTasks = day ? getTasksForDay(day) : [];
          return (
            <div key={i} className={`bg-[var(--bg-card)] p-2 min-h-[100px] ${!day ? "opacity-30" : ""}`}>
              {day && (
                <>
                  <span className={`text-xs ${isToday ? "bg-[var(--accent)] text-black px-1.5 py-0.5 rounded-full font-bold" : "text-[var(--text-muted)]"}`}>{day}</span>
                  <div className="mt-1 space-y-1">
                    {dayTasks.map(t => (
                      <div key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] truncate">{t.title}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Upcoming Tasks</h2>
        <div className="space-y-2">
          {tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today && t.status !== "done").sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()).slice(0, 10).map(t => (
            <div key={t.id} className="card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                {t.assignee && <span className="text-xs text-[var(--accent)]">→ {t.assignee}</span>}
              </div>
              <span className="text-xs text-[var(--text-muted)]">{new Date(t.dueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          ))}
          {tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today && t.status !== "done").length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No upcoming tasks. Add due dates to tasks to see them here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
