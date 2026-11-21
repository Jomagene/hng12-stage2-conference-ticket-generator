import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { connectEmbedded } from '../db/connect';
import * as repo from '../repo';

const NOW = new Date('2026-06-01T12:00:00Z');

let db;
beforeAll(async () => {
  db = await connectEmbedded();
  await repo.createEvent(
    db,
    {
      name: 'RLS check',
      tagline: 'Making sure API roles cannot read tables.',
      venue: 'Lagos',
      startsAtLocal: '2026-07-10T18:30',
      timeZone: 'Africa/Lagos',
      currency: 'USD',
      maxPerOrder: 2,
      accentColor: '#24A0B5',
      requirePhoto: false,
      extraQuestion: '',
      hostName: '',
      listed: true,
      published: true,
      tiers: [{ name: 'General', description: '', price: 0, capacity: 5 }],
    },
    { now: NOW },
  );

  // Mirror Supabase: an API role with table grants, and a non-superuser owner.
  await db.execute(sql`CREATE ROLE anon NOLOGIN`);
  await db.execute(sql`GRANT SELECT ON events, ticket_tiers, tickets TO anon`);
  await db.execute(sql`CREATE ROLE app_owner NOLOGIN`);
  await db.execute(sql`ALTER TABLE events OWNER TO app_owner`);
  await db.execute(sql`ALTER TABLE ticket_tiers OWNER TO app_owner`);
  await db.execute(sql`ALTER TABLE tickets OWNER TO app_owner`);
});

async function countEventsAs(role) {
  await db.execute(sql.raw(`SET ROLE ${role}`));
  try {
    const result = await db.execute(sql`SELECT count(*)::int AS n FROM events`);
    return (result.rows ?? result)[0].n;
  } finally {
    await db.execute(sql`RESET ROLE`);
  }
}

describe('row level security', () => {
  it('hides every row from API roles even when they have grants', async () => {
    expect(await countEventsAs('anon')).toBe(0);
  });

  it('still lets the table owner (the app) read everything', async () => {
    expect(await countEventsAs('app_owner')).toBe(1);
  });
});
