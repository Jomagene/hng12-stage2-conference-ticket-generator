'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { BadgeCheck, BookmarkPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { StepActions } from '@/components/layout/PageCard';
import { BOOKING_STEPS } from '@/config/site';
import { ticketStore, useTicketStore } from '@/hooks/use-ticket-store';
import { formatShortDateTime } from '@/lib/format';
import { DownloadTicketButton } from './DownloadTicketButton';
import { TicketCard } from './TicketCard';
import type { TicketSnapshot } from '@/lib/types';

export function TicketView({ ticket, justBooked }: { ticket: TicketSnapshot; justBooked: boolean }) {
  const ticketRef = useRef<HTMLElement>(null);
  const { ready, tickets } = useTicketStore();
  const savedOnDevice = tickets.some((t) => t.code === ticket.code);

  function saveToDevice() {
    ticketStore.saveTicket(ticket);
    toast.success('Saved to My Tickets on this device');
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center md:gap-4">
        {justBooked ? (
          <>
            <h2 className="text-2xl md:text-[32px]">Your Ticket is Booked!</h2>
            <p>
              Download it below. It is also saved under{' '}
              <Link href="/my-tickets" className="text-accent underline">
                My Tickets
              </Link>{' '}
              on this device.
            </p>
          </>
        ) : (
          <p className="text-muted">Show this ticket, or its QR code, at the entrance.</p>
        )}
        {ticket.checkedInAt && (
          <p className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1 text-sm text-emerald-300">
            <BadgeCheck className="size-4" aria-hidden />
            Checked in {formatShortDateTime(ticket.checkedInAt, ticket.event.timeZone)}
          </p>
        )}
      </div>

      <div className="py-4">
        <TicketCard ticket={ticket} ref={ticketRef} />
      </div>

      {ready && !savedOnDevice && (
        <Button variant="ghost" onClick={saveToDevice} className="self-center">
          <BookmarkPlus aria-hidden /> Save to My Tickets on this device
        </Button>
      )}

      <StepActions>
        <Button asChild variant="outline">
          <Link href={BOOKING_STEPS.selection.href(ticket.eventSlug)}>Book Another Ticket</Link>
        </Button>
        <DownloadTicketButton targetRef={ticketRef} fileName={`${ticket.code}.png`}>
          Download {ticket.tierName} Ticket
        </DownloadTicketButton>
      </StepActions>
    </>
  );
}
