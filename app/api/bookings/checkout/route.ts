import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { confirmPaidSession, getStripe } from '@/lib/stripe';

// Called by the booking page when Stripe returns the client. Confirms the booking straight
// away if the payment went through, so it doesn't have to wait for the webhook.
export async function GET(request: Request) {
    const sessionId = new URL(request.url).searchParams.get('session_id') || '';
    if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ error: 'Online payments are not set up' }, { status: 503 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paid = session.payment_status === 'paid';
        if (paid) await confirmPaidSession(session);

        const bookingId = session.client_reference_id || session.metadata?.bookingId;
        const booking = bookingId ? await db.getBooking(bookingId) : undefined;

        return NextResponse.json({
            status: paid ? 'paid' : session.status, // 'paid' | 'open' | 'expired' | 'complete' (paid later, e.g. bank transfer)
            booking: booking ? { date: booking.date, time: booking.time, package: booking.package } : null,
        });
    } catch (error) {
        console.error('Could not check Stripe session:', error);
        return NextResponse.json({ error: "We couldn't check your payment. Please refresh the page." }, { status: 502 });
    }
}

// The client went back before paying: end their checkout and free the slot they were holding
export async function DELETE(request: Request) {
    const body = await request.json().catch(() => ({}));
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId : '';
    const booking = bookingId ? await db.getBooking(bookingId) : undefined;
    if (!booking || booking.status !== 'pending' || booking.paymentStatus === 'paid') {
        return NextResponse.json({ success: true });
    }

    const stripe = getStripe();
    if (stripe && booking.paymentRef?.startsWith('cs_')) {
        try {
            await stripe.checkout.sessions.expire(booking.paymentRef);
        } catch (error) {
            // Already paid or expired; don't cancel a booking Stripe may have just charged
            const session = await stripe.checkout.sessions.retrieve(booking.paymentRef).catch(() => null);
            if (session?.payment_status === 'paid') {
                await confirmPaidSession(session);
                return NextResponse.json({ success: false, paid: true });
            }
            console.error('Could not expire Stripe session:', error);
        }
    }

    await db.updateBooking(booking.id, { status: 'cancelled', holdUntil: undefined });
    return NextResponse.json({ success: true });
}
