import { defineConfig } from 'drizzle-kit';

// drizzle-kit doesn't read Next's env files, so load .env.local when it exists.
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local (e.g. on Vercel, where env vars are already set)
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/server/db/schema.ts',
  out: './drizzle',
  // Migrations need a session connection; the app itself can use a transaction pooler.
  dbCredentials: { url: process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL || '' },
});
