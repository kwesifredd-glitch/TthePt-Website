import { NextResponse } from 'next/server';
import { db, Booking } from '@/lib/store';
import { findPackage } from '@/lib/packages';
import { cleanEmail, cleanText, isBookableDate, isValidTime, optionalText } from '@/lib/validation';
import { createBookingCheckout, getStripe, holdExpiry } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const name = cleanText(body.name, 100);
        const email = cleanEmail(body.email);
        const pkg = findPackage(body.package);
        const { date, time } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Please enter your name and a valid email address.' }, { status: 400 });
        }
        if (!pkg) {
            return NextResponse.json({ error: 'Please choose a package.' }, { status: 400 });
        }
        if (!isBookableDate(date) || !isValidTime(time)) {
            return NextResponse.json({ error: 'Please choose a valid date and time.' }, { status: 400 });
        }

        // Double check availability
        const availableSlots = await db.getAvailableSlots(date);
        if (!availableSlots.includes(time)) {
            return NextResponse.json({ error: 'Sorry, that time was just taken. Please pick another.' }, { status: 409 });
        }

        // Public bookings always start unpaid, at the package's listed price.
        // With Stripe set up, the slot is only held until the client pays on the booking page.
        const stripe = getStripe();
        const hold = holdExpiry();
        const booking: Booking = {
            id: crypto.randomUUID(),
            name,
            email,
            phone: optionalText(body.phone, 30),
            date,
            time,
            package: pkg.name,
            price: pkg.price,
            currency: 'GBP',
            status: stripe ? 'pending' : 'confirmed',
            paymentStatus: 'unpaid',
            paymentMethod: stripe ? 'stripe' : 'pending_gateway',
            goals: optionalText(body.goals, 1000),
            source: 'website_booking',
            ...(stripe && { holdUntil: hold.iso }),
            createdAt: new Date().toISOString(),
        };

        await db.addBooking(booking);

        if (!stripe) {
            return NextResponse.json({ success: true, booking: { id: booking.id } });
        }

        try {
            const session = await createBookingCheckout(stripe, booking, pkg, hold.unixSeconds, new URL(request.url).origin);
            await db.updateBooking(booking.id, { paymentRef: session.id });
            return NextResponse.json({ success: true, booking: { id: booking.id }, clientSecret: session.client_secret });
        } catch (stripeError) {
            console.error('Stripe checkout could not be created:', stripeError);
            await db.deleteBooking(booking.id);
            return NextResponse.json({ error: "We couldn't start the payment. Please try again in a moment." }, { status: 502 });
        }
    } catch (error) {
        console.error('Error in /api/bookings:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
