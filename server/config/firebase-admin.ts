import admin from 'firebase-admin';
import dotenv from 'dotenv';
// Example path: var serviceAccount = require("../serviceAccountKey.json");

import path from 'path';

dotenv.config();

const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
        console.log('Firebase Admin initialized with service account file.');
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        // Fallback or exit
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
