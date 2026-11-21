import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { defineConfig } from 'vitest/config';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': r('./'),
      'server-only': r('./test/server-only-stub.js'),
    },
  },
  test: {
    include: ['**/*.test.js'],
    exclude: ['node_modules/**', '.next/**'],
    testTimeout: 20_000,
    env: parseEnv(readFileSync(r('./.env'), 'utf8')),
  },
});
