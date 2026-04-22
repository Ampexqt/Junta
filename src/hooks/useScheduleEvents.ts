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
  Query,
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
    // Firestore dates can be ISO strings like "2025-06-15" or "2025-06-15T08:00:00.000Z"
    const base = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(base);
    if (isNaN(d.getTime())) return null;

    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        d.setHours(h, m, 0, 0);
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
      title: raw.title,
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
    title: raw.title,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const eventsRef = collection(db, 'events');

    let q: Query<DocumentData>;

    if (role === 'admin') {
      // Admin sees ALL events regardless of status
      q = query(eventsRef);
    } else if (role === 'organizer' && uid) {
      // Organizer sees only their own events (all statuses)
      q = query(eventsRef, where('organizerId', '==', uid));
    } else {
      // Participant sees only published public events
      q = query(
        eventsRef,
        where('visibility', '==', 'public'),
        where('status', '==', 'published')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const raw: ScheduleEvent[] = [];
        const calEvents: DayflowEvent[] = [];

        snapshot.forEach((doc) => {
          const scheduleEvent = mapDocToScheduleEvent(doc.id, doc.data());
          raw.push(scheduleEvent);

          const calEvent = toCalendarEvent(scheduleEvent);
          if (calEvent) calEvents.push(calEvent);
        });

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

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, uid, refreshKey]);

  return { calendarEvents, rawEvents, isLoading, error, refresh };
}
