import { describe, expect, it } from 'vitest';
import { parseUsageEvent, parseUsageField, usageDayKey, usageField } from './usage-event.js';

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
});
