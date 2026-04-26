import { db } from '../config/firebase-admin';

export interface CreateAdminLogPayload {
    adminId: string;
    adminName: string;
    actionType: 'event_approval' | 'kyc_verification' | 'organizer_request';
    actionStatus: 'approved' | 'rejected';
    targetId: string;
    targetName: string;
    reason?: string;
}

export async function logAdminAction(payload: CreateAdminLogPayload): Promise<void> {
    try {
        const logRef = db.collection('admin_logs').doc();
        await logRef.set({
            ...payload,
            createdAt: new Date().toISOString(),
            timestamp: Date.now()
        });
        console.log(`Admin action logged: ${payload.actionType} - ${payload.actionStatus} by ${payload.adminName}`);
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}
