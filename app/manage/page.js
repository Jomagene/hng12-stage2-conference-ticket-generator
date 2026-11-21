import Link from 'next/link';
import { Plus, Settings } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';
import { PageCard } from '@/components/layout/PageCard';
import { Button } from '@/components/ui/button';
import { manageHref } from '@/config/site';
import { formatEventDate } from '@/lib/format';
import { accentStyle } from '@/lib/color';
import { getManagedEventList } from '@/lib/server/queries';

export const metadata = { title: 'Your events' };

export default async function ManageIndexPage({ searchParams }) {
  const [{ error }, events] = await Promise.all([searchParams, getManagedEventList()]);

  return (
    <PageCard title="Your events">
      {error === 'invalid-link' && (
        <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4">
          That manage link is not valid. Check that you copied the whole link.
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted">Create an event, share its link, and manage bookings and check-in from here.</p>
        <Button asChild className="shrink-0">
          <Link href="/manage/new">
            <Plus aria-hidden /> Create event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events on this device"
          description="Events you create appear here. Managing an event from another device? Open its private manage link."
          actionLabel="Create your first event"
          actionHref="/manage/new"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => {
            const sold = event.tiers.reduce((sum, t) => sum + t.sold, 0);
            const capacity = event.tiers.reduce((sum, t) => sum + t.capacity, 0);
            return (
              <li key={event.id} style={accentStyle(event.accentColor)}>
                <Link
                  href={manageHref(event.slug)}
                  className="flex items-center gap-4 rounded-2xl border border-line-subtle border-l-4 border-l-accent bg-well p-4 transition hover:border-accent hover:shadow-glow">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-lg">{event.name}</p>
                    <p className="text-sm text-muted">
                      {formatEventDate(event.startsAt, event.timeZone)} · {sold}/{capacity} booked
                      {!event.published && ' · Closed'}
                      {event.isPast && ' · Ended'}
                    </p>
                  </div>
                  <Settings className="size-5 shrink-0 text-accent" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageCard>
  );
}
