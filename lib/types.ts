import type { z } from 'zod';
import type { draftSchema, ticketSnapshotSchema } from './booking-schema';
import type { eventInputSchema } from './event-schema';

// Shapes the repo sends to the browser (see lib/server/repo/mappers.ts).

export interface Tier {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  capacity: number;
  sold: number;
  remaining: number;
}

export interface PublicEvent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  venue: string;
  startsAt: string;
  timeZone: string;
  currency: string;
  maxPerOrder: number;
  ticketPrefix: string;
  accentColor: string;
  requirePhoto: boolean;
  extraQuestion: string | null;
  hostName: string | null;
  listed: boolean;
  published: boolean;
  isPast: boolean;
  tiers: Tier[];
}

export interface Attendee {
  code: string;
  name: string;
  email: string;
  avatarUrl: string;
  tierName: string;
  quantity: number;
  unitPriceMinor: number;
  extraAnswer: string;
  bookedAt: string;
  checkedInAt: string | null;
}

export type TicketSnapshot = z.infer<typeof ticketSnapshotSchema> & { checkedInAt?: string | null };
export type Draft = z.infer<typeof draftSchema>;

export type EventInput = z.output<typeof eventInputSchema>;
export type EventFormValues = z.input<typeof eventInputSchema>;

/** The parts of an event the booking schemas depend on. */
export interface BookingRules {
  tiers: ReadonlyArray<{ id: string }>;
  maxPerOrder: number;
  requirePhoto: boolean;
}

export type ActionFailure = { ok: false; code: string; error: string; field?: string };
export type ActionResult<T extends object = object> = ({ ok: true } & T) | ActionFailure;
