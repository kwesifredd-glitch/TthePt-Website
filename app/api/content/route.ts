import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
    return NextResponse.json(db.getContent());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const updated = db.updateContent(body);
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
