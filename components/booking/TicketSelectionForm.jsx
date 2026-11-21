'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StepActions } from '@/components/layout/PageCard';
import { BOOKING_STEPS } from '@/config/site';
import { ticketStore, useTicketStore } from '@/hooks/use-ticket-store';
import { draftFor } from '@/lib/ticket-store';
import { TierPicker } from './TierPicker';

// Saved tier if it still has spots, otherwise the first tier that does.
export function resolveTier(event, tierId) {
  const available = event.tiers.filter((tier) => tier.remaining > 0);
  return available.find((tier) => tier.id === tierId) ?? available[0] ?? null;
}

export function TicketSelectionForm({ event }) {
  const router = useRouter();
  const state = useTicketStore();
  const draft = draftFor(state, event.id);
  const tier = resolveTier(event, draft.tierId);
  const maxQuantity = tier ? Math.min(event.maxPerOrder, tier.remaining) : 1;
  const quantity = Math.min(draft.quantity, maxQuantity);
  const bookable = state.ready && !event.isPast && tier !== null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!bookable) return;
    ticketStore.updateDraft(event.id, { tierId: tier.id, quantity });
    router.push(BOOKING_STEPS.attendee.href(event.slug));
  }

  function handleCancel() {
    ticketStore.resetDraft(event.id);
    toast('Booking cleared', { icon: '↺' });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" aria-busy={!state.ready}>
      {event.isPast && (
        <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-center">
          This event has already taken place. Bookings are closed.
        </p>
      )}
      {!event.isPast && tier === null && (
        <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-center">
          This event is sold out.
        </p>
      )}

      <TierPicker
        event={event}
        value={tier?.id ?? ''}
        onChange={(tierId) => ticketStore.updateDraft(event.id, { tierId })}
        disabled={!bookable}
      />

      <div className="flex flex-col gap-2">
        <span id="quantity-label">Number of Tickets</span>
        <Select
          value={String(quantity)}
          onValueChange={(value) => ticketStore.updateDraft(event.id, { quantity: Number(value) })}
          disabled={!bookable}>
          <SelectTrigger aria-labelledby="quantity-label">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxQuantity }, (_, i) => String(i + 1)).map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <StepActions>
        <Button variant="outline" onClick={handleCancel} disabled={!state.ready}>
          Cancel
        </Button>
        <Button type="submit" disabled={!bookable}>
          Next
        </Button>
      </StepActions>
    </form>
  );
}
