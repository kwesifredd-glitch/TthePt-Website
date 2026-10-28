import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, SESSION_MAX_AGE, checkAdminPassword, createSessionToken, verifySessionToken } from '@/lib/auth';
import { clientIp, isRateLimited, recordFailure } from '@/lib/rate-limit';

// Lock out an address after 10 wrong passwords for 15 minutes
const MAX_FAILURES = 10;
const LOCKOUT_SECONDS = 15 * 60;

// Session status for the admin page
export async function GET() {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    return NextResponse.json({ authenticated: await verifySessionToken(token) });
}

// Log in
export async function POST(request: Request) {
    try {
        const limitKey = `tthept:login-fail:${clientIp(request)}`;
        if (await isRateLimited(limitKey, MAX_FAILURES)) {
            return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
        }

        const { password } = await request.json();
        if (!checkAdminPassword(password)) {
            await recordFailure(limitKey, LOCKOUT_SECONDS);
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
