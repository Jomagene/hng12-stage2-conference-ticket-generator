import { Road_Rage, Roboto } from 'next/font/google';
import localFont from 'next/font/local';

// Jeju Myeongjo isn't on Google Fonts, so it's a Latin-only subset of the original TTF.

const fontSans = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Road_Rage({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const fontSerif = localFont({
  src: '../assets/fonts/JejuMyeongjo-latin.woff2',
  variable: '--font-serif',
  display: 'swap',
});

export const fontVariables = [fontSans.variable, fontDisplay.variable, fontSerif.variable].join(' ');
