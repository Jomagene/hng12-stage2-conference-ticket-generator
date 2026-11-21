import { formatEventDate } from '@/lib/format';

export function EventBanner({ event }) {
  return (
    <div className="event-banner flex flex-col items-center gap-2 rounded-3xl px-6 py-4 text-center md:py-6">
      <p className="font-display text-5xl [overflow-wrap:anywhere] md:text-[62px]">{event.name}</p>
      <p className="max-w-[420px] text-sm md:text-base">{event.tagline}</p>
      <p className="flex flex-col gap-1 md:flex-row md:gap-4">
        <span>📍 {event.venue}</span>
        <span className="hidden md:inline" aria-hidden>
          | |
        </span>
        <time dateTime={event.startsAt}>{formatEventDate(event.startsAt, event.timeZone)}</time>
      </p>
      {event.hostName && <p className="text-sm text-muted">Hosted by {event.hostName}</p>}
    </div>
  );
}
