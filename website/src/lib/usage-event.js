/**
 * Anonymous usage counter: validation and key helpers shared by the client
 * and the /api functions. Nothing here identifies a visitor.
 */

export const USAGE_EVENTS = ['download', 'copy', 'zip'];
export const USAGE_RETENTION_DAYS = 120;

const SLUG_RE = /^[a-z0-9-]{1,64}$/;
const ASSET_RE = /^[a-z0-9:_./-]{1,120}$/i;

/**
 * @param {unknown} body
 * @returns {{ event: string, institution: string, asset: string } | null}
 */
export function parseUsageEvent(body) {
  if (!body || typeof body !== 'object') return null;
  const { event, institution, asset } = /** @type {Record<string, unknown>} */ (body);
  if (typeof event !== 'string' || !USAGE_EVENTS.includes(event)) return null;
  if (typeof institution !== 'string' || !SLUG_RE.test(institution)) return null;
  const rawAsset = typeof asset === 'string' && asset ? asset : '-';
  if (!ASSET_RE.test(rawAsset) && rawAsset !== '-') return null;
  return { event, institution, asset: rawAsset };
}

/** One Redis hash per UTC day; the field is `event|institution|asset`. */
export function usageDayKey(date = new Date()) {
  return `usage:${date.toISOString().slice(0, 10)}`;
}

export function usageField({ event, institution, asset }) {
  return `${event}|${institution}|${asset}`;
}

export function parseUsageField(field) {
  const [event, institution, ...rest] = String(field).split('|');
  return { event, institution, asset: rest.join('|') };
}

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|curl|wget|python-requests|node-fetch|undici|axios|go-http-client|httpclient/i;

/** Empty or automated user agents are not counted. The value is checked, never stored. */
export function isAutomatedUserAgent(userAgent) {
  return !userAgent || BOT_RE.test(userAgent);
}
