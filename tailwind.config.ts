import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { colors } from './config/theme';

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...colors,
        // Driven by CSS vars so each event can set its own color.
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          soft: 'rgb(var(--accent-rgb) / 0.22)',
          fg: 'rgb(var(--accent-fg-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'cursive'],
      },
      boxShadow: {
        glow: '0 5px 15px rgb(var(--accent-rgb) / 0.35)',
      },
      keyframes: {
        'page-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'page-in': 'page-in 400ms ease-out both',
      },
    },
  },
  plugins: [animate],
};

export default config;
