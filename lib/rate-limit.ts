import { redis } from '@/lib/store';

// Counts failed attempts per key inside a time window. Uses Redis when available
// (shared across server instances), otherwise an in-memory map for local development.
const memory = new Map<string, { count: number; resetAt: number }>();

export async function isRateLimited(key: string, limit: number): Promise<boolean> {
    if (redis) {
        const count = await redis.get<number>(key);
        return (count ?? 0) >= limit;
    }
    const entry = memory.get(key);
    return !!entry && entry.resetAt > Date.now() && entry.count >= limit;
}

export async function recordFailure(key: string, windowSeconds: number): Promise<void> {
    if (redis) {
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, windowSeconds);
        return;
    }
    const entry = memory.get(key);
    if (!entry || entry.resetAt <= Date.now()) {
        memory.set(key, { count: 1, resetAt: Date.now() + windowSeconds * 1000 });
    } else {
        entry.count++;
    }
}

export function clientIp(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
