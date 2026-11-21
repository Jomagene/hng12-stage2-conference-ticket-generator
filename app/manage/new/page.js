import { PageCard } from '@/components/layout/PageCard';
import { CreateEventFlow } from '@/components/manage/CreateEventFlow';

export const metadata = { title: 'Create an event' };

export default function NewEventPage() {
  return (
    <PageCard title="Create an event" className="max-w-[1100px]">
      <CreateEventFlow />
    </PageCard>
  );
}
