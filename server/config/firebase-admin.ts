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
        if (fs.existsSync(serviceAccountPath) && fs.statSync(serviceAccountPath).size > 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath)
            });
            console.log('Firebase Admin initialized with local service account file.');
            initialized = true;
        } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                })
            });
            console.log('Firebase Admin initialized with environment variables.');
            initialized = true;
        }

        if (!initialized) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log('Firebase Admin initialized with application default credentials.');
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
