import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { and, asc, desc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { firstIssueMessage, makeBookingSchema } from '@/lib/booking-schema';
import { eventInputSchema } from '@/lib/event-schema';
import { fromMinorUnits, toMinorUnits } from '@/lib/money';
import { RESERVED_SLUGS, slugify, ticketPrefixFor } from '@/lib/slug';
import { createTicketId } from '@/lib/ticket-id';
import { utcToZonedLocal, zonedLocalToUtc } from '@/lib/timezone';
import { events, ticketTiers, tickets } from './db/schema';

// All queries take `db` first so tests can pass an in-memory database.

// Expected failure; the message is shown to the user.
export class DomainError extends Error {
  constructor(code, message, field) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.field = field;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Manage tokens
// ---------------------------------------------------------------------------

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export const createManageToken = () => randomBytes(24).toString('base64url');

export function verifyManageToken(eventRow, token) {
  if (!eventRow?.manageTokenHash || typeof token !== 'string' || token.length < 16) return false;
  const expected = Buffer.from(eventRow.manageTokenHash, 'hex');
  const actual = Buffer.from(hashToken(token), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ---------------------------------------------------------------------------
// Mapping rows → plain objects that are safe to send to the browser
// ---------------------------------------------------------------------------

function toTier(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceMinor: row.priceMinor,
    capacity: row.capacity,
    sold: row.sold,
    remaining: row.capacity - row.sold,
  };
}

function toEvent(row, tierRows, now) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    venue: row.venue,
    startsAt: row.startsAt.toISOString(),
    timeZone: row.timeZone,
    currency: row.currency,
    maxPerOrder: row.maxPerOrder,
    ticketPrefix: row.ticketPrefix,
    accentColor: row.accentColor,
    requirePhoto: row.requirePhoto,
    extraQuestion: row.extraQuestion || null,
    hostName: row.hostName || null,
    listed: row.listed,
    published: row.published,
    isPast: row.startsAt.getTime() < now.getTime(),
    tiers: tierRows.map(toTier),
  };
}

function toTicketSnapshot(ticket, event, tier) {
  return {
    code: ticket.code,
    eventSlug: event.slug,
    event: {
      name: event.name,
      venue: event.venue,
      startsAt: new Date(event.startsAt).toISOString(),
      timeZone: event.timeZone,
      accentColor: event.accentColor,
      extraQuestion: event.extraQuestion || null,
    },
    tierName: tier.name,
    quantity: ticket.quantity,
    name: ticket.name,
    email: ticket.email,
    avatarUrl: ticket.avatarUrl ?? '',
    extraAnswer: ticket.extraAnswer ?? '',
    bookedAt: ticket.createdAt.toISOString(),
    checkedInAt: ticket.checkedInAt?.toISOString() ?? null,
  };
}

function toAttendee(ticket, tier) {
  return {
    code: ticket.code,
    name: ticket.name,
    email: ticket.email,
    avatarUrl: ticket.avatarUrl ?? '',
    tierName: tier.name,
    quantity: ticket.quantity,
    unitPriceMinor: ticket.unitPriceMinor,
    extraAnswer: ticket.extraAnswer,
    bookedAt: ticket.createdAt.toISOString(),
    checkedInAt: ticket.checkedInAt?.toISOString() ?? null,
  };
}

export function toEventFormValues(event) {
  return {
    name: event.name,
    tagline: event.tagline,
    venue: event.venue,
    startsAtLocal: utcToZonedLocal(event.startsAt, event.timeZone),
    timeZone: event.timeZone,
    currency: event.currency,
    maxPerOrder: event.maxPerOrder,
    accentColor: event.accentColor,
    requirePhoto: event.requirePhoto,
    extraQuestion: event.extraQuestion ?? '',
    hostName: event.hostName ?? '',
    listed: event.listed,
    published: event.published,
    tiers: event.tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      price: fromMinorUnits(tier.priceMinor, event.currency),
      capacity: tier.capacity,
      sold: tier.sold,
    })),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUniqueViolation(error) {
  return (error?.code ?? error?.cause?.code) === '23505';
}

function validationError(error) {
  const issue = error.issues[0];
  return new DomainError('INVALID', firstIssueMessage(error), issue?.path?.join('.'));
}

async function tiersByEvent(db, eventIds) {
  const map = new Map(eventIds.map((id) => [id, []]));
  if (eventIds.length === 0) return map;
  const rows = await db
    .select()
    .from(ticketTiers)
    .where(inArray(ticketTiers.eventId, eventIds))
    .orderBy(asc(ticketTiers.position));
  for (const row of rows) map.get(row.eventId).push(row);
  return map;
}

function parseEventInput(raw) {
  const result = eventInputSchema.safeParse(raw);
  if (!result.success) throw validationError(result.error);
  const input = result.data;
  return { input, startsAt: zonedLocalToUtc(input.startsAtLocal, input.timeZone) };
}

function eventColumns(input, startsAt) {
  return {
    name: input.name,
    tagline: input.tagline,
    venue: input.venue,
    startsAt,
    timeZone: input.timeZone,
    currency: input.currency,
    maxPerOrder: input.maxPerOrder,
    accentColor: input.accentColor.toUpperCase(),
    requirePhoto: input.requirePhoto,
    extraQuestion: input.extraQuestion || null,
    hostName: input.hostName || null,
    listed: input.listed,
    published: input.published,
  };
}

function tierColumns(tier, position, currency) {
  return {
    name: tier.name,
    description: tier.description,
    priceMinor: toMinorUnits(tier.price, currency),
    capacity: tier.capacity,
    position,
  };
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function listPublicEvents(db, { now = new Date(), limit = 100 } = {}) {
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.listed, true), eq(events.published, true)))
    .orderBy(asc(events.startsAt))
    .limit(limit);
  const tiers = await tiersByEvent(
    db,
    rows.map((r) => r.id),
  );
  const all = rows.map((row) => toEvent(row, tiers.get(row.id), now));
  return { upcoming: all.filter((e) => !e.isPast), past: all.filter((e) => e.isPast).reverse() };
}

// Also returns the raw row, needed for token checks.
export async function findEventBySlug(db, slug, { includeUnpublished = false, now = new Date() } = {}) {
  if (typeof slug !== 'string' || slug.length > 80) return null;
  const [row] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  if (!row || (!includeUnpublished && !row.published)) return null;
  const tiers = await tiersByEvent(db, [row.id]);
  return { row, event: toEvent(row, tiers.get(row.id), now) };
}

export async function getPublicEvent(db, slug, options) {
  return (await findEventBySlug(db, slug, options))?.event ?? null;
}

export async function getEventsForCredentials(db, credentials, { now = new Date() } = {}) {
  const valid = credentials.filter((c) => UUID.test(c.eventId));
  if (valid.length === 0) return [];
  const rows = await db
    .select()
    .from(events)
    .where(
      inArray(
        events.id,
        valid.map((c) => c.eventId),
      ),
    );
  const tokenById = new Map(valid.map((c) => [c.eventId, c.token]));
  const allowed = rows.filter((row) => verifyManageToken(row, tokenById.get(row.id)));
  const tiers = await tiersByEvent(
    db,
    allowed.map((r) => r.id),
  );
  return allowed
    .map((row) => toEvent(row, tiers.get(row.id), now))
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
}

// The token is only returned here; we store its hash.
export async function createEvent(db, raw, { now = new Date(), createToken = createManageToken } = {}) {
  const { input, startsAt } = parseEventInput(raw);
  if (startsAt <= now) throw new DomainError('INVALID', 'The event date must be in the future.', 'startsAtLocal');

  const manageToken = createToken();
  const base = slugify(input.name);

  for (let attempt = 0; attempt < 6; attempt++) {
    const slug =
      attempt === 0 && !RESERVED_SLUGS.has(base) ? base : `${base.slice(0, 40)}-${randomBytes(3).toString('hex')}`;
    try {
      const event = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(events)
          .values({
            ...eventColumns(input, startsAt),
            slug,
            ticketPrefix: ticketPrefixFor(input.name, startsAt),
            manageTokenHash: hashToken(manageToken),
            createdAt: now,
            updatedAt: now,
          })
          .returning();
        const tierRows = await tx
          .insert(ticketTiers)
          .values(input.tiers.map((tier, i) => ({ ...tierColumns(tier, i, input.currency), eventId: row.id })))
          .returning();
        return toEvent(
          row,
          tierRows.sort((a, b) => a.position - b.position),
          now,
        );
      });
      return { event, manageToken };
    } catch (error) {
      if (isUniqueViolation(error)) continue; // slug taken, retry with a suffix
      throw error;
    }
  }
  throw new Error('Could not allocate a unique event URL.');
}

export async function updateEvent(db, eventId, raw, { now = new Date() } = {}) {
  const { input, startsAt } = parseEventInput(raw);

  await db.transaction(async (tx) => {
    const [current] = await tx.select().from(events).where(eq(events.id, eventId)).for('update');
    if (!current) throw new DomainError('NOT_FOUND', 'Event not found.');
    const existing = await tx.select().from(ticketTiers).where(eq(ticketTiers.eventId, eventId)).for('update');
    const existingById = new Map(existing.map((tier) => [tier.id, tier]));

    if (input.currency !== current.currency && existing.some((tier) => tier.sold > 0)) {
      throw new DomainError('INVALID', 'The currency cannot change once tickets are booked.', 'currency');
    }

    const keptIds = new Set();
    input.tiers.forEach((tier, i) => {
      if (!tier.id) return;
      const previous = existingById.get(tier.id);
      if (!previous) throw new DomainError('CONFLICT', 'A ticket type was removed elsewhere. Reload and try again.');
      if (tier.capacity < previous.sold) {
        throw new DomainError(
          'INVALID',
          `"${tier.name}" already has ${previous.sold} booked, so capacity can't go below that.`,
          `tiers.${i}.capacity`,
        );
      }
      keptIds.add(tier.id);
    });

    const removed = existing.filter((tier) => !keptIds.has(tier.id));
    const removedWithSales = removed.find((tier) => tier.sold > 0);
    if (removedWithSales) {
      throw new DomainError(
        'INVALID',
        `"${removedWithSales.name}" has bookings and can't be removed. Lower its capacity instead.`,
      );
    }

    await tx
      .update(events)
      .set({ ...eventColumns(input, startsAt), updatedAt: now })
      .where(eq(events.id, eventId));
    if (removed.length > 0) {
      await tx.delete(ticketTiers).where(
        inArray(
          ticketTiers.id,
          removed.map((tier) => tier.id),
        ),
      );
    }
    for (const [i, tier] of input.tiers.entries()) {
      const values = tierColumns(tier, i, input.currency);
      if (tier.id) await tx.update(ticketTiers).set(values).where(eq(ticketTiers.id, tier.id));
      else await tx.insert(ticketTiers).values({ ...values, eventId });
    }
  });
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

// Seats are reserved with one conditional UPDATE so concurrent bookings can't oversell.
export async function bookTicket(db, slug, raw, { now = new Date(), createCode } = {}) {
  const found = await findEventBySlug(db, slug, { now });
  if (!found) throw new DomainError('NOT_FOUND', 'This event is not available for booking.');
  const { row, event } = found;
  if (event.isPast) throw new DomainError('CLOSED', 'This event has already taken place.');

  const result = makeBookingSchema(event).safeParse(raw);
  if (!result.success) throw validationError(result.error);
  const input = result.data;
  const nextCode = createCode ?? (() => createTicketId(row.ticketPrefix));

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        const [tier] = await tx
          .update(ticketTiers)
          .set({ sold: sql`${ticketTiers.sold} + ${input.quantity}` })
          .where(
            and(
              eq(ticketTiers.id, input.tierId),
              eq(ticketTiers.eventId, row.id),
              sql`${ticketTiers.sold} + ${input.quantity} <= ${ticketTiers.capacity}`,
            ),
          )
          .returning();
        if (!tier) {
          throw new DomainError('SOLD_OUT', 'Not enough spots are left for this ticket type.', 'tierId');
        }

        const [ticket] = await tx
          .insert(tickets)
          .values({
            code: nextCode(),
            eventId: row.id,
            tierId: tier.id,
            quantity: input.quantity,
            unitPriceMinor: tier.priceMinor,
            name: input.name,
            email: input.email,
            avatarUrl: input.avatarUrl || null,
            extraAnswer: event.extraQuestion ? input.extraAnswer : '',
            createdAt: now,
          })
          .returning();
        return toTicketSnapshot(ticket, event, tier);
      });
    } catch (error) {
      if (isUniqueViolation(error)) continue; // code collision, retry
      throw error;
    }
  }
  throw new Error('Could not allocate a unique ticket code.');
}

const normaliseCode = (code) =>
  String(code ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 40);

export async function getTicketByCode(db, code) {
  const [found] = await db
    .select({ ticket: tickets, event: events, tier: ticketTiers })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTiers, eq(tickets.tierId, ticketTiers.id))
    .where(eq(tickets.code, normaliseCode(code)))
    .limit(1);
  return found ? toTicketSnapshot(found.ticket, found.event, found.tier) : null;
}

export async function listAttendees(db, eventId) {
  const rows = await db
    .select({ ticket: tickets, tier: ticketTiers })
    .from(tickets)
    .innerJoin(ticketTiers, eq(tickets.tierId, ticketTiers.id))
    .where(eq(tickets.eventId, eventId))
    .orderBy(desc(tickets.createdAt));
  return rows.map(({ ticket, tier }) => toAttendee(ticket, tier));
}

async function attendeeByCode(db, eventId, code) {
  const [found] = await db
    .select({ ticket: tickets, tier: ticketTiers })
    .from(tickets)
    .innerJoin(ticketTiers, eq(tickets.tierId, ticketTiers.id))
    .where(and(eq(tickets.eventId, eventId), eq(tickets.code, code)))
    .limit(1);
  return found ? toAttendee(found.ticket, found.tier) : null;
}

export async function checkInTicket(db, eventId, rawCode, { now = new Date() } = {}) {
  const code = normaliseCode(rawCode);
  const updated = await db
    .update(tickets)
    .set({ checkedInAt: now })
    .where(and(eq(tickets.eventId, eventId), eq(tickets.code, code), isNull(tickets.checkedInAt)))
    .returning({ id: tickets.id });

  const attendee = await attendeeByCode(db, eventId, code);
  if (!attendee) return { status: 'not_found' };
  return { status: updated.length > 0 ? 'checked_in' : 'already_checked_in', attendee };
}

export async function undoCheckIn(db, eventId, rawCode) {
  await db
    .update(tickets)
    .set({ checkedInAt: null })
    .where(and(eq(tickets.eventId, eventId), eq(tickets.code, normaliseCode(rawCode)), isNotNull(tickets.checkedInAt)));
}
