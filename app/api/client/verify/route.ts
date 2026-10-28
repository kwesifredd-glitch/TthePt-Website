import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { cleanEmail, optionalText } from '@/lib/validation';

// Unlocks the meal plans page. A quick signup is saved as a website lead (not a booking),
// and lookups never return stored client details, only whether the email is known.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = cleanEmail(body.email);

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        if (body.quickSignup) {
            const name = optionalText(body.name, 100) || email.split('@')[0];
            await db.addInquiry({
                id: `inq_${crypto.randomUUID()}`,
                name,
                email,
                objective: optionalText(body.objective, 1000) || 'Meal plans signup',
                status: 'new',
                createdAt: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                verified: true,
                client: { name, email },
                message: 'You\'re signed up. Meal plans unlocked.'
            });
        }

        const [bookings, inquiries] = await Promise.all([db.getBookings(), db.getInquiries()]);
        const known = bookings.some(b => b.email?.trim().toLowerCase() === email)
            || inquiries.some(i => i.email?.trim().toLowerCase() === email);

        if (known) {
            return NextResponse.json({
                success: true,
                verified: true,
                client: { name: '', email },
                message: 'Welcome back. Meal plans unlocked.'
            });
        }

        return NextResponse.json({
            success: false,
            verified: false,
            message: 'We couldn\'t find that email. Sign up below or book a session to unlock the meal plans.'
        }, { status: 404 });

    } catch (error) {
        console.error('Error verifying client:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
