import { cloudinary } from '../config/cloudinary';

/**
 * Uploads a base64 string to Cloudinary and returns the secure URL.
 * @param base64 String containing data:image/...;base64,...
 * @param folder The folder to store the file in (e.g. 'kyc')
 * @returns Public URL of the uploaded file
 */
export async function uploadBase64Image(base64: string, folder: string): Promise<string> {
    if (!base64 || !base64.startsWith('data:image')) {
        throw new Error('Invalid base64 image data');
    }

    try {
        console.log(`[Upload] Uploading base64 image to Cloudinary folder: ${folder}...`);
        
        // Cloudinary handles base64 strings directly
        const result = await cloudinary.uploader.upload(base64, {
            folder: `junta/${folder}`,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });

        console.log(`[Upload] Upload successful: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error('[Upload] Cloudinary upload failed:', error);
        throw new Error('Failed to upload image to cloud storage');
    }
}
