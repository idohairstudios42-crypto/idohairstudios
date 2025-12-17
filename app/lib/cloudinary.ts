import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with extended timeout for slow connections
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    url: string;
    publicId: string;
}

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Upload an image to Cloudinary with retry logic
 * @param file - Base64 encoded image string or URL
 * @param folder - Folder to upload to (e.g., 'hairstyles', 'categories')
 * @param maxRetries - Maximum number of retry attempts
 * @returns Upload result with URL and public ID
 */
export async function uploadImage(
    file: string,
    folder: string = 'hairengineer',
    maxRetries: number = 5
): Promise<UploadResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Upload attempt ${attempt}/${maxRetries} to folder: ${folder}`);

            // Use chunked upload for large files (more reliable on slow connections)
            const result = await cloudinary.uploader.upload(file, {
                folder: `hairengineer/${folder}`,
                resource_type: 'image',
                chunk_size: 6000000, // 6MB chunks for more reliable uploads
                timeout: 180000, // 3 minute timeout per chunk
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            });

            console.log(`Upload successful on attempt ${attempt}`);
            return {
                url: result.secure_url,
                publicId: result.public_id
            };
        } catch (error: any) {
            lastError = error;
            console.error(`Upload attempt ${attempt} failed:`, error?.error?.message || error?.message || error);

            // If we haven't exhausted retries, wait before trying again
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
                console.log(`Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    // All retries failed
    console.error('All upload attempts failed:', lastError);

    if (lastError?.error?.name === 'TimeoutError' || lastError?.message?.includes('timeout')) {
        throw new Error('Upload timed out after multiple attempts. Please try with a smaller image or better connection.');
    }
    throw new Error('Failed to upload image after multiple attempts. Please try again.');
}

/**
 * Upload image using unsigned upload (direct from client) - more reliable for mobile
 * This creates a signature for client-side upload
 */
export function generateUploadSignature(folder: string = 'hairengineer') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp: timestamp,
            folder: `hairengineer/${folder}`,
            transformation: 'w_800,h_800,c_limit,q_auto:good,f_auto'
        },
        process.env.CLOUDINARY_API_SECRET || ''
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: `hairengineer/${folder}`
    };
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image');
    }
}

export default cloudinary;
