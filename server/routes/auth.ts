import { Router } from 'express';
import { auth, db } from '../config/firebase-admin';
import { resend } from '../config/resend';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const router = Router();


// Helper to generate 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

/**
 * 1. Send OTP (For Registration/Login)
 * Generates a 6-digit code, stores it in Firestore, and emails it to the user.
 */
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP in Firestore (doc ID is the email for easy lookup)
        await db.collection('otps').doc(email).set({
            otp,
            expiresAt,
            email,
            createdAt: new Date(),
        });

        // Always log OTP to terminal — useful during development when Resend restricts recipients
        console.log('------------------------------------------');
        console.log(`[AUTH] Verification Code for ${email}: ${otp}`);
        console.log('------------------------------------------');

        // Attempt to send email via Resend (plain HTML — no template required)
        let sendError: any = null;
        try {
            const { error } = await resend.emails.send({
                from: 'Junta <onboarding@resend.dev>',
                to: email,
                subject: `Your Junta Verification Code: ${otp}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
                        <h2 style="color: #064e3b; margin-bottom: 8px;">Junta Verification Code</h2>
                        <p style="color: #374151; margin-bottom: 24px;">Use the code below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
                        <div style="background: #fff; border: 2px solid #d1fae5; border-radius: 12px; padding: 24px; text-align: center;">
                            <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #064e3b;">${otp}</span>
                        </div>
                        <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
                    </div>
                `,
            });
            sendError = error;
        } catch (e) {
            sendError = e;
        }

        if (sendError) {
            // Resend free tier only allows sending to the account owner's email.
            // If blocked, we still succeed — the OTP is in Firestore and the terminal.
            const errorMessage = sendError instanceof Error ? sendError.message : String(sendError);
            console.warn(`[AUTH] Resend failed for ${email}:`, errorMessage);
            console.warn('[AUTH] OTP is still valid — user can enter the code shown in the server terminal.');
            // Return success so the frontend can proceed to the OTP step
            return res.json({
                message: 'OTP generated. Check your email or the server terminal for the code.',
                devMode: true,
            });
        }

        res.json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});


/**
 * 2. Verify OTP
 * Checks if the provided OTP matches the one in Firestore and hasn't expired.
 */
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const otpDoc = await db.collection('otps').doc(email).get();

        if (!otpDoc.exists) {
            return res.status(400).json({ error: 'No OTP found for this email' });
        }

        const data = otpDoc.data();
        const now = new Date();

        // Check if OTP matches
        if (data?.otp !== otp) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Check expiration
        const expiry = data?.expiresAt.toDate();
        if (now > expiry) {
            await db.collection('otps').doc(email).delete(); // Cleanup expired
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        // OTP is valid! Cleanup and return success
        await db.collection('otps').doc(email).delete();

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

/**
 * 3. Final Registration (Persistence)
 * Creates the user in Firebase Auth and stores profile data in Firestore.
 */
router.post('/register', async (req, res) => {
    const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone, 
        role, 
        barangay, 
        orgName,
        suffix
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Missing required registration fields' });
    }

    try {
        let userRecord;
        let isExistingAuthUser = false;

        // Check if user already exists in Firebase Auth
        try {
            userRecord = await auth.getUserByEmail(email);
            isExistingAuthUser = true;
            console.log(`User ${email} already exists in Auth. Checking for profile...`);
        } catch (e) {
            // User does not exist, safe to create
            console.log(`Creating new Auth record for ${email}`);
        }

        if (!isExistingAuthUser) {
            // 1. Create User in Firebase Authentication (for manual registrations)
            userRecord = await auth.createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
                phoneNumber: (phone && phone.startsWith('+')) ? phone.replace(/\s/g, '') : undefined,
            });
        }

        // 1.5 Hash password before storing in DB (for custom login logic)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Store Profile details in Firestore
        // Note: For Google users, userRecord.uid will be their existing Google UID
        await db.collection('users').doc(userRecord!.uid).set({
            uid: userRecord!.uid,
            email,
            password: hashedPassword, // Storing hashed password for custom login
            firstName,
            lastName,
            suffix: suffix || '',
            displayName: `${firstName} ${lastName}${suffix ? ' ' + suffix : ''}`,
            phone,
            role: role || 'participant',
            barangay: barangay || '',
            orgName: orgName || '',
            organizationName: orgName || '',
            kycVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });


        console.log(`Successfully registered/synced profile for: ${email} (${userRecord!.uid})`);

        // Generate JWT for auto-login after registration
        const token = jwt.sign(
            { 
                uid: userRecord!.uid, 
                email: email, 
                role: role || 'participant',
                name: `${firstName} ${lastName}${suffix ? ' ' + suffix : ''}`
            },
            process.env.JWT_SECRET || 'junta_fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            success: true, 
            message: isExistingAuthUser ? 'Profile created successfully' : 'User registered successfully',
            token,
            user: {
                uid: userRecord!.uid,
                email,
                displayName: `${firstName} ${lastName}${suffix ? ' ' + suffix : ''}`,
                role: role || 'participant'
            }
        });
    } catch (error) {
        console.error('Error in register:', error);
        
        const err = error as { code?: string; message: string };
        // Handle common Firebase Auth errors
        if (err.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'This email is already registered.' });
        }
        if (err.code === 'auth/invalid-phone-number') {
            return res.status(400).json({ error: 'The phone number format is invalid.' });
        }

        res.status(500).json({ error: err.message || 'Failed to complete registration' });
    }
});

/**
 * 4. Login with Email/Password
 * Verifies credentials against Firestore and returns a JWT.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Query user by email from Firestore
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (userSnapshot.empty) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Check if user has a password stored in Firestore (custom logic requirement)
        if (!userData.password) {
            console.warn(`Login failed: User ${email} has no stored password in Firestore. This might be an old account.`);
            return res.status(401).json({ error: 'Account needs update. Please register again.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }


        // Generate JWT
        const token = jwt.sign(
            { 
                uid: userData.uid, 
                email: userData.email, 
                role: userData.role,
                name: userData.displayName
            },
            process.env.JWT_SECRET || 'junta_fallback_secret',
            { expiresIn: '24h' }
        );

        console.log(`User logged in: ${email}`);

        res.json({
            success: true,
            token,
            user: {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

/**
 * 4.5 Get Current User Profile (Protected)
 * Fetches the full profile including organization name from Firestore.
 */
router.get('/me', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid) return res.status(401).json({ error: 'Unauthorized' });

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        res.json(userData);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * 5. Send Login Link (Passwordless - Backup Method)

 */
router.post('/send-login-link', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const actionCodeSettings = {
            url: process.env.FRONTEND_URL || 'http://localhost:5173/login/verify',
            handleCodeInApp: true,
        };

        const link = await auth.generateSignInWithEmailLink(email, actionCodeSettings);

        await resend.emails.send({
            from: 'Junta <noreply@resend.dev>',
            to: email,
            subject: 'Login to Junta',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to Junta</h2>
                    <p>Click the button below to sign in to your account.</p>
                    <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #064e3b; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Sign In to Junta
                    </a>
                </div>
            `,
        });

        res.json({ message: 'Login link sent successfully!' });
    } catch (error) {
        console.error('Error in send-login-link:', error);
        res.status(500).json({ error: 'Failed to send login link' });
    }
});

/**
 * 4. Sync Profile / Registration (Protected)
 * Call this after the user successfully logs in on the frontend.
 */
import { Request, Response } from 'express';

router.post('/sync-profile', authenticateUser, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { uid, email, name } = authReq.user;
    const { displayName, photoURL } = req.body;

    try {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        const userData = {
            email,
            displayName: displayName || name || '',
            photoURL: photoURL || '',
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (!doc.exists) {
            await userRef.set({
                ...userData,
                createdAt: new Date().toISOString(),
                role: 'user',
            });
            console.log(`New user registered: ${email}`);
        } else {
            await userRef.update(userData);
        }

        res.json({ message: 'Profile synced successfully', user: userData });
    } catch (error) {
        console.error('Error syncing profile:', error);
        res.status(500).json({ error: 'Failed to sync user profile' });
    }
});

/**
 * 6. Update Profile / KYC (Protected)
 * Updates arbitrary profile fields like phone, firstName, KYC URLs, etc.
 */
router.put('/update-profile', authenticateUser, async (req: AuthRequest, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const updateData = req.body;
        const userRef = db.collection('users').doc(uid);

        // Rate limit organization name changes (every 24 hours)
        if (updateData.organizationName) {
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            
            // If the name is actually being changed
            if (userData?.organizationName !== updateData.organizationName) {
                const lastUpdate = userData?.lastOrgNameUpdate;
                if (lastUpdate) {
                    const lastDate = new Date(lastUpdate);
                    const diffMs = Date.now() - lastDate.getTime();
                    const hoursPassed = diffMs / (1000 * 60 * 60);
                    
                    if (hoursPassed < 24) {
                        const remaining = Math.ceil(24 - hoursPassed);
                        return res.status(429).json({ 
                            error: `Organization name can only be changed every 24 hours. Please wait ${remaining} hour(s).` 
                        });
                    }
                }
                // Record the timestamp of this change
                updateData.lastOrgNameUpdate = new Date().toISOString();
            }
        }

        // Don't allow updating critical fields via this generic endpoint
        delete updateData.uid;
        delete updateData.email;
        delete updateData.password;
        delete updateData.role;

        updateData.updatedAt = new Date().toISOString();

        await userRef.update(updateData);

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export const authRoutes = router;
