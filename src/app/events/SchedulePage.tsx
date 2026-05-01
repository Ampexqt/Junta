import { useMemo, useState, useEffect, useRef } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ChevronRight,
  History,
  CalendarCheck,
  Filter,
  Check,
  User,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from '@/features/auth/AuthContext';
import {
  useScheduleEvents,
  CALENDAR_DEFINITIONS,
  ScheduleEvent,
} from '@/hooks/useScheduleEvents';
import { useDayflowStyles } from '@/hooks/useDayflowStyles';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api';

// ─── Role subtitle config ────────────────────────────────────────────────────

const ROLE_SUBTITLE: Record<string, string> = {
  admin:       'Full system event management.',
  organizer:   'Explore and manage community events.',
  participant: 'Find and join environmental activities.',
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

export function SchedulePage() {
  useDayflowStyles();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { calendarEvents, rawEvents, isLoading, error, refresh } = useScheduleEvents();

  const [activeView, setActiveView] = useState<'calendar' | 'upcoming' | 'past'>('calendar');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CALENDAR_DEFINITIONS.map(c => c.name)
  );
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [participantAvatars, setParticipantAvatars] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedEvent?.id || !showModal) return;
    setParticipantAvatars([]);
    fetch(`${API_BASE_URL}/events/${selectedEvent.id}/public-participants?limit=3`)
      .then(res => res.json())
      .then(data => setParticipantAvatars(data))
      .catch(console.error);
  }, [selectedEvent?.id, showModal]);


  
  // ─── Event Item Component (Nested for scope) ───────────────────────────────
  function EventListItem({ event, onClick }: { event: ScheduleEvent; onClick: () => void }) {
    const eventDate = new Date(event.date);
    
    // Find category color - use case-insensitive matching
    const catDef = CALENDAR_DEFINITIONS.find(c => c.name.toLowerCase() === event.category.toLowerCase());
    const brandColor = catDef?.colors.eventColor || '#cbd5e1';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        <div 
          className="group relative flex flex-col h-full rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 cursor-pointer p-6"
          onClick={() => onClick()}
        >
          {/* Top Label Bar */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: brandColor }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: brandColor }}>{event.category}</span>
              </div>
              {event.organizationName && (
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-4 flex items-center gap-1">
                  <span>Organization Name:</span>
                  <span className="text-slate-900 font-black">{event.organizationName}</span>
                </div>
              )}
            </div>
            <div 
              className="flex items-center gap-2.5 pr-4 pl-1.5 h-8 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm bg-white"
              style={{ 
                borderColor: brandColor,
                color: '#0f172a' // High contrast slate-900
              }}
            >
               <div 
                 className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                 style={{ backgroundColor: brandColor }}
               >
                 <CalendarIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />
               </div>
               <span>{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Title - High Contrast */}
          <h3 className="text-lg font-black text-slate-950 group-hover:text-emerald-700 transition-colors leading-tight mb-5 line-clamp-2">
            {event.title}
          </h3>

          {/* Details - Minimalist Rows */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600">Schedule</span>
              </div>
              <span className="text-[11px] font-black text-slate-900">{event.startTime} — {event.endTime || 'End'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600">Location</span>
              </div>
              <span className="text-[11px] font-black text-slate-900 truncate max-w-[150px] text-right">
                {event.locationName || event.location}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600">Volunteers</span>
              </div>
              <span className="text-[11px] font-black text-slate-900">{event.participantsCount || 0} Joined</span>
            </div>
          </div>

          {/* Minimalist Footer */}
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 text-amber-500">
                {"★★★★★".split("").map((_, i) => (
                  <span key={i} className="text-xs">★</span>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-500 mt-0.5">5.0</span>
            </div>
            
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
              View Details <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
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
    const events = rawEvents.filter(e => {
      const catMatch = CALENDAR_DEFINITIONS.find(c => c.name.toLowerCase() === e.category.toLowerCase());
      const mappedCat = catMatch ? catMatch.name : 'Other';
      return selectedCategories.includes(mappedCat);
    });
    
    if (activeView === 'upcoming') {
      return events.filter(e => new Date(e.date) >= now)
                   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (activeView === 'past') {
      return events.filter(e => new Date(e.date) < now)
                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return events;
  }, [rawEvents, activeView, selectedCategories, now]);
  
  // ── Group by Month & Year for List View ──
  const groupedEvents = useMemo(() => {
    const groups: Record<string, ScheduleEvent[]> = {};
    filteredEvents.forEach(e => {
      const d = new Date(e.date);
      const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [filteredEvents]);

  // Calendar filtered events
  const filteredCalendarEvents = useMemo(() => {
    return calendarEvents.filter(e => {
      const rawCat = (e.meta?.category as string) || '';
      // Case-insensitive mapping to official category names
      const catMatch = CALENDAR_DEFINITIONS.find(c => c.name.toLowerCase() === rawCat.toLowerCase());
      const mappedCat = catMatch ? catMatch.name : 'Other';
      return selectedCategories.includes(mappedCat);
    });
  }, [calendarEvents, selectedCategories]);

  // ── Calendar Instance (Completely Stable) ──
  const eventsPlugin = useMemo(() => createEventsPlugin(), []);
  const initialDate = useMemo(() => new Date(), []);
  
  const views = useMemo(() => [
    createDayView({ timeFormat: '12h', scrollToCurrentTime: true }),
    createWeekView({ timeFormat: '12h', scrollToCurrentTime: true }),
    createMonthView(),
    createYearView({ mode: 'grid', showTimedEventsInYearView: true }),
  ], []);

  // Use a ref for the click handler to avoid re-creating the config when rawEvents change
  const rawEventsRef = useRef(rawEvents);
  useEffect(() => { rawEventsRef.current = rawEvents; }, [rawEvents]);

  const calendar = useCalendarApp({
    views,
    defaultView: ViewType.MONTH,
    plugins: [eventsPlugin],
    events: [], // Start empty, sync via useEffect
    calendars: CALENDAR_DEFINITIONS,
    initialDate,
    callbacks: {
      onEventClick: (event: any) => {
        const firestoreId = event.meta?.firestoreId;
        const fullEvent = rawEventsRef.current.find(e => e.id === firestoreId);
        
        if (fullEvent) {
          setSelectedEvent(fullEvent);
          setShowModal(true);
        } else if (firestoreId) {
          navigate(`/app/events/${firestoreId}`);
        }
      },
    },
  });

  // ── Sync Events to Calendar Instance (Controlled) ──
  // Use a ref to track the last synced events to avoid redundant updates
  const lastSyncedRef = useRef<string>('');

  useEffect(() => {
    if (!calendar) return;
    
    const eventsJson = JSON.stringify(filteredCalendarEvents);
    if (lastSyncedRef.current === eventsJson) return;
    
    // Clear and set
    calendar.applyEventsChanges({
      delete: calendar.events.map(e => e.id),
      add: filteredCalendarEvents
    });
    
    lastSyncedRef.current = eventsJson;
  }, [calendar, filteredCalendarEvents]);

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
                  <div 
                    className={cn(
                      "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center bg-white shadow-sm",
                      selectedCategories.includes(cat.name) ? "border-transparent" : "border-slate-400 group-hover:border-slate-600"
                    )}
                    style={selectedCategories.includes(cat.name) ? { backgroundColor: cat.colors.eventColor } : {}}
                  >
                    <Check 
                      className="w-3 h-3 text-white transition-transform" 
                      style={{ transform: selectedCategories.includes(cat.name) ? 'scale(1)' : 'scale(0)' }} 
                      strokeWidth={4} 
                    />
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
              {Object.keys(groupedEvents).length > 0 ? (
                <div className="space-y-12">
                  {Object.entries(groupedEvents).map(([monthYear, events]) => (
                    <div key={monthYear} className="space-y-5">
                      <div className="flex items-center gap-4 px-1">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                          {monthYear}
                        </h2>
                        <div className="h-[1px] w-full bg-slate-100" />
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
                        {events.map((event) => (
                          <EventListItem 
                            key={event.id} 
                            event={event} 
                            onClick={() => {
                              if (event.id === 'mock-cleanup-29') {
                                setSelectedEvent(event);
                                setShowModal(true);
                              } else {
                                navigate(`/app/events/${event.id}`);
                              }
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-200 mb-4 border border-slate-100/50 shadow-sm">
                    <CalendarIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">No events discovered</h3>
                  <p className="text-slate-400 mt-1.5 max-w-[240px] text-xs font-medium leading-relaxed">
                    Adjust your category filters or switch views to explore community activities.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-6 rounded-xl font-bold text-[11px] h-10 px-6 border-slate-200 hover:bg-slate-50 uppercase tracking-widest"
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

      {/* Event Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div 
            className="h-32 w-full relative flex items-end p-6 bg-slate-800 bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                selectedEvent?.category === 'Cleanup' ? 'https://images.unsplash.com/photo-1618477461853-cf6ed80fbea5?q=80&w=800&auto=format&fit=crop' :
                selectedEvent?.category === 'Planting' ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop' :
                selectedEvent?.category === 'Workshop' ? 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=800&auto=format&fit=crop' :
                selectedEvent?.category === 'Awareness' ? 'https://images.unsplash.com/photo-1531206715517-5c0ba140b4b8?q=80&w=800&auto=format&fit=crop' :
                selectedEvent?.category === 'Research' ? 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop' :
                'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=800&auto=format&fit=crop'
              })`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="relative z-10 w-full flex items-center justify-between">
              <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-none font-black text-[10px] uppercase tracking-widest px-3">
                {selectedEvent?.category}
              </Badge>
              <div className="flex -space-x-2">
                 {participantAvatars.length > 0 ? (
                   participantAvatars.map((url, i) => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-200 overflow-hidden shadow-sm">
                        <img src={url} alt="participant" className="w-full h-full object-cover" />
                     </div>
                   ))
                 ) : (
                   [1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-200 overflow-hidden shadow-sm opacity-50">
                        <img src={`https://i.pravatar.cc/150?u=${selectedEvent?.id || 'event'}-${i}`} alt="avatar" className="w-full h-full object-cover" />
                     </div>
                   ))
                 )}
                 <div className="w-6 h-6 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">
                    +{selectedEvent?.participantsCount || 0}
                 </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                {selectedEvent?.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <CalendarIcon className="w-3 h-3" />
                {selectedEvent?.date && new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Schedule</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedEvent?.startTime} — {selectedEvent?.endTime || 'End'}
                  </p>
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Location</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {selectedEvent?.locationName || selectedEvent?.location}
                  </p>
               </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Organizer</p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {selectedEvent?.organizationName || selectedEvent?.organizerName || 'Junta Official'}
                    </p>
                  </div>
               </div>
               
               {/* Mission Outcome for Organizers (Past Events) */}
               {selectedEvent && new Date(selectedEvent.date) < new Date(new Date().setHours(0,0,0,0)) ? (
                 <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Mission Feedback</h4>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100">Private to Organizer</Badge>
                    </div>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {[
                        { name: "Sarah Jenkins", rating: 5, comment: "Amazing coordination! The team was very helpful and we cleared so much more than expected.", avatar: "https://i.pravatar.cc/150?u=sarah" },
                        { name: "Michael Chen", rating: 4, comment: "Well organized, but we could use more recycling bins at the site next time.", avatar: "https://i.pravatar.cc/150?u=michael" },
                        { name: "Jhon Harold", rating: 5, comment: "I really liked the energy! Looking forward to the next one.", avatar: "https://i.pravatar.cc/150?u=jhon" }
                      ].map((p, idx) => (
                        <details key={idx} className="group border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-slate-200 transition-colors">
                          <summary className="flex items-center justify-between p-3 cursor-pointer list-none">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-100">
                                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <div className="flex gap-0.5 text-amber-400">
                                 {Array.from({ length: p.rating }).map((_, i) => (
                                   <span key={i} className="text-[10px]">★</span>
                                 ))}
                               </div>
                               <ChevronRight className="w-3 h-3 text-slate-300 group-open:rotate-90 transition-transform" />
                            </div>
                          </summary>
                          <div className="px-3 pb-3 pt-0">
                             <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100/50">
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">"{p.comment}"</p>
                             </div>
                          </div>
                        </details>
                      ))}
                    </div>
                 </div>
               ) : (
                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                      "This is a scheduled environmental activity. Official registration and participation details will be enabled soon."
                    </p>
                 </div>
               )}
            </div>

            <div className="pt-2 flex gap-3">
               <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold text-xs" onClick={() => setShowModal(false)}>
                  Close
               </Button>
               <Button 
                 className="flex-1 h-10 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90"
                 onClick={() => {
                   setShowModal(false);
                   if (selectedEvent) {
                     setTimeout(() => navigate(`/app/events/${selectedEvent.id}`), 150);
                   }
                 }}
               >
                  View Details
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
