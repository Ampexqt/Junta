import { db } from '../config/firebase-admin';

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

interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedId?: string;
}

/**
 * Creates a real-time notification under the user's subcollection.
 * Path: notifications/{userId}/items/{auto-id}
 */
export async function createNotification(payload: CreateNotificationPayload): Promise<void> {
  const { userId, type, title, message, link, relatedId } = payload;

  await db
    .collection('notifications')
    .doc(userId)
    .collection('items')
    .add({
      type,
      title,
      message,
      link: link || null,
      relatedId: relatedId || null,
      read: false,
      createdAt: new Date(),
    });
}

/**
 * Sends a notification to ALL admin users in the system.
 */
export async function notifyAllAdmins(payload: Omit<CreateNotificationPayload, 'userId'>): Promise<void> {
  const adminSnapshot = await db
    .collection('users')
    .where('role', '==', 'admin')
    .get();

  const writes = adminSnapshot.docs.map((doc) =>
    createNotification({ ...payload, userId: doc.id })
  );

  await Promise.all(writes);
}
