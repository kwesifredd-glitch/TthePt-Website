import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
    try {
        const settings = db.getSettings();
        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const updated = db.updateSettings(body);
        return NextResponse.json({ success: true, settings: updated });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
