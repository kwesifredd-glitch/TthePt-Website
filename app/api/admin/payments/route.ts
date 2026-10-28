import { NextResponse } from 'next/server';
import { db, Payment } from '@/lib/store';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform');
        const status = searchParams.get('status');

        let payments = await db.getPayments();

        if (platform && platform !== 'all') {
            payments = payments.filter(p => p.platform === platform);
        }

        if (status && status !== 'all') {
            payments = payments.filter(p => p.status === status);
        }

        const stats = await db.getStats();

        return NextResponse.json({ payments, stats });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientName, clientEmail, amount, currency, platform, referenceId, description, bookingId } = body;

        if (!clientName || !clientEmail || amount === undefined) {
            return NextResponse.json({ error: 'Client name, email, and amount are required' }, { status: 400 });
        }

        const newPayment: Payment = {
            id: `tx_${Date.now()}`,
            bookingId: bookingId || undefined,
            clientName,
            clientEmail,
            amount: Number(amount),
            currency: currency || 'GBP',
            platform: platform || 'manual',
            status: 'succeeded',
            referenceId: referenceId || `MAN-${Date.now().toString().slice(-6)}`,
            description: description || 'External / Manual Payment Received',
            createdAt: new Date().toISOString()
        };

        await db.addPayment(newPayment);

        // If linked to a booking, update the booking's payment status to paid
        if (bookingId) {
            await db.updateBooking(bookingId, {
                paymentStatus: 'paid',
                paymentMethod: platform || 'manual',
                paymentRef: newPayment.referenceId,
                paidAt: newPayment.createdAt
            });
        }

        return NextResponse.json({ success: true, payment: newPayment, stats: await db.getStats() });
    } catch (error) {
        console.error('Error recording payment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Payment ID and new status are required' }, { status: 400 });
        }

        const updated = await db.updatePayment(id, { status });
        if (!updated) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // If refunded and tied to a booking, update booking payment status
        if (status === 'refunded' && updated.bookingId) {
            await db.updateBooking(updated.bookingId, { paymentStatus: 'refunded' });
        }

        return NextResponse.json({ success: true, payment: updated, stats: await db.getStats() });
    } catch (error) {
        console.error('Error updating payment status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
