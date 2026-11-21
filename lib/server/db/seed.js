import { count } from 'drizzle-orm';
import { createEvent } from '../events-repo';
import { events } from './schema';

const DEMO_EVENTS = [
  {
    name: 'Techember Fest ”27',
    tagline: 'Join us for an unforgettable experience at Techember Fest! Secure your spot now.',
    venue: '04 Rumens road, Ikoyi, Lagos',
    startsAtLocal: '2027-03-15T19:00',
    timeZone: 'Africa/Lagos',
    currency: 'USD',
    maxPerOrder: 5,
    accentColor: '#24A0B5',
    requirePhoto: true,
    extraQuestion: 'Special request?',
    hostName: 'Ticz demo',
    listed: true,
    published: true,
    tiers: [
      { name: 'Free', description: 'Regular Access', price: 0, capacity: 52 },
      { name: 'VIP', description: 'VIP Access', price: 150, capacity: 52 },
      { name: 'VVIP', description: 'VVIP Access', price: 300, capacity: 20 },
    ],
  },
  {
    name: 'Harmattan Hack Night',
    tagline: 'An evening of building, demos and jollof for developers and designers.',
    venue: 'Innovation Hub, Osu, Accra',
    startsAtLocal: '2027-01-23T18:00',
    timeZone: 'Africa/Accra',
    currency: 'GHS',
    maxPerOrder: 2,
    accentColor: '#7C5CFF',
    requirePhoto: false,
    extraQuestion: 'What are you hoping to build?',
    hostName: 'Ticz demo',
    listed: true,
    published: true,
    tiers: [
      { name: 'Builder', description: 'Hack + dinner', price: 50, capacity: 80 },
      { name: 'Spectator', description: 'Demos only', price: 0, capacity: 120 },
    ],
  },
];

export async function seedDemoEvents(db) {
  const [{ value }] = await db.select({ value: count() }).from(events);
  if (value > 0) return [];

  const created = [];
  for (const input of DEMO_EVENTS) {
    const { event, manageToken } = await createEvent(db, input);
    created.push({ name: event.name, slug: event.slug, manageToken });
  }
  return created;
}
