import { NextResponse } from 'next/server';
import { db, Inquiry } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, objective } = body;

        if (!name || !email || !objective) {
            return NextResponse.json({ error: 'Name, email, and objective are required' }, { status: 400 });
        }

        const newInquiry: Inquiry = {
            id: `inq_${Date.now()}`,
            name,
            email,
            phone: phone || '',
            objective,
            status: 'new',
            createdAt: new Date().toISOString()
        };

        await db.addInquiry(newInquiry);

        return NextResponse.json({ success: true, inquiry: newInquiry });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
