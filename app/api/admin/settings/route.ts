import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

// Only schedule settings are exposed here. Payment keys live in environment variables.
export async function GET() {
    try {
        const { availableHours } = db.getSettings();
        return NextResponse.json({ settings: { availableHours } });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const hours = body?.availableHours;
        if (!Array.isArray(hours) || !hours.every(h => typeof h === 'string' && /^\d{2}:\d{2}$/.test(h))) {
            return NextResponse.json({ error: 'availableHours must be a list of HH:mm times' }, { status: 400 });
        }
        const updated = db.updateSettings({ availableHours: hours });
        return NextResponse.json({ success: true, settings: { availableHours: updated.availableHours } });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
