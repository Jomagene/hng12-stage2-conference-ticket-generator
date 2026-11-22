import { EventBanner } from '@/components/booking/EventBanner';
import { TicketSelectionForm } from '@/components/booking/TicketSelectionForm';
import { Divider, PageCard, Panel } from '@/components/layout/PageCard';
import { notFound } from 'next/navigation';
import { BOOKING_STEPS } from '@/config/site';
import { getEventForPage } from '@/lib/server/queries';

export default async function TicketSelectionPage({ params }: PageProps<'/events/[slug]'>) {
  // Layouts and pages render in parallel, so each needs its own guard.
  const event = await getEventForPage((await params).slug);
  if (!event) notFound();
  const { title, step } = BOOKING_STEPS.selection;
  return (
    <PageCard title={title} step={step}>
      <Panel>
        <EventBanner event={event} />
        <Divider />
        <TicketSelectionForm event={event} />
      </Panel>
    </PageCard>
  );
}
