import { parseUsageEvent, usageDayKey, usageField, USAGE_RETENTION_DAYS } from '../src/lib/usage-event.js';
import { redisPipeline } from './_redis.js';

const NO_CONTENT = { status: 204, headers: { 'cache-control': 'no-store' } };

// Increments an anonymous per-day counter. Does not read or store IP, user agent or any identifier.
export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return new Response(null, { status: 403 });

  let body;
  try {
    const text = await request.text();
    if (text.length > 512) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = parseUsageEvent(body);
  if (!parsed) return new Response(null, { status: 400 });

  const key = usageDayKey();
  try {
    await redisPipeline([
      ['HINCRBY', key, usageField(parsed), 1],
      ['EXPIRE', key, USAGE_RETENTION_DAYS * 86400],
    ]);
  } catch { /* counting must never break the page */ }
  return new Response(null, NO_CONTENT);
}
