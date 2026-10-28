/**
 * Cookieless, consent-free counter for logo downloads and copies.
 * Sends only { event, institution, asset } — no identifier, nothing stored in the browser.
 */
export function countUsage(event: 'download' | 'copy' | 'zip', institution: string | null | undefined, asset?: string | null) {
  if (!institution) return;
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event, institution, asset: asset || undefined }),
      credentials: 'omit',
      cache: 'no-store',
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}
