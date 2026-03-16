import { describe, it, expect } from 'vitest';
import {
  getPreferredCatalogKey,
  buildCatalogPathMap,
  getPrimaryLogoPath,
  hasSvg,
  formatRgb,
  getSiteUrl,
} from './helpers';
import type { Institution } from '../types/institution';

// ─── Minimal institution factory ─────────────────────────────────────────────

function makeInstitution(overrides: Partial<Institution> = {}): Institution {
  return {
    id: 'md-test',
    slug: 'test',
    name: 'Test Institution',
    category: 'altele',
    meta: {
      version: '1.0',
      last_updated: '2024-01-01',
      keywords: ['test'],
      quality: 'draft',
    },
    location: { country_code: 'MD' },
    description: 'Test description',
    assets: {
      main: { type: 'horizontal' },
    },
    ...overrides,
  };
}

// ─── getPreferredCatalogKey ───────────────────────────────────────────────────

describe('getPreferredCatalogKey', () => {
  it('returns lowercased shortname when available', () => {
    expect(getPreferredCatalogKey({ slug: 'guvern', shortname: 'Guvern' })).toBe('guvern');
  });

  it('returns shortname (acronym) over slug', () => {
    expect(
      getPreferredCatalogKey({ slug: 'ministerul-justitiei', shortname: 'MJ' })
    ).toBe('mj');
  });

  it('falls back to slug when shortname is empty string', () => {
    expect(getPreferredCatalogKey({ slug: 'some-slug', shortname: '' })).toBe('some-slug');
  });

  it('falls back to slug when shortname is undefined', () => {
    expect(getPreferredCatalogKey({ slug: 'some-slug', shortname: undefined })).toBe('some-slug');
  });

  it('removes diacritics from shortname', () => {
    expect(
      getPreferredCatalogKey({ slug: 'primaria-chisinau', shortname: 'Primăria Chișinău' })
    ).toBe('primaria-chisinau');
  });
});

// ─── buildCatalogPathMap ──────────────────────────────────────────────────────

describe('buildCatalogPathMap', () => {
  it('maps a single institution to its preferred key', () => {
    const result = buildCatalogPathMap([{ slug: 'a', shortname: 'A' }]);
    expect(result).toEqual({ a: 'a' });
  });

  it('uses slug fallback for second institution with colliding preferred key', () => {
    const institutions = [
      { slug: 'a', shortname: 'X' },
      { slug: 'b', shortname: 'X' },
    ];
    const result = buildCatalogPathMap(institutions);
    // First gets 'x', second falls back to slug 'b'
    expect(result['a']).toBe('x');
    expect(result['b']).toBe('b');
  });

  it('uses numbered suffix when all options collide for third institution', () => {
    // All three have the same preferred key AND the same slug collision target
    const institutions = [
      { slug: 'x', shortname: 'X' },    // gets 'x'
      { slug: 'x-2', shortname: 'X' },  // preferred 'x' taken, slug 'x-2' available
      { slug: 'x-3', shortname: 'X' },  // preferred 'x' taken, slug 'x-3' available
    ];
    const result = buildCatalogPathMap(institutions);
    expect(result['x']).toBe('x');
    expect(result['x-2']).toBe('x-2');
    expect(result['x-3']).toBe('x-3');
  });

  it('assigns numbered suffix when both preferred key and slug fallback are taken', () => {
    // inst1: slug='q', shortname='Q' → preferred='q' → gets 'q', used={'q'}
    // inst2: slug='q-alt', shortname='Q' → preferred='q' (taken), slug 'q-alt' free → gets 'q-alt'
    // inst3: slug='q-alt', shortname='Q-alt' → preferred='q-alt' (taken), slug 'q-alt' (taken) → numbered: 'q-alt-2'
    const institutions = [
      { slug: 'q', shortname: 'Q' },
      { slug: 'q-alt', shortname: 'Q' },
      { slug: 'q-alt', shortname: 'Q-alt' },
    ];
    const result = buildCatalogPathMap(institutions);
    expect(result['q']).toBe('q');
    expect(result['q-alt']).toBe('q-alt-2');
  });
});

// ─── getPrimaryLogoPath ───────────────────────────────────────────────────────

describe('getPrimaryLogoPath', () => {
  it('returns CDN URL for main.color path', () => {
    const inst = makeInstitution({
      assets: {
        main: { type: 'horizontal', color: '/logos/foo-color.svg' },
      },
    });
    const result = getPrimaryLogoPath(inst);
    expect(result).not.toBeNull();
    expect(result).toContain('jsdelivr.net');
    expect(result).toContain('/logos/foo-color.svg');
  });

  it('returns CDN URL for main.dark_mode when no color', () => {
    const inst = makeInstitution({
      assets: {
        main: { type: 'horizontal', dark_mode: '/logos/foo-dark.svg' },
      },
    });
    const result = getPrimaryLogoPath(inst);
    expect(result).not.toBeNull();
    expect(result).toContain('jsdelivr.net');
    expect(result).toContain('/logos/foo-dark.svg');
  });

  it('returns null when main has no SVG variants', () => {
    const inst = makeInstitution({
      assets: { main: { type: 'horizontal' } },
    });
    expect(getPrimaryLogoPath(inst)).toBeNull();
  });
});

// ─── hasSvg ───────────────────────────────────────────────────────────────────

describe('hasSvg', () => {
  it('returns true when main.color is set', () => {
    const inst = makeInstitution({
      assets: { main: { type: 'horizontal', color: '/logos/foo.svg' } },
    });
    expect(hasSvg(inst)).toBe(true);
  });

  it('returns true when only horizontal.white is set', () => {
    const inst = makeInstitution({
      assets: {
        main: { type: 'horizontal' },
        horizontal: { type: 'horizontal', white: '/logos/foo-white.svg' },
      },
    });
    expect(hasSvg(inst)).toBe(true);
  });

  it('returns false when no SVG variants exist (only PNG)', () => {
    const inst = makeInstitution({
      assets: {
        main: {
          type: 'horizontal',
          png: { path: '/logos/foo.png', width: 200, height: 100 },
        },
      },
    });
    expect(hasSvg(inst)).toBe(false);
  });
});

// ─── formatRgb ────────────────────────────────────────────────────────────────

describe('formatRgb', () => {
  it('formats RGB tuple as css rgb() string', () => {
    expect(formatRgb([0, 73, 144])).toBe('rgb(0, 73, 144)');
  });
});

// ─── getSiteUrl ───────────────────────────────────────────────────────────────

describe('getSiteUrl', () => {
  it('removes trailing slash from provided URL', () => {
    expect(getSiteUrl('https://identitate.md/')).toBe('https://identitate.md');
  });

  it('returns default URL when called with undefined', () => {
    expect(getSiteUrl(undefined)).toBe('https://identitate.md');
  });
});
