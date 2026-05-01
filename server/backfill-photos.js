/* eslint-env node */
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.resolve('D:/3rd Year Project/Junta/server/config/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  console.log('Firebase already initialized or error:', e);
}

const db = admin.firestore();

async function backfillOrganizerPhotos() {
    try {
        const eventsSnap = await db.collection('events').get();
        let updated = 0;
        
        for (const doc of eventsSnap.docs) {
            const data = doc.data();
            if (data.organizerId && !data.organizerPhotoURL) {
                const userDoc = await db.collection('users').doc(data.organizerId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData?.photoURL) {
                        await doc.ref.update({
                            organizerPhotoURL: userData.photoURL
                        });
                        updated++;
                        console.log(`Updated event ${doc.id} with organizer photo`);
                    }
                }
            }
        }
        console.log(`Finished! Updated ${updated} events.`);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

backfillOrganizerPhotos();
