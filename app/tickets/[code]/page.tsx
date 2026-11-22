import { notFound } from 'next/navigation';
import { EventTheme } from '@/components/layout/EventTheme';
import { PageCard } from '@/components/layout/PageCard';
import { TicketView } from '@/components/ticket/TicketView';
import { BOOKING_STEPS } from '@/config/site';
import { getTicketForPage } from '@/lib/server/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps<'/tickets/[code]'>) {
  const ticket = await getTicketForPage((await params).code);
  return {
    title: ticket ? `Ticket ${ticket.code}` : 'Ticket not found',
    // Ticket pages show personal data.
    robots: { index: false, follow: false },
  };
}

export default async function TicketPage({ params, searchParams }: PageProps<'/tickets/[code]'>) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const ticket = await getTicketForPage(code);
  if (!ticket) notFound();

  const justBooked = query.new === '1';
  return (
    <EventTheme color={ticket.event.accentColor}>
      <PageCard
        title={justBooked ? BOOKING_STEPS.ready.title : ticket.event.name}
        step={justBooked ? BOOKING_STEPS.ready.step : undefined}>
        <TicketView ticket={ticket} justBooked={justBooked} />
      </PageCard>
    </EventTheme>
  );
}
