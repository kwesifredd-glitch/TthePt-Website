import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/auth';

// Every admin API call, and any change to site content, needs a valid admin session.
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isContentWrite = pathname === '/api/content' && request.method !== 'GET';

    if (pathname.startsWith('/api/admin') || isContentWrite) {
        const token = request.cookies.get(ADMIN_COOKIE)?.value;
        if (!(await verifySessionToken(token))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/admin/:path*', '/api/content'],
};
