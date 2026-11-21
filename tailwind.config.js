/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,mdx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#02191D',
        card: '#041E23',
        panel: '#08252B',
        well: '#052228',
        ticket: '#08343C',
        line: {
          DEFAULT: '#197686',
          muted: '#0E464F',
          subtle: '#07373F',
          ticket: '#12464E',
        },
        // Driven by CSS vars so each event can set its own colour.
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          soft: 'rgb(var(--accent-rgb) / 0.22)',
          fg: 'rgb(var(--accent-fg-rgb) / <alpha-value>)',
        },
        muted: '#B3B3B3',
        danger: '#FF8A80',
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
  plugins: [require('tailwindcss-animate')],
};
