import { NextResponse } from 'next/server';
import { LAUNCH_EVENTS, PHASES, getTimelineStatus } from '@/lib/launch-timeline-data';

export async function GET() {
  const status = getTimelineStatus(new Date());

  return NextResponse.json({
    events: LAUNCH_EVENTS,
    phases: {
      preEvent: PHASES.preEvent,
      liveEvent: PHASES.liveEvent,
      cartOpen: PHASES.cartOpen,
    },
    daysUntilLaunch: status.daysUntilLaunch,
    daysUntilPreEvent: status.daysUntilPreEvent,
    nextMilestone: status.nextMilestone,
  });
}
