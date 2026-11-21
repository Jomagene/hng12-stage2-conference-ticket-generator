import { fromMinorUnits } from '@/lib/money';
import { utcToZonedLocal } from '@/lib/timezone';

// Rows -> plain objects that are safe to send to the browser.

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

export function toEvent(row, tierRows, now) {
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

export function toTicketSnapshot(ticket, event, tier) {
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

export function toAttendee(ticket, tier) {
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
