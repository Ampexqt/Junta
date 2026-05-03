import emailjs from '@emailjs/nodejs';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_ID  = process.env.EMAILJS_SERVICE_ID  || '';
const PUBLIC_KEY  = process.env.EMAILJS_PUBLIC_KEY  || '';
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '';

/**
 * Send OTP / Verification Code email via EmailJS.
 * Requires a template on EmailJS dashboard with these variables:
 *   {{to_email}}, {{otp}}
 */
export async function sendOTPEmail(to: string, otp: string): Promise<void> {
    const TEMPLATE_ID = process.env.EMAILJS_OTP_TEMPLATE_ID || '';

    await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            to_email: to,
            otp,
        },
        {
            publicKey: PUBLIC_KEY,
            privateKey: PRIVATE_KEY,
        }
    );

    console.log(`[Mailer] OTP email sent to ${to}`);
}

/**
 * Send Password Reset Code email via EmailJS.
 * Requires a template on EmailJS dashboard with these variables:
 *   {{to_email}}, {{otp}}
 */
export async function sendResetEmail(to: string, otp: string): Promise<void> {
    const TEMPLATE_ID = process.env.EMAILJS_RESET_TEMPLATE_ID || '';

    await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            to_email: to,
            otp,
        },
        {
            publicKey: PUBLIC_KEY,
            privateKey: PRIVATE_KEY,
        }
    );

    console.log(`[Mailer] Password reset email sent to ${to}`);
}

/**
 * Send Login Link email via EmailJS.
 * Requires a template on EmailJS dashboard with these variables:
 *   {{to_email}}, {{link}}
 */
export async function sendLoginLinkEmail(to: string, link: string): Promise<void> {
    const TEMPLATE_ID = process.env.EMAILJS_OTP_TEMPLATE_ID || ''; // reuse OTP template or make a new one

    await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            to_email: to,
            link,
        },
        {
            publicKey: PUBLIC_KEY,
            privateKey: PRIVATE_KEY,
        }
    );

    console.log(`[Mailer] Login link email sent to ${to}`);
}
