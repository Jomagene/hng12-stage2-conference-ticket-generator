import { notFound } from 'next/navigation';
import { EventTheme } from '@/components/layout/EventTheme';
import { getEventForPage } from '@/lib/server/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const event = await getEventForPage((await params).slug);
  if (!event) return { title: 'Event not found' };
  return {
    title: event.name,
    description: event.tagline,
    openGraph: { title: event.name, description: `${event.tagline} · ${event.venue}` },
  };
}

export default async function EventLayout({ params, children }) {
  const event = await getEventForPage((await params).slug);
  if (!event) notFound();
  return <EventTheme color={event.accentColor}>{children}</EventTheme>;
}
