'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { accentStyle } from '@/lib/color';
import { formatEventDate, pluralize } from '@/lib/format';
import { cn } from '@/lib/utils';

function Detail({ label, children, className }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1 p-1', className)}>
      <dt className="truncate text-[10px] text-white/40">{label}</dt>
      <dd className="line-clamp-2 break-words text-xs font-bold">{children}</dd>
    </div>
  );
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Accent vars go on the article itself so the exported PNG keeps the colour.
export function TicketCard({ ticket, ref }) {
  const { event } = ticket;

  return (
    <article
      ref={ref}
      style={accentStyle(event.accentColor)}
      aria-label={`${ticket.tierName} ticket ${ticket.code} for ${ticket.name}`}
      className="ticket-shape mx-auto flex h-[600px] w-[300px] shrink-0 flex-col items-center gap-5 p-5">
      <div className="ticket-body flex h-[446px] w-[260px] flex-col gap-5 rounded-2xl border border-accent p-3.5">
        <header className="text-center">
          <p className="line-clamp-2 font-display text-[34px] leading-none [overflow-wrap:anywhere]">{event.name}</p>
          <p className="flex flex-col items-center gap-1 p-1 text-[10px]">
            <span className="line-clamp-1">📍 {event.venue}</span>
            <span>📅 {formatEventDate(event.startsAt, event.timeZone)}</span>
          </p>
        </header>

        <div className="relative mx-auto size-[140px] shrink-0 overflow-hidden rounded-xl border-4 border-accent/50">
          {ticket.avatarUrl ? (
            <Image src={ticket.avatarUrl} alt="" fill sizes="140px" className="object-cover" />
          ) : (
            <div
              className="flex size-full items-center justify-center bg-accent-soft font-display text-5xl"
              aria-hidden>
              {initials(ticket.name)}
            </div>
          )}
        </div>

        <dl className="grid h-40 grid-cols-2 grid-rows-[1fr_1fr_1.45fr] rounded-lg border border-[#133D44] bg-ticket p-1">
          <Detail label="Name" className="border-r border-line-ticket">
            {ticket.name}
          </Detail>
          <Detail label="Email" className="[&_dd]:text-[11px] [&_dd]:[overflow-wrap:anywhere]">
            {ticket.email}
          </Detail>
          <Detail label="Ticket Type" className="border-r border-t border-line-ticket">
            {ticket.tierName}
          </Detail>
          <Detail label="Ticket for" className="border-t border-line-ticket">
            {pluralize(ticket.quantity, 'person', 'people')}
          </Detail>
          <Detail
            label={event.extraQuestion ?? 'Ticket booked'}
            className="col-span-2 border-t border-line-ticket p-2 [&_dd]:font-normal">
            {event.extraQuestion
              ? ticket.extraAnswer || <span className="text-white/40">None</span>
              : formatEventDate(ticket.bookedAt, event.timeZone)}
          </Detail>
        </dl>
      </div>

      <footer className="mt-3 flex items-center gap-3">
        <div className="rounded-md bg-white p-1">
          <QRCodeSVG
            value={ticket.code}
            size={56}
            level="M"
            bgColor="#ffffff"
            fgColor="#02191D"
            title={`Ticket ${ticket.code}`}
          />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider text-white/50">Ticket no.</span>
          <span className="font-mono text-sm font-bold tracking-wider">{ticket.code}</span>
        </div>
      </footer>
    </article>
  );
}
