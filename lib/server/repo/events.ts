import { randomBytes } from 'node:crypto';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { eventInputSchema } from '@/lib/event-schema';
import { toMinorUnits } from '@/lib/money';
import { RESERVED_SLUGS, slugify, ticketPrefixFor } from '@/lib/slug';
import { zonedLocalToUtc } from '@/lib/timezone';
import type { EventInput, PublicEvent } from '@/lib/types';
import { events, ticketTiers } from '../db/schema';
import type { Db, EventRow, TierRow } from '../db/types';
import { DomainError, isUniqueViolation, validationError } from './errors';
import { toEvent } from './mappers';
import { createManageToken, hashToken, verifyManageToken } from './tokens';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function tiersByEvent(db: Db, eventIds: string[]) {
  const map = new Map<string, TierRow[]>(eventIds.map((id) => [id, []]));
  if (eventIds.length === 0) return map;
  const rows = await db
    .select()
    .from(ticketTiers)
    .where(inArray(ticketTiers.eventId, eventIds))
    .orderBy(asc(ticketTiers.position));
  for (const row of rows) map.get(row.eventId)?.push(row);
  return map;
}

function parseEventInput(raw: unknown) {
  const result = eventInputSchema.safeParse(raw);
  if (!result.success) throw validationError(result.error);
  const input = result.data;
  return { input, startsAt: zonedLocalToUtc(input.startsAtLocal, input.timeZone) };
}

function eventColumns(input: EventInput, startsAt: Date) {
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

function tierColumns(tier: EventInput['tiers'][number], position: number, currency: string) {
  return {
    name: tier.name,
    description: tier.description,
    priceMinor: toMinorUnits(tier.price, currency),
    capacity: tier.capacity,
    position,
  };
}

export async function listPublicEvents(db: Db, { now = new Date(), limit = 100 } = {}) {
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
  const all = rows.map((row) => toEvent(row, tiers.get(row.id) ?? [], now));
  return { upcoming: all.filter((e) => !e.isPast), past: all.filter((e) => e.isPast).reverse() };
}

// Also returns the raw row, needed for token checks.
export interface FindEventOptions {
  includeUnpublished?: boolean;
  now?: Date;
}

export async function findEventBySlug(
  db: Db,
  slug: unknown,
  { includeUnpublished = false, now = new Date() }: FindEventOptions = {},
): Promise<{ row: EventRow; event: PublicEvent } | null> {
  if (typeof slug !== 'string' || slug.length > 80) return null;
  const [row] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  if (!row || (!includeUnpublished && !row.published)) return null;
  const tiers = await tiersByEvent(db, [row.id]);
  return { row, event: toEvent(row, tiers.get(row.id) ?? [], now) };
}

export async function getPublicEvent(db: Db, slug: unknown, options?: FindEventOptions) {
  return (await findEventBySlug(db, slug, options))?.event ?? null;
}

export async function getEventsForCredentials(
  db: Db,
  credentials: Array<{ eventId: string; token: string }>,
  { now = new Date() } = {},
): Promise<PublicEvent[]> {
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
    .map((row) => toEvent(row, tiers.get(row.id) ?? [], now))
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
}

// The token is only returned here; we store its hash.
export async function createEvent(
  db: Db,
  raw: unknown,
  { now = new Date(), createToken = createManageToken } = {},
): Promise<{ event: PublicEvent; manageToken: string }> {
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

export async function updateEvent(db: Db, eventId: string, raw: unknown, { now = new Date() } = {}) {
  const { input, startsAt } = parseEventInput(raw);

  await db.transaction(async (tx) => {
    const [current] = await tx.select().from(events).where(eq(events.id, eventId)).for('update');
    if (!current) throw new DomainError('NOT_FOUND', 'Event not found.');
    const existing = await tx.select().from(ticketTiers).where(eq(ticketTiers.eventId, eventId)).for('update');
    const existingById = new Map(existing.map((tier) => [tier.id, tier]));

    if (input.currency !== current.currency && existing.some((tier) => tier.sold > 0)) {
      throw new DomainError('INVALID', 'The currency cannot change once tickets are booked.', 'currency');
    }

    const keptIds = new Set<string>();
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
