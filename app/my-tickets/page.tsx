import { PageCard } from '@/components/layout/PageCard';
import { MyTicketsView } from '@/components/ticket/MyTicketsView';

export const metadata = { title: 'My Tickets' };

export default function MyTicketsPage() {
  return (
    <PageCard title="My Tickets">
      <MyTicketsView />
    </PageCard>
  );
}
