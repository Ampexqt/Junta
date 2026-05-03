// Quick test — run with: npx ts-node test-email.ts
// Place this in the /server folder and run from there
// FIX: Go to https://dashboard.emailjs.com/admin/account/security
//      and enable "Allow EmailJS API for non-browser applications"
import emailjs from '@emailjs/nodejs';
import dotenv from 'dotenv';
dotenv.config();

const SERVICE_ID   = process.env.EMAILJS_SERVICE_ID   || '';
const PUBLIC_KEY   = process.env.EMAILJS_PUBLIC_KEY   || '';
const PRIVATE_KEY  = process.env.EMAILJS_PRIVATE_KEY  || '';
const TEMPLATE_ID  = process.env.EMAILJS_OTP_TEMPLATE_ID || '';

// ⬇️ Change this to an email you can check
const TEST_EMAIL = 'PUT_YOUR_EMAIL_HERE@gmail.com';
const TEST_OTP   = '123456';

console.log('--- EmailJS Test ---');
console.log('Service ID    :', SERVICE_ID);
console.log('Template ID   :', TEMPLATE_ID);
console.log('Public Key    :', PUBLIC_KEY ? PUBLIC_KEY.slice(0, 6) + '...' : 'MISSING');
console.log('Private Key   :', PRIVATE_KEY ? PRIVATE_KEY.slice(0, 6) + '...' : 'MISSING');
console.log('To            :', TEST_EMAIL);
console.log('--------------------');

emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { to_email: TEST_EMAIL, otp: TEST_OTP },
    { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY }
)
.then((res) => {
    console.log('✅ SUCCESS! Email sent. Status:', res.status, res.text);
})
.catch((err) => {
    console.error('❌ FAILED! Error details:');
    console.error('  Status :', err.status);
    console.error('  Text   :', err.text);
    console.error('  Message:', err.message);
    console.error('Full error:', JSON.stringify(err, null, 2));
});
