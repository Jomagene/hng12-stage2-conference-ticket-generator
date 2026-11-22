import { and, desc, eq, sql } from 'drizzle-orm';
import { makeBookingSchema } from '@/lib/booking-schema';
import { createTicketId } from '@/lib/ticket-id';
import type { TicketSnapshot } from '@/lib/types';
import { events, ticketTiers, tickets } from '../db/schema';
import type { Db } from '../db/types';
import { DomainError, isUniqueViolation, validationError } from './errors';
import { findEventBySlug } from './events';
import { toAttendee, toTicketSnapshot } from './mappers';

// Seats are reserved with one conditional UPDATE so concurrent bookings can't oversell.
export async function bookTicket(
  db: Db,
  slug: string,
  raw: unknown,
  { now = new Date(), createCode }: { now?: Date; createCode?: () => string } = {},
): Promise<TicketSnapshot> {
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

export const normalizeCode = (code: unknown) =>
  String(code ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 40);

export async function getTicketByCode(db: Db, code: string): Promise<TicketSnapshot | null> {
  const [found] = await db
    .select({ ticket: tickets, event: events, tier: ticketTiers })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTiers, eq(tickets.tierId, ticketTiers.id))
    .where(eq(tickets.code, normalizeCode(code)))
    .limit(1);
  return found ? toTicketSnapshot(found.ticket, found.event, found.tier) : null;
}

export async function listAttendees(db: Db, eventId: string) {
  const rows = await db
    .select({ ticket: tickets, tier: ticketTiers })
    .from(tickets)
    .innerJoin(ticketTiers, eq(tickets.tierId, ticketTiers.id))
    .where(eq(tickets.eventId, eventId))
    .orderBy(desc(tickets.createdAt));
  return rows.map(({ ticket, tier }) => toAttendee(ticket, tier));
}
