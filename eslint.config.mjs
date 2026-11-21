import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    // Playwright fixtures receive a callback named `use`, which isn't React's hook.
    files: ['e2e/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
];

export default config;
