import { NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@/app/lib/cloudinary';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image, folder } = body;

        if (!image) {
            return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
        }

        console.log(`Starting image upload to folder: ${folder || 'general'}`);
        const result = await uploadImage(image, folder || 'general');

        return NextResponse.json({
            url: result.url,
            publicId: result.publicId
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        // Pass through the specific error message
        const errorMessage = error?.message || 'Failed to upload image';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const publicId = searchParams.get('publicId');

        if (!publicId) {
            return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
        }

        await deleteImage(publicId);

        return NextResponse.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
