/**
 * useMyParticipations
 * Real-time Firestore listener for the current user's participations.
 * Joins each participation doc with the corresponding event doc for full data.
 */
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';

export interface ParticipationRecord {
  id: string;
  eventId: string;
  title: string;
  date: string;
  location: string;
  category: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  progress: number;
  joinedAt: string;
  attendedAt?: string;
  completedAt?: string;
  // Rating fields (populated after event completion)
  rating?: number;
  ratingComment?: string;
  ratingSubmittedAt?: string;
  isEligibleForRating?: boolean;
  // Event Rating fields (participant rating the event)
  eventRating?: number;
  eventRatingComment?: string;
  hasRatedEvent?: boolean;
  eventRatingSubmittedAt?: string;
  // Event metadata
  coverImage?: string;
  organizationName?: string;
  organizerName?: string;
}

interface UseMyParticipationsReturn {
  participations: ParticipationRecord[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    completed: number;
    upcoming: number;
    ongoing: number;
    averageRating: number;
  };
}

export function useMyParticipations(): UseMyParticipationsReturn {
  const { uid } = useAuth();
  const [participations, setParticipations] = useState<ParticipationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'participations'),
      where('userId', '==', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const enriched: ParticipationRecord[] = await Promise.all(
            snapshot.docs.map(async (pDoc) => {
              const pData = pDoc.data();
              // Fetch the event doc for full metadata
              const eventSnap = await getDoc(doc(db, 'events', pData.eventId));
              const eData = eventSnap.exists() ? eventSnap.data() : null;

              return {
                id: pDoc.id,
                eventId: pData.eventId,
                // Use denormalized title stored at join time, then fall back to live event doc
                title: pData.eventTitle || eData?.title || eData?.name || 'Untitled Event',
                date: pData.eventDate || eData?.date || '',
                location: pData.locationName || eData?.locationName || eData?.location || '',
                category: pData.category || eData?.category || '',
                status: pData.status || 'Upcoming',
                progress: pData.progress || 0,
                joinedAt: pData.joinedAt || '',
                attendedAt: pData.attendedAt,
                completedAt: pData.completedAt,
                rating: pData.rating ?? undefined,
                ratingComment: pData.ratingComment || '',
                ratingSubmittedAt: pData.ratingSubmittedAt,
                isEligibleForRating: pData.isEligibleForRating || false,
                eventRating: pData.eventRating,
                eventRatingComment: pData.eventRatingComment || '',
                hasRatedEvent: pData.hasRatedEvent || false,
                eventRatingSubmittedAt: pData.eventRatingSubmittedAt,
                coverImage: eData?.coverImage,
                organizationName: pData.organizationName || eData?.organizationName,
                organizerName: pData.organizerName || eData?.organizerName,
              } as ParticipationRecord;
            })
          );

          // Sort: Ongoing first, then Upcoming by date, then Completed (latest first)
          enriched.sort((a, b) => {
            const order: Record<string, number> = { Ongoing: 0, Upcoming: 1, Completed: 2, Cancelled: 3 };
            const oa = order[a.status] ?? 4;
            const ob = order[b.status] ?? 4;
            if (oa !== ob) return oa - ob;
            return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
          });

          setParticipations(enriched);
          setIsLoading(false);
        } catch (err) {
          console.error('[useMyParticipations] Error enriching data:', err);
          setError('Failed to load participation data.');
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('[useMyParticipations] Firestore error:', err);
        setError('Failed to connect to real-time updates.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const stats = {
    total: participations.length,
    completed: participations.filter(p => p.status === 'Completed').length,
    upcoming: participations.filter(p => p.status === 'Upcoming').length,
    ongoing: participations.filter(p => p.status === 'Ongoing').length,
    averageRating: (() => {
      const rated = participations.filter(p => p.rating != null);
      if (!rated.length) return 0;
      return parseFloat((rated.reduce((s, p) => s + (p.rating || 0), 0) / rated.length).toFixed(1));
    })(),
  };

  return { participations, isLoading, error, stats };
}
