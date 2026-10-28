// Input checks shared by the public API routes. Each returns a cleaned value, or null when invalid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function cleanText(value: unknown, maxLength: number): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > maxLength) return null;
    return trimmed;
}

export function optionalText(value: unknown, maxLength: number): string {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, maxLength);
}

export function cleanEmail(value: unknown): string | null {
    const email = cleanText(value, 254)?.toLowerCase();
    return email && EMAIL_RE.test(email) ? email : null;
}

export function isValidTime(value: unknown): value is string {
    return typeof value === 'string' && TIME_RE.test(value);
}

function todayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// A real calendar date in YYYY-MM-DD form
export function isValidDate(value: unknown): value is string {
    if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

// A valid date from today up to `maxDaysAhead` days out
export function isBookableDate(value: unknown, maxDaysAhead = 180): value is string {
    if (!isValidDate(value)) return false;
    const limit = new Date();
    limit.setDate(limit.getDate() + maxDaysAhead);
    return value >= todayString() && new Date(`${value}T00:00:00`) <= limit;
}
