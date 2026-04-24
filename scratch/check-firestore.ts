import { db } from '../server/config/firebase-admin';

async function checkUsers() {
    try {
        const snapshot = await db.collection('users').get();
        console.log(`Total users found: ${snapshot.size}`);
        snapshot.docs.forEach(doc => {
            console.log(`ID: ${doc.id}, Name: ${doc.data().displayName}, KYC: ${doc.data().kycStatus}`);
        });
        
        const pending = await db.collection('users').where('kycStatus', '==', 'pending').get();
        console.log(`Pending users: ${pending.size}`);
    } catch (error) {
        console.error('Firestore check failed:', error);
    }
}

checkUsers();
