import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'junta_fallback_secret';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        role?: string;
        name?: string;
    };
}

interface JWTPayload {
    uid: string;
    email?: string;
    role?: string;
    name?: string;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as JWTPayload;
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
        };
        next();
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
