import { db } from '../config/firebase-admin';

async function cleanup() {
    console.log('Cleaning up orphaned participations...');
    const partsSnap = await db.collection('participations').get();
    let deletedCount = 0;
    
    for (const doc of partsSnap.docs) {
        const data = doc.data();
        const eventId = data.eventId;
        
        if (eventId) {
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                console.log(`Deleting orphaned participation ${doc.id} (Event ${eventId} not found)`);
                await doc.ref.delete();
                deletedCount++;
            }
        }
    }
    
    console.log(`Cleanup complete. Deleted ${deletedCount} orphaned participations.`);
    process.exit(0);
}

cleanup().catch(console.error);
