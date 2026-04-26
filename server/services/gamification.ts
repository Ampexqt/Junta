import { db } from '../config/firebase-admin';
import * as admin from 'firebase-admin';

/**
 * GAMIFICATION SYSTEM LOGIC
 * Encapsulates XP, OP, Tier, and Badge distributions.
 */

// Badge definitions
const BADGES = {
    PARTICIPANT: {
        FIRST_STEP: 'badge_first_step',
        ECO_WARRIOR: 'badge_eco_warrior',
        TOP_PARTICIPANT: 'badge_top_participant'
    },
    ORGANIZER: {
        RELIABLE: 'badge_reliable_organizer',
        CROWD_PULLER: 'badge_crowd_puller'
    }
};

// Level thresholds
const getLevel = (xp: number) => {
    if (xp >= 1000) return 5;
    if (xp >= 601) return 4;
    if (xp >= 301) return 3;
    if (xp >= 101) return 2;
    return 1;
};

// Tier thresholds
const getTier = (op: number) => {
    if (op >= 1501) return 3;
    if (op >= 501) return 2;
    return 1;
};

export async function grantParticipantXP(userId: string, xpAmount: number, reason: string) {
    try {
        const userRef = db.collection('users').doc(userId);
        
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) return;
            
            const data = userDoc.data()!;
            const currentXp = data.xp || 0;
            const newXp = currentXp + xpAmount;
            const newLevel = getLevel(newXp);
            
            const badges: string[] = data.badges || [];
            
            // Check unlocks
            if (newXp > 0 && !badges.includes(BADGES.PARTICIPANT.FIRST_STEP)) {
                badges.push(BADGES.PARTICIPANT.FIRST_STEP);
            }
            if (newLevel >= 5 && !badges.includes(BADGES.PARTICIPANT.TOP_PARTICIPANT)) {
                badges.push(BADGES.PARTICIPANT.TOP_PARTICIPANT);
            }

            transaction.update(userRef, {
                xp: newXp,
                level: newLevel,
                badges,
                updatedAt: new Date().toISOString()
            });
            
            // Note: We could log the reason to a subcollection "xp_logs" for history.
        });
        console.log(`[Gamification] Granted ${xpAmount} XP to User ${userId}. Reason: ${reason}`);
    } catch (e) {
        console.error(`[Gamification] Error granting XP to ${userId}:`, e);
    }
}

export async function processEventCompletionGamification(eventId: string, organizerId: string) {
    try {
        // 1. Get Event and check if already processed
        const eventRef = db.collection('events').doc(eventId);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) return;
        const eventData = eventDoc.data()!;
        
        if (eventData.isGamificationProcessed) {
            console.log(`[Gamification] Event ${eventId} already processed.`);
            return;
        }

        // 2. Fetch all participations for this event
        const participationsSnap = await db.collection('participations').where('eventId', '==', eventId).get();
        const participantCount = participationsSnap.size;
        
        // Calculate Organizer Points (OP)
        const baseCompletionPoints = 100;
        const participantPoints = participantCount * 5;
        const totalOp = baseCompletionPoints + participantPoints;

        // 3. Start batch write
        const batch = db.batch();
        
        // 4. Grant OP to Organizer
        const orgRef = db.collection('users').doc(organizerId);
        const orgDoc = await orgRef.get();
        if (orgDoc.exists) {
            const orgData = orgDoc.data()!;
            const currentOp = orgData.organizerPoints || 0;
            const newOp = currentOp + totalOp;
            const newTier = getTier(newOp);
            
            const organizerBadges: string[] = orgData.organizerBadges || [];
            if (participantCount >= 50 && !organizerBadges.includes(BADGES.ORGANIZER.CROWD_PULLER)) {
                organizerBadges.push(BADGES.ORGANIZER.CROWD_PULLER);
            }

            batch.update(orgRef, {
                organizerPoints: newOp,
                organizerTier: newTier,
                organizerBadges,
                updatedAt: new Date().toISOString()
            });
        }

        // 5. Grant XP to Participants
        const xpPerParticipant = 50;
        for (const pDoc of participationsSnap.docs) {
            const pData = pDoc.data();
            const pUserId = pData.userId;
            
            batch.update(pDoc.ref, {
                xpEarned: (pData.xpEarned || 0) + xpPerParticipant
            });

            const userRef = db.collection('users').doc(pUserId);
            batch.update(userRef, {
                xp: admin.firestore.FieldValue.increment(xpPerParticipant),
                updatedAt: new Date().toISOString()
            });
        }
        
        // 6. Mark Event as Gamification Processed
        batch.update(eventRef, {
            isGamificationProcessed: true,
            updatedAt: new Date().toISOString()
        });

        // 7. Commit Batch
        await batch.commit();
        console.log(`[Gamification] Processed Completion for Event ${eventId}. Granted ${totalOp} OP. Processed ${participantCount} Participants.`);

        // Sweep for level updates
        for (const pDoc of participationsSnap.docs) {
            const userRef = db.collection('users').doc(pDoc.data().userId);
            db.runTransaction(async (t) => {
                const u = await t.get(userRef);
                if(u.exists) {
                    const uData = u.data()!;
                    const newLevel = getLevel(uData.xp || 0);
                    if(newLevel !== uData.level) {
                        t.update(userRef, { level: newLevel });
                    }
                }
            });
        }

    } catch (e) {
        console.error(`[Gamification] Error processing event completion for ${eventId}:`, e);
    }
}
