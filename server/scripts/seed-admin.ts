import { auth, db } from '../config/firebase-admin';
import * as bcrypt from 'bcryptjs';

async function seedAdmin() {
    const adminEmail = 'admin@junta.com';
    const adminPassword = 'JuntaAdmin2024!';

    console.log(`🚀 Starting admin seeding process for: ${adminEmail}...`);

    try {
        let userRecord: import('firebase-admin').auth.UserRecord;
        try {
            // Check if user already exists in Auth
            userRecord = await auth.getUserByEmail(adminEmail);
            console.log('ℹ️ Admin user already exists in Firebase Authentication.');
        } catch (error) {
            const err = error as { code: string };
            if (err.code === 'auth/user-not-found') {
                // Create the user in Auth
                userRecord = await auth.createUser({
                    email: adminEmail,
                    password: adminPassword,
                    displayName: 'Junta Admin',
                });
                console.log('✅ Admin user created in Firebase Authentication.');
            } else {
                throw error;
            }
        }

        if (!userRecord) {
            throw new Error('Failed to obtain user record.');
        }

        // Hash password for our custom login logic
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Store/Update user details in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: adminEmail,
            password: hashedPassword, // Store hashed password for login
            firstName: 'Junta',
            lastName: 'Admin',
            suffix: '',
            displayName: 'Junta Admin',
            role: 'admin',
            kycVerified: true, // Admin is auto-verified
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }, { merge: true });


        console.log('✅ Admin profile saved to Firestore users collection.');
        console.log('\n--- SEEDING COMPLETE ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('------------------------\n');
        console.log('⚠️  IMPORTANT: Please change this password after your first login.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedAdmin();
