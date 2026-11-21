import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageCard } from '@/components/layout/PageCard';
import { AccessRequired } from '@/components/manage/AccessRequired';
import { EditEventForm } from '@/components/manage/EditEventForm';
import { manageHref } from '@/config/site';
import { toEventFormValues } from '@/lib/server/repo';
import { getManagedEventForPage } from '@/lib/server/queries';

export const metadata = { title: 'Edit event' };

export default async function EditEventPage({ params }) {
  const { slug } = await params;
  const event = await getManagedEventForPage(slug);

  if (!event) return <AccessRequired description="Only the organizer can edit this event." />;

  return (
    <PageCard title={`Edit · ${event.name}`} className="max-w-[1100px]">
      <Link href={manageHref(slug)} className="flex items-center gap-2 self-start text-sm text-accent hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Back to dashboard
      </Link>
      <EditEventForm slug={slug} defaultValues={toEventFormValues(event)} />
    </PageCard>
  );
}
