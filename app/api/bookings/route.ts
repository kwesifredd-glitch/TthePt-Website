import { NextResponse } from 'next/server';
import { db, Booking } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, date, time, package: packageName, price, goals } = body;

        if (!name || !email || !date || !time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Double check availability
        const availableSlots = db.getAvailableSlots(date);
        if (!availableSlots.includes(time)) {
            return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
        }

        // Public bookings always start unpaid; only a verified payment or the admin can mark them paid
        const finalPrice = typeof price === 'number' ? price : 30;
        const bookingId = crypto.randomUUID ? crypto.randomUUID() : `bk_${Date.now()}`;

        const booking: Booking = {
            id: bookingId,
            name,
            email,
            phone: phone || '',
            date,
            time,
            package: packageName || "Standard Session",
            price: finalPrice,
            currency: 'GBP',
            status: 'confirmed',
            paymentStatus: 'unpaid',
            paymentMethod: 'pending_gateway',
            goals: goals || '',
            source: 'website_booking',
            createdAt: new Date().toISOString(),
        };

        db.addBooking(booking);

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error('Error in /api/bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
