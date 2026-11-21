import { z } from 'zod';
import { UPLOAD } from '@/config/upload';

// Built per event; used by both the booking form and the server action.

const AVATAR_PREFIX = `https://res.cloudinary.com/${UPLOAD.cloudName}/`;

const avatarUrl = z
  .url({ protocol: /^https$/, error: 'Please upload a profile photo.' })
  .refine((url) => url.startsWith(AVATAR_PREFIX), 'Please upload a profile photo.');

export function makeSelectionSchema(event) {
  const tierIds = new Set(event.tiers.map((tier) => tier.id));
  return z.object({
    tierId: z.string().refine((id) => tierIds.has(id), 'Choose a ticket type.'),
    quantity: z.coerce
      .number()
      .int()
      .min(1, 'Book at least one ticket.')
      .max(event.maxPerOrder, `You can book up to ${event.maxPerOrder} tickets per order.`),
  });
}

export function makeAttendeeSchema(event) {
  return z.object({
    name: z.string().trim().min(2, 'Please enter your full name.').max(80, 'Names are limited to 80 characters.'),
    email: z.string().trim().toLowerCase().pipe(z.email('Please enter a valid email address.')),
    avatarUrl: event.requirePhoto ? avatarUrl : z.union([avatarUrl, z.literal('')]),
    extraAnswer: z.string().trim().max(300, 'Please keep your answer under 300 characters.'),
  });
}

export function makeBookingSchema(event) {
  return z.object({
    ...makeSelectionSchema(event).shape,
    ...makeAttendeeSchema(event).shape,
  });
}

// Lenient: a bad field falls back to its default instead of dropping the draft.
export const draftSchema = z.object({
  tierId: z.string().max(100).catch(''),
  quantity: z.coerce.number().int().min(1).max(50).catch(1),
  name: z.string().max(200).catch(''),
  email: z.string().max(200).catch(''),
  avatarUrl: z.string().max(2000).catch(''),
  extraAnswer: z.string().max(1000).catch(''),
});
export const EMPTY_DRAFT = Object.freeze(draftSchema.parse({}));

// Includes enough event data to render the ticket offline.
export const ticketSnapshotSchema = z.object({
  code: z.string().min(1),
  eventSlug: z.string().min(1),
  event: z.object({
    name: z.string(),
    venue: z.string(),
    startsAt: z.string(),
    timeZone: z.string(),
    accentColor: z.string(),
    extraQuestion: z.string().nullable(),
  }),
  tierName: z.string(),
  quantity: z.number().int().min(1),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string(),
  extraAnswer: z.string(),
  bookedAt: z.string(),
});

export function firstIssueMessage(error) {
  return error?.issues?.[0]?.message ?? 'Something is missing from your booking.';
}
