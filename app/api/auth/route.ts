import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, SESSION_MAX_AGE, checkAdminPassword, createSessionToken, verifySessionToken } from '@/lib/auth';

// Session status for the admin page
export async function GET() {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    return NextResponse.json({ authenticated: await verifySessionToken(token) });
}

// Log in
export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        if (!checkAdminPassword(password)) {
            // Small delay to slow down password guessing
            await new Promise(resolve => setTimeout(resolve, 800));
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const res = NextResponse.json({ success: true });
        res.cookies.set(ADMIN_COOKIE, await createSessionToken(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: SESSION_MAX_AGE,
        });
        return res;
    } catch (error) {
        console.error('Error in /api/auth:', error);
        return NextResponse.json({ error: 'Login unavailable' }, { status: 500 });
    }
}

// Log out
export async function DELETE() {
    const res = NextResponse.json({ success: true });
    res.cookies.delete(ADMIN_COOKIE);
    return res;
}
