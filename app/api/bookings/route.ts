import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

// Since I don't have uuid installed, I'll use crypto.randomUUID() which is available in Node/Edge.
// Actually, I'll just use Date.now().toString() for simplicity if crypto is not standard in this env, 
// but crypto.randomUUID() is standard in modern Node.
// Let's stick to crypto.randomUUID().

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, date, time, package: packageName, price } = body;

        if (!name || !email || !date || !time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Double check availability
        const availableSlots = db.getAvailableSlots(date);
        if (!availableSlots.includes(time)) {
            return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
        }

        const booking = db.addBooking({
            id: crypto.randomUUID(),
            name,
            email,
            date,
            time,
            package: packageName || "Standard Session",
            price: typeof price === "number" ? price : 30,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
