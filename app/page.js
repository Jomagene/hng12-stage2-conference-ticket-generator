import Link from 'next/link';
import { Plus } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/button';
import { SITE } from '@/config/site';
import { getPublicEventList } from '@/lib/server/queries';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const { upcoming, past } = await getPublicEventList();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12">
      <section className="flex flex-col items-center gap-4 pt-4 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl">Find your next event</h1>
        <p className="max-w-xl text-muted">{SITE.tagline} Book in under a minute, no account needed.</p>
        <Button asChild variant="outline">
          <Link href="/manage/new">
            <Plus aria-hidden /> Host your own event
          </Link>
        </Button>
      </section>

      <section aria-labelledby="upcoming-heading" className="flex flex-col gap-6">
        <h2 id="upcoming-heading" className="font-serif text-2xl">
          Upcoming events
        </h2>
        {upcoming.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No upcoming events yet"
            description="Be the first: create an event and share its booking link."
            actionLabel="Create an event"
            actionHref="/manage/new"
          />
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="flex flex-col gap-6">
          <h2 id="past-heading" className="font-serif text-2xl text-muted">
            Past events
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
