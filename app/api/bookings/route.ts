import { NextResponse } from 'next/server';
import { db, Booking, PaymentPlatform } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, date, time, package: packageName, price, paymentStatus, paymentMethod, goals } = body;

        if (!name || !email || !date || !time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Double check availability
        const availableSlots = db.getAvailableSlots(date);
        if (!availableSlots.includes(time)) {
            return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
        }

        const isPaid = paymentStatus === 'paid';
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
            paymentStatus: isPaid ? 'paid' : 'unpaid',
            paymentMethod: paymentMethod || (isPaid ? 'card' : 'pending_gateway'),
            paymentRef: isPaid ? `WEB_${Date.now().toString().slice(-6)}` : undefined,
            paidAt: isPaid ? new Date().toISOString() : undefined,
            goals: goals || '',
            source: 'website_booking',
            createdAt: new Date().toISOString(),
        };

        db.addBooking(booking);

        // If marked paid on submission, log in payment ledger
        if (isPaid) {
            db.addPayment({
                id: `tx_${Date.now()}`,
                bookingId: booking.id,
                clientName: booking.name,
                clientEmail: booking.email,
                amount: finalPrice,
                currency: 'GBP',
                platform: (paymentMethod as PaymentPlatform) || 'stripe',
                status: 'succeeded',
                referenceId: booking.paymentRef || `TX-${Date.now().toString().slice(-6)}`,
                description: `${booking.package} - Website Checkout`,
                createdAt: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error('Error in /api/bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
