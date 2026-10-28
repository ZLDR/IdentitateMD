// Minimal Upstash/Vercel KV REST client (no dependency). Returns null when not configured.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisConfigured = Boolean(URL_ && TOKEN);

/** @param {Array<Array<string | number>>} commands */
export async function redisPipeline(commands) {
  if (!redisConfigured) return null;
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return res.json();
}
