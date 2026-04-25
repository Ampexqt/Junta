import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ChevronRight,
  History,
  CalendarCheck,
  Filter,
  Check
} from 'lucide-react';

import { useAuth } from '@/features/auth/AuthContext';
import {
  useScheduleEvents,
  CALENDAR_DEFINITIONS,
  ScheduleEvent,
} from '@/hooks/useScheduleEvents';
import { useDayflowStyles } from '@/hooks/useDayflowStyles';
import { cn } from '@/lib/utils';

// ─── Role subtitle config ────────────────────────────────────────────────────

const ROLE_SUBTITLE: Record<string, string> = {
  admin:       'Full system event management.',
  organizer:   'Manage your hosted events.',
  participant: 'Find environmental activities.',
};

// ─── Loading skeleton ────────────────────────────────────────────────────────

function ScheduleSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <div className="w-full lg:w-56 space-y-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Event Item Component ───────────────────────────────────────────────────

function EventListItem({ event, onClick }: { event: ScheduleEvent; onClick: () => void }) {
  const isPast = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0));
  
  // Find category color
  const catDef = CALENDAR_DEFINITIONS.find(c => c.name === event.category);
  const dotColor = catDef?.colors.eventColor || '#cbd5e1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
        onClick={onClick}
      >
        {/* Date Box */}
        <div className="flex flex-col items-center justify-center min-w-[56px] h-[56px] rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-emerald-50 transition-colors">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-lg font-black text-slate-700">
            {new Date(event.date).getDate()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{event.category}</span>
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
            {event.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Clock className="w-3 h-3" />
              {event.startTime}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
              <MapPin className="w-3 h-3" />
              {event.locationName || event.location}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="outline" className={cn(
            "text-[9px] font-bold uppercase h-5",
            isPast ? "bg-slate-50 text-slate-400" : "bg-emerald-50 text-emerald-700 border-emerald-100"
          )}>
            {isPast ? 'Past' : 'Upcoming'}
          </Badge>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SchedulePage() {
  useDayflowStyles();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { calendarEvents, rawEvents, isLoading, error, refresh } = useScheduleEvents();
  
  const [activeView, setActiveView] = useState<'calendar' | 'upcoming' | 'past'>('calendar');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CALENDAR_DEFINITIONS.map(c => c.name)
  );

  const subtitle = ROLE_SUBTITLE[role] ?? ROLE_SUBTITLE.participant;

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  // Filter logic
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredEvents = useMemo(() => {
    const events = rawEvents.filter(e => selectedCategories.includes(e.category));
    
    if (activeView === 'upcoming') {
      return events.filter(e => new Date(e.date) >= now)
                   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (activeView === 'past') {
      return events.filter(e => new Date(e.date) < now)
                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return events;
  }, [rawEvents, activeView, selectedCategories, now]);

  // Calendar filtered events
  const filteredCalendarEvents = useMemo(() => 
    calendarEvents.filter(e => selectedCategories.includes(e.meta?.category as string))
  , [calendarEvents, selectedCategories]);

  // ── Calendar Instance ──
  const calendar = useCalendarApp({
    views: [
      createDayView({ timeFormat: '12h', scrollToCurrentTime: true }),
      createWeekView({ timeFormat: '12h', scrollToCurrentTime: true }),
      createMonthView(),
      createYearView({ mode: 'grid', showTimedEventsInYearView: true }),
    ],
    defaultView: ViewType.MONTH,
    plugins: [createEventsPlugin()],
    events: filteredCalendarEvents,
    calendars: CALENDAR_DEFINITIONS,
    initialDate: new Date(),
    callbacks: {
      onEventClick: (event) => {
        const firestoreId = (event as { meta?: { firestoreId?: string } }).meta?.firestoreId;
        if (firestoreId) navigate(`/app/events/${firestoreId}`);
      },
    },
  });

  if (isLoading) return <ScheduleSkeleton />;

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Alert variant="destructive" className="rounded-xl border-none shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Schedule Sync Failed</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refresh} className="ml-4">Retry</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)] bg-slate-50/20 rounded-[20px] overflow-hidden border border-slate-100 shadow-sm">
      
      {/* ── Left Sidebar ── */}
      <aside className="w-full lg:w-56 bg-white border-r border-slate-100 p-4 flex flex-col gap-5 shrink-0">
        
        {/* Navigation */}
        <div className="space-y-2">
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">View</h2>
          <div className="grid gap-0.5">
            {[
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'upcoming', label: 'Upcoming', icon: CalendarCheck },
              { id: 'past', label: 'History', icon: History },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as 'calendar' | 'upcoming' | 'past')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold transition-all group",
                  activeView === item.id 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-3.5 h-3.5", activeView === item.id ? "text-white" : "text-slate-400 group-hover:text-emerald-600")} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Filters</h2>
            <Filter className="w-3.5 h-3.5 text-slate-900" strokeWidth={3} />
          </div>
          <div className="grid gap-0.5">
            {CALENDAR_DEFINITIONS.map((cat) => (
              <label 
                key={cat.id}
                className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-sm border-2 border-white" 
                    style={{ backgroundColor: cat.colors.eventColor }} 
                  />
                  <span className="text-[12px] font-black text-slate-700 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                </div>
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => toggleCategory(cat.name)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-slate-400 peer-checked:border-emerald-600 peer-checked:bg-emerald-600 transition-all flex items-center justify-center bg-white shadow-sm group-hover:border-slate-600">
                    <Check className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" strokeWidth={4} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div className="mt-auto bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/30">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
            <span className="text-xs font-black text-slate-900">{filteredEvents.length}</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 bg-white/40 backdrop-blur-xl flex flex-col p-5 lg:p-7 min-w-0">
        <header className="mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {activeView === 'calendar' ? 'Calendar View' : 'Event Schedule'}
            </h1>
            {filteredEvents.length > 0 && (
               <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100/50 px-2 h-4 text-[9px] font-bold">
                 {filteredEvents.length}
               </Badge>
            )}
          </div>
          <p className="text-slate-400 mt-0.5 font-medium text-xs">
            {subtitle}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {activeView === 'calendar' ? (
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/10 bg-white junta-calendar-wrap flex-1"
            >
              <style dangerouslySetInnerHTML={{ __html: `
                /* Hide ALL possible plus/create buttons in the calendar */
                .junta-calendar-wrap [class*="create"],
                .junta-calendar-wrap [class*="Create"],
                .junta-calendar-wrap .df-header-left button:first-of-type,
                .junta-calendar-wrap .df-icon-plus,
                .junta-calendar-wrap .df-header-create-button { 
                  display: none !important; 
                  visibility: hidden !important;
                  pointer-events: none !important;
                }
              ` }} />
              <DayFlowCalendar calendar={calendar} />
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {filteredEvents.map((event) => (
                    <EventListItem 
                      key={event.id} 
                      event={event} 
                      onClick={() => navigate(`/app/events/${event.id}`)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 mb-3 border border-slate-100/50">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No events found</h3>
                  <p className="text-slate-400 mt-1 max-w-[200px] text-[11px] font-medium leading-relaxed">
                    Adjust filters or switch views to find scheduled activities.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4 rounded-lg font-bold text-[10px] h-8 px-4"
                    onClick={() => setSelectedCategories(CALENDAR_DEFINITIONS.map(c => c.name))}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
