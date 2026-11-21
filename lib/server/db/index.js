import 'server-only';
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { SITE, manageAccessPath } from '@/config/site';
import { connectEmbedded, connectPostgres } from './connect';
import { seedDemoEvents } from './seed';

// Uses DATABASE_URL if set, otherwise PGlite in .data/. Cached on globalThis for dev HMR.
export function getDb() {
  globalThis.__ticzDb ??= initDb().catch((error) => {
    globalThis.__ticzDb = undefined;
    throw error;
  });
  return globalThis.__ticzDb;
}

async function initDb() {
  if (process.env.DATABASE_URL) return connectPostgres(process.env.DATABASE_URL);

  if (process.env.VERCEL) {
    throw new Error(
      'DATABASE_URL is not set. Add a Postgres connection string (Neon, Supabase…) in the project settings.',
    );
  }

  const dataRoot = path.join(process.cwd(), '.data');
  const db = await connectEmbedded(process.env.PGLITE_DATA_DIR || path.join(dataRoot, 'pglite'));

  const seeded = await seedDemoEvents(db);
  if (seeded.length > 0) {
    mkdirSync(dataRoot, { recursive: true });
    const lines = seeded.map((e) => `${e.name}: ${SITE.url}${manageAccessPath(e.slug, e.manageToken)}`);
    appendFileSync(path.join(dataRoot, 'demo-manage-links.txt'), `${lines.join('\n')}\n`);
    console.info(
      `[ticz] Seeded demo events. Organizer links (also in .data/demo-manage-links.txt):\n  ${lines.join('\n  ')}`,
    );
  }
  return db;
}
