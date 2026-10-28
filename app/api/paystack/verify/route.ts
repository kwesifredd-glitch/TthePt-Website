import { NextResponse } from 'next/server';
import { db, Payment } from '@/lib/store';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('reference');
        const bookingId = searchParams.get('bookingId');
        // Simulated payments are a local-development convenience only
        const allowSimulation = process.env.NODE_ENV !== 'production';
        const simulated = allowSimulation && searchParams.get('simulated') === 'true';

        if (!reference) {
            return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
        }

        const settings = db.getSettings();
        const secretKey = settings.gateway.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY || '';
        const isRealKey = secretKey && (secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_')) && !secretKey.includes('sample') && !secretKey.includes('placeholder');

        let amount = 0;
        let currency = settings.gateway.currency || 'GBP';
        let clientEmail = '';
        let clientName = '';
        let verifiedBookingId = bookingId || undefined;

        if (isRealKey && !simulated) {
            const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.status || verifyData.data?.status !== 'success') {
                return NextResponse.json({
                    success: false,
                    error: verifyData.message || 'Payment not successful on Paystack',
                    data: verifyData.data
                }, { status: 400 });
            }

            const trans = verifyData.data;
            amount = typeof trans.amount === 'number' ? trans.amount / 100 : 0;
            currency = (trans.currency || 'GBP').toUpperCase();
            clientEmail = trans.customer?.email || '';
            const fname = trans.customer?.first_name || '';
            const lname = trans.customer?.last_name || '';
            clientName = `${fname} ${lname}`.trim() || trans.metadata?.clientName || clientEmail;
            verifiedBookingId = trans.metadata?.bookingId || verifiedBookingId;
        } else if (simulated || (!isRealKey && allowSimulation)) {
            // Simulated verification
            amount = 30;
        } else {
            return NextResponse.json({ success: false, error: 'Payment could not be verified' }, { status: 400 });
        }

        // Match and update the booking in local store
        let matched = verifiedBookingId ? db.getBooking(verifiedBookingId) : undefined;
        if (!matched && clientEmail) {
            const all = db.getBookings();
            matched = all.find(b => b.email.toLowerCase() === clientEmail.toLowerCase());
        }

        if (matched) {
            db.updateBooking(matched.id, {
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: 'paystack',
                paymentRef: reference,
                paidAt: new Date().toISOString()
            });
            verifiedBookingId = matched.id;
            if (!clientName) clientName = matched.name;
            if (!clientEmail) clientEmail = matched.email;
            if (amount === 0 && matched.price) amount = matched.price;
        }

        // Add payment to ledger if not already recorded
        const existingTx = db.getPayments().find(p => p.referenceId === reference);
        if (!existingTx) {
            const newPayment: Payment = {
                id: `tx_paystack_${Date.now()}`,
                bookingId: verifiedBookingId,
                clientName: clientName || 'Paystack Trainee',
                clientEmail: clientEmail || 'client@paystack.com',
                amount: amount > 0 ? amount : 30,
                currency,
                platform: 'paystack',
                status: 'succeeded',
                referenceId: reference,
                description: `Paystack Verified Checkout (${reference})`,
                eventType: 'transaction.verify',
                createdAt: new Date().toISOString()
            };
            db.addPayment(newPayment);
        }

        return NextResponse.json({
            success: true,
            paid: true,
            reference,
            bookingId: verifiedBookingId,
            clientName,
            clientEmail,
            amount,
            currency
        });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Verification failed', details: errMsg }, { status: 500 });
    }
}
