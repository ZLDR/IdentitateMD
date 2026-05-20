import { describe, expect, it } from 'vitest';
import { getFirstLogoPath, getPreviewLogoPath } from './logo-paths.js';

describe('logo-paths', () => {
  it('prefers the first available logo variant', () => {
    expect(getFirstLogoPath({ type: 'horizontal', white: '/logos/x-white.svg', color: '/logos/x.svg' })).toBe('/logos/x.svg');
  });

  it('falls back to png when no svg variants exist', () => {
    expect(getFirstLogoPath({ type: 'horizontal', png: { path: '/logos/x.png', width: 100, height: 50 } })).toBe('/logos/x.png');
  });

  it('returns preview logo path from institution main asset group', () => {
    expect(getPreviewLogoPath({
      id: 'md-x',
      slug: 'x',
      name: 'X',
      category: 'altele',
      meta: { version: '1.0', last_updated: '2024-01-01', keywords: [] },
      assets: { main: { type: 'horizontal', dark_mode: '/logos/x-dark.svg' } },
    } as any)).toBe('/logos/x-dark.svg');
  });
});
