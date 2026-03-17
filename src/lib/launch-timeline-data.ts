// AI Universa Launch Timeline Data
// DO NOT modify dates — these are exact from boss

export interface TimelineEvent {
  date: string;
  title: string;
  phase: 'pre-event' | 'live-event' | 'cart-open';
  items: string[];
}

export interface TimelinePhase {
  start: string;
  end: string;
}

export const LAUNCH_EVENTS: TimelineEvent[] = [
  {
    date: '2026-03-25',
    title: 'PRE EVENT Launch',
    phase: 'pre-event',
    items: ['LP goes live', 'Ads launch €860/day', 'Trailer on IG+YT', 'Email 1 (recapture old list)'],
  },
  {
    date: '2026-03-27',
    title: 'Email 1.5',
    phase: 'pre-event',
    items: ['Re-engage old email list'],
  },
  {
    date: '2026-04-01',
    title: 'Email 2',
    phase: 'pre-event',
    items: ['Email 2 send'],
  },
  {
    date: '2026-04-03',
    title: 'Email 3',
    phase: 'pre-event',
    items: ['Email 3 send'],
  },
  {
    date: '2026-04-10',
    title: 'Email 4',
    phase: 'pre-event',
    items: ['Email 4 send'],
  },
  {
    date: '2026-04-12',
    title: 'Email 5',
    phase: 'pre-event',
    items: ['3 days left reminder'],
  },
  {
    date: '2026-04-13',
    title: 'Email 6',
    phase: 'pre-event',
    items: ['2 days left reminder'],
  },
  {
    date: '2026-04-14',
    title: 'Email 7 + Ads End',
    phase: 'pre-event',
    items: ['1 day left reminder', 'Ads end'],
  },
  {
    date: '2026-04-15',
    title: 'Day 1: YouTube LIVE',
    phase: 'live-event',
    items: ['YouTube Live stream', 'First Delovni Zvezki (workbooks)'],
  },
  {
    date: '2026-04-16',
    title: 'Day 2: Offer Goes Live',
    phase: 'live-event',
    items: ['Offer page goes live when LIVE 2 starts (6PM)', 'Event launches'],
  },
  {
    date: '2026-04-17',
    title: 'Day 3: Cart Opens',
    phase: 'live-event',
    items: ['Final day', 'Cart open sequence starts'],
  },
  {
    date: '2026-04-18',
    title: 'Cart Open Day 2',
    phase: 'cart-open',
    items: ['Sales window open'],
  },
  {
    date: '2026-04-19',
    title: 'Cart Open Day 3',
    phase: 'cart-open',
    items: ['Sales window open'],
  },
  {
    date: '2026-04-20',
    title: 'Cart Open Day 4',
    phase: 'cart-open',
    items: ['Sales window open'],
  },
  {
    date: '2026-04-21',
    title: 'Cart Closes',
    phase: 'cart-open',
    items: ['Final day of sales window'],
  },
];

export const PHASES: Record<string, TimelinePhase> = {
  preEvent: { start: '2026-03-25', end: '2026-04-14' },
  liveEvent: { start: '2026-04-15', end: '2026-04-17' },
  cartOpen: { start: '2026-04-17', end: '2026-04-21' },
};

export const PHASE_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  'pre-event': { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', text: '#F59E0B', accent: '#FB923C' },
  'live-event': { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', text: '#10B981', accent: '#34D399' },
  'cart-open': { bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.25)', text: '#EAB308', accent: '#FACC15' },
};

export const PHASE_LABELS: Record<string, string> = {
  'pre-event': 'PRE EVENT',
  'live-event': 'LIVE EVENT',
  'cart-open': 'CART OPEN',
};

export const DASHBOARD_MILESTONE_DATES = [
  '2026-03-25',
  '2026-03-27',
  '2026-04-01',
  '2026-04-15',
  '2026-04-17',
] as const;

export const DASHBOARD_MILESTONE_LABELS: Record<string, string> = {
  '2026-03-25': 'PRE EVENT starts',
  '2026-03-27': 'Email 1.5',
  '2026-04-01': 'Email 2',
  '2026-04-15': 'Day 1 Live Event',
  '2026-04-17': 'Cart open starts',
};

export function getDashboardMilestones() {
  return DASHBOARD_MILESTONE_DATES.map((date) => {
    const event = LAUNCH_EVENTS.find((item) => item.date === date);
    if (!event) {
      throw new Error(`Missing launch timeline event for ${date}`);
    }

    return {
      date,
      label: DASHBOARD_MILESTONE_LABELS[date] ?? event.title,
      phase: event.phase,
    };
  });
}

export function getTimelineStatus(now: Date = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const nextMilestone = LAUNCH_EVENTS.find(e => {
    const eventDate = new Date(e.date + 'T00:00:00');
    return eventDate >= today;
  });

  const liveEventDate = new Date('2026-04-15T00:00:00');
  const preEventDate = new Date('2026-03-25T00:00:00');

  const daysUntilLaunch = Math.max(0, Math.ceil((liveEventDate.getTime() - today.getTime()) / 86400000));
  const daysUntilPreEvent = Math.max(0, Math.ceil((preEventDate.getTime() - today.getTime()) / 86400000));

  let nextMilestoneDays = 0;
  if (nextMilestone) {
    const nDate = new Date(nextMilestone.date + 'T00:00:00');
    nextMilestoneDays = Math.max(0, Math.ceil((nDate.getTime() - today.getTime()) / 86400000));
  }

  return {
    daysUntilLaunch,
    daysUntilPreEvent,
    nextMilestone: nextMilestone
      ? { date: nextMilestone.date, title: nextMilestone.title, daysAway: nextMilestoneDays }
      : null,
  };
}

export function getEventStatus(eventDate: string, now: Date = new Date()): 'past' | 'today' | 'future' {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eDate = new Date(eventDate + 'T00:00:00');
  const eDateNorm = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());

  if (eDateNorm < today) return 'past';
  if (eDateNorm.getTime() === today.getTime()) return 'today';
  return 'future';
}
