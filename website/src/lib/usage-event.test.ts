import { describe, expect, it } from 'vitest';
import { isAutomatedUserAgent, parseUsageEvent, parseUsageField, usageDayKey, usageField } from './usage-event.js';

describe('usage-event', () => {
  it('accepts a valid event', () => {
    expect(parseUsageEvent({ event: 'download', institution: 'md-mc', asset: 'vertical:white' })).toEqual({
      event: 'download', institution: 'md-mc', asset: 'vertical:white',
    });
  });

  it('defaults a missing asset', () => {
    expect(parseUsageEvent({ event: 'zip', institution: 'utm' })?.asset).toBe('-');
  });

  it('rejects unknown events, bad slugs and bad assets', () => {
    expect(parseUsageEvent({ event: 'hack', institution: 'utm' })).toBeNull();
    expect(parseUsageEvent({ event: 'copy', institution: 'UTM/../x' })).toBeNull();
    expect(parseUsageEvent({ event: 'copy', institution: 'utm', asset: 'a|b' })).toBeNull();
    expect(parseUsageEvent(null)).toBeNull();
  });

  it('round-trips a field and builds a UTC day key', () => {
    const parsed = { event: 'copy', institution: 'utm', asset: '/logos/utm/utm.svg' };
    expect(parseUsageField(usageField(parsed))).toEqual(parsed);
    expect(usageDayKey(new Date('2026-10-28T23:59:59Z'))).toBe('usage:2026-10-28');
  });

  it('flags automated user agents', () => {
    expect(isAutomatedUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isAutomatedUserAgent('curl/8.4.0')).toBe(true);
    expect(isAutomatedUserAgent('')).toBe(true);
    expect(isAutomatedUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15')).toBe(false);
  });
});
