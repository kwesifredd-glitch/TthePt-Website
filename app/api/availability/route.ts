import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { isValidDate } from '@/lib/validation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!isValidDate(date)) {
        return NextResponse.json({ error: 'A date in YYYY-MM-DD format is required' }, { status: 400 });
    }

    const slots = await db.getAvailableSlots(date);
    return NextResponse.json({ slots });
}
