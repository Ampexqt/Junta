import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  where,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/AuthContext';

export type NotificationType =
  | 'event_created'
  | 'event_approved'
  | 'event_rejected'
  | 'event_joined'
  | 'kyc_submitted'
  | 'kyc_verified'
  | 'kyc_rejected'
  | 'organizer_approved'
  | 'organizer_rejected'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  relatedId?: string | null;
  createdAt: Date;
}

interface UseNotificationsOptions {
  maxItems?: number;
}

export function useNotifications({ maxItems = 50 }: UseNotificationsOptions = {}) {
  const { uid } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications', uid, 'items'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: AppNotification[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: (data.type || 'system') as NotificationType,
            title: data.title || 'Notification',
            message: data.message || '',
            read: data.read === true,
            link: data.link || null,
            relatedId: data.relatedId || null,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          };
        });
        setNotifications(items);
        setLoading(false);
      },
      (error) => {
        console.error('[useNotifications] Listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, maxItems]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /** Mark a single notification as read in Firestore */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!uid) return;
      try {
        const batch = writeBatch(db);
        const ref = doc(db, 'notifications', uid, 'items', notificationId);
        batch.update(ref, { read: true });
        await batch.commit();
      } catch (e) {
        console.error('[useNotifications] markAsRead error:', e);
      }
    },
    [uid]
  );

  /** Mark ALL notifications as read in Firestore */
  const markAllAsRead = useCallback(async () => {
    if (!uid) return;
    try {
      const unreadSnap = await getDocs(
        query(
          collection(db, 'notifications', uid, 'items'),
          where('read', '==', false)
        )
      );
      if (unreadSnap.empty) return;
      const batch = writeBatch(db);
      unreadSnap.docs.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
    } catch (e) {
      console.error('[useNotifications] markAllAsRead error:', e);
    }
  }, [uid]);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}
