import { describe, expect, it } from 'vitest';
import { buildCatalogPathMap, getPreferredCatalogKey } from './catalog-paths.js';

describe('catalog-paths', () => {
  it('normalizes shortname into a safe catalog key', () => {
    expect(getPreferredCatalogKey({ slug: 'primaria-chisinau', shortname: 'Primăria Chișinău' })).toBe('primaria-chisinau');
  });

  it('falls back to slug when shortname is empty', () => {
    expect(getPreferredCatalogKey({ slug: 'md-test', shortname: '' })).toBe('md-test');
  });

  it('keeps unique catalog keys stable across collisions', () => {
    const result = buildCatalogPathMap([
      { slug: 'a', shortname: 'X' },
      { slug: 'b', shortname: 'X' },
      { slug: 'x-2', shortname: 'X' },
    ]);

    expect(result).toEqual({ a: 'x', b: 'b', 'x-2': 'x-2' });
  });
});
