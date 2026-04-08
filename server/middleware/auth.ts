import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        name?: string;
    };
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name as string,
        };
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
