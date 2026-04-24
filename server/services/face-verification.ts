import axios from 'axios';

/**
 * Service to handle face comparison and OCR using Face++ (or similar)
 */
export class FaceVerificationService {
    private static API_KEY = process.env.FACEPLUSPLUS_API_KEY;
    private static API_SECRET = process.env.FACEPLUSPLUS_API_SECRET;
    private static BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';

    /**
     * Compares two faces and returns a confidence score (0-100)
     * @param image1Url URL of the first image (e.g., ID Front)
     * @param image2Url URL of the second image (e.g., Selfie)
     */
    static async compareFaces(image1Url: string, image2Url: string): Promise<{ confidence: number; threshold: number }> {
        if (!this.API_KEY || !this.API_SECRET) {
            console.warn('[FaceVerification] API keys missing. Returning mock result.');
            return { confidence: 0, threshold: 80 }; // Mock failure
        }

        try {
            const params = new URLSearchParams();
            params.append('api_key', this.API_KEY);
            params.append('api_secret', this.API_SECRET);
            params.append('image_url1', image1Url);
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
        } catch (error) {
            console.error('[FaceVerification] Error during face comparison:', error);
            throw error;
        }
    }

    /**
     * Extracts info from an ID (OCR)
     * @param imageUrl URL of the ID card image
     */
    static async extractIdInfo(imageUrl: string) {
        if (!this.API_KEY || !this.API_SECRET) {
             return null;
        }

        try {
            const params = new URLSearchParams();
            params.append('api_key', this.API_KEY);
            params.append('api_secret', this.API_SECRET);
            params.append('image_url', imageUrl);

            const response = await axios.post(`${this.BASE_URL}/ocr/idcard`, params);
            return response.data;
        } catch (error) {
            console.error('[FaceVerification] Error during OCR:', error);
            return null;
        }
    }
}
