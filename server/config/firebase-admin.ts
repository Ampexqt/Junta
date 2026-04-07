import admin from 'firebase-admin';
import dotenv from 'dotenv';
// Example path: var serviceAccount = require("../serviceAccountKey.json");

dotenv.config();

// Usually, you should use FIREBASE_SERVICE_ACCOUNT environment variable 
// Or a serviceAccountKey.json file
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault() // Or pass your serviceAccount directly
        // Or: credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!))
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
