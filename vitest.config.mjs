import { fileURLToPath } from 'node:url';
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
  },
});
