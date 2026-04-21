import { Router } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase-admin';
import * as jwt from 'jsonwebtoken';
import { authenticateUser, AuthRequest } from '../middleware/auth';

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
        const organizationName = userData?.organizationName || userData?.orgName || '';
        const organizationLogo = userData?.organizationLogo || userData?.photoURL || '';

        // Add metadata
        const newEvent = {
            ...eventData,
            organizerId,
            organizerName: authReq.user?.name || 'Anonymous Organizer', // Store name for easy display
            organizationName,
            organizationLogo,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            participantsCount: 0,
            averageRating: 0,
            ratingCount: 0,
        };

        const docRef = await db.collection('events').add(newEvent);

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

        const participations = [];
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
        
        // If the event is public and published, anyone can see it
        if (eventData?.visibility === 'public' && eventData?.status === 'published') {
            // Enrich with latest organization logo
            const organizerDoc = await db.collection('users').doc(eventData.organizerId).get();
            const organizerData = organizerDoc.data();
            return res.json({ 
                id: eventDoc.id, 
                ...eventData, 
                organizationLogo: organizerData?.organizationLogo || eventData.organizationLogo || organizerData?.photoURL 
            });
        }

        // Otherwise, we need to check who is asking (Authorization Check)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(403).json({ error: 'This event is private or pending review' });
        }

        // Verify token to see if the requester is the owner or an admin
        const token = authHeader.split('Bearer ')[1];
        const JWT_SECRET = process.env.JWT_SECRET || 'junta_fallback_secret';
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            const isOwner = eventData?.organizerId === decoded.uid;
            const isAdmin = decoded.role === 'admin';

            if (isOwner || isAdmin) {
                // Enrich with latest organization logo
                const organizerDoc = await db.collection('users').doc(eventData.organizerId).get();
                const organizerData = organizerDoc.data();
                return res.json({ 
                    id: eventDoc.id, 
                    ...eventData, 
                    organizationLogo: organizerData?.organizationLogo || eventData.organizationLogo || organizerData?.photoURL 
                });
            } else {
                return res.status(403).json({ error: 'You do not have permission to view this event' });
            }
        } catch (e) {
            return res.status(403).json({ error: 'Invalid token' });
        }
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

        res.json({ message: `Event ${status} successfully`, eventId: id });
    } catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({ error: 'Failed to update event status' });
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
        if (eventData?.status !== 'published') {
            return res.status(400).json({ error: 'Registration is not open for this event' });
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

        // Record participation
        await participationRef.set({
            eventId: id,
            userId,
            status: 'Upcoming', // Can be 'Upcoming', 'In Progress', 'Completed'
            progress: 0,
            joinedAt: new Date().toISOString()
        });

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

export const eventsRoutes = router;
