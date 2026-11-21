'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ExternalLink, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/EmptyState';
import { ticketStore, useTicketStore } from '@/hooks/use-ticket-store';
import { DownloadTicketButton } from './DownloadTicketButton';
import { TicketCard } from './TicketCard';

function TicketListItem({ ticket }) {
  const ref = useRef(null);

  function handleRemove() {
    if (!window.confirm(`Remove ticket ${ticket.code} from this device? Your booking stays valid.`)) return;
    ticketStore.removeTicket(ticket.code);
    toast('Removed from this device');
  }

  return (
    <li className="flex flex-col items-center gap-4">
      <TicketCard ticket={ticket} ref={ref} />
      <div className="flex w-[300px] gap-3">
        <DownloadTicketButton targetRef={ref} fileName={`${ticket.code}.png`} className="flex-1" size="sm">
          Download
        </DownloadTicketButton>
        <Button asChild variant="outline" size="sm">
          <Link href={`/tickets/${ticket.code}`} aria-label={`Open ticket ${ticket.code}`}>
            <ExternalLink aria-hidden />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          aria-label={`Remove ticket ${ticket.code} from this device`}>
          <Trash2 aria-hidden />
        </Button>
      </div>
    </li>
  );
}

export function MyTicketsView() {
  const { ready, tickets } = useTicketStore();

  if (!ready) return <div className="mx-auto h-[600px] w-[300px] animate-pulse rounded-3xl bg-well" aria-busy="true" />;

  if (tickets.length === 0) {
    return (
      <EmptyState
        title="You have no tickets yet"
        description="Tickets you book on this device will appear here."
        actionLabel="Browse events"
      />
    );
  }

  return (
    <>
      <p className="text-muted">
        {tickets.length === 1 ? '1 ticket' : `${tickets.length} tickets`} saved on this device. They work offline too.
      </p>
      <ul className="grid justify-center gap-10 sm:grid-cols-[repeat(auto-fit,300px)]">
        {tickets.map((ticket) => (
          <TicketListItem key={ticket.code} ticket={ticket} />
        ))}
      </ul>
    </>
  );
}
