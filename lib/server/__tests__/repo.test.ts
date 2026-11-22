import { sql } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { connectEmbedded } from '../db/connect';
import * as repo from '../repo';
import { UPLOAD } from '@/config/upload';
import type { PublicEvent } from '@/lib/types';
import type { Db } from '../db/types';

const NOW = new Date('2026-06-01T12:00:00Z');

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}
const AVATAR = `https://res.cloudinary.com/${UPLOAD.cloudName}/image/upload/v1/ada.jpg`;

function eventInput(overrides = {}) {
  return {
    name: 'Lagos Tech Meetup',
    tagline: 'Monthly talks and networking for builders.',
    venue: 'Yaba, Lagos',
    startsAtLocal: '2026-07-10T18:30',
    timeZone: 'Africa/Lagos',
    currency: 'NGN',
    maxPerOrder: 4,
    accentColor: '#e8505b',
    requirePhoto: true,
    extraQuestion: '',
    hostName: 'Ada',
    listed: true,
    published: true,
    tiers: [
      { name: 'General', description: 'Entry', price: 0, capacity: 3 },
      { name: 'VIP', description: 'Front row', price: 5000.5, capacity: 10 },
    ],
    ...overrides,
  };
}

function booking(event: PublicEvent, overrides: Record<string, unknown> = {}) {
  return {
    tierId: event.tiers[0].id,
    quantity: 1,
    name: 'Ada Lovelace',
    email: 'ADA@example.com',
    avatarUrl: AVATAR,
    extraAnswer: '',
    ...overrides,
  };
}

let db: Db;
beforeAll(async () => {
  db = await connectEmbedded(); // in-memory Postgres with real migrations
});
beforeEach(async () => {
  await db.execute(sql`TRUNCATE events, ticket_tiers, tickets CASCADE`);
});

describe('createEvent', () => {
  it('stores the event in UTC with prices in minor units and returns a one-time token', async () => {
    const { event, manageToken } = await repo.createEvent(db, eventInput(), { now: NOW });

    expect(event.slug).toBe('lagos-tech-meetup');
    expect(event.startsAt).toBe('2026-07-10T17:30:00.000Z'); // 18:30 WAT = 17:30 UTC
    expect(event.accentColor).toBe('#E8505B');
    expect(event.tiers.map((t) => [t.name, t.priceMinor, t.remaining])).toEqual([
      ['General', 0, 3],
      ['VIP', 500050, 10],
    ]);
    expect(manageToken.length).toBeGreaterThanOrEqual(32);

    const found = must(await repo.findEventBySlug(db, event.slug));
    expect(found.row.manageTokenHash).not.toContain(manageToken);
    expect(repo.verifyManageToken(found.row, manageToken)).toBe(true);
    expect(repo.verifyManageToken(found.row, 'x'.repeat(32))).toBe(false);
  });

  it('gives duplicate and reserved names a unique slug', async () => {
    const a = await repo.createEvent(db, eventInput(), { now: NOW });
    const b = await repo.createEvent(db, eventInput(), { now: NOW });
    const reserved = await repo.createEvent(db, eventInput({ name: 'New' }), { now: NOW });
    expect(b.event.slug).not.toBe(a.event.slug);
    expect(b.event.slug).toMatch(/^lagos-tech-meetup-[0-9a-f]{6}$/);
    expect(reserved.event.slug).toMatch(/^new-[0-9a-f]{6}$/);
  });

  it('rejects past dates and invalid input with a field-specific message', async () => {
    await expect(
      repo.createEvent(db, eventInput({ startsAtLocal: '2026-01-01T10:00' }), { now: NOW }),
    ).rejects.toMatchObject({
      code: 'INVALID',
      field: 'startsAtLocal',
    });
    await expect(repo.createEvent(db, eventInput({ tiers: [] }), { now: NOW })).rejects.toMatchObject({
      field: 'tiers',
    });
  });

  it('handles zero-decimal currencies', async () => {
    const { event } = await repo.createEvent(
      db,
      eventInput({ currency: 'XAF', tiers: [{ name: 'Standard', description: '', price: 5000, capacity: 5 }] }),
      { now: NOW },
    );
    expect(event.tiers[0].priceMinor).toBe(5000);
  });
});

describe('listPublicEvents', () => {
  it('lists only listed + published events, upcoming first', async () => {
    await repo.createEvent(db, eventInput({ name: 'Later', startsAtLocal: '2026-09-01T10:00' }), { now: NOW });
    await repo.createEvent(db, eventInput({ name: 'Sooner', startsAtLocal: '2026-07-01T10:00' }), { now: NOW });
    await repo.createEvent(db, eventInput({ name: 'Hidden', listed: false }), { now: NOW });
    await repo.createEvent(db, eventInput({ name: 'Draft', published: false }), { now: NOW });

    const { upcoming, past } = await repo.listPublicEvents(db, { now: NOW });
    expect(upcoming.map((e) => e.name)).toEqual(['Sooner', 'Later']);
    expect(past).toEqual([]);

    const afterwards = await repo.listPublicEvents(db, { now: new Date('2026-08-01T00:00:00Z') });
    expect(afterwards.past.map((e) => e.name)).toEqual(['Sooner']);
  });
});

describe('bookTicket', () => {
  it('books seats, normalizes input and records the price paid', async () => {
    const { event } = await repo.createEvent(db, eventInput(), { now: NOW });
    const ticket = await repo.bookTicket(db, event.slug, booking(event, { tierId: event.tiers[1].id, quantity: 2 }), {
      now: NOW,
      createCode: () => 'LTM26-TEST-0001',
    });

    expect(ticket).toMatchObject({ code: 'LTM26-TEST-0001', tierName: 'VIP', quantity: 2, email: 'ada@example.com' });
    const updated = must(await repo.getPublicEvent(db, event.slug, { now: NOW }));
    expect(updated.tiers[1]).toMatchObject({ sold: 2, remaining: 8 });
    const [attendee] = await repo.listAttendees(db, event.id);
    expect(attendee.unitPriceMinor).toBe(500050);
  });

  it('never oversells, even with concurrent bookings', async () => {
    const { event } = await repo.createEvent(db, eventInput(), { now: NOW }); // General has 3 seats
    const attempts = Array.from({ length: 6 }, (_, i) =>
      repo.bookTicket(db, event.slug, booking(event, { email: `p${i}@example.com` }), { now: NOW }).then(
        () => 'ok',
        (error) => error.code,
      ),
    );
    const results = await Promise.all(attempts);

    expect(results.filter((r) => r === 'ok')).toHaveLength(3);
    expect(results.filter((r) => r === 'SOLD_OUT')).toHaveLength(3);
    expect(must(await repo.getPublicEvent(db, event.slug, { now: NOW })).tiers[0].remaining).toBe(0);
  });

  it('enforces the per-event order limit and photo requirement', async () => {
    const { event } = await repo.createEvent(db, eventInput(), { now: NOW });
    await expect(repo.bookTicket(db, event.slug, booking(event, { quantity: 5 }), { now: NOW })).rejects.toMatchObject({
      code: 'INVALID',
      field: 'quantity',
    });
    await expect(
      repo.bookTicket(db, event.slug, booking(event, { avatarUrl: '' }), { now: NOW }),
    ).rejects.toMatchObject({
      field: 'avatarUrl',
    });
    await expect(
      repo.bookTicket(db, event.slug, booking(event, { avatarUrl: 'https://evil.example/a.jpg' }), { now: NOW }),
    ).rejects.toMatchObject({ field: 'avatarUrl' });
  });

  it('accepts no photo when the event does not require one, and stores custom answers', async () => {
    const { event } = await repo.createEvent(db, eventInput({ requirePhoto: false, extraQuestion: 'T-shirt size?' }), {
      now: NOW,
    });
    const ticket = await repo.bookTicket(db, event.slug, booking(event, { avatarUrl: '', extraAnswer: 'L' }), {
      now: NOW,
    });
    expect(ticket).toMatchObject({ avatarUrl: '', extraAnswer: 'L', event: { extraQuestion: 'T-shirt size?' } });
  });

  it('refuses bookings for past, unpublished or unknown events', async () => {
    const { event } = await repo.createEvent(db, eventInput(), { now: NOW });
    await expect(
      repo.bookTicket(db, event.slug, booking(event), { now: new Date('2027-01-01T00:00:00Z') }),
    ).rejects.toMatchObject({ code: 'CLOSED' });
    await expect(repo.bookTicket(db, 'nope', {}, { now: NOW })).rejects.toMatchObject({ code: 'NOT_FOUND' });

    const hidden = await repo.createEvent(db, eventInput({ name: 'Draft', published: false }), { now: NOW });
    await expect(repo.bookTicket(db, hidden.event.slug, booking(hidden.event), { now: NOW })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('rejects a tier from another event', async () => {
    const a = await repo.createEvent(db, eventInput(), { now: NOW });
    const b = await repo.createEvent(db, eventInput({ name: 'Other' }), { now: NOW });
    await expect(
      repo.bookTicket(db, a.event.slug, booking(a.event, { tierId: b.event.tiers[0].id }), { now: NOW }),
    ).rejects.toMatchObject({ code: 'INVALID', field: 'tierId' });
  });
});

describe('updateEvent', () => {
  async function bookedEvent() {
    const { event } = await repo.createEvent(db, eventInput(), { now: NOW });
    await repo.bookTicket(db, event.slug, booking(event, { quantity: 2 }), { now: NOW });
    return must(await repo.getPublicEvent(db, event.slug, { includeUnpublished: true, now: NOW }));
  }

  it('updates details and tiers, keeping bookings intact', async () => {
    const event = await bookedEvent();
    const values = repo.toEventFormValues(event);
    values.name = 'Lagos Tech Meetup — July';
    values.tiers[0].capacity = 50;
    values.tiers.push({ id: '', name: 'Student', description: '', price: 1000, capacity: 5 });

    await repo.updateEvent(db, event.id, values, { now: NOW });
    const updated = must(await repo.getPublicEvent(db, event.slug, { now: NOW }));
    expect(updated.name).toBe('Lagos Tech Meetup — July');
    expect(updated.slug).toBe(event.slug); // links keep working
    expect(updated.tiers.map((t) => [t.name, t.capacity, t.sold])).toEqual([
      ['General', 50, 2],
      ['VIP', 10, 0],
      ['Student', 5, 0],
    ]);
  });

  it('protects booked seats', async () => {
    const event = await bookedEvent();
    const lowerCapacity = repo.toEventFormValues(event);
    lowerCapacity.tiers[0].capacity = 1;
    await expect(repo.updateEvent(db, event.id, lowerCapacity)).rejects.toMatchObject({ field: 'tiers.0.capacity' });

    const removeBooked = repo.toEventFormValues(event);
    removeBooked.tiers = removeBooked.tiers.slice(1);
    await expect(repo.updateEvent(db, event.id, removeBooked)).rejects.toThrow(/has bookings/);

    const changeCurrency = repo.toEventFormValues(event);
    changeCurrency.currency = 'USD';
    await expect(repo.updateEvent(db, event.id, changeCurrency)).rejects.toMatchObject({ field: 'currency' });
  });

  it('allows removing a tier nobody booked', async () => {
    const event = await bookedEvent();
    const values = repo.toEventFormValues(event);
    values.tiers = values.tiers.slice(0, 1);
    await repo.updateEvent(db, event.id, values);
    expect(must(await repo.getPublicEvent(db, event.slug)).tiers).toHaveLength(1);
  });
});

describe('check-in', () => {
  it('checks a ticket in once and reports repeats and unknown codes', async () => {
    const { event } = await repo.createEvent(db, eventInput(), { now: NOW });
    const ticket = await repo.bookTicket(db, event.slug, booking(event), { now: NOW });

    const first = await repo.checkInTicket(db, event.id, ` ${ticket.code.toLowerCase()} `, { now: NOW });
    expect(first).toMatchObject({ status: 'checked_in', attendee: { name: 'Ada Lovelace', avatarUrl: AVATAR } });
    expect((await repo.checkInTicket(db, event.id, ticket.code)).status).toBe('already_checked_in');
    expect((await repo.checkInTicket(db, event.id, 'NOPE-0000')).status).toBe('not_found');

    await repo.undoCheckIn(db, event.id, ticket.code);
    expect((await repo.checkInTicket(db, event.id, ticket.code)).status).toBe('checked_in');
  });

  it("can't check in another event's ticket", async () => {
    const a = await repo.createEvent(db, eventInput(), { now: NOW });
    const b = await repo.createEvent(db, eventInput({ name: 'Other' }), { now: NOW });
    const ticket = await repo.bookTicket(db, a.event.slug, booking(a.event), { now: NOW });
    expect((await repo.checkInTicket(db, b.event.id, ticket.code)).status).toBe('not_found');
  });
});

describe('getEventsForCredentials', () => {
  it('returns only events whose token matches', async () => {
    const a = await repo.createEvent(db, eventInput(), { now: NOW });
    const b = await repo.createEvent(db, eventInput({ name: 'Other' }), { now: NOW });
    const result = await repo.getEventsForCredentials(db, [
      { eventId: a.event.id, token: a.manageToken },
      { eventId: b.event.id, token: a.manageToken },
      { eventId: 'not-a-uuid', token: 'x' },
    ]);
    expect(result.map((e) => e.id)).toEqual([a.event.id]);
  });
});

describe('getTicketByCode', () => {
  it('finds a ticket case-insensitively with its event snapshot', async () => {
    const { event } = await repo.createEvent(db, eventInput(), { now: NOW });
    const booked = await repo.bookTicket(db, event.slug, booking(event), { now: NOW });
    const found = await repo.getTicketByCode(db, booked.code.toLowerCase());
    expect(found).toMatchObject({ code: booked.code, eventSlug: event.slug, event: { name: event.name } });
    expect(await repo.getTicketByCode(db, 'missing')).toBeNull();
  });
});
