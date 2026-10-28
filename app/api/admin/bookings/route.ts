import { NextResponse } from 'next/server';
import { db, Booking, PaymentPlatform } from '@/lib/store';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase();
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');

        let bookings = await db.getBookings();

        if (search) {
            bookings = bookings.filter(b =>
                b.name.toLowerCase().includes(search) ||
                b.email.toLowerCase().includes(search) ||
                (b.package && b.package.toLowerCase().includes(search)) ||
                (b.notes && b.notes.toLowerCase().includes(search))
            );
        }

        if (status && status !== 'all') {
            bookings = bookings.filter(b => b.status === status);
        }

        if (paymentStatus && paymentStatus !== 'all') {
            bookings = bookings.filter(b => b.paymentStatus === paymentStatus);
        }

        const stats = await db.getStats();

        return NextResponse.json({ bookings, stats });
    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, date, time, package: packageName, price, status, paymentStatus, paymentMethod, notes, goals } = body;

        if (!name || !email || !date || !time) {
            return NextResponse.json({ error: 'Name, email, date, and time are required' }, { status: 400 });
        }

        const newBooking: Booking = {
            id: crypto.randomUUID ? crypto.randomUUID() : `bk_${Date.now()}`,
            name,
            email,
            phone: phone || '',
            date,
            time,
            package: packageName || 'Single Session',
            price: typeof price === 'number' ? price : Number(price) || 30,
            currency: 'GBP',
            status: status || 'confirmed',
            paymentStatus: paymentStatus || 'unpaid',
            paymentMethod: paymentMethod || 'manual',
            notes: notes || '',
            goals: goals || '',
            source: 'manual_admin',
            createdAt: new Date().toISOString()
        };

        await db.addBooking(newBooking);

        // If paymentStatus is 'paid', automatically log transaction in payments ledger
        if (newBooking.paymentStatus === 'paid') {
            await db.addPayment({
                id: `tx_${Date.now()}`,
                bookingId: newBooking.id,
                clientName: newBooking.name,
                clientEmail: newBooking.email,
                amount: newBooking.price || 30,
                currency: 'GBP',
                platform: (newBooking.paymentMethod as PaymentPlatform) || 'manual',
                status: 'succeeded',
                referenceId: `REF-${Date.now().toString().slice(-6)}`,
                description: `${newBooking.package} - Manual Admin Entry`,
                createdAt: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: true, booking: newBooking, stats: await db.getStats() });
    } catch (error) {
        console.error('Error creating admin booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const existingBooking = await db.getBooking(id);
        if (!existingBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // If marking as paid and wasn't paid before, record transaction in payments ledger
        if (updates.paymentStatus === 'paid' && existingBooking.paymentStatus !== 'paid') {
            updates.paidAt = new Date().toISOString();
            if (!updates.paymentRef) {
                updates.paymentRef = `MANUAL-${Date.now().toString().slice(-6)}`;
            }

            await db.addPayment({
                id: `tx_${Date.now()}`,
                bookingId: existingBooking.id,
                clientName: existingBooking.name,
                clientEmail: existingBooking.email,
                amount: updates.price !== undefined ? updates.price : (existingBooking.price || 30),
                currency: 'GBP',
                platform: (updates.paymentMethod as PaymentPlatform) || 'manual',
                status: 'succeeded',
                referenceId: updates.paymentRef,
                description: `${existingBooking.package || 'Session'} - Marked Paid by Admin`,
                createdAt: new Date().toISOString()
            });
        }

        const updated = await db.updateBooking(id, updates);

        return NextResponse.json({ success: true, booking: updated, stats: await db.getStats() });
    } catch (error) {
        console.error('Error updating admin booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const success = await db.deleteBooking(id);
        if (!success) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, stats: await db.getStats() });
    } catch (error) {
        console.error('Error deleting admin booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
