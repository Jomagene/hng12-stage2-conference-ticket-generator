import { EmptyState } from '@/components/layout/EmptyState';
import { PageCard } from '@/components/layout/PageCard';

export function AccessRequired({ description = 'Open the manage link you saved when you created the event.' }) {
  return (
    <PageCard title="Organizer access">
      <EmptyState
        title="Open your manage link"
        description={description}
        actionLabel="Your events"
        actionHref="/manage"
      />
    </PageCard>
  );
}
