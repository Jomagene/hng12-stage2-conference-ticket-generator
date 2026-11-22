import { AttendeeForm } from '@/components/booking/AttendeeForm';
import { PageCard, Panel } from '@/components/layout/PageCard';
import { notFound } from 'next/navigation';
import { BOOKING_STEPS } from '@/config/site';
import { getEventForPage } from '@/lib/server/queries';

export const metadata = { title: BOOKING_STEPS.attendee.title };

export default async function AttendeeDetailsPage({ params }: PageProps<'/events/[slug]/details'>) {
  // Layouts and pages render in parallel, so each needs its own guard.
  const event = await getEventForPage((await params).slug);
  if (!event) notFound();
  const { title, step } = BOOKING_STEPS.attendee;
  return (
    <PageCard title={title} step={step}>
      <Panel>
        <AttendeeForm event={event} />
      </Panel>
    </PageCard>
  );
}
