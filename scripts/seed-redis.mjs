// One-off: copy a local db.json into Upstash Redis.
// Usage: node --env-file=.env.local scripts/seed-redis.mjs [path/to/db.json] [--force]
import fs from 'fs';
import { Redis } from '@upstash/redis';

const REDIS_KEY = 'tthept:db';
const args = process.argv.slice(2);
const force = args.includes('--force');
const file = args.find(a => !a.startsWith('--')) || 'db.json';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
    console.error('Missing KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_*) in the environment.');
    process.exit(1);
}

const redis = new Redis({ url, token });
const existing = await redis.get(REDIS_KEY);
if (existing && !force) {
    console.error('Redis already holds data. Re-run with --force to overwrite it.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
await redis.set(REDIS_KEY, data);
console.log(`Copied ${data.bookings?.length || 0} bookings, ${data.payments?.length || 0} payments and ${data.inquiries?.length || 0} inquiries into Redis.`);
