import { describe, it, expect } from 'vitest';
import {
  resolveAssetPath,
  getAssetFallbackUrls,
  hasCdnUrls,
  toLocalLogosPath,
  CDN_VERSION,
} from './cdn-helpers';

describe('resolveAssetPath', () => {
  it('returns null for undefined', () => {
    expect(resolveAssetPath(undefined)).toBeNull();
  });

  it('returns local path when preferCdn is false', () => {
    expect(resolveAssetPath('/logos/foo.svg', false)).toBe('/logos/foo.svg');
  });

  it('returns CDN URL containing jsdelivr.net and path when preferCdn is true', () => {
    const result = resolveAssetPath('/logos/foo.svg', true);
    expect(result).toContain('jsdelivr.net');
    expect(result).toContain('/logos/foo.svg');
  });

  it('returns cdn_primary when preferCdn is true and object has CDN URLs', () => {
    const asset = {
      cdn_primary: 'https://cdn1.com/a.svg',
      cdn_fallback: 'https://cdn2.com/a.svg',
      local: '/logos/a.svg',
    };
    expect(resolveAssetPath(asset, true)).toBe('https://cdn1.com/a.svg');
  });

  it('returns local path when preferCdn is false and object has CDN URLs', () => {
    const asset = {
      cdn_primary: 'https://cdn1.com/a.svg',
      cdn_fallback: 'https://cdn2.com/a.svg',
      local: '/logos/a.svg',
    };
    expect(resolveAssetPath(asset, false)).toBe('/logos/a.svg');
  });
});

describe('getAssetFallbackUrls', () => {
  it('returns [] for undefined', () => {
    expect(getAssetFallbackUrls(undefined)).toEqual([]);
  });

  it('returns array with 3 items for /logos/ path: jsdelivr, unpkg, local', () => {
    const result = getAssetFallbackUrls('/logos/foo.svg');
    expect(result).toHaveLength(3);
    expect(result[0]).toContain('jsdelivr.net');
    expect(result[1]).toContain('unpkg.com');
    expect(result[2]).toBe('/logos/foo.svg');
  });

  it('returns [path] for non-logos path without CDN', () => {
    const result = getAssetFallbackUrls('/other/path.svg');
    expect(result).toEqual(['/other/path.svg']);
  });
});

describe('hasCdnUrls', () => {
  it('returns false for undefined', () => {
    expect(hasCdnUrls(undefined)).toBe(false);
  });

  it('returns false for a string path', () => {
    expect(hasCdnUrls('/logos/foo.svg')).toBe(false);
  });

  it('returns true for an object with cdn_primary and cdn_fallback', () => {
    expect(
      hasCdnUrls({ cdn_primary: 'x', cdn_fallback: 'y', local: 'z' })
    ).toBe(true);
  });
});

describe('toLocalLogosPath', () => {
  it('returns null for null', () => {
    expect(toLocalLogosPath(null)).toBeNull();
  });

  it('returns the same path if already a local logos path', () => {
    expect(toLocalLogosPath('/logos/foo.svg')).toBe('/logos/foo.svg');
  });

  it('converts jsdelivr CDN URL to local logos path', () => {
    const url = `https://cdn.jsdelivr.net/npm/@identitate-md/logos@1.3.0/logos/foo.svg`;
    expect(toLocalLogosPath(url)).toBe('/logos/foo.svg');
  });

  it('converts unpkg CDN URL to local logos path', () => {
    const url = `https://unpkg.com/@identitate-md/logos@1.3.0/logos/foo.svg`;
    expect(toLocalLogosPath(url)).toBe('/logos/foo.svg');
  });
});
