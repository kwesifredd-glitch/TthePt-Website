import { NextResponse } from 'next/server';
import { db, Booking, Inquiry } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, quickSignup, objective } = body;

        const cleanEmail = (email || '').trim().toLowerCase();

        if (!cleanEmail) {
            return NextResponse.json(
                { success: false, message: 'Please provide a valid client email address.' },
                { status: 400 }
            );
        }

        // If quick signup is requested directly from the protocol clearance modal
        if (quickSignup) {
            const clientName = (name || '').trim() || cleanEmail.split('@')[0];
            const bookingId = crypto.randomUUID ? crypto.randomUUID() : `bk_${Date.now()}`;
            const today = new Date().toISOString().split('T')[0];

            const newBooking: Booking = {
                id: bookingId,
                name: clientName,
                email: cleanEmail,
                date: today,
                time: '12:00',
                package: 'Tactical Clearance Registration',
                price: 0,
                currency: 'GBP',
                status: 'confirmed',
                paymentStatus: 'paid',
                goals: objective || 'Nutritional Protocol Clearance',
                source: 'website_booking',
                createdAt: new Date().toISOString()
            };

            await db.addBooking(newBooking);

            return NextResponse.json({
                success: true,
                verified: true,
                client: {
                    name: newBooking.name,
                    email: newBooking.email,
                    package: newBooking.package
                },
                message: 'Client profile registered. Full operational clearance granted.'
            });
        }

        // Verify against existing bookings
        const bookings = await db.getBookings();
        const matched = bookings.find(
            b => b.email && b.email.trim().toLowerCase() === cleanEmail
        );

        if (matched) {
            return NextResponse.json({
                success: true,
                verified: true,
                client: {
                    name: matched.name,
                    email: matched.email,
                    package: matched.package || 'Enrolled Trainee'
                },
                message: `Identity confirmed: Welcome back, ${matched.name || 'Trainee'}. Clearance granted.`
            });
        }

        // Also check inquiries as a fallback
        const inquiries: Inquiry[] = await db.getInquiries();
        const matchedInquiry = inquiries.find(
            (i: Inquiry) => i.email && i.email.trim().toLowerCase() === cleanEmail
        );

        if (matchedInquiry) {
            return NextResponse.json({
                success: true,
                verified: true,
                client: {
                    name: matchedInquiry.name,
                    email: matchedInquiry.email,
                    package: 'Registered Lead'
                },
                message: `Inquiry clearance acknowledged for ${matchedInquiry.name}. Full protocols unlocked.`
            });
        }

        return NextResponse.json({
            success: false,
            verified: false,
            message: 'No client profile found for this email. Complete an intake booking to activate full clearance.'
        }, { status: 404 });

    } catch (error) {
        console.error('Error verifying client clearance:', error);
        return NextResponse.json(
            { success: false, message: 'Server verification error. Please try again.' },
            { status: 500 }
        );
    }
}
