import Stripe from 'stripe';
import { db, Booking } from '@/lib/store';
import type { TrainingPackage } from '@/lib/packages';

// How long a booking keeps its slot while the client pays. Stripe needs at least 30 minutes.
const HOLD_SECONDS = 31 * 60;

let client: Stripe | null = null;

// Null when STRIPE_SECRET_KEY isn't set, so the site falls back to Payment Links
export function getStripe(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    client ??= new Stripe(key);
    return client;
}

export function holdExpiry(): { unixSeconds: number; iso: string } {
    const unixSeconds = Math.floor(Date.now() / 1000) + HOLD_SECONDS;
    return { unixSeconds, iso: new Date(unixSeconds * 1000).toISOString() };
}

// Embedded Checkout Session for a pending booking, priced from the server's package list
export async function createBookingCheckout(
    stripe: Stripe,
    booking: Booking,
    pkg: TrainingPackage,
    expiresAt: number,
    origin: string
): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        mode: 'payment',
        line_items: [{
            quantity: 1,
            price_data: {
                currency: 'gbp',
                unit_amount: Math.round(pkg.price * 100),
                product_data: {
                    name: pkg.name,
                    description: `First session ${booking.date} at ${booking.time}`,
                },
            },
        }],
        customer_email: booking.email,
        client_reference_id: booking.id,
        metadata: { bookingId: booking.id, package: pkg.name },
        expires_at: expiresAt,
        return_url: `${origin}/booking?session_id={CHECKOUT_SESSION_ID}`,
    });
}

// Marks the session's booking confirmed and paid. Safe to call more than once for the same session.
export async function confirmPaidSession(session: Stripe.Checkout.Session): Promise<Booking | null> {
    if (session.payment_status !== 'paid') return null;

    const bookingId = session.client_reference_id || session.metadata?.bookingId;
    const booking = bookingId ? await db.getBooking(bookingId) : undefined;
    if (booking?.paymentStatus === 'paid') return booking;

    const payments = await db.getPayments();
    const alreadyRecorded = payments.some(p => p.referenceId === session.id);
    const amount = (session.amount_total ?? 0) / 100;
    const now = new Date().toISOString();

    let updated: Booking | null = null;
    if (booking) {
        updated = await db.updateBooking(booking.id, {
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'stripe',
            paymentRef: session.id,
            paidAt: now,
            holdUntil: undefined,
        });
    }

    if (!alreadyRecorded) {
        await db.addPayment({
            id: `tx_stripe_${crypto.randomUUID()}`,
            bookingId: booking?.id,
            clientName: booking?.name || session.customer_details?.name || session.customer_details?.email || 'Stripe customer',
            clientEmail: booking?.email || session.customer_details?.email || '',
            amount,
            currency: (session.currency || 'gbp').toUpperCase(),
            platform: 'stripe',
            status: 'succeeded',
            referenceId: session.id,
            description: `Stripe Checkout: ${session.metadata?.package || booking?.package || 'Training'}`,
            eventType: 'checkout.session.completed',
            createdAt: now,
        });
    }

    return updated;
}

// Releases the slot of a booking whose checkout expired without payment
export async function releaseExpiredSession(session: Stripe.Checkout.Session): Promise<void> {
    const bookingId = session.client_reference_id || session.metadata?.bookingId;
    const booking = bookingId ? await db.getBooking(bookingId) : undefined;
    if (booking && booking.status === 'pending' && booking.paymentStatus !== 'paid') {
        await db.updateBooking(booking.id, { status: 'cancelled', holdUntil: undefined });
    }
}
