
import { getAvailableSlots } from '@/lib/slots';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');

    if (!date) {
        return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    try {
        const slots = await getAvailableSlots(date, staffId || undefined);
        return NextResponse.json({ slots });
    } catch (err) {
        console.error('Error fetching slots:', err);
        return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }
}
