// Admin session handling: a signed, expiring token stored in an httpOnly cookie.
// Uses Web Crypto so it works in both route handlers and proxy.ts.

export const ADMIN_COOKIE = "tthept_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const encoder = new TextEncoder();

// Signing key: ADMIN_SESSION_SECRET when it is long enough, otherwise derived from ADMIN_PASSWORD
// (so changing the password also signs out existing sessions).
async function getKeyMaterial(): Promise<ArrayBuffer> {
    const secret = process.env.ADMIN_SESSION_SECRET;
    const password = process.env.ADMIN_PASSWORD;
    const base = secret && secret.length >= 32 ? secret : password;
    if (!base) {
        throw new Error("ADMIN_PASSWORD must be set.");
    }
    return crypto.subtle.digest("SHA-256", encoder.encode(`tthept-admin-session:${base}`));
}

async function sign(value: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        await getKeyMaterial(),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
    return Buffer.from(sig).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export async function createSessionToken(): Promise<string> {
    const expiresAt = String(Date.now() + SESSION_MAX_AGE * 1000);
    return `${expiresAt}.${await sign(expiresAt)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    const [expiresAt, sig] = token.split(".");
    if (!expiresAt || !sig || Number(expiresAt) < Date.now()) return false;
    try {
        return safeEqual(sig, await sign(expiresAt));
    } catch {
        return false;
    }
}

export function checkAdminPassword(password: unknown): boolean {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || typeof password !== "string") return false;
    return safeEqual(password, expected);
}
