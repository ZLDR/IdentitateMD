/**
 * Shared image fallback handlers.
 */

export function buildLocalImageOnError(fallbackPath: string | null | undefined): string {
  const fb = fallbackPath ?? '';
  return `const fb=this.dataset.localFallback; if (fb && this.src !== window.location.origin + fb && this.src !== fb) { this.src=fb; return; } this.style.display='none';`;
}

export function buildRemoteImageOnError(fallbackPath: string | null | undefined): string {
  const fb = fallbackPath ?? '';
  return `const fb=this.dataset.remoteFallback; if(fb&&this.src!==fb){this.src=fb;return;} this.style.display='none'; this.nextElementSibling.style.display='flex';`;
}
