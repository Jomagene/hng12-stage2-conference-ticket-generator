import { mkdirSync } from 'node:fs';
import path from 'node:path';
import * as schema from './schema';

export const MIGRATIONS_DIR = path.join(process.cwd(), 'drizzle');

// PGlite for local dev and tests. No dataDir = in-memory.
export async function connectEmbedded(dataDir) {
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import('@electric-sql/pglite'),
    import('drizzle-orm/pglite'),
    import('drizzle-orm/pglite/migrator'),
  ]);
  if (dataDir) mkdirSync(dataDir, { recursive: true });
  const client = dataDir ? new PGlite(dataDir) : new PGlite();
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db;
}

// Migrations run at deploy time (db:migrate). prepare: false for transaction-mode poolers.
export async function connectPostgres(url) {
  const [{ default: postgres }, { drizzle }] = await Promise.all([
    import('postgres'),
    import('drizzle-orm/postgres-js'),
  ]);
  const client = postgres(url, { prepare: false, max: Number(process.env.DATABASE_POOL_MAX ?? 5) });
  return drizzle({ client, schema });
}
