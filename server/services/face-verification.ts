/* eslint-env node */
import axios from 'axios';

/**
 * Enhanced Service to handle face detection, comparison, and OCR using Face++ API
 */
export class FaceVerificationService {
    private static API_KEY = process.env.FACEPLUSPLUS_API_KEY;
    private static API_SECRET = process.env.FACEPLUSPLUS_API_SECRET;
    private static BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';

    private static ensureKeys() {
        if (!this.API_KEY || !this.API_SECRET) {
            throw new Error('FACEPLUSPLUS_MISSING_KEYS');
        }
    }

    /**
     * Parse Face++ error responses into readable messages
     */
    private static parseError(error: unknown): string {
        const err = error as { response?: { data?: { error_message?: string } }; message?: string };
        const errorMessage = err?.response?.data?.error_message || err?.message || 'Unknown API Error';
        if (errorMessage.includes('IMAGE_ERROR_UNSUPPORTED_FORMAT')) return 'Image format not supported. Please use JPG or PNG.';
        if (errorMessage.includes('INVALID_IMAGE_SIZE')) return 'Image file size is too large (max 2MB).';
        if (errorMessage.includes('CONCURRENCY_LIMIT_EXCEEDED')) return 'API rate limit exceeded. Please try again in a moment.';
        if (errorMessage.includes('AUTHORIZATION_ERROR')) return 'Face++ API authorization failed. Check API keys.';
        return errorMessage;
    }

    /**
     * Detect faces in an image and return face qualities/tokens
     * Used as a pre-flight check to ensure a valid selfie before comparison.
     * @param imageUrl Publicly accessible URL of the image
     */
    static async detectFace(imageUrl: string): Promise<{ faceCount: number; faceToken: string | null; quality: number }> {
        this.ensureKeys();

        try {
            const params = new URLSearchParams();
            params.append('api_key', this.API_KEY as string);
            params.append('api_secret', this.API_SECRET as string);
            params.append('image_url', imageUrl);
            params.append('return_attributes', 'facequality');

            const response = await axios.post(`${this.BASE_URL}/detect`, params);
            
            const faces = response.data?.faces || [];
            if (faces.length === 0) {
                return { faceCount: 0, faceToken: null, quality: 0 };
            }

            // We only want the first prominent face
            const mainFace = faces[0];
            const qualityScore = mainFace.attributes?.facequality?.value || 0;

            return {
                faceCount: faces.length,
                faceToken: mainFace.face_token,
                quality: qualityScore
            };
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error('[FaceVerification:Detect] Error:', err?.response?.data || err.message);
            throw new Error(`Face Detection failed: ${this.parseError(err)}`);
        }
    }

    /**
     * Compares two faces and returns a confidence score (0-100)
     * Optmized by using face_token1 (from detectFace) to save API processing time.
     */
    static async compareFaces(faceToken1: string, image2Url: string): Promise<{ confidence: number; threshold: number }> {
        this.ensureKeys();

        try {
            const params = new URLSearchParams();
            params.append('api_key', this.API_KEY as string);
            params.append('api_secret', this.API_SECRET as string);
            params.append('face_token1', faceToken1);
            params.append('image_url2', image2Url);

            const response = await axios.post(`${this.BASE_URL}/compare`, params);
            
            if (response.data && response.data.confidence !== undefined) {
                // threshold for 1e-5 error rate is usually around 80.7
                const threshold = response.data.thresholds?.['1e-5'] || 80;
                return { 
                    confidence: response.data.confidence, 
                    threshold 
                };
            }

            throw new Error('Invalid response from Face++');
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error('[FaceVerification:Compare] Error:', err?.response?.data || err.message);
            throw new Error(`Face Comparison failed: ${this.parseError(err)}`);
        }
    }

    /**
     * Extracts info from an ID (OCR)
     * Validates if the document is actually an ID card and extracts the name.
     */
    static async extractIdInfo(imageUrl: string): Promise<{ isIdCard: boolean; name: string | null; idNumber: string | null; rawInfo: unknown }> {
        this.ensureKeys();

        try {
            const params = new URLSearchParams();
            params.append('api_key', this.API_KEY as string);
            params.append('api_secret', this.API_SECRET as string);
            params.append('image_url', imageUrl);

            const response = await axios.post(`${this.BASE_URL}/ocr/idcard`, params);
            const data = response.data;
            
            // Note: Face++ OCR response format depends on region (e.g., Chinese ID vs others)
            // For a general implementation, we parse standard fields if available, otherwise just confirm it detected ID features
            const cards = data.cards || [];
            if (cards.length === 0) {
                return { isIdCard: false, name: null, idNumber: null, rawInfo: data };
            }

            const card = cards[0];
            return {
                isIdCard: true,
                name: card.name || card.formatted_name || null,
                idNumber: card.id_card_number || card.document_number || null,
                rawInfo: card
            };
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error('[FaceVerification:OCR] Error:', err?.response?.data || err.message);
            throw new Error(`ID Document OCR failed: ${this.parseError(err)}`);
        }
    }
}
