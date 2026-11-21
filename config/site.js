export const SITE = Object.freeze({
  name: 'Ticz',
  tagline: 'Fraud-resistant, mobile-first tickets for community events.',
  repoUrl: 'https://github.com/Jomagene/hng12-stage2-conference-ticket-generator',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
});

export const NAV_LINKS = Object.freeze([
  { href: '/', label: 'Events' },
  { href: '/my-tickets', label: 'My Tickets' },
  { href: '/manage', label: 'For Organizers' },
]);

export const BOOKING_STEPS = Object.freeze({
  selection: { step: 1, title: 'Ticket Selection', href: (slug) => `/events/${slug}` },
  attendee: { step: 2, title: 'Attendee Details', href: (slug) => `/events/${slug}/details` },
  ready: { step: 3, title: 'Ready', href: (code) => `/tickets/${code}?new=1` },
});
export const TOTAL_STEPS = Object.keys(BOOKING_STEPS).length;

export const manageHref = (slug) => `/manage/${slug}`;
export const manageAccessPath = (slug, token) => `/manage/${slug}/access/${token}`;
