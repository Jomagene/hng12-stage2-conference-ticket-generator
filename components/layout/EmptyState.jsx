import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ title, description, actionLabel = 'Book a ticket', actionHref = '/' }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line-muted px-6 py-12 text-center">
      <Ticket className="size-10 text-accent" aria-hidden />
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-xl">{title}</h2>
        <p className="text-muted">{description}</p>
      </div>
      <Button asChild>
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
