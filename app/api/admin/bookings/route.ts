import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
    // In a real app, check auth token here
    const bookings = db.getBookings();
    return NextResponse.json({ bookings });
}
