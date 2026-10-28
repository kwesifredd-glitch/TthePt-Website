import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

// Public lookup used by the client checkout link. Returns only what that page needs.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const booking = await db.getBooking(id);
    if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({
        booking: {
            id: booking.id,
            name: booking.name,
            email: booking.email,
            date: booking.date,
            time: booking.time,
            package: booking.package,
            price: booking.price,
            currency: booking.currency,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
        }
    });
}
