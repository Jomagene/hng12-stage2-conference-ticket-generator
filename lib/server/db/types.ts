import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type * as schema from './schema';

// Common to the PGlite (dev/tests) and postgres-js (production) drivers.
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export type EventRow = typeof schema.events.$inferSelect;
export type TierRow = typeof schema.ticketTiers.$inferSelect;
export type TicketRow = typeof schema.tickets.$inferSelect;
