import admin from 'firebase-admin';
import dotenv from 'dotenv';
// Example path: var serviceAccount = require("../serviceAccountKey.json");

import path from 'path';

import fs from 'fs';

dotenv.config();

const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

if (!admin.apps.length) {
    try {
        let initialized = false;
        if (fs.existsSync(serviceAccountPath)) {
            const stat = fs.statSync(serviceAccountPath);
            if (stat.size > 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccountPath)
                });
                console.log('Firebase Admin initialized with service account file.');
                initialized = true;
            } else {
                console.warn('serviceAccountKey.json is empty. Falling back to default credentials.');
            }
        } else {
            console.warn('serviceAccountKey.json not found. Falling back to default credentials.');
        }

        if (!initialized) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log('Firebase Admin initialized with application default credentials.');
        }
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
