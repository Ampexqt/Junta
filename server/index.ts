import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { db } from './config/firebase-admin'; // Removed to fix ESLint unused var warning

import { authenticateUser, AuthRequest } from './middleware/auth';
import { authRoutes } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Public Routes
app.get('/', (req, res) => {
    res.send('Junta Backend API is running...');
});

// Config Routes
app.get('/api/config/mapbox', (req, res) => {
    res.json({ token: process.env.MAPBOX_ACCESS_TOKEN });
});

// Protected Route Example
app.get('/api/me', authenticateUser, (req: express.Request, res: express.Response) => {
    const authReq = req as AuthRequest;
    // This will only run if the token is valid
    res.json({
        message: 'This is a protected route',
        user: authReq.user
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

