/**
 * Backfill Script: Fix existing users where xp/op in the profile document
 * is 0 but xp_logs subcollection has entries.
 *
 * Run from the server directory:
 *   npx ts-node scripts/backfill-xp.ts
 */
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// --- Initialize Firebase Admin ---
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
}

const db = admin.firestore();

const LEVELS = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 100 },
    { level: 3, xpRequired: 300 },
    { level: 4, xpRequired: 600 },
    { level: 5, xpRequired: 1000 },
];

function getLevel(xp: number): number {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpRequired) return LEVELS[i].level;
    }
    return 1;
}

const TIERS = [
    { tier: 1, opRequired: 0 },
    { tier: 2, opRequired: 500 },
    { tier: 3, opRequired: 1500 },
    { tier: 4, opRequired: 3000 },
];

function getTier(op: number): number {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (op >= TIERS[i].opRequired) return TIERS[i].tier;
    }
    return 1;
}

async function backfillUser(userId: string, userData: admin.firestore.DocumentData) {
    const logsRef = db.collection('users').doc(userId).collection('xp_logs');
    const logsSnap = await logsRef.get();

    if (logsSnap.empty) return false;

    let totalXp = 0;
    let totalOp = 0;

    for (const logDoc of logsSnap.docs) {
        const log = logDoc.data();
        if (log.type === 'xp') totalXp += (log.amount || 0);
        if (log.type === 'op') totalOp += (log.amount || 0);
    }

    const currentXp = userData.xp || 0;
    const currentOp = userData.organizerPoints || 0;

    const needsXpFix = totalXp > 0 && currentXp !== totalXp;
    const needsOpFix = totalOp > 0 && currentOp !== totalOp;

    if (!needsXpFix && !needsOpFix) return false;

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (needsXpFix) {
        updates.xp = totalXp;
        updates.level = getLevel(totalXp);
        console.log(`  [XP] ${userId}: ${currentXp} → ${totalXp} (Level ${getLevel(totalXp)})`);
    }

    if (needsOpFix) {
        updates.organizerPoints = totalOp;
        updates.organizerTier = getTier(totalOp);
        console.log(`  [OP] ${userId}: ${currentOp} → ${totalOp} (Tier ${getTier(totalOp)})`);
    }

    await db.collection('users').doc(userId).update(updates);
    return true;
}

async function main() {
    console.log('🔄 Starting XP/OP Backfill Script...\n');

    const usersSnap = await db.collection('users').get();
    let fixed = 0;
    let skipped = 0;

    for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const wasFixed = await backfillUser(userDoc.id, userData);

        if (wasFixed) {
            fixed++;
        } else {
            skipped++;
        }
    }

    console.log(`\n✅ Backfill Complete!`);
    console.log(`   Fixed : ${fixed} users`);
    console.log(`   Skipped: ${skipped} users (already correct or no logs)`);
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
});
