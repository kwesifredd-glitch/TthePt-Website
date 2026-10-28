import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { optionalText } from '@/lib/validation';

export async function GET() {
    return NextResponse.json(await db.getContent());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const heroTitle = optionalText(body.heroTitle, 120);
        const heroSubtitle = optionalText(body.heroSubtitle, 400);
        const updated = await db.updateContent({
            ...(heroTitle && { heroTitle }),
            ...(heroSubtitle && { heroSubtitle }),
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
