import { Router } from 'express';
/* eslint-env node */
import admin from 'firebase-admin';
import { db } from '../config/firebase-admin';
import * as jwt from 'jsonwebtoken';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { createNotification, notifyAllAdmins } from '../services/notifications';
import { logAdminAction } from '../services/adminLogs';
import { grantXP, grantOP, XP, OP, processEventCompletionGamification } from '../services/gamification';

const router = Router();

// Create an event
router.post('/', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const eventData = req.body;
        
        if (!authReq.user || !authReq.user.uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const organizerId = authReq.user.uid;

        // Basic validation
        if (!eventData.title || !eventData.category || !eventData.date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fetch user's organization name to attach to the event
        const userDoc = await db.collection('users').doc(organizerId).get();
        const userData = userDoc.data();

        // KYC Verification Check for Organizer
        if (userData?.kycStatus !== 'verified') {
            return res.status(403).json({ error: 'You must complete KYC verification before creating an event.' });
        }

        const organizationName = userData?.organizationName || userData?.orgName || '';
        const organizationLogo = userData?.organizationLogo || userData?.photoURL || '';
        const organizerPhotoURL = userData?.photoURL || '';

        // Add metadata
        const newEvent = {
            ...eventData,
            organizerId,
            organizerName: authReq.user?.name || 'Anonymous Organizer', // Store name for easy display
            organizationName,
            organizationLogo,
            organizerPhotoURL,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            participantsCount: 0,
            averageRating: 0,
            ratingCount: 0,
        };

        const docRef = await db.collection('events').add(newEvent);

        // Notify all admins about the new pending event
        notifyAllAdmins({
            type: 'event_created',
            title: '📋 New Event Submission',
            message: `"${eventData.title}" was submitted by ${authReq.user?.name || 'an organizer'} and is awaiting review.`,
            link: '/app/admin/approvals',
            relatedId: docRef.id,
        }).catch(console.error); // fire-and-forget

        res.status(201).json({
            message: 'Event created successfully',
            eventId: docRef.id,
            event: { id: docRef.id, ...newEvent }
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Get my events (Organizer)
router.get('/my-events', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const organizerId = authReq.user?.uid;

        if (!organizerId) return res.status(401).json({ error: 'Unauthorized' });

        const snapshot = await db.collection('events')
            .where('organizerId', '==', organizerId)
            .get();

        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(events);
    } catch (error) {
        console.error('Error fetching my events:', error);
        res.status(500).json({ error: 'Failed to fetch my events' });
    }
});

// Get my participations
router.get('/my-participations', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.uid;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const participationsSnapshot = await db.collection('participations')
            .where('userId', '==', userId)
            .get();

        if (participationsSnapshot.empty) {
            return res.json([]);
        }

        const participations: Array<{
            id: string;
            eventId: string;
            title: string;
            date: string;
            location: string;
            status: string;
            progress: number;
            joinedAt: string;
        }> = [];
        for (const doc of participationsSnapshot.docs) {
            const data = doc.data();
            const eventDoc = await db.collection('events').doc(data.eventId).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                participations.push({
                    id: doc.id,
                    eventId: data.eventId,
                    title: eventData?.title || eventData?.name,
                    date: eventData?.date,
                    location: eventData?.location,
                    status: data.status,
                    progress: data.progress,
                    joinedAt: data.joinedAt
                });
            }
        }

        res.json(participations);
    } catch (error) {
        console.error('Error fetching my participations:', error);
        res.status(500).json({ error: 'Failed to fetch participations' });
    }
});

// Admin: Get all pending events
router.get('/pending', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        if (!authReq.user || authReq.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const snapshot = await db.collection('events')
            .where('status', '==', 'pending')
            .get();

        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(events);
    } catch (error) {
        console.error('Error fetching pending events:', error);
        res.status(500).json({ error: 'Failed to fetch pending events' });
    }
});

// Get single event details (with IDOR protection)
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const eventDoc = await db.collection('events').doc(eventId).get();
        
        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventData = eventDoc.data();
        if (!eventData) {
            return res.status(404).json({ error: 'Event data is missing' });
        }
        
        const authHeader = req.headers.authorization;
        let hasJoined = false;
        let isOwner = false;
        let isAdmin = false;

        if (authHeader) {
            const token = authHeader.split('Bearer ')[1];
            const JWT_SECRET = process.env.JWT_SECRET || 'junta_fallback_secret';
            try {
                interface DecodedToken { uid: string; role: string; }
                const decoded = jwt.verify(token, JWT_SECRET) as unknown as DecodedToken;
                isOwner = eventData.organizerId === decoded.uid;
                isAdmin = decoded.role === 'admin';
                
                // Check if they joined
                const pDoc = await db.collection('participations').doc(`${eventId}_${decoded.uid}`).get();
                hasJoined = pDoc.exists;
            } catch (e) {
                // Ignore invalid tokens for public events
            }
        }

        // If the event is public and published, anyone can see it
        if (eventData.visibility === 'public' && eventData.status === 'published') {
            // Enrich with latest organization logo
            const organizerDoc = await db.collection('users').doc(eventData.organizerId).get();
            const organizerData = organizerDoc.data();
            return res.json({ 
                id: eventDoc.id, 
                ...eventData, 
                organizationLogo: organizerData?.organizationLogo || eventData.organizationLogo || organizerData?.photoURL,
                hasJoined
            });
        }

        // Otherwise, we need to check who is asking (Authorization Check)
        if (!authHeader || (!isOwner && !isAdmin)) {
            return res.status(403).json({ error: 'This event is private or pending review' });
        }

        // Owner/Admin view
        const organizerDoc = await db.collection('users').doc(eventData.organizerId).get();
        const organizerData = organizerDoc.data();
        return res.json({ 
            id: eventDoc.id, 
            ...eventData, 
            organizationLogo: organizerData?.organizationLogo || eventData.organizationLogo || organizerData?.photoURL,
            hasJoined
        });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
});

// Get all events (Public)
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('events')
            .where('visibility', '==', 'public')
            .where('status', '==', 'published') // Only show approved/published events
            .get();

        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Admin: Approve or Reject event
router.patch('/:id/status', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        if (!authReq.user || authReq.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { status, organizationName } = req.body; // 'published' or 'rejected'

        if (!['published', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData: Record<string, unknown> = {
            status,
            updatedAt: new Date().toISOString(),
            reviewedBy: authReq.user?.uid || 'admin',
            reviewedAt: new Date().toISOString()
        };

        if (organizationName !== undefined) {
            updateData.organizationName = organizationName;
        }

        await db.collection('events').doc(id).update(updateData);

        // Notify the organizer about the status change
        const eventDoc = await db.collection('events').doc(id).get();
        const eventData2 = eventDoc.data();
        if (eventData2?.organizerId) {
            const isApproved = status === 'published';
            const isRejected = status === 'rejected';
            if (isApproved || isRejected) {
                createNotification({
                    userId: eventData2.organizerId,
                    type: isApproved ? 'event_approved' : 'event_rejected',
                    title: isApproved ? '✅ Event Approved!' : '❌ Event Rejected',
                    message: isApproved
                        ? `Your event "${eventData2.title}" has been approved and is now live!`
                        : `Your event "${eventData2.title}" was not approved. Please review and resubmit.`,
                    link: '/app/organizer/submissions',
                    relatedId: id,
                }).catch(console.error);

                logAdminAction({
                    adminId: authReq.user.uid,
                    adminName: authReq.user.name || authReq.user.email || 'Admin',
                    actionType: 'event_approval',
                    actionStatus: isApproved ? 'approved' : 'rejected',
                    targetId: id,
                    targetName: eventData2.title || 'Unknown Event'
                }).catch(console.error);

                if (isApproved) {
                    await grantOP(eventData2.organizerId, OP.EVENT_APPROVED, 'Event approved by admin', id);
                }
            }
        }

        res.json({ message: `Event ${status} successfully`, eventId: id });
    } catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({ error: 'Failed to update event status' });
    }
});

// Public endpoint to get just the photos of the first few participants for preview avatars
router.get('/:id/public-participants', async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt((req.query.limit as string) || '3');
        
        // Fetch a few participations
        const participationsSnapshot = await db.collection('participations')
            .where('eventId', '==', id)
            .limit(limit)
            .get();
            
        if (participationsSnapshot.empty) return res.json([]);
        
        const userIds = participationsSnapshot.docs.map(doc => doc.data().userId);
        
        // Fetch the corresponding users to get their photo URLs
        const usersSnap = await db.collection('users').where('uid', 'in', userIds).get();
        const photos = usersSnap.docs
            .map(doc => doc.data().photoURL)
            .filter(Boolean); // Only return existing photos
            
        return res.json(photos);
    } catch (error) {
        console.error('Error fetching public participants preview:', error);
        return res.status(500).json({ error: 'Failed to fetch participant previews' });
    }
});

// Get event participants (Organizer or Admin)
router.get('/:id/participants', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user?.uid;
        
        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();
        
        if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });
        
        const eventData = eventDoc.data();
        const isAdmin = authReq.user?.role === 'admin';
        const isOrganizer = eventData?.organizerId === userId;
        
        if (!isAdmin && !isOrganizer) {
            return res.status(403).json({ error: 'Forbidden. Only admin or organizer can view participants.' });
        }
        
        const participationsSnapshot = await db.collection('participations').where('eventId', '==', id).get();
        if (participationsSnapshot.empty) return res.json([]);
        
        const userIds = participationsSnapshot.docs.map(doc => doc.data().userId);
        
        const users: Array<{ id: string; name: string; email: string; photoURL: string | null; joinedAt: string; status: string }> = [];
        for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const usersSnap = await db.collection('users').where('uid', 'in', chunk).get();
            usersSnap.docs.forEach(uDoc => {
                const uData = uDoc.data();
                const partDoc = participationsSnapshot.docs.find(d => d.data().userId === uDoc.id);
                users.push({
                    id: uDoc.id,
                    name: uData.displayName || `${uData.firstName} ${uData.lastName}`.trim(),
                    email: uData.email,
                    photoURL: uData.photoURL || null,
                    joinedAt: partDoc?.data()?.joinedAt,
                    status: partDoc?.data()?.status || 'Upcoming'
                });
            });
        }
        
        // Sort by joinedAt
        users.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
        res.json(users);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ error: 'Failed to fetch participants' });
    }
});

// Join an event (Participant)
router.post('/:id/join', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.uid;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventData = eventDoc.data();
        if (eventData?.status !== 'published' && eventData?.status !== 'approved') {
            return res.status(400).json({ error: 'Registration is not open for this event' });
        }

        // KYC Verification Check for Participant
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.data()?.kycStatus !== 'verified') {
            return res.status(403).json({ error: 'You must complete KYC verification before joining an event.' });
        }

        // Check if already joined
        const participationRef = db.collection('participations').doc(`${id}_${userId}`);
        const pDoc = await participationRef.get();
        if (pDoc.exists) {
            return res.status(400).json({ error: 'You have already joined this event' });
        }

        // Increment participants count atomically
        await eventRef.update({
            participantsCount: admin.firestore.FieldValue.increment(1),
            updatedAt: new Date().toISOString()
        });

        // Record participation with denormalized event info
        await participationRef.set({
            eventId: id,
            userId,
            status: 'Upcoming',
            progress: 0,
            joinedAt: new Date().toISOString(),
            eventTitle: eventData?.title || eventData?.name || '',
            eventDate: eventData?.date || '',
            locationName: eventData?.locationName || '',
            organizerName: eventData?.organizerName || '',
            organizationName: eventData?.organizationName || '',
            category: eventData?.category || '',
        });

        // Grant 10 XP for joining an event
        await grantXP(userId, XP.JOIN_EVENT, 'Joined event ' + id, id);

        // Notify the organizer that someone joined
        if (eventData?.organizerId) {
            const userDoc = await db.collection('users').doc(userId).get();
            const userData2 = userDoc.data();
            const userName = userData2?.displayName || userData2?.firstName || 'A participant';
            createNotification({
                userId: eventData.organizerId,
                type: 'event_joined',
                title: '👤 New Participant',
                message: `${userName} just registered for your event "${eventData.title}".`,
                link: '/app/organizer/my-events',
                relatedId: id,
            }).catch(console.error);
        }

        res.json({ message: 'Successfully joined event', eventId: id });
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ error: 'Failed to join event' });
    }
});

// Update an event (Organizer Only - IDOR Prevention)
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user?.uid;
        const updateData = req.body;

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventData = eventDoc.data();

        // AUTHORIZATION CHECK: Ensure the user is the organizer or an admin
        if (eventData?.organizerId !== userId && authReq.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: You can only edit your own events' });
        }

        const cleanUpdate = {
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        // Prevent tampering with sensitive fields
        delete cleanUpdate.organizerId;
        delete cleanUpdate.id;

        await eventRef.update(cleanUpdate);

        res.json({ message: 'Event updated successfully', id });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete an event (Organizer Only - IDOR Prevention)
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user?.uid;

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventData = eventDoc.data();

        // AUTHORIZATION CHECK: Ensure the user is the organizer or an admin
        if (eventData?.organizerId !== userId && authReq.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: You can only delete your own events' });
        }

        await eventRef.delete();

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Mark event as ONGOING (Admin or Organizer)
router.patch('/:id/mark-ongoing', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user?.uid;

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });

        const eventData = eventDoc.data();
        const isAdmin = authReq.user?.role === 'admin';
        const isOrganizer = eventData?.organizerId === userId;
        if (!isAdmin && !isOrganizer) return res.status(403).json({ error: 'Forbidden' });

        if (eventData?.status !== 'published') {
            return res.status(400).json({ error: 'Event must be published before marking ongoing' });
        }

        const now = new Date().toISOString();

        // Batch: update event + all participations to Ongoing
        const batch = db.batch();
        batch.update(eventRef, { status: 'ongoing', updatedAt: now });

        const participationsSnap = await db.collection('participations')
            .where('eventId', '==', id)
            .where('status', '==', 'Upcoming')
            .get();

        participationsSnap.docs.forEach(d => {
            batch.update(d.ref, { status: 'Ongoing', attendedAt: now });
        });

        await batch.commit();

        // Grant XP for attending
        for (const pDoc of participationsSnap.docs) {
            await grantXP(pDoc.data().userId, XP.ATTEND_EVENT, 'Attended event ' + id, id);
        }

        // Notify participants
        const allParts = await db.collection('participations').where('eventId', '==', id).get();
        const notifyPromises = allParts.docs.map(d =>
            createNotification({
                userId: d.data().userId,
                type: 'event_started',
                title: '🟢 Event Started!',
                message: `"${eventData?.title}" has begun. See you there!`,
                link: `/app/events/${id}`,
                relatedId: id,
            }).catch(console.error)
        );
        await Promise.all(notifyPromises);

        res.json({ message: 'Event marked as ongoing', eventId: id });
    } catch (error) {
        console.error('Error marking event ongoing:', error);
        res.status(500).json({ error: 'Failed to mark event ongoing' });
    }
});

// Mark event as COMPLETED (Admin or Organizer)
router.patch('/:id/mark-completed', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user?.uid;
        const { summary } = req.body;

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });

        const eventData = eventDoc.data();
        const isAdmin = authReq.user?.role === 'admin';
        const isOrganizer = eventData?.organizerId === userId;
        if (!isAdmin && !isOrganizer) return res.status(403).json({ error: 'Forbidden' });

        if (!['published', 'ongoing'].includes(eventData?.status)) {
            return res.status(400).json({ error: 'Event must be published or ongoing to complete' });
        }

        const now = new Date().toISOString();

        // Batch: update event + all participation docs
        const batch = db.batch();
        batch.update(eventRef, {
            status: 'completed',
            completedAt: now,
            completedBy: userId,
            updatedAt: now,
        });

        const participationsSnap = await db.collection('participations')
            .where('eventId', '==', id)
            .get();

        const totalParticipants = participationsSnap.docs.length;
        participationsSnap.docs.forEach(d => {
            batch.update(d.ref, {
                status: 'Completed',
                completedAt: now,
                isEligibleForRating: true,
            });
        });

        // Create eventResults doc
        const resultRef = db.collection('eventResults').doc(id);
        batch.set(resultRef, {
            eventId: id,
            completedAt: now,
            totalParticipants,
            ratedParticipants: 0,
            averageRating: 0,
            summary: summary || '',
        });

        await batch.commit();

        // Notify participants event is complete
        const notifyPromises = participationsSnap.docs.map(d =>
            createNotification({
                userId: d.data().userId,
                type: 'event_completed',
                title: '🏁 Event Completed!',
                message: `"${eventData?.title}" has ended. Thank you for participating!`,
                link: '/app/my-participation',
                relatedId: id,
            }).catch(console.error)
        );
        await Promise.all(notifyPromises);

        // TRIGGER GAMIFICATION REWARDS
        await processEventCompletionGamification(id, eventData?.organizerId);

        res.json({ message: 'Event marked as completed', eventId: id, totalParticipants });
    } catch (error) {
        console.error('Error marking event completed:', error);
        res.status(500).json({ error: 'Failed to mark event completed' });
    }
});

// Submit rating for a participant (Admin or Organizer only)
router.post('/:id/participants/:userId/rate', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id, userId: participantId } = req.params;
        const { rating, comment } = req.body;
        const raterUid = authReq.user?.uid;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });

        const eventData = eventDoc.data();
        const isAdmin = authReq.user?.role === 'admin';
        const isOrganizer = eventData?.organizerId === raterUid;
        if (!isAdmin && !isOrganizer) return res.status(403).json({ error: 'Forbidden' });

        if (eventData?.status !== 'completed') {
            return res.status(400).json({ error: 'Ratings can only be submitted after event is completed' });
        }

        const partRef = db.collection('participations').doc(`${id}_${participantId}`);
        const partDoc = await partRef.get();
        if (!partDoc.exists) return res.status(404).json({ error: 'Participation record not found' });
        if (!partDoc.data()?.isEligibleForRating) {
            return res.status(400).json({ error: 'This participant is not eligible for rating' });
        }

        const now = new Date().toISOString();

        // Update participation with rating
        await partRef.update({
            rating,
            ratingComment: comment || '',
            ratedBy: raterUid,
            ratingSubmittedAt: now,
            isEligibleForRating: false, // prevent duplicate ratings
        });

        const allParts = await db.collection('participations')
            .where('eventId', '==', id)
            .get();
        const rated = allParts.docs.filter(d => d.data().rating != null);

        // Update eventResults
        const resultRef = db.collection('eventResults').doc(id);
        await resultRef.update({
            ratedParticipants: rated.length,
        }).catch((err) => { console.error('Failed to update eventResults:', err); }); // Don't fail if eventResults doc doesn't exist yet

        // Update user's participation stats
        const userRef = db.collection('users').doc(participantId);
        const userAllParts = await db.collection('participations')
            .where('userId', '==', participantId)
            .get();
        const userRated = userAllParts.docs.filter(d => d.data().rating != null);
        const userAvg = userRated.length > 0
            ? userRated.reduce((sum, d) => sum + (d.data().rating || 0), 0) / userRated.length
            : 0;
        const completedCount = userAllParts.docs.filter(d => d.data().status === 'Completed').length;

        // Assign badges
        const badges: string[] = [];
        if (userAvg >= 4.8 && userRated.length >= 3) badges.push('eco-champion');
        if (completedCount >= 10) badges.push('veteran-volunteer');
        if (rating === 5) badges.push('5-star-volunteer');

        await userRef.update({
            'participationStats.averageRating': parseFloat(userAvg.toFixed(2)),
            'participationStats.completedEvents': completedCount,
            'participationStats.badges': admin.firestore.FieldValue.arrayUnion(...(badges.length ? badges : [''])),
        }).catch(console.error);

        // Notify participant of their rating
        createNotification({
            userId: participantId,
            type: 'rating_received',
            title: '⭐ You received a rating!',
            message: `You got ${rating}/5 stars for "${eventData?.title}". ${comment ? `"${comment}"` : ''}`,
            link: '/app/my-participation',
            relatedId: id,
        }).catch(console.error);

        // Grant XP to participant based on rating
        await grantXP(participantId, rating * XP.RECEIVE_RATING_PER_STAR, `Received a ${rating}-star rating`, id);

        res.json({ message: 'Rating submitted successfully', rating, averageRating: userAvg });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

// Submit rating for an EVENT (Participant only)
router.post('/:id/rate-event', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.uid;
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const partRef = db.collection('participations').doc(`${id}_${userId}`);
        const partDoc = await partRef.get();
        if (!partDoc.exists) return res.status(404).json({ error: 'Participation record not found' });
        
        const partData = partDoc.data();
        if (partData?.status !== 'Completed') {
            return res.status(400).json({ error: 'You can only rate events that are completed' });
        }
        if (partData?.hasRatedEvent) {
            return res.status(400).json({ error: 'You have already rated this event' });
        }

        const now = new Date().toISOString();

        // Update participation with the event rating
        await partRef.update({
            eventRating: rating,
            eventRatingComment: comment || '',
            hasRatedEvent: true,
            eventRatingSubmittedAt: now,
        });

        // Recalculate event average rating
        const allParts = await db.collection('participations')
            .where('eventId', '==', id)
            .get();
        const rated = allParts.docs.filter(d => d.data().eventRating != null);
        const avg = rated.length > 0
            ? rated.reduce((sum, d) => sum + (d.data().eventRating || 0), 0) / rated.length
            : 0;

        const eventRef = db.collection('events').doc(id);
        await eventRef.update({
            averageRating: parseFloat(avg.toFixed(2)),
            ratingCount: rated.length,
        });

        // Grant 15 XP for leaving a rating
        await grantXP(userId, XP.RATE_EVENT, `Rated event ${id}`, id);

        res.json({ message: 'Event rated successfully. You earned 15 XP!' });
    } catch (error) {
        console.error('Error rating event:', error);
        res.status(500).json({ error: 'Failed to submit event rating' });
    }
});

// Get all ratings for an event (Admin or Organizer)
router.get('/:id/ratings', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user?.uid;

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });

        const eventData = eventDoc.data();
        const isAdmin = authReq.user?.role === 'admin';
        const isOrganizer = eventData?.organizerId === userId;
        if (!isAdmin && !isOrganizer) return res.status(403).json({ error: 'Forbidden' });

        const participationsSnap = await db.collection('participations')
            .where('eventId', '==', id)
            .get();

        const result: Array<{
            participantId: string;
            name: string;
            email: string;
            photoURL: string | null;
            joinedAt: string;
            rating: number | null;
            ratingComment: string;
            ratingSubmittedAt: string | null;
            isEligibleForRating: boolean;
        }> = [];

        for (const pDoc of participationsSnap.docs) {
            const pData = pDoc.data();
            const userDoc = await db.collection('users').doc(pData.userId).get();
            const uData = userDoc.data();
            result.push({
                participantId: pData.userId,
                name: uData?.displayName || `${uData?.firstName || ''} ${uData?.lastName || ''}`.trim() || 'Unknown',
                email: uData?.email || '',
                photoURL: uData?.photoURL || null,
                joinedAt: pData.joinedAt,
                rating: pData.rating ?? null,
                ratingComment: pData.ratingComment || '',
                ratingSubmittedAt: pData.ratingSubmittedAt || null,
                isEligibleForRating: pData.isEligibleForRating || false,
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

// Get all EVENT ratings given by participants (Organizer only)
router.get('/:id/event-ratings', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user?.uid;

        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });

        const eventData = eventDoc.data();
        const isAdmin = authReq.user?.role === 'admin';
        const isOrganizer = eventData?.organizerId === userId;
        
        // Only organizer and admin can see the reviews of the event
        if (!isAdmin && !isOrganizer) return res.status(403).json({ error: 'Forbidden' });

        const participationsSnap = await db.collection('participations')
            .where('eventId', '==', id)
            .where('hasRatedEvent', '==', true)
            .get();

        const result: Array<{
            participantId: string;
            name: string;
            photoURL: string | null;
            eventRating: number;
            eventRatingComment: string;
            eventRatingSubmittedAt: string;
        }> = [];

        participationsSnap.docs.forEach(doc => {
            const data = doc.data();
            result.push({
                participantId: data.userId,
                name: data.participantName || data.userName || 'Anonymous',
                photoURL: data.photoURL || null,
                eventRating: data.eventRating,
                eventRatingComment: data.eventRatingComment || '',
                eventRatingSubmittedAt: data.eventRatingSubmittedAt,
            });
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching event ratings:', error);
        res.status(500).json({ error: 'Failed to fetch event ratings' });
    }
});

export const eventsRoutes = router;
