import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Stripe from 'stripe';
import { db, Booking, Payment, PaymentPlatform } from '@/lib/store';

export async function GET() {
    const settings = await db.getSettings();
    return NextResponse.json({
        status: 'active',
        service: 'TthePT Third-Party Payment Webhook Receiver',
        instructions: {
            endpoint: '/api/webhooks/payment',
            supportedProviders: ['stripe', 'paypal', 'square', 'custom_webhook'],
            universalPayloadFormat: {
                provider: 'stripe | paypal | square | custom',
                clientName: 'Client Full Name',
                clientEmail: 'client@example.com',
                amount: 280,
                currency: 'GBP',
                referenceId: 'ch_12345 or PAYID-12345',
                bookingId: 'optional_existing_booking_id',
                package: '12 Sessions a month',
                secret: 'required unless Stripe-signed: WEBHOOK_SECRET (or x-webhook-secret header)'
            },
            notes: 'Native Stripe webhook payloads (checkout.session.completed, payment_intent.succeeded) and PayPal webhook payloads (PAYMENT.CAPTURE.COMPLETED) are automatically parsed.'
        },
        gatewayConfig: {
            stripeEnabled: settings.gateway.stripeEnabled,
            paypalEnabled: settings.gateway.paypalEnabled,
            currency: settings.gateway.currency
        }
    });
}

interface StripeCustomerDetails {
    email?: string;
    name?: string;
}

interface WebhookIncomingPayload {
    id?: string;
    object?: string;
    type?: string;
    event?: string;
    event_type?: string;
    eventType?: string;
    resource_type?: string;
    provider?: string;
    clientName?: string;
    name?: string;
    clientEmail?: string;
    email?: string;
    amount?: number | string;
    currency?: string;
    referenceId?: string;
    transactionId?: string;
    bookingId?: string;
    package?: string;
    description?: string;
    secret?: string;
    data?: {
        object?: {
            id?: string;
            amount?: number;
            amount_total?: number;
            currency?: string;
            customer_details?: StripeCustomerDetails;
            receipt_email?: string;
            customer_email?: string;
            client_reference_id?: string;
            metadata?: {
                email?: string;
                name?: string;
                bookingId?: string;
                booking_id?: string;
                package?: string;
            };
            display_items?: Array<{ custom?: { name?: string } }>;
        };
    };
    resource?: {
        id?: string;
        amount?: { value?: string; currency_code?: string };
        seller_receivable_breakdown?: { gross_amount?: { value?: string } };
        payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
        custom_id?: string;
        invoice_id?: string;
    };
    payer?: { email_address?: string };
}

export async function POST(request: Request) {
    try {
        const bodyText = await request.text();
        let payload: WebhookIncomingPayload = {};
        try {
            payload = JSON.parse(bodyText) as WebhookIncomingPayload;
        } catch {
            return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
        }

        const headersList = request.headers;
        const stripeSignature = headersList.get('stripe-signature');
        const settings = await db.getSettings();

        // Only accept events that prove they came from Stripe, or from a sender holding WEBHOOK_SECRET
        if (stripeSignature) {
            const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!stripeWebhookSecret) {
                return NextResponse.json({ error: 'Stripe webhooks are not configured' }, { status: 503 });
            }
            try {
                Stripe.webhooks.constructEvent(bodyText, stripeSignature, stripeWebhookSecret);
            } catch {
                return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 401 });
            }
        } else {
            const expected = process.env.WEBHOOK_SECRET || '';
            const provided = headersList.get('x-webhook-secret') || payload.secret || '';
            if (!expected || provided.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
                return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
            }
        }

        // Standardized extraction variables
        let provider: PaymentPlatform = 'webhook';
        let eventType = payload.type || payload.event_type || payload.eventType || 'payment.success';
        let clientName = '';
        let clientEmail = '';
        let amount = 0;
        let currency = settings.gateway.currency || 'GBP';
        let referenceId = '';
        let bookingId: string | undefined = undefined;
        let packageName = 'Personal Training Package';
        let description = '';

        // 1. Check if this is a native Stripe Webhook event
        if (payload.object === 'event' || stripeSignature || payload.id?.startsWith('evt_') || payload.type?.startsWith('payment_intent.') || payload.type?.startsWith('checkout.session.')) {
            provider = 'stripe';
            eventType = payload.type || 'stripe.event';

            const dataObj = payload.data?.object;

            referenceId = dataObj?.id || `stripe_${Date.now()}`;
            amount = typeof dataObj?.amount_total === 'number' ? dataObj.amount_total / 100 : (typeof dataObj?.amount === 'number' ? dataObj.amount / 100 : 0);
            currency = (dataObj?.currency || 'gbp').toUpperCase();

            clientEmail = dataObj?.customer_details?.email || dataObj?.receipt_email || dataObj?.customer_email || dataObj?.metadata?.email || '';
            clientName = dataObj?.customer_details?.name || dataObj?.metadata?.name || clientEmail.split('@')[0] || 'Stripe Customer';
            bookingId = dataObj?.client_reference_id || dataObj?.metadata?.bookingId || dataObj?.metadata?.booking_id;
            packageName = dataObj?.metadata?.package || dataObj?.display_items?.[0]?.custom?.name || 'Personal Training';
            description = `Stripe Payment (${eventType}) - ${referenceId}`;
        }
        // 2. Check if this is a native PayPal Webhook event
        else if (payload.event_type || payload.resource_type === 'capture' || payload.resource_type === 'checkout-order') {
            provider = 'paypal';
            eventType = payload.event_type || 'paypal.capture';

            const res = payload.resource;
            referenceId = res?.id || `paypal_${Date.now()}`;
            amount = parseFloat(res?.amount?.value || res?.seller_receivable_breakdown?.gross_amount?.value || '0');
            currency = res?.amount?.currency_code || 'GBP';

            clientEmail = res?.payer?.email_address || payload.payer?.email_address || '';
            const givenName = res?.payer?.name?.given_name || '';
            const surname = res?.payer?.name?.surname || '';
            clientName = `${givenName} ${surname}`.trim() || clientEmail.split('@')[0] || 'PayPal Trainee';
            bookingId = res?.custom_id || res?.invoice_id || undefined;
            description = `PayPal Transaction (${eventType}) - ${referenceId}`;
        }
        // 3. Generic / Custom Third-Party Webhook
        else {
            const rawProv = (payload.provider?.toLowerCase() || 'webhook');
            provider = ['stripe', 'paypal', 'square', 'manual', 'webhook'].includes(rawProv) ? (rawProv as PaymentPlatform) : 'webhook';
            eventType = payload.eventType || payload.type || 'external.payment';
            clientName = payload.clientName || payload.name || 'External Trainee';
            clientEmail = payload.clientEmail || payload.email || '';
            amount = Number(payload.amount) || 0;
            currency = (payload.currency || settings.gateway.currency || 'GBP').toUpperCase();
            referenceId = payload.referenceId || payload.transactionId || payload.id || `ref_${Date.now()}`;
            bookingId = payload.bookingId || undefined;
            packageName = payload.package || 'Elite Protocol';
            description = payload.description || `Third-Party Platform Payment (${provider.toUpperCase()})`;
        }

        if (!clientEmail && !bookingId) {
            return NextResponse.json({
                error: 'Missing identifiable client information (email or bookingId is required in payload)'
            }, { status: 422 });
        }

        // Check if an existing booking matches by bookingId or email
        const allBookings = await db.getBookings();
        let matchedBooking: Booking | undefined = undefined;

        if (bookingId) {
            matchedBooking = allBookings.find(b => b.id === bookingId);
        }

        if (!matchedBooking && clientEmail) {
            // Find most recent unpaid booking with this email
            matchedBooking = allBookings.find(b =>
                b.email.toLowerCase() === clientEmail.toLowerCase() &&
                b.paymentStatus !== 'paid' &&
                b.status !== 'cancelled'
            );

            // If not found, match any booking with this email
            if (!matchedBooking) {
                matchedBooking = allBookings.find(b => b.email.toLowerCase() === clientEmail.toLowerCase());
            }
        }

        let isNewSignup = false;

        // If matched an existing booking, update it
        if (matchedBooking) {
            await db.updateBooking(matchedBooking.id, {
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: provider,
                paymentRef: referenceId,
                paidAt: new Date().toISOString(),
                price: amount > 0 ? amount : matchedBooking.price
            });
            bookingId = matchedBooking.id;
            if (!clientName && matchedBooking.name) {
                clientName = matchedBooking.name;
            }
        } else {
            // Auto-provision a new client signup directly from third-party payment!
            isNewSignup = true;
            const newBookingId = crypto.randomUUID ? crypto.randomUUID() : `bk_${Date.now()}`;

            // Pick next day for default session schedule
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

            const newBooking: Booking = {
                id: newBookingId,
                name: clientName || clientEmail.split('@')[0],
                email: clientEmail,
                date: dateStr,
                time: '10:00',
                package: packageName,
                price: amount > 0 ? amount : 200,
                currency,
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: provider,
                paymentRef: referenceId,
                paidAt: new Date().toISOString(),
                notes: `Auto-created from third-party ${provider.toUpperCase()} payment payload (${referenceId})`,
                source: 'external_checkout',
                createdAt: new Date().toISOString()
            };

            await db.addBooking(newBooking);
            bookingId = newBookingId;
        }

        // Record the transaction in the payments ledger
        const paymentRecord: Payment = {
            id: `tx_${provider}_${Date.now()}`,
            bookingId,
            clientName: clientName || clientEmail,
            clientEmail,
            amount: amount > 0 ? amount : (matchedBooking?.price || 30),
            currency,
            platform: provider,
            status: 'succeeded',
            referenceId,
            description,
            eventType,
            rawPayload: payload as Record<string, unknown>,
            createdAt: new Date().toISOString()
        };

        await db.addPayment(paymentRecord);

        return NextResponse.json({
            success: true,
            message: `Payment from ${provider.toUpperCase()} successfully processed and synchronized.`,
            transactionId: paymentRecord.id,
            referenceId,
            bookingId,
            clientEmail,
            clientName,
            amount: paymentRecord.amount,
            currency,
            isNewSignup,
            stats: await db.getStats()
        });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Error processing payment webhook:', errMsg);
        return NextResponse.json({
            error: 'Webhook processing failure',
            details: errMsg
        }, { status: 500 });
    }
}
