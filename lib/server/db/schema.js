import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Run `npm run db:generate` after changes. No app imports: drizzle-kit loads this file directly.

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Never changes after creation, links get shared.
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    tagline: text('tagline').notNull(),
    venue: text('venue').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    timeZone: text('time_zone').notNull(),
    currency: text('currency').notNull(),
    maxPerOrder: integer('max_per_order').notNull().default(5),
    ticketPrefix: text('ticket_prefix').notNull(),
    accentColor: text('accent_color').notNull(),
    requirePhoto: boolean('require_photo').notNull().default(true),
    extraQuestion: text('extra_question'),
    hostName: text('host_name'),
    listed: boolean('listed').notNull().default(true),
    published: boolean('published').notNull().default(true),
    manageTokenHash: text('manage_token_hash').notNull(),
    ...timestamps,
  },
  (t) => [index('events_listing_idx').on(t.listed, t.published, t.startsAt)],
);

export const ticketTiers = pgTable(
  'ticket_tiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    priceMinor: integer('price_minor').notNull().default(0),
    capacity: integer('capacity').notNull(),
    sold: integer('sold').notNull().default(0),
    position: integer('position').notNull().default(0),
  },
  (t) => [
    index('ticket_tiers_event_idx').on(t.eventId, t.position),
    check('ticket_tiers_sold_within_capacity', sql`${t.sold} >= 0 AND ${t.sold} <= ${t.capacity}`),
    check('ticket_tiers_price_non_negative', sql`${t.priceMinor} >= 0`),
  ],
);

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    tierId: uuid('tier_id')
      .notNull()
      .references(() => ticketTiers.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull(),
    // Price at booking time, so later price edits don't change past bookings.
    unitPriceMinor: integer('unit_price_minor').notNull().default(0),
    name: text('name').notNull(),
    email: text('email').notNull(),
    avatarUrl: text('avatar_url'),
    extraAnswer: text('extra_answer').notNull().default(''),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('tickets_event_created_idx').on(t.eventId, t.createdAt),
    check('tickets_quantity_positive', sql`${t.quantity} > 0`),
  ],
);
