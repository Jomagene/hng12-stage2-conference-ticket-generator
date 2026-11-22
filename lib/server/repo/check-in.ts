import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import type { Attendee } from '@/lib/types';
import { ticketTiers, tickets } from '../db/schema';
import type { Db } from '../db/types';

export type CheckInResult =
  { status: 'checked_in' | 'already_checked_in'; attendee: Attendee } | { status: 'not_found'; attendee?: undefined };
import { normalizeCode } from './bookings';
import { toAttendee } from './mappers';

async function attendeeByCode(db: Db, eventId: string, code: string) {
  const [found] = await db
    .select({ ticket: tickets, tier: ticketTiers })
    .from(tickets)
    .innerJoin(ticketTiers, eq(tickets.tierId, ticketTiers.id))
    .where(and(eq(tickets.eventId, eventId), eq(tickets.code, code)))
    .limit(1);
  return found ? toAttendee(found.ticket, found.tier) : null;
}

export async function checkInTicket(
  db: Db,
  eventId: string,
  rawCode: unknown,
  { now = new Date() } = {},
): Promise<CheckInResult> {
  const code = normalizeCode(rawCode);
  const updated = await db
    .update(tickets)
    .set({ checkedInAt: now })
    .where(and(eq(tickets.eventId, eventId), eq(tickets.code, code), isNull(tickets.checkedInAt)))
    .returning({ id: tickets.id });

  const attendee = await attendeeByCode(db, eventId, code);
  if (!attendee) return { status: 'not_found' };
  return { status: updated.length > 0 ? 'checked_in' : 'already_checked_in', attendee };
}

export async function undoCheckIn(db: Db, eventId: string, rawCode: unknown) {
  await db
    .update(tickets)
    .set({ checkedInAt: null })
    .where(and(eq(tickets.eventId, eventId), eq(tickets.code, normalizeCode(rawCode)), isNotNull(tickets.checkedInAt)));
}
