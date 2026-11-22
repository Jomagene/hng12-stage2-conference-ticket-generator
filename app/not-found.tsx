import { EmptyState } from '@/components/layout/EmptyState';
import { PageCard } from '@/components/layout/PageCard';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <PageCard title="Page not found">
      <EmptyState
        title="This page does not exist"
        description="The link may be broken or the page may have moved."
        actionLabel="Back to the event"
      />
    </PageCard>
  );
}
