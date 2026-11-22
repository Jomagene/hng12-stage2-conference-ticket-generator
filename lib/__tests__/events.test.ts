import { describe, expect, it } from 'vitest';
import type { PublicEvent, Tier } from '../types';
import { attendeeTotals, availability, maxQuantity, priceSummary, resolveTier, seatTotals } from '../events';

const tier = (id: string, priceMinor: number, capacity: number, sold = 0): Tier => ({
  id,
  name: id,
  description: '',
  priceMinor,
  capacity,
  sold,
  remaining: capacity - sold,
});
const event = (tiers: Tier[], extra: Partial<PublicEvent> = {}) => ({
  tiers,
  currency: 'USD',
  maxPerOrder: 5,
  isPast: false,
  ...extra,
});

describe('seat and attendee totals', () => {
  it('sums seats across tiers', () => {
    expect(seatTotals(event([tier('a', 0, 10, 4), tier('b', 0, 5, 5)]))).toEqual({
      sold: 9,
      capacity: 15,
      remaining: 6,
    });
  });

  it('counts checked-in seats and booked value', () => {
    const attendees = [
      { quantity: 2, unitPriceMinor: 1000, checkedInAt: '2026-01-01T00:00:00Z' },
      { quantity: 1, unitPriceMinor: 500, checkedInAt: null },
    ];
    expect(attendeeTotals(attendees)).toEqual({ checkedIn: 2, bookedValueMinor: 2500 });
  });
});

describe('resolveTier and maxQuantity', () => {
  const e = event([tier('a', 0, 2, 2), tier('b', 0, 10, 8), tier('c', 0, 10)]);

  it('keeps the saved tier while it has spots, otherwise picks the first available', () => {
    expect(resolveTier(e, 'c')?.id).toBe('c');
    expect(resolveTier(e, 'a')?.id).toBe('b'); // sold out
    expect(resolveTier(e, 'gone')?.id).toBe('b');
    expect(resolveTier(event([tier('a', 0, 1, 1)]), 'a')).toBeNull();
  });

  it('caps quantity by the order limit and the seats left', () => {
    expect(maxQuantity(e, e.tiers[1])).toBe(2);
    expect(maxQuantity(e, e.tiers[2])).toBe(5);
    expect(maxQuantity(e, null)).toBe(1);
  });
});

describe('priceSummary', () => {
  it.each([
    [[0, 0], 'Free'],
    [[5000], '$50'],
    [[0, 5000], 'Free – $50'],
    [[2000, 5000], 'From $20'],
    [[], ''],
  ])('%j -> %s', (prices, expected) => {
    expect(priceSummary(event(prices.map((p, i) => tier(String(i), p, 10))))).toBe(expected);
  });
});

describe('availability', () => {
  it('reports ended, sold out, low and plenty', () => {
    expect(availability(event([tier('a', 0, 10)], { isPast: true })).label).toBe('Ended');
    expect(availability(event([tier('a', 0, 3, 3)])).label).toBe('Sold out');
    expect(availability(event([tier('a', 0, 10, 2)]))).toEqual({ label: 'Only 8 left', tone: 'warn' });
    expect(availability(event([tier('a', 0, 2000)])).label).toBe('2,000 spots left');
  });
});
