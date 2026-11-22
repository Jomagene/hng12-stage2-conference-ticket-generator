import { z } from 'zod';
import { CURRENCY_CODES, LIMITS } from '@/config/event-options';
import { HEX_COLOR } from './color';
import { isValidTimeZone } from './timezone';

// Price is in major units here; the repo converts to minor units.
const tierInputSchema = z.object({
  id: z.union([z.uuid(), z.literal('')]).optional(),
  name: z.string().trim().min(1, 'Name this ticket type.').max(40, 'Keep it under 40 characters.'),
  description: z.string().trim().max(60, 'Keep it under 60 characters.'),
  price: z.coerce
    .number({ error: 'Enter a price (0 for free).' })
    .min(0, 'Price cannot be negative.')
    .max(10_000_000, 'That price is too high.'),
  capacity: z.coerce
    .number({ error: 'Enter how many spots.' })
    .int('Use a whole number.')
    .min(1, 'At least 1 spot.')
    .max(LIMITS.maxCapacity, `At most ${LIMITS.maxCapacity.toLocaleString('en-US')} spots.`),
  // Shown in the edit form; the server ignores it.
  sold: z.number().optional(),
});

export const eventInputSchema = z.object({
  name: z.string().trim().min(3, 'Give your event a name.').max(80, 'Keep the name under 80 characters.'),
  tagline: z
    .string()
    .trim()
    .min(10, 'Add a short description (at least 10 characters).')
    .max(200, 'Keep the description under 200 characters.'),
  venue: z.string().trim().min(3, 'Where is it happening?').max(120),
  startsAtLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Pick a date and time.'),
  timeZone: z.string().refine(isValidTimeZone, 'Choose a valid time zone.'),
  currency: z.enum(CURRENCY_CODES, { error: 'Choose a currency.' }),
  maxPerOrder: z.coerce.number().int().min(1).max(LIMITS.maxPerOrder),
  accentColor: z.string().regex(HEX_COLOR, 'Use a hex color like #24A0B5.'),
  requirePhoto: z.boolean(),
  extraQuestion: z.string().trim().max(80, 'Keep the question under 80 characters.'),
  hostName: z.string().trim().max(80),
  listed: z.boolean(),
  published: z.boolean(),
  tiers: z
    .array(tierInputSchema)
    .min(1, 'Add at least one ticket type.')
    .max(LIMITS.maxTiers, `At most ${LIMITS.maxTiers} ticket types.`),
});
