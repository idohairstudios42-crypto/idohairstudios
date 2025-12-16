import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import AddOnService from '@/app/models/AddOnService';

export async function GET() {
    try {
        const addOnServices = await withCache(
            'addon-services',
            async () => {
                await connectDB();
                return AddOnService.find({}).sort({ category: 1, name: 1 }).lean();
            },
            false
        );
        return NextResponse.json(addOnServices);
    } catch (error) {
        console.error('Error fetching add-on services:', error);
        return NextResponse.json({ error: 'Failed to fetch add-on services' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await connectDB();

        if (!body.name || body.price === undefined) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        const addOnService = await AddOnService.create(body);

        // Refresh cache
        const allServices = await AddOnService.find({}).sort({ category: 1, name: 1 }).lean();
        await withCache('addon-services', async () => allServices, true);

        return NextResponse.json(addOnService);
    } catch (error) {
        console.error('Error creating add-on service:', error);
        return NextResponse.json({ error: 'Failed to create add-on service' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        await connectDB();

        if (!body._id) {
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

        const addOnService = await AddOnService.findByIdAndUpdate(
            body._id,
            { $set: body },
            { new: true }
        );

        if (!addOnService) {
            return NextResponse.json({ error: 'Add-on service not found' }, { status: 404 });
        }

        // Refresh cache
        const allServices = await AddOnService.find({}).sort({ category: 1, name: 1 }).lean();
        await withCache('addon-services', async () => allServices, true);

        return NextResponse.json(addOnService);
    } catch (error) {
        console.error('Error updating add-on service:', error);
        return NextResponse.json({ error: 'Failed to update add-on service' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

        await connectDB();
        const addOnService = await AddOnService.findByIdAndDelete(id);

        if (!addOnService) {
            return NextResponse.json({ error: 'Add-on service not found' }, { status: 404 });
        }

        // Refresh cache
        const allServices = await AddOnService.find({}).sort({ category: 1, name: 1 }).lean();
        await withCache('addon-services', async () => allServices, true);

        return NextResponse.json({ message: 'Add-on service deleted successfully' });
    } catch (error) {
        console.error('Error deleting add-on service:', error);
        return NextResponse.json({ error: 'Failed to delete add-on service' }, { status: 500 });
    }
}
