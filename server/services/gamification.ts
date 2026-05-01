import { db } from '../config/firebase-admin';
import * as admin from 'firebase-admin';
import { createNotification } from './notifications';

/**
 * GAMIFICATION SYSTEM LOGIC
 * Encapsulates XP, OP, Tier, and Badge distributions.
 */

// Unified level thresholds (matches UI labels)
export const LEVELS = [
  { level: 1, xpRequired: 0,    label: 'Seedling' },
  { level: 2, xpRequired: 100,  label: 'Eco Starter' },
  { level: 3, xpRequired: 300,  label: 'Green Guardian' },
  { level: 4, xpRequired: 600,  label: 'Eco Warrior' },
  { level: 5, xpRequired: 1000, label: 'Planet Defender' },
];

export const getLevel = (xp: number) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpRequired) return LEVELS[i].level;
    }
    return 1;
};

// Unified tier thresholds
export const TIERS = [
  { tier: 1, opRequired: 0,    label: 'Bronze Partner' },
  { tier: 2, opRequired: 500,  label: 'Silver Guardian' },
  { tier: 3, opRequired: 1500, label: 'Gold Champion' },
  { tier: 4, opRequired: 3000, label: 'Platinum Leader' },
];

export const getTier = (op: number) => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (op >= TIERS[i].opRequired) return TIERS[i].tier;
    }
    return 1;
};

// XP constants
export const XP = {
  JOIN_EVENT: 10,
  ATTEND_EVENT: 25,         
  COMPLETE_EVENT: 50,
  RATE_EVENT: 15,
  RECEIVE_RATING_PER_STAR: 5, 
  KYC_VERIFIED: 20,         
  REGISTER: 5,              
  STREAK_3: 30,             
  STREAK_7: 75,             
};

// OP constants
export const OP = {
  EVENT_APPROVED: 25,       
  EVENT_COMPLETION_BASE: 100,
  PER_PARTICIPANT: 5,
  RATING_BONUS_GOOD: 50,    // avg >= 4.0
  RATING_BONUS_PERFECT: 100,// avg = 5.0
  RATED_ALL_PARTICIPANTS: 20, 
  FIRST_EVENT_BONUS: 50,    
};

export async function notifyXPGrant(userId: string, amount: number, reason: string, newTotal: number) {
    createNotification({
        userId,
        type: 'xp_earned',
        title: '🌟 XP Earned!',
        message: `You earned ${amount} XP for: ${reason}. You now have ${newTotal} XP.`,
        link: '/app/my-participation',
    }).catch(console.error);
}

export async function notifyOPGrant(userId: string, amount: number, reason: string, newTotal: number) {
    createNotification({
        userId,
        type: 'op_earned',
        title: '🛡️ OP Earned!',
        message: `You earned ${amount} OP for: ${reason}. You now have ${newTotal} OP.`,
        link: '/app/organizer/dashboard',
    }).catch(console.error);
}

export async function grantXP(userId: string, amount: number, reason: string, eventId?: string) {
    if (amount <= 0) return;
    try {
        const userRef = db.collection('users').doc(userId);
        
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) return;
            
            const data = userDoc.data();
            if (!data) return;
            const currentXp = data.xp || 0;
            const newXp = currentXp + amount;
            const newLevel = getLevel(newXp);
            
            transaction.update(userRef, {
                xp: newXp,
                level: newLevel,
                updatedAt: new Date().toISOString()
            });
            
            // Log to xp_logs
            const logRef = userRef.collection('xp_logs').doc();
            transaction.set(logRef, {
                type: 'xp',
                amount,
                reason,
                eventId: eventId || null,
                grantedAt: new Date().toISOString(),
                balanceAfter: newXp
            });
        });

        const userDoc = await userRef.get();
        if (userDoc.exists) {
           await evaluateBadges(userId);
           await notifyXPGrant(userId, amount, reason, userDoc.data()?.xp || 0);
        }
        console.log(`[Gamification] Granted ${amount} XP to User ${userId}. Reason: ${reason}`);
    } catch (e) {
        console.error(`[Gamification] Error granting XP to ${userId}:`, e);
    }
}

export async function grantOP(organizerId: string, amount: number, reason: string, eventId?: string) {
    if (amount <= 0) return;
    try {
        const userRef = db.collection('users').doc(organizerId);
        
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) return;
            
            const data = userDoc.data();
            if (!data) return;
            const currentOp = data.organizerPoints || 0;
            const newOp = currentOp + amount;
            const newTier = getTier(newOp);
            
            transaction.update(userRef, {
                organizerPoints: newOp,
                organizerTier: newTier,
                updatedAt: new Date().toISOString()
            });
            
            // Log to xp_logs
            const logRef = userRef.collection('xp_logs').doc();
            transaction.set(logRef, {
                type: 'op',
                amount,
                reason,
                eventId: eventId || null,
                grantedAt: new Date().toISOString(),
                balanceAfter: newOp
            });
        });

        const userDoc = await userRef.get();
        if (userDoc.exists) {
            await evaluateBadges(organizerId);
            await notifyOPGrant(organizerId, amount, reason, userDoc.data()?.organizerPoints || 0);
        }

        console.log(`[Gamification] Granted ${amount} OP to Organizer ${organizerId}. Reason: ${reason}`);
    } catch (e) {
        console.error(`[Gamification] Error granting OP to ${organizerId}:`, e);
    }
}

export async function updateParticipantStreak(userId: string) {
    try {
        const userRef = db.collection('users').doc(userId);
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) return;
            const data = userDoc.data();
            if (!data) return;
            
            const now = new Date();
            const lastCompletedStr = data.lastEventCompletedAt;
            let currentStreak = data.streak || 0;

            if (lastCompletedStr) {
                const lastCompleted = new Date(lastCompletedStr);
                const diffMs = now.getTime() - lastCompleted.getTime();
                const diffDays = diffMs / (1000 * 60 * 60 * 24);
                
                // If it's been more than 30 days since last event, reset streak
                if (diffDays > 30) {
                    currentStreak = 1; 
                } else {
                    currentStreak += 1;
                }
            } else {
                currentStreak = 1;
            }

            transaction.update(userRef, {
                streak: currentStreak,
                lastEventCompletedAt: now.toISOString(),
                eventsCompleted: admin.firestore.FieldValue.increment(1)
            });
        });

        const userDocAfter = await userRef.get();
        if(userDocAfter.exists) {
            const streak = userDocAfter.data()?.streak || 0;
            if (streak === 3) {
                await grantXP(userId, XP.STREAK_3, 'Streak: 3 events!', undefined);
            } else if (streak === 7) {
                await grantXP(userId, XP.STREAK_7, 'Streak: 7 events!', undefined);
            }
        }
    } catch (e) {
        console.error(`[Gamification] Error updating streak for ${userId}:`, e);
    }
}

export async function evaluateBadges(userId: string) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;
        const data = userDoc.data();
        if (!data) return;

        const badges = new Set<string>(data.badges || []);
        const organizerBadges = new Set<string>(data.organizerBadges || []);

        // Evaluate Participant Badges
        if (data.eventsJoined > 0) badges.add('first_step');
        if (data.level >= 2) badges.add('eco_starter');
        if (data.level >= 4) badges.add('eco_warrior');
        if (data.level >= 5) badges.add('planet_defender');
        if (data.streak >= 3) badges.add('streak_3');
        if (data.streak >= 7) badges.add('streak_7');
        if (data.eventsRated >= 5) badges.add('top_rater');
        if (data.eventsCompleted >= 10) badges.add('veteran');
        
        // Evaluate event ratings (requires participant to receive ratings)
        if (data.participationStats?.averageRating >= 4.8 && data.participationStats?.completedEvents >= 3) {
            badges.add('eco_champion');
        }

        // Evaluate Organizer Badges
        if (data.eventsCompleted_org > 0) organizerBadges.add('first_event');
        if (data.totalParticipantsHosted >= 50) organizerBadges.add('crowd_puller');
        if (data.organizerTier >= 2) organizerBadges.add('silver_guardian');
        if (data.organizerTier >= 3) organizerBadges.add('gold_champion');
        if (data.organizerTier >= 4) organizerBadges.add('platinum_leader');

        // Update if changes
        const currentBadges = data.badges || [];
        const currentOrgBadges = data.organizerBadges || [];

        const newBadges = Array.from(badges);
        const newOrgBadges = Array.from(organizerBadges);

        if (newBadges.length !== currentBadges.length || newOrgBadges.length !== currentOrgBadges.length) {
            await userRef.update({
                badges: newBadges,
                organizerBadges: newOrgBadges,
            });
        }
    } catch (e) {
         console.error(`[Gamification] Error evaluating badges for ${userId}:`, e);
    }
}

// Ensure backward compatibility of signature if needed
export async function grantParticipantXP(userId: string, xpAmount: number, reason: string) {
    return grantXP(userId, xpAmount, reason);
}

export async function processEventCompletionGamification(eventId: string, organizerId: string) {
    try {
        const eventRef = db.collection('events').doc(eventId);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) return;
        const eventData = eventDoc.data();
        if (!eventData) return;
        
        if (eventData.isGamificationProcessed) {
            console.log(`[Gamification] Event ${eventId} already processed.`);
            return;
        }

        const participationsSnap = await db.collection('participations').where('eventId', '==', eventId).get();
        const participantCount = participationsSnap.size;
        
        // OP Logic
        const totalOp = OP.EVENT_COMPLETION_BASE + (participantCount * OP.PER_PARTICIPANT);
        await grantOP(organizerId, totalOp, 'Event completed', eventId);

        // Rating bonus check - since rating is likely done after completion, we might need a separate trigger, 
        // but if there are already ratings, we grant it here.
        if (eventData.averageRating >= 4.0 && !eventData.organizerRatingBonusGranted) {
           const bonus = eventData.averageRating >= 5.0 ? OP.RATING_BONUS_PERFECT : OP.RATING_BONUS_GOOD;
           await grantOP(organizerId, bonus, 'High average rating bonus', eventId);
           await eventRef.update({ organizerRatingBonusGranted: true });
        }

        // Participant XP Logic
        for (const pDoc of participationsSnap.docs) {
            const pData = pDoc.data();
            const pUserId = pData.userId;
            
            await db.collection('participations').doc(pDoc.id).update({
                 xpEarned: (pData.xpEarned || 0) + XP.COMPLETE_EVENT
            });

            await grantXP(pUserId, XP.COMPLETE_EVENT, 'Completed event', eventId);
            await updateParticipantStreak(pUserId);
        }
        
        await eventRef.update({
            isGamificationProcessed: true,
            updatedAt: new Date().toISOString()
        });

        // Update org stats
        await db.collection('users').doc(organizerId).update({
             eventsCompleted_org: admin.firestore.FieldValue.increment(1),
             totalParticipantsHosted: admin.firestore.FieldValue.increment(participantCount)
        });
        await evaluateBadges(organizerId);

        console.log(`[Gamification] Processed Completion for Event ${eventId}.`);
    } catch (e) {
        console.error(`[Gamification] Error processing event completion for ${eventId}:`, e);
    }
}
