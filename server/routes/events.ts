import { Router } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase-admin';
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
        const organizationName = userData?.orgName || '';

        // Add metadata
        const newEvent = {
            ...eventData,
            organizerId,
            organizerName: authReq.user?.name || 'Anonymous Organizer', // Store name for easy display
            organizationName,
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

// Get single event details
router.get('/:id', async (req, res) => {
    try {
        const eventDoc = await db.collection('events').doc(req.params.id).get();
        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ id: eventDoc.id, ...eventDoc.data() });
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

export const eventsRoutes = router;
