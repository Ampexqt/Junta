import { Router } from 'express';
import { db } from '../config/firebase-admin';
import { authenticateUser, AuthRequest } from '../middleware/auth';

const router = Router();

// Create an event
router.post('/', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const eventData = req.body;
        const organizerId = authReq.user.uid;

        // Basic validation
        if (!eventData.title || !eventData.category || !eventData.date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Add metadata
        const newEvent = {
            ...eventData,
            organizerId,
            organizerName: authReq.user.name || 'Anonymous Organizer', // Store name for easy display
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            participantsCount: 0,
        };

        const docRef = await db.collection('events').add(newEvent);

        res.status(201).json({
            message: 'Event created successfully',
            eventId: docRef.id,
            event: { id: docRef.id, ...newEvent }
        });
    } catch (error: any) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
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
    } catch (error: any) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Get my events (Organizer)
router.get('/my-events', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const organizerId = authReq.user.uid;

        const snapshot = await db.collection('events')
            .where('organizerId', '==', organizerId)
            .get();

        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(events);
    } catch (error: any) {
        console.error('Error fetching my events:', error);
        res.status(500).json({ error: 'Failed to fetch your events' });
    }
});

// Admin: Get all pending events
router.get('/pending', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        if (authReq.user.role !== 'admin') {
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
    } catch (error: any) {
        console.error('Error fetching pending events:', error);
        res.status(500).json({ error: 'Failed to fetch pending events' });
    }
});

// Admin: Approve or Reject event
router.patch('/:id/status', authenticateUser, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        if (authReq.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { status } = req.body; // 'published' or 'rejected'

        if (!['published', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await db.collection('events').doc(id).update({
            status,
            updatedAt: new Date().toISOString(),
            reviewedBy: authReq.user.uid,
            reviewedAt: new Date().toISOString()
        });

        res.json({ message: `Event ${status} successfully`, eventId: id });
    } catch (error: any) {
        console.error('Error updating event status:', error);
        res.status(500).json({ error: 'Failed to update event status' });
    }
});

export const eventsRoutes = router;
