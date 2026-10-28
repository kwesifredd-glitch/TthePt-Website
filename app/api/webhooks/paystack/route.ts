import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, Booking, Payment } from '@/lib/store';

interface PaystackCustomer {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    customer_code?: string;
}

interface PaystackWebhookPayload {
    event?: string;
    data?: {
        id?: number;
        domain?: string;
        status?: string;
        reference?: string;
        amount?: number; // In kobo/cents
        gateway_response?: string;
        paid_at?: string;
        channel?: string;
        currency?: string;
        ip_address?: string;
        metadata?: {
            bookingId?: string;
            clientName?: string;
            package?: string;
            email?: string;
        };
        customer?: PaystackCustomer;
    };
}

export async function GET() {
    const settings = db.getSettings();
    return NextResponse.json({
        status: 'active',
        service: 'TthePT Paystack Webhook Receiver',
        instructions: {
            endpoint: '/api/webhooks/paystack',
            paystackDashboardUrl: 'https://dashboard.paystack.com/#/settings/developer',
            supportedEvents: ['charge.success'],
            setupGuide: 'Copy this URL and paste it into your Paystack Dashboard under Settings -> API Keys & Webhooks -> Live/Test Webhook URL.'
        },
        gatewayConfig: {
            paystackEnabled: settings.gateway.paystackEnabled,
            hasSecretKey: Boolean(settings.gateway.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY),
            currency: settings.gateway.currency
        }
    });
}

export async function POST(request: Request) {
    try {
        const bodyText = await request.text();
        let payload: PaystackWebhookPayload = {};

        try {
            payload = JSON.parse(bodyText) as PaystackWebhookPayload;
        } catch {
            return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
        }

        const settings = db.getSettings();
        const secretKey = settings.gateway.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY || '';

        // Every Paystack webhook must carry a valid HMAC SHA512 signature
        const signature = request.headers.get('x-paystack-signature') || '';
        if (!secretKey) {
            return NextResponse.json({ error: 'Paystack is not configured' }, { status: 503 });
        }
        const hash = crypto.createHmac('sha512', secretKey).update(bodyText).digest('hex');
        if (signature.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
            console.warn('Paystack webhook signature mismatch detected.');
            return NextResponse.json({ error: 'Invalid Paystack signature' }, { status: 401 });
        }

        const event = payload.event || 'charge.success';
        const data = payload.data;

        if (!data || event !== 'charge.success') {
            return NextResponse.json({
                received: true,
                message: `Event '${event}' acknowledged but ignored (only 'charge.success' triggers booking intake)`
            });
        }

        const referenceId = data.reference || `paystack_${Date.now()}`;
        // Paystack amounts are in subunits (kobo / pence / cents), so divide by 100
        const amount = typeof data.amount === 'number' ? data.amount / 100 : 0;
        const currency = (data.currency || settings.gateway.currency || 'GBP').toUpperCase();

        const clientEmail = data.customer?.email || data.metadata?.email || '';
        const firstName = data.customer?.first_name || '';
        const lastName = data.customer?.last_name || '';
        const clientName = `${firstName} ${lastName}`.trim() || data.metadata?.clientName || clientEmail.split('@')[0] || 'Paystack Trainee';
        let bookingId = data.metadata?.bookingId;
        const packageName = data.metadata?.package || 'Personal Training Protocol';

        if (!clientEmail && !bookingId) {
            return NextResponse.json({
                error: 'Missing client email or bookingId in Paystack payload'
            }, { status: 422 });
        }

        const allBookings = db.getBookings();
        let matchedBooking: Booking | undefined = undefined;

        if (bookingId) {
            matchedBooking = allBookings.find(b => b.id === bookingId);
        }

        if (!matchedBooking && clientEmail) {
            matchedBooking = allBookings.find(b =>
                b.email.toLowerCase() === clientEmail.toLowerCase() &&
                b.paymentStatus !== 'paid' &&
                b.status !== 'cancelled'
            );

            if (!matchedBooking) {
                matchedBooking = allBookings.find(b => b.email.toLowerCase() === clientEmail.toLowerCase());
            }
        }

        let isNewSignup = false;

        if (matchedBooking) {
            db.updateBooking(matchedBooking.id, {
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: 'paystack',
                paymentRef: referenceId,
                paidAt: data.paid_at || new Date().toISOString(),
                price: amount > 0 ? amount : matchedBooking.price
            });
            bookingId = matchedBooking.id;
        } else {
            // Auto-provision a new client booking
            isNewSignup = true;
            const newBookingId = crypto.randomUUID ? crypto.randomUUID() : `bk_${Date.now()}`;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

            const newBooking: Booking = {
                id: newBookingId,
                name: clientName,
                email: clientEmail,
                phone: data.customer?.phone || '',
                date: dateStr,
                time: '11:00',
                package: packageName,
                price: amount > 0 ? amount : 200,
                currency,
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: 'paystack',
                paymentRef: referenceId,
                paidAt: data.paid_at || new Date().toISOString(),
                notes: `Auto-enrolled via Paystack charge.success webhook (${referenceId})`,
                source: 'external_checkout',
                createdAt: new Date().toISOString()
            };

            db.addBooking(newBooking);
            bookingId = newBookingId;
        }

        // Record into payments ledger
        const paymentRecord: Payment = {
            id: `tx_paystack_${Date.now()}`,
            bookingId,
            clientName: clientName || clientEmail,
            clientEmail,
            amount: amount > 0 ? amount : (matchedBooking?.price || 30),
            currency,
            platform: 'paystack',
            status: 'succeeded',
            referenceId,
            description: `Paystack Charge Verified (${referenceId})`,
            eventType: event,
            rawPayload: payload as Record<string, unknown>,
            createdAt: new Date().toISOString()
        };

        db.addPayment(paymentRecord);

        return NextResponse.json({
            success: true,
            message: 'Paystack charge successfully processed and synchronized with trainee roster.',
            transactionId: paymentRecord.id,
            referenceId,
            bookingId,
            clientEmail,
            clientName,
            amount: paymentRecord.amount,
            currency,
            isNewSignup,
            stats: db.getStats()
        });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Error processing Paystack webhook:', errMsg);
        return NextResponse.json({
            error: 'Paystack webhook processing failure',
            details: errMsg
        }, { status: 500 });
    }
}
