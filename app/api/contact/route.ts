import { NextResponse } from 'next/server';
import { db, Inquiry } from '@/lib/store';
import { cleanEmail, cleanText, optionalText } from '@/lib/validation';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = cleanText(body.name, 100);
        const email = cleanEmail(body.email);
        const objective = cleanText(body.objective, 2000);

        if (!name || !email || !objective) {
            return NextResponse.json({ error: 'Please enter your name, a valid email and a message.' }, { status: 400 });
        }

        const newInquiry: Inquiry = {
            id: `inq_${crypto.randomUUID()}`,
            name,
            email,
            phone: optionalText(body.phone, 30),
            objective,
            status: 'new',
            createdAt: new Date().toISOString()
        };

        await db.addInquiry(newInquiry);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
