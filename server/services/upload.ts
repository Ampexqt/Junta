import { storage } from '../config/firebase-admin';
import * as crypto from 'crypto';

/**
 * Uploads a base64 string to Firebase Storage and returns the public URL.
 * @param base64 String containing data:image/...;base64,...
 * @param folder The folder to store the file in (e.g. 'kyc')
 * @returns Public URL of the uploaded file
 */
export async function uploadBase64Image(base64: string, folder: string): Promise<string> {
    if (!base64 || !base64.startsWith('data:image')) {
        throw new Error('Invalid base64 image data');
    }

    try {
        const bucket = storage.bucket();
        const matches = base64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 format');
        }

        const extension = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${folder}/${crypto.randomUUID()}.${extension}`;
        const file = bucket.file(filename);

        await file.save(buffer, {
            metadata: {
                contentType: `image/${extension}`,
            },
            public: true
        });

        // Construct public URL
        // Note: Depending on bucket configuration, you might need getSignedUrl or a public template
        return `https://storage.googleapis.com/${bucket.name}/${filename}`;
    } catch (error) {
        console.error('Upload failed:', error);
        throw new Error('Failed to upload image');
    }
}
