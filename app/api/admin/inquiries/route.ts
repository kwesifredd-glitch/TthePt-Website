import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
    try {
        const inquiries = db.getInquiries();
        return NextResponse.json({ inquiries });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Inquiry ID and status are required' }, { status: 400 });
        }

        const updated = db.updateInquiry(id, { status });
        if (!updated) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, inquiry: updated });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
        }

        const success = db.deleteInquiry(id);
        if (!success) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
