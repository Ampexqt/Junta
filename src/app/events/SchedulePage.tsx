import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useCalendarApp,
  DayFlowCalendar,
  createDayView,
  createWeekView,
  createMonthView,
  createYearView,
  createEventsPlugin,
  ViewType,
} from '@dayflow/react';
import { createSidebarPlugin } from '@dayflow/plugin-sidebar';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { useAuth } from '@/features/auth/AuthContext';
import {
  useScheduleEvents,
  CALENDAR_DEFINITIONS,
} from '@/hooks/useScheduleEvents';
import { useDayflowStyles } from '@/hooks/useDayflowStyles';

// ─── Role subtitle config ────────────────────────────────────────────────────

const ROLE_SUBTITLE: Record<string, string> = {
  admin:       'Viewing all system events across all organizers.',
  organizer:   'Viewing your own events and their schedules.',
  participant: 'Viewing approved public environmental events.',
};

// ─── Loading skeleton ────────────────────────────────────────────────────────

function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="w-full rounded-2xl" style={{ height: '680px' }} />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SchedulePage() {
  useDayflowStyles(); // Injects DayFlow CSS via <link> tags (bypasses PostCSS)
  const navigate = useNavigate();
  const { role } = useAuth();
  const { calendarEvents, isLoading, error, refresh } = useScheduleEvents();

  const subtitle = ROLE_SUBTITLE[role] ?? ROLE_SUBTITLE.participant;

  // ── Sidebar plugin ──
  const sidebarPlugin = useMemo(
    () =>
      createSidebarPlugin({
        width: 260,
        initialCollapsed: false,
        createCalendarMode: 'modal',
      }),
    []
  );

  // ── Dayflow calendar instance ──
  const calendar = useCalendarApp({
    views: [
      createDayView({ timeFormat: '12h', scrollToCurrentTime: true }),
      createWeekView({ timeFormat: '12h', scrollToCurrentTime: true }),
      createMonthView({ scroll: { disabled: true, transition: 'fade' } }),
      createYearView({ mode: 'grid', showTimedEventsInYearView: true }),
    ],
    defaultView: ViewType.MONTH,
    plugins: [createEventsPlugin(), sidebarPlugin],
    events: calendarEvents,
    calendars: CALENDAR_DEFINITIONS,
    initialDate: new Date(),
    callbacks: {
      onEventClick: (event) => {
        const firestoreId = (event as { meta?: { firestoreId?: string } }).meta?.firestoreId;
        if (firestoreId) navigate(`/app/events/${firestoreId}`);
      },
    },
  });

  // ─── Loading ────────────────────────────────────────────────────────────
  if (isLoading) return <ScheduleSkeleton />;

  // ─── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">Schedule</h1>
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        </div>
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load schedule</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refresh} className="ml-4 gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ─── Main ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      {/* ── Page header ── */}
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">Schedule</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
      </div>

      {/* ── Full-width DayFlow calendar (sidebar built-in) ── */}
      <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm bg-white junta-calendar-wrap">
        <DayFlowCalendar calendar={calendar} />
      </div>
    </motion.div>
  );
}
