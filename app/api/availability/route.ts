import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const slots = db.getAvailableSlots(date);
    return NextResponse.json({ slots });
}
