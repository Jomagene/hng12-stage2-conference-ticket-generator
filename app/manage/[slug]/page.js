import Link from 'next/link';
import { Download, ExternalLink, KeyRound, Pencil } from 'lucide-react';
import { EventTheme } from '@/components/layout/EventTheme';
import { PageCard } from '@/components/layout/PageCard';
import { AccessRequired } from '@/components/manage/AccessRequired';
import { AttendeeTable } from '@/components/manage/AttendeeTable';
import { CheckInPanel } from '@/components/manage/CheckInPanel';
import { Button } from '@/components/ui/button';
import { CopyField } from '@/components/ui/copy-field';
import { attendeeTotals, seatTotals } from '@/lib/events';
import { formatEventDate } from '@/lib/format';
import { formatPrice } from '@/lib/money';
import { getAttendees, getManagedEventForPage } from '@/lib/server/queries';
import { cn } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const event = await getManagedEventForPage((await params).slug);
  return { title: event ? `Manage · ${event.name}` : 'Organizer access' };
}

function Stat({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line-subtle bg-well p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-serif text-2xl">{value}</dd>
      {hint && <dd className="text-xs text-muted">{hint}</dd>}
    </div>
  );
}

function Badge({ on, children }) {
  return (
    <span className={cn('rounded-full px-3 py-1 text-xs', on ? 'bg-accent-soft text-white' : 'bg-white/5 text-muted')}>
      {children}
    </span>
  );
}

export default async function ManageEventPage({ params }) {
  const { slug } = await params;
  const event = await getManagedEventForPage(slug);

  if (!event) return <AccessRequired />;

  const attendees = await getAttendees(event.id);
  const { sold: seatsBooked, capacity, remaining } = seatTotals(event);
  const { checkedIn, bookedValueMinor: bookedValue } = attendeeTotals(attendees);

  return (
    <EventTheme color={event.accentColor}>
      <PageCard title={event.name} className="max-w-[1100px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-muted">
              {formatEventDate(event.startsAt, event.timeZone)} · {event.venue}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge on={event.published}>{event.published ? 'Open for booking' : 'Closed'}</Badge>
              <Badge on={event.listed}>{event.listed ? 'Listed publicly' : 'Link only'}</Badge>
              {event.isPast && <Badge on={false}>Ended</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${event.slug}`}>
                <ExternalLink aria-hidden /> Event page
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/manage/${event.slug}/attendees.csv`} download>
                <Download aria-hidden /> Export CSV
              </a>
            </Button>
            <Button asChild size="sm">
              <Link href={`/manage/${event.slug}/edit`}>
                <Pencil aria-hidden /> Edit event
              </Link>
            </Button>
          </div>
        </div>

        <CopyField
          label="Public booking link"
          path={`/events/${event.slug}`}
          description="Share this anywhere: WhatsApp, Instagram, email…"
        />

        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Seats booked" value={`${seatsBooked} / ${capacity}`} hint={`${remaining} left`} />
          <Stat label="Bookings" value={attendees.length} />
          <Stat label="Checked in" value={`${checkedIn} / ${seatsBooked}`} />
          <Stat
            label="Ticket value"
            value={bookedValue ? formatPrice(bookedValue, event.currency) : '—'}
            hint="Payments are not collected yet"
          />
        </dl>

        <section aria-labelledby="tiers-heading" className="flex flex-col gap-3">
          <h2 id="tiers-heading" className="font-serif text-xl">
            Ticket types
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {event.tiers.map((tier) => (
              <li key={tier.id} className="flex flex-col gap-2 rounded-2xl border border-line-subtle bg-well p-4">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{tier.name}</span>
                  <span>{formatPrice(tier.priceMinor, event.currency)}</span>
                </div>
                <div
                  className="h-2 rounded-full bg-line-muted"
                  role="meter"
                  aria-label={`${tier.name} booked`}
                  aria-valuemin={0}
                  aria-valuemax={tier.capacity}
                  aria-valuenow={tier.sold}>
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(tier.sold / tier.capacity) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted">
                  {tier.sold} / {tier.capacity} booked
                </span>
              </li>
            ))}
          </ul>
        </section>

        <CheckInPanel slug={event.slug} timeZone={event.timeZone} ticketPrefix={event.ticketPrefix} />

        <section aria-labelledby="attendees-heading" className="flex flex-col gap-3">
          <h2 id="attendees-heading" className="font-serif text-xl">
            Attendees
          </h2>
          <AttendeeTable
            slug={event.slug}
            attendees={attendees}
            timeZone={event.timeZone}
            extraQuestion={event.extraQuestion}
          />
        </section>

        <p className="flex items-center gap-2 text-xs text-muted">
          <KeyRound className="size-4" aria-hidden /> You can manage this event because this browser opened its private
          link. Keep that link safe.
        </p>
      </PageCard>
    </EventTheme>
  );
}
