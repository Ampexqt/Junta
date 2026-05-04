import { Router, Request, Response } from 'express';
import { auth, db } from '../config/firebase-admin';
import { sendOTPEmail, sendResetEmail, sendLoginLinkEmail } from '../config/mailer';
import { authenticateUser, AuthRequest, isAdmin } from '../middleware/auth';
import { FaceVerificationService } from '../services/face-verification';
import { createNotification, notifyAllAdmins } from '../services/notifications';
import { logAdminAction } from '../services/adminLogs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { uploadBase64Image } from '../services/upload';
import { grantXP, grantOP, XP, OP } from '../services/gamification';

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

        await sendOTPEmail(email, otp);

        console.log(`[AUTH] OTP sent successfully to ${email}`);
        res.json({ message: 'OTP sent successfully!' });
    } catch (error: unknown) {
        console.error('Error in send-otp:');
        const err = error as { status?: number, text?: string };
        if (err.status && err.text) {
            console.error('EmailJS Error:', err.status, err.text);
        } else {
            console.error(error);
        }
        
        // Clean up stored OTP since we couldn't deliver it
        await db.collection('otps').doc(email).delete().catch((e) => { console.error('Failed to clean up OTP doc', e); });

        // If credentials are missing, give a clear hint
        if (!process.env.EMAILJS_SERVICE_ID) {
            return res.status(500).json({ error: 'Server configuration error: Please restart the backend server so it can read the new .env keys.' });
        }

        res.status(500).json({ error: 'Failed to send verification code to your email. Please try again later.' });
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
        suffix,
        idImage,
        idBackImage,
        selfieImage
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
        } else if (password) {
            // 1.1 Update existing user (e.g. Google login) with the provided password for fallback
            console.log(`Updating Auth record for ${email} with fallback password`);
            await auth.updateUser(userRecord.uid, {
                password: password,
            });
        }

        // 1.5 Hash password before storing in DB (for custom login logic)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!userRecord) {
            return res.status(500).json({ error: 'Failed to create or retrieve user record' });
        }

        // 1.7 Handle Identity Verification Images (Optional during registration)
        let idUrl = '';
        let idBackUrl = '';
        let selfieUrl = '';
        let kycStatus = 'none';
        let verificationScore = 0;
        let verificationThreshold = 80;
        let kycApiStatus = 'success';
        let kycErrorLogs: string | null = null;
        let ocrData = null;

        if (idImage && selfieImage) {
            try {
                // Upload images (Align with submit-verification behavior)
                idUrl = await uploadBase64Image(idImage, 'kyc/ids');
                if (idBackImage) idBackUrl = await uploadBase64Image(idBackImage, 'kyc/ids');
                selfieUrl = await uploadBase64Image(selfieImage, 'kyc/selfies');
                kycStatus = 'pending';

                // Automated Analysis (Face++ Pipeline)
                const hasFacePlusKeys = !!(process.env.FACEPLUSPLUS_API_KEY && process.env.FACEPLUSPLUS_API_SECRET);
                if (hasFacePlusKeys) {
                    try {
                        console.log(`[AUTH:KYC] Running automated analysis for ${email}...`);
                        const detection = await FaceVerificationService.detectFace(selfieUrl);
                        
                        if (detection.faceCount === 0) {
                            kycApiStatus = 'no_face_detected';
                            kycErrorLogs = 'No face detected in selfie.';
                        } else if (detection.faceCount > 1) {
                            kycApiStatus = 'multiple_faces';
                            kycErrorLogs = 'Multiple faces detected in selfie.';
                        } else if (detection.faceToken) {
                            const comparisonResult = await FaceVerificationService.compareFaces(detection.faceToken, idUrl);
                            verificationScore = comparisonResult.confidence;
                            verificationThreshold = comparisonResult.threshold;
                            kycApiStatus = 'success';
                        }
                    } catch (apiErr) {
                        console.error('[AUTH:KYC] Face++ API Error:', apiErr);
                        kycApiStatus = 'api_error';
                        kycErrorLogs = apiErr instanceof Error ? apiErr.message : 'Unknown API error';
                    }
                } else {
                    kycApiStatus = 'api_keys_missing';
                }
            } catch (uploadError) {
                console.error('[AUTH] KYC Image upload failed during registration:', uploadError);
                // Unlike before, we don't swallow this if images were provided but failed to upload
                throw new Error('Failed to upload identity documents. Please try again.');
            }
        }

        // 2. Store Profile details in Firestore
        const userProfile = {
            uid: userRecord.uid,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            suffix: suffix || '',
            displayName: `${firstName} ${lastName}${suffix ? ' ' + suffix : ''}`.trim(),
            phone: phone || '',
            role: role || 'participant',
            barangay: barangay || '',
            orgName: orgName || '',
            organizationName: orgName || '',
            kycVerified: false,
            kycStatus: kycStatus,
            validIdUrl: idUrl,
            validIdBackUrl: idBackUrl,
            selfieUrl: selfieUrl,
            verificationScore,
            verificationThreshold,
            kycApiStatus,
            kycErrorLogs,
            ocrData,
            kycSubmittedAt: kycStatus === 'pending' ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Gamification Initial State
            xp: 0,
            level: 1,
            badges: [],
            streak: 0,
            organizerPoints: 0,
            organizerTier: 1,
            organizerBadges: [],
        };

        await db.collection('users').doc(userRecord.uid).set(userProfile);

        // Notify admins if KYC was submitted
        if (kycStatus === 'pending') {
            notifyAllAdmins({
                type: 'kyc_submitted',
                title: '🪪 New Registration KYC',
                message: `User ${firstName} ${lastName} has registered and submitted identity verification for review.`,
            }).catch(err => console.error('Failed to send admin KYC notification:', err));
        }

        // Grant registration rewards based on role
        if (!isExistingAuthUser) {
            if (role === 'organizer') {
                await grantOP(userRecord.uid, OP.REGISTER, 'Account created');
            } else {
                await grantXP(userRecord.uid, XP.REGISTER, 'Account created');
            }
        }

        console.log(`Successfully registered/synced profile for: ${email} (${userRecord.uid})`);

        // Generate JWT for auto-login after registration
        const token = jwt.sign(
            { 
                uid: userRecord.uid, 
                email: email, 
                role: role || 'participant',
                name: `${firstName} ${lastName}${suffix ? ' ' + suffix : ''}`
            },
            process.env.JWT_SECRET || 'junta_fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            success: true, 
            message: isExistingAuthUser ? 'Profile created successfully' : 'User registered successfully',
            token,
            user: {
                uid: userRecord.uid,
                email,
                displayName: `${firstName} ${lastName}${suffix ? ' ' + suffix : ''}`,
                role: role || 'participant'
            }
        });
    } catch (error) {
        console.error('[AUTH:Register] Fatal Error:', error);
        
        const err = error as { code?: string; message: string; stack?: string };
        
        // Handle common Firebase Auth errors
        if (err.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'This email is already registered.' });
        }
        if (err.code === 'auth/invalid-phone-number') {
            return res.status(400).json({ error: 'The phone number format is invalid.' });
        }
        if (err.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'The password is too weak.' });
        }

        // Return the specific error message if it exists, otherwise a generic one
        res.status(500).json({ 
            error: err.message || 'Failed to complete registration',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

/**
 * 3.5. Google Sync — Exchange a Firebase ID token for a Junta JWT.
 * Called after Google login on the client to ensure all auth flows
 * have a server-issued JWT for protected API routes.
 */
router.post('/google-sync', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ error: 'Firebase ID token is required' });
    }
    try {
        // Verify the Firebase ID token using Admin SDK
        const decoded = await auth.verifyIdToken(idToken);
        const uid = decoded.uid;

        // Fetch the user's Junta profile from Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User profile not found. Please complete registration.' });
        }
        const userData = userDoc.data();
        if (!userData) {
            return res.status(404).json({ error: 'User profile data is empty.' });
        }

        // Issue a standard Junta JWT
        const token = jwt.sign(
            {
                uid,
                email: userData.email,
                role: userData.role,
                name: userData.displayName,
            },
            process.env.JWT_SECRET || 'junta_fallback_secret',
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: {
                uid,
                email: userData.email,
                displayName: userData.displayName,
                role: userData.role,
            }
        });
    } catch (error) {
        console.error('[auth/google-sync] Error:', error);
        return res.status(401).json({ error: 'Invalid or expired Firebase token' });
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
            { expiresIn: '7d' }
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

        await sendLoginLinkEmail(email, link);

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
router.put('/update-profile', authenticateUser, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const uid = authReq.user?.uid;
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

/**
 * 7. Forgot Password - Request OTP
 */
router.post('/forgot-password', async (req, res) => {
    let { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    email = email.toLowerCase().trim();

    try {
        // Check if user exists first
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ error: 'No account found with this email' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await db.collection('otps').doc(email).set({
            otp,
            expiresAt,
            email,
            type: 'password_reset',
            createdAt: new Date(),
        });

        try {
            await sendResetEmail(email, otp);
        } catch (e) {
            console.error('[AUTH] Password reset email exception:', e);
            await db.collection('otps').doc(email).delete();
            return res.status(500).json({
                error: 'Failed to send reset code. Please try again later.',
            });
        }

        console.log(`[AUTH] Password reset code sent to ${email}`);
        res.json({ message: 'Reset code sent to your email' });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        res.status(500).json({ error: 'Failed to initiate password reset' });
    }
});

/**
 * 8. Reset Password - Verify OTP & Update
 */
router.post('/reset-password', async (req, res) => {
    let { email } = req.body;
    const { otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    email = email.toLowerCase().trim();

    try {
        const otpDoc = await db.collection('otps').doc(email).get();
        if (!otpDoc.exists) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        const otpData = otpDoc.data();
        if (otpData?.otp !== otp) {
            return res.status(400).json({ error: 'Invalid reset code' });
        }

        const now = new Date();
        if (now > otpData?.expiresAt.toDate()) {
            return res.status(400).json({ error: 'Reset code has expired' });
        }

        // 1. Update Password in Firebase Auth
        const userRecord = await auth.getUserByEmail(email);
        await auth.updateUser(userRecord.uid, {
            password: newPassword,
        });

        // 2. Update Hashed Password in Firestore
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.collection('users').doc(userRecord.uid).update({
            password: hashedPassword,
            updatedAt: new Date().toISOString(),
        });

        // 3. Cleanup OTP
        await db.collection('otps').doc(email).delete();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in reset-password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

/**
 * 8.5 Verify Reset Code (Without Deleting)
 */
router.post('/verify-reset-code', async (req, res) => {
    let { email } = req.body;
    const { otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and reset code are required' });
    }

    email = email.toLowerCase().trim();

    try {
        const otpDoc = await db.collection('otps').doc(email).get();
        if (!otpDoc.exists) {
            console.log(`[AUTH] No OTP found for ${email}`);
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        const data = otpDoc.data();

        if (data?.otp !== otp) {
            return res.status(400).json({ error: 'Invalid reset code' });
        }

        const now = new Date();
        if (now > data?.expiresAt.toDate()) {
            return res.status(400).json({ error: 'Reset code has expired' });
        }

        res.json({ success: true, message: 'Code verified' });
    } catch (error) {
        console.error('Error in verify-reset-code:', error);
        res.status(500).json({ error: 'Failed to verify reset code' });
    }
});

/**
 * 9. Submit Identity Verification (KYC)
 * Multi-step pipeline: Upload → OCR ID Check → Face Detect → Face Compare.
 */
router.post('/submit-verification', authenticateUser, async (req: Request, res) => {
    const authReq = req as AuthRequest;
    const uid = authReq.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { validIdUrl, validIdBackUrl, selfieUrl } = req.body;

    if (!validIdUrl || !selfieUrl) {
        return res.status(400).json({ error: 'Front ID and Selfie are required' });
    }

    try {
        console.log(`[KYC] Processing verification for user ${uid}`);

        // 1. Handle Base64 Uploads if necessary
        let finalIdUrl = validIdUrl;
        let finalSelfieUrl = selfieUrl;

        if (validIdUrl.startsWith('data:image')) {
            finalIdUrl = await uploadBase64Image(validIdUrl, 'kyc/ids');
        }
        if (selfieUrl.startsWith('data:image')) {
            finalSelfieUrl = await uploadBase64Image(selfieUrl, 'kyc/selfies');
        }

        // 2. Multi-step Face++ pipeline
        let verificationScore = 0;
        let verificationThreshold = 80;
        const ocrData: { isIdCard: boolean; name: string | null; idNumber: string | null } | null = null;
        let kycApiStatus: 'success' | 'no_face_detected' | 'multiple_faces' | 'low_quality' | 'id_invalid' | 'api_error' | 'api_keys_missing' = 'success';
        let kycErrorLogs: string | null = null;

        const hasFacePlusKeys = !!(process.env.FACEPLUSPLUS_API_KEY && process.env.FACEPLUSPLUS_API_SECRET);

        if (!hasFacePlusKeys) {
            console.warn('[KYC] Face++ API keys missing. Skipping automated analysis.');
            kycApiStatus = 'api_keys_missing';
            kycErrorLogs = 'Face++ API keys not configured. Manual review required.';
        } else {
            try {
                // Step A: OCR - (Skipped - using manual review for ID type/name)
                // We bypass this to avoid Face++ API_NOT_FOUND errors on non-supported regions
                console.log('[KYC] Step A: Skipping OCR (Manual Review mode)');


                // Step B: Detect face in selfie (pre-flight check for comparison)
                console.log('[KYC] Step B: Detecting face in selfie...');
                const detection = await FaceVerificationService.detectFace(finalSelfieUrl);

                if (detection.faceCount === 0) {
                    console.warn('[KYC] No face detected in selfie.');
                    kycApiStatus = 'no_face_detected';
                    kycErrorLogs = (kycErrorLogs ? kycErrorLogs + ' | ' : '') + 'No face detected in the selfie image. Please retake your selfie.';
                } else if (detection.faceCount > 1) {
                    console.warn(`[KYC] Multiple faces detected in selfie: ${detection.faceCount}`);
                    kycApiStatus = 'multiple_faces';
                    kycErrorLogs = (kycErrorLogs ? kycErrorLogs + ' | ' : '') + `Multiple faces (${detection.faceCount}) detected. Only one face should be visible.`;
                } else if (detection.quality < 10) {
                    console.warn(`[KYC] Poor image quality: ${detection.quality}`);
                    kycApiStatus = 'low_quality';
                    kycErrorLogs = (kycErrorLogs ? kycErrorLogs + ' | ' : '') + `Selfie quality score is too low (${Math.round(detection.quality)}). Please ensure good lighting.`;
                } else if (detection.faceToken) {
                    // Step C: Compare selfie face_token against the ID image
                    console.log('[KYC] Step C: Comparing selfie to ID...');
                    const comparisonResult = await FaceVerificationService.compareFaces(detection.faceToken, finalIdUrl);
                    verificationScore = comparisonResult.confidence;
                    verificationThreshold = comparisonResult.threshold;
                    console.log(`[KYC] Comparison complete. Score: ${verificationScore.toFixed(1)}% (Threshold: ${verificationThreshold}%)`);
                    kycApiStatus = 'success';
                }
            } catch (apiError: unknown) {
                const err = apiError as { message: string };
                console.error('[KYC] Face++ API pipeline error:', err.message);
                kycApiStatus = 'api_error';
                kycErrorLogs = (kycErrorLogs ? kycErrorLogs + ' | ' : '') + `API Error: ${err.message}`;
            }
        }

        // 3. Save structured results to Firestore
        const userRef = db.collection('users').doc(uid);
        const updatePayload: Record<string, unknown> = {
            kycStatus: 'pending',
            validIdUrl: finalIdUrl,
            validIdBackUrl: validIdBackUrl || '',
            selfieUrl: finalSelfieUrl,
            verificationScore,
            verificationThreshold,
            kycApiStatus,
            kycErrorLogs,
            ocrData,

            kycSubmittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await userRef.update(updatePayload);

        // Notify all admins that a new KYC is pending review
        notifyAllAdmins({
            type: 'kyc_submitted',
            title: '🪪 New KYC Submission',
            message: `A user has submitted identity verification documents and is awaiting review.`,
            link: '/app/admin/verification',
            relatedId: uid,
        }).catch(console.error);

        console.log(`[KYC] Submission complete for ${uid}. Status: ${kycApiStatus}, Score: ${verificationScore.toFixed(1)}%`);

        res.json({ 
            success: true, 
            message: 'Verification submitted successfully. Automated analysis complete.',
            kycApiStatus,
            verificationScore,
            kycErrorLogs
        });
    } catch (error) {
        console.error('Error in submit-verification:', error);
        res.status(500).json({ error: 'Failed to process verification' });
    }
});

/**
 * 10. Get Pending Verifications (Admin Only)
 */
router.get('/admin/pending-verifications', authenticateUser, isAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('kycStatus', '==', 'pending')
            .get();

        const pending = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));

        res.json(pending);
    } catch (error) {
        const err = error as { message?: string; code?: string };
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({ 
            error: 'Failed to fetch pending verifications',
            details: err.message || 'Unknown error',
            code: err.code
        });
    }
});

/**
 * 11. Verify User (Admin Only)
 */
router.post('/admin/verify-user', authenticateUser, isAdmin, async (req, res) => {
    const { uid, status, notes } = req.body;

    if (!uid || !['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid UID or status' });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        
        await userRef.update({
            kycStatus: status,
            isVerified: status === 'verified',
            kycNotes: notes || '',
            kycProcessedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Notify the user about their KYC result
        createNotification({
            userId: uid,
            type: status === 'verified' ? 'kyc_verified' : 'kyc_rejected',
            title: status === 'verified' ? '✅ Identity Verified!' : '❌ Verification Rejected',
            message: status === 'verified'
                ? 'Your identity has been successfully verified. You can now access all platform features.'
                : `Your identity verification was rejected. ${notes ? 'Reason: ' + notes : 'Please resubmit with clearer documents.'}`,
            link: '/app/settings',
            relatedId: uid,
        }).catch(console.error);

        if (status === 'verified') {
            await grantXP(uid, XP.KYC_VERIFIED, 'KYC approved');
        }

        const authReq = req as AuthRequest;
        const userDoc = await userRef.get();
        logAdminAction({
            adminId: authReq.user?.uid || 'admin',
            adminName: authReq.user?.name || authReq.user?.email || 'Admin',
            actionType: 'kyc_verification',
            actionStatus: status === 'verified' ? 'approved' : 'rejected',
            targetId: uid,
            targetName: userDoc.data()?.displayName || 'Unknown User'
        }).catch(console.error);

        res.json({ success: true, message: `User verification ${status}` });
    } catch (error) {
        console.error('Error in verify-user:', error);
        res.status(500).json({ error: 'Failed to update verification status' });
    }
});

/**
 * 12. Approve/Reject Organizer Request (Admin Only)
 */
router.post('/admin/organizer-request', authenticateUser, isAdmin, async (req, res) => {
    const { uid, status, notes } = req.body;

    if (!uid || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid UID or status' });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        
        const updates: Record<string, unknown> = {
            organizerRequestStatus: status,
            organizerProcessedAt: new Date().toISOString(),
            organizerNotes: notes || '',
            updatedAt: new Date().toISOString(),
        };

        if (status === 'approved') {
            updates.role = 'organizer';
        }

        await userRef.update(updates);

        // Notify the user about their organizer request outcome
        createNotification({
            userId: uid,
            type: status === 'approved' ? 'organizer_approved' : 'organizer_rejected',
            title: status === 'approved' ? '🎉 Organizer Request Approved!' : '❌ Organizer Request Rejected',
            message: status === 'approved'
                ? 'Congratulations! Your organizer request has been approved. You can now create and manage events.'
                : `Your organizer request was not approved. ${notes ? 'Reason: ' + notes : 'Please contact support for more information.'}`,
            link: '/app/dashboard',
            relatedId: uid,
        }).catch(console.error);

        const authReq = req as AuthRequest;
        const userDoc = await userRef.get();
        logAdminAction({
            adminId: authReq.user?.uid || 'admin',
            adminName: authReq.user?.name || authReq.user?.email || 'Admin',
            actionType: 'organizer_request',
            actionStatus: status === 'approved' ? 'approved' : 'rejected',
            targetId: uid,
            targetName: userDoc.data()?.displayName || 'Unknown User'
        }).catch(console.error);

        res.json({ success: true, message: `Organizer request ${status}` });
    } catch (error) {
        console.error('Error processing organizer request:', error);
        res.status(500).json({ error: 'Failed to update organizer request status' });
    }
});

export const authRoutes = router;
