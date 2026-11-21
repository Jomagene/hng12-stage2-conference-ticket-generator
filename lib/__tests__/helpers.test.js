import { describe, expect, it } from 'vitest';
import { makeAttendeeSchema, makeSelectionSchema } from '../booking-schema';
import { accentStyle, readableForegroundChannels } from '../color';
import { eventInputSchema } from '../event-schema';
import { formatEventDate, pluralize } from '../format';
import { currencyDigits, formatPrice, toMinorUnits } from '../money';
import { slugify, ticketPrefixFor } from '../slug';
import { createTicketId } from '../ticket-id';
import { isValidTimeZone, utcToZonedLocal, zonedLocalToUtc } from '../timezone';
import { validateImageFile } from '../upload-avatar';
import { newEventDefaults } from '@/config/event-options';

describe('time zones', () => {
  it('converts a wall-clock time to the exact instant', () => {
    expect(zonedLocalToUtc('2025-03-15T19:00', 'Africa/Lagos').toISOString()).toBe('2025-03-15T18:00:00.000Z');
    expect(zonedLocalToUtc('2025-01-15T09:00', 'America/New_York').toISOString()).toBe('2025-01-15T14:00:00.000Z');
    expect(zonedLocalToUtc('2025-07-15T09:00', 'America/New_York').toISOString()).toBe('2025-07-15T13:00:00.000Z'); // DST
  });

  it('round-trips through the form representation', () => {
    for (const tz of ['Africa/Lagos', 'Asia/Kolkata', 'America/Los_Angeles', 'UTC']) {
      expect(utcToZonedLocal(zonedLocalToUtc('2026-10-31T23:45', tz), tz)).toBe('2026-10-31T23:45');
    }
  });

  it('validates zone names', () => {
    expect(isValidTimeZone('Africa/Douala')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
  });
});

describe('money', () => {
  it('respects each currency’s minor unit', () => {
    expect(currencyDigits('USD')).toBe(2);
    expect(currencyDigits('XAF')).toBe(0);
    expect(toMinorUnits(150, 'USD')).toBe(15000);
    expect(toMinorUnits(19.99, 'USD')).toBe(1999);
    expect(toMinorUnits(5000, 'XAF')).toBe(5000);
  });

  it('formats prices', () => {
    expect(formatPrice(0, 'USD')).toBe('Free');
    expect(formatPrice(15000, 'USD')).toBe('$150');
    expect(formatPrice(1999, 'USD')).toBe('$19.99');
    expect(formatPrice(500000, 'NGN')).toBe('₦5,000');
    expect(formatPrice(5000, 'XAF').replace(/\s/g, ' ')).toBe('FCFA 5,000');
  });
});

describe('slugs and prefixes', () => {
  it('slugifies names', () => {
    expect(slugify('Techember Fest ”25!')).toBe('techember-fest-25');
    expect(slugify('Café Révolution')).toBe('cafe-revolution');
    expect(slugify('🎉🎉')).toBe('event');
  });

  it('derives ticket prefixes from the name and year', () => {
    expect(ticketPrefixFor('Techember Fest ”25', '2025-03-15T18:00:00Z')).toBe('TF25');
    expect(ticketPrefixFor('Harmattan Hack Night Live', '2027-01-23T18:00:00Z')).toBe('HHN27');
  });
});

describe('colors', () => {
  it('picks readable text for the brand color', () => {
    expect(readableForegroundChannels('#24A0B5')).toBe('255 255 255');
    expect(readableForegroundChannels('#F5E663')).toBe('2 25 29');
  });

  it('builds theme variables only for valid colors', () => {
    expect(accentStyle('#7C5CFF')).toEqual({ '--accent-rgb': '124 92 255', '--accent-fg-rgb': '255 255 255' });
    expect(accentStyle('red')).toBeUndefined();
  });
});

describe('createTicketId', () => {
  it('formats PREFIX-XXXX-XXXX from Crockford Base32', () => {
    expect(createTicketId('TF25')).toMatch(/^TF25-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(createTicketId('X', (bytes) => bytes.fill(31))).toBe('X-ZZZZ-ZZZZ');
  });

  it('does not repeat across many draws', () => {
    expect(new Set(Array.from({ length: 5000 }, () => createTicketId('T'))).size).toBe(5000);
  });
});

describe('format helpers', () => {
  it('renders dates in the given time zone', () => {
    expect(formatEventDate('2025-03-15T18:00:00Z', 'Africa/Lagos')).toBe('March 15, 2025 | 7:00 PM');
    expect(formatEventDate('2025-03-15T18:00:00Z', 'Asia/Tokyo')).toBe('March 16, 2025 | 3:00 AM');
  });

  it('pluralizes', () => {
    expect(pluralize(1, 'person', 'people')).toBe('1 person');
    expect(pluralize(1200, 'seat')).toBe('1,200 seats');
  });
});

describe('event input schema', () => {
  it('accepts a filled-in default event', () => {
    const values = {
      ...newEventDefaults(),
      name: 'Meetup',
      tagline: 'A friendly monthly meetup.',
      venue: 'Lagos',
      startsAtLocal: '2027-01-01T10:00',
    };
    expect(eventInputSchema.safeParse(values).success).toBe(true);
  });

  it('rejects bad colors, zones and empty tiers', () => {
    const base = {
      ...newEventDefaults(),
      name: 'Meetup',
      tagline: 'A friendly monthly meetup.',
      venue: 'Lagos',
      startsAtLocal: '2027-01-01T10:00',
    };
    expect(eventInputSchema.safeParse({ ...base, accentColor: 'teal' }).success).toBe(false);
    expect(eventInputSchema.safeParse({ ...base, timeZone: 'Nowhere/City' }).success).toBe(false);
    expect(eventInputSchema.safeParse({ ...base, tiers: [] }).success).toBe(false);
  });
});

describe('booking schemas are built per event', () => {
  const event = { tiers: [{ id: 't1' }, { id: 't2' }], maxPerOrder: 2, requirePhoto: false };
  const attendee = { name: 'Ada Lovelace', email: ' Ada@Example.COM ', avatarUrl: '', extraAnswer: '' };

  it('limits tiers and quantity to the event’s settings', () => {
    expect(makeSelectionSchema(event).safeParse({ tierId: 't2', quantity: '2' }).success).toBe(true);
    expect(makeSelectionSchema(event).safeParse({ tierId: 'other', quantity: 1 }).success).toBe(false);
    expect(makeSelectionSchema(event).safeParse({ tierId: 't1', quantity: 3 }).error.issues[0].message).toMatch(
      /up to 2/,
    );
  });

  it('makes the photo optional or required per event', () => {
    expect(makeAttendeeSchema(event).parse(attendee).email).toBe('ada@example.com');
    expect(makeAttendeeSchema({ ...event, requirePhoto: true }).safeParse(attendee).success).toBe(false);
  });
});

describe('validateImageFile', () => {
  it('accepts common photo types under the size limit and rejects others', () => {
    expect(validateImageFile({ type: 'image/jpeg', size: 2_000_000 })).toBeNull();
    expect(validateImageFile({ type: 'application/pdf', size: 10 })).toMatch(/JPG, PNG or WebP/);
    expect(validateImageFile({ type: 'image/png', size: 50 * 1024 * 1024 })).toMatch(/too large/);
  });
});
