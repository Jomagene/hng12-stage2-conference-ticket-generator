import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { accentStyle } from '@/lib/color';
import { formatEventDate } from '@/lib/format';
import { availability, priceSummary } from '@/lib/events';
import { cn } from '@/lib/utils';
import type { PublicEvent } from '@/lib/types';

export function EventCard({ event }: { event: PublicEvent }) {
  const status = availability(event);

  return (
    <li style={accentStyle(event.accentColor)}>
      <Link
        href={`/events/${event.slug}`}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-panel transition hover:border-accent hover:shadow-glow',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          event.isPast && 'opacity-70',
        )}>
        <div className="event-banner flex min-h-32 items-center justify-center rounded-none border-0 border-b-2 border-b-accent px-6 py-6 text-center">
          <p className="line-clamp-2 font-display text-4xl [overflow-wrap:anywhere]">{event.name}</p>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="line-clamp-2 text-sm text-muted">{event.tagline}</p>
          <p className="flex items-center gap-2 text-sm">
            <CalendarDays className="size-4 shrink-0 text-accent" aria-hidden />
            <time dateTime={event.startsAt}>{formatEventDate(event.startsAt, event.timeZone)}</time>
          </p>
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
            <span className="line-clamp-1">{event.venue}</span>
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <span className="font-semibold">{priceSummary(event)}</span>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs',
                status.tone === 'ok' && 'bg-accent-soft text-white',
                status.tone === 'warn' && 'bg-amber-500/15 text-amber-300',
                status.tone === 'muted' && 'bg-white/5 text-muted',
              )}>
              {status.label}
            </span>
          </div>
          {!event.isPast && (
            <span className="flex items-center gap-1 font-serif text-accent">
              Get tickets <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
