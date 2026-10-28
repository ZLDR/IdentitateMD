import { parseUsageField, usageDayKey } from '../src/lib/usage-event.js';
import { redisConfigured, redisPipeline } from './_redis.js';

// Aggregate counts only: GET /api/stats?days=14
export async function GET(request) {
  if (!redisConfigured) return Response.json({ error: 'counter not configured' }, { status: 503 });
  const days = Math.min(Math.max(parseInt(new URL(request.url).searchParams.get('days') || '14', 10) || 14, 1), 90);
  const keys = Array.from({ length: days }, (_, i) => usageDayKey(new Date(Date.now() - i * 86400000)));
  const results = await redisPipeline(keys.map((k) => ['HGETALL', k]));

  const totals = new Map();
  for (const { result } of results) {
    for (let i = 0; i < (result?.length || 0); i += 2) {
      totals.set(result[i], (totals.get(result[i]) || 0) + Number(result[i + 1]));
    }
  }
  const rows = [...totals]
    .map(([field, count]) => ({ ...parseUsageField(field), count }))
    .sort((a, b) => b.count - a.count);

  return Response.json(
    { days, rows },
    { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  );
}
