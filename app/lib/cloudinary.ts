import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
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
 * Upload an image to Cloudinary
 * @param file - Base64 encoded image string or URL
 * @param folder - Folder to upload to (e.g., 'hairstyles', 'categories')
 * @returns Upload result with URL and public ID
 */
export async function uploadImage(file: string, folder: string = 'hairengineer'): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `hairengineer/${folder}`,
            resource_type: 'image',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image');
    }
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
