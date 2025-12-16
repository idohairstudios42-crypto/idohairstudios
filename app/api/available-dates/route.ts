import { NextResponse } from 'next/server';
import connectDB, { withCache, invalidateCache } from '@/app/lib/mongodb';
import AvailableDate from '@/app/models/AvailableDate';

// GET - Fast endpoint that returns cached dates immediately
export async function GET(request: Request) {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for month query parameter for pagination
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // Format: YYYY-MM

    let dateFilter: { date: { $gte: Date; $lt?: Date } } = { date: { $gte: today } };

    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number);
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      // Don't show dates before today even if in the requested month
      const effectiveStart = startOfMonth < today ? today : startOfMonth;

      dateFilter = {
        date: {
          $gte: effectiveStart,
          $lt: endOfMonth
        }
      };
    }

    // Use cache with short TTL for frequently accessed data
    const cacheKey = monthParam ? `available-dates-${monthParam}` : 'available-dates-all';

    const dates = await withCache(
      cacheKey,
      async () => {
        return AvailableDate.find(dateFilter)
          .sort({ date: 1 })
          .select('date maxAppointments currentAppointments')
          .lean();
      },
      false // Don't force refresh - use cache
    );

    // Filter out dates that have reached capacity
    const availableDates = dates.filter(
      (d: { maxAppointments: number; currentAppointments: number }) =>
        d.currentAppointments < d.maxAppointments
    );

    return NextResponse.json(availableDates);
  } catch (error) {
    console.error('Error fetching available dates:', error);
    return NextResponse.json({ error: 'Failed to fetch available dates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Set default maxAppointments to 1 if not provided or invalid
    const maxAppointments = (!body.maxAppointments || body.maxAppointments < 1) ? 1 : body.maxAppointments;

    const date = await AvailableDate.create({
      date: body.date,
      maxAppointments,
      currentAppointments: 0
    });

    // Invalidate all date caches
    invalidateCache('available-dates');

    return NextResponse.json(date);
  } catch (error) {
    console.error('Error creating available date:', error);
    return NextResponse.json({ error: 'Failed to create available date' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await connectDB();
    const date = await AvailableDate.findByIdAndDelete(id);

    if (!date) {
      return NextResponse.json({ error: 'Date not found' }, { status: 404 });
    }

    // Invalidate all date caches
    invalidateCache('available-dates');

    return NextResponse.json({ message: 'Date removed successfully' });
  } catch (error) {
    console.error('Error deleting available date:', error);
    return NextResponse.json({ error: 'Failed to delete available date' }, { status: 500 });
  }
}