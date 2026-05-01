/**
 * useScheduleEvents
 * Fetches Firestore events and converts them into Dayflow-compatible Event objects.
 * Role logic:
 *  - admin       → all events in the system (any status)
 *  - organizer   → only events they own
 *  - participant → only published/public events
 */
import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { createEvent } from '@dayflow/core';
import type { Event as DayflowEvent } from '@dayflow/core';
import { useAuth } from '@/features/auth/AuthContext';

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;      // ISO date string stored in Firestore (e.g. "2025-06-15")
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
  location: string;
  locationName?: string;
  category: string;
  status: string;
  organizerId?: string;
  organizerName?: string;
  organizationName?: string;
  participantsCount?: number;
}

/** Category → Dayflow calendarId mapping */
export const CATEGORY_CALENDAR_MAP: Record<string, string> = {
  Cleanup: 'cleanup',
  Planting: 'planting',
  Workshop: 'workshop',
  Awareness: 'awareness',
  Research: 'research',
  Other: 'other',
};

/** Calendar colour definitions per category — aligned with Junta brand palette */
export const CALENDAR_DEFINITIONS = [
  {
    id: 'cleanup',
    name: 'Cleanup',
    colors: {
      eventColor: '#3b82f6',
      eventSelectedColor: '#2563eb',
      lineColor: '#3b82f6',
      textColor: '#ffffff',
    },
    isVisible: true,
  },
  {
    id: 'planting',
    name: 'Planting',
    colors: {
      eventColor: '#2FA084',   // brand primary
      eventSelectedColor: '#1F6F5F',
      lineColor: '#2FA084',
      textColor: '#ffffff',
    },
    isVisible: true,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    colors: {
      eventColor: '#8b5cf6',
      eventSelectedColor: '#7c3aed',
      lineColor: '#8b5cf6',
      textColor: '#ffffff',
    },
    isVisible: true,
  },
  {
    id: 'awareness',
    name: 'Awareness',
    colors: {
      eventColor: '#f59e0b',
      eventSelectedColor: '#d97706',
      lineColor: '#f59e0b',
      textColor: '#ffffff',
    },
    isVisible: true,
  },
  {
    id: 'research',
    name: 'Research',
    colors: {
      eventColor: '#ec4899',
      eventSelectedColor: '#db2777',
      lineColor: '#ec4899',
      textColor: '#ffffff',
    },
    isVisible: true,
  },
  {
    id: 'other',
    name: 'Other',
    colors: {
      eventColor: '#6b7280',
      eventSelectedColor: '#4b5563',
      lineColor: '#6b7280',
      textColor: '#ffffff',
    },
    isVisible: true,
  },
];

/**
 * Safely parses a date+time string from Firestore and returns a JS Date.
 * Falls back gracefully if the format is unexpected.
 */
function parseEventDate(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    // Attempt standard parse first (handles "Apr 29, 2026")
    let d = new Date(dateStr);
    
    // If invalid, try appending T00:00:00 (for strict "YYYY-MM-DD" formats)
    if (isNaN(d.getTime())) {
      const base = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
      d = new Date(base);
    }
    
    if (isNaN(d.getTime())) return null;

    if (timeStr) {
      // timeStr might be "10:30 AM" or "14:00"
      const [timePart, period] = timeStr.trim().split(/\s+/);
      if (timePart) {
        const [hStr, mStr] = timePart.split(':');
        let h = parseInt(hStr, 10);
        const m = parseInt(mStr || '0', 10);
        
        if (!isNaN(h) && !isNaN(m)) {
           if (period?.toLowerCase() === 'pm' && h < 12) h += 12;
           if (period?.toLowerCase() === 'am' && h === 12) h = 0;
           d.setHours(h, m, 0, 0);
        }
      }
    }
    return d;
  } catch {
    return null;
  }
}

/**
 * Converts a raw Firestore event document into a Dayflow-compatible Event.
 */
function toCalendarEvent(raw: ScheduleEvent): DayflowEvent | null {
  const start = parseEventDate(raw.date, raw.startTime);
  if (!start) return null;

  const end = raw.endTime
    ? parseEventDate(raw.date, raw.endTime)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000); // default 2-hour block

  if (!end || end <= start) {
    // If end parsing fails, default to start + 2 hours
    const fallbackEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return createEvent({
      id: raw.id,
      title: `${raw.title} • ${raw.locationName || raw.location}`,
      start,
      end: fallbackEnd,
      description: `${raw.location} · ${raw.category}`,
      calendarId: CATEGORY_CALENDAR_MAP[raw.category] ?? 'other',
      meta: {
        location: raw.location,
        locationName: raw.locationName,
        category: raw.category,
        status: raw.status,
        organizerId: raw.organizerId,
        organizerName: raw.organizerName,
        organizationName: raw.organizationName,
        participantsCount: raw.participantsCount,
        firestoreId: raw.id,
      },
    });
  }

  return createEvent({
    id: raw.id,
    title: `${raw.title} • ${raw.locationName || raw.location}`,
    start,
    end,
    description: `${raw.location} · ${raw.category}`,
    calendarId: CATEGORY_CALENDAR_MAP[raw.category] ?? 'other',
    meta: {
      location: raw.location,
      locationName: raw.locationName,
      category: raw.category,
      status: raw.status,
      organizerId: raw.organizerId,
      organizerName: raw.organizerName,
      organizationName: raw.organizationName,
      participantsCount: raw.participantsCount,
      firestoreId: raw.id,
    },
  });
}

function mapDocToScheduleEvent(id: string, data: DocumentData): ScheduleEvent {
  return {
    id,
    title: data.title || 'Untitled Event',
    date: data.date || '',
    startTime: data.startTime || data.time?.split('–')[0]?.trim(),
    endTime: data.endTime || data.time?.split('–')[1]?.trim(),
    location: data.locationName || data.location || 'Unknown Location',
    locationName: data.locationName,
    category: data.category || 'Other',
    status: data.status || 'published',
    organizerId: data.organizerId,
    organizerName: data.organizerName,
    organizationName: data.organizationName,
    participantsCount: data.participantsCount,
  };
}

interface UseScheduleEventsReturn {
  calendarEvents: DayflowEvent[];
  rawEvents: ScheduleEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useScheduleEvents(): UseScheduleEventsReturn {
  const { role, uid } = useAuth();
  const [rawEvents, setRawEvents] = useState<ScheduleEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<DayflowEvent[]>([]);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Effect 1: Listen to participations to know which events the user has joined
  useEffect(() => {
    if (!uid || role === 'admin') return;

    const partQ = query(collection(db, 'participations'), where('userId', '==', uid));
    const unsub = onSnapshot(partQ, (snap) => {
      setJoinedEventIds(new Set(snap.docs.map(d => d.data().eventId as string)));
    }, (err) => console.error('[useScheduleEvents] partQ error:', err));

    return () => unsub();
  }, [uid, role]);

  // Effect 2: Listen to events and apply role-based filtering
  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        const raw: ScheduleEvent[] = [];
        const calEvents: DayflowEvent[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Filter logic per role
          if (role !== 'admin') {
            const isMyEvent = data.organizerId === uid;  // created by me
            const isJoined  = joinedEventIds.has(doc.id); // joined as participant
            const isPublic  = data.visibility === 'public';
            
            // Only show events that are approved, published, or completed
            const isValidStatus = ['approved', 'published', 'completed', 'ongoing'].includes((data.status || 'published').toLowerCase());
            
            if (!isValidStatus) return; // Hide rejected and pending events from the calendar
            
            // Show if it's my event, I joined it, OR it's a public event
            if (!isMyEvent && !isJoined && !isPublic) return;
          }

          const scheduleEvent = mapDocToScheduleEvent(doc.id, data);
          raw.push(scheduleEvent);

          const calEvent = toCalendarEvent(scheduleEvent);
          if (calEvent) {
            calEvents.push(calEvent);
          } else {
            console.warn('[useScheduleEvents] toCalendarEvent returned null for:', doc.id, scheduleEvent.date, scheduleEvent.startTime);
          }
        });

        console.log(`[useScheduleEvents] Found ${calEvents.length} calendar events out of ${snapshot.size} total events. joinedEventIds size:`, joinedEventIds.size);
        setRawEvents(raw);
        setCalendarEvents(calEvents);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useScheduleEvents] Firestore error:', err);
        setError('Failed to load schedule data. Please try again.');
        setIsLoading(false);
      }
    );

    return () => unsubEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, uid, refreshKey, joinedEventIds]);

  return { calendarEvents, rawEvents, isLoading, error, refresh };
}
