import { formatPrice } from '@/lib/money';
import { cn } from '@/lib/utils';

// Inputs are sr-only rather than display:none so keyboard navigation still works.
export function TierPicker({ event, value, onChange, disabled }) {
  const columns = event.tiers.length >= 3 ? 'sm:grid-cols-3' : event.tiers.length === 2 ? 'sm:grid-cols-2' : '';

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-2">Select Ticket Type:</legend>
      <div className={cn('grid gap-4 rounded-3xl border border-line-subtle bg-well p-4 sm:gap-6', columns)}>
        {event.tiers.map((tier) => {
          const soldOut = tier.remaining <= 0;
          return (
            <label key={tier.id} className={cn('cursor-pointer', soldOut && 'cursor-not-allowed opacity-50')}>
              <input
                type="radio"
                name="tier"
                value={tier.id}
                checked={value === tier.id}
                onChange={() => onChange(tier.id)}
                disabled={soldOut}
                className="peer sr-only"
              />
              <div className="flex h-full flex-col gap-3 rounded-xl border-2 border-line p-3 transition hover:shadow-glow peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-well">
                <p className="text-2xl font-semibold">{formatPrice(tier.priceMinor, event.currency)}</p>
                <div>
                  <p className="uppercase">{tier.description || tier.name}</p>
                  <p className="text-sm text-subtle">
                    {soldOut ? (
                      'Sold out'
                    ) : (
                      <>
                        {tier.remaining}/{tier.capacity}
                        <span className="sr-only"> spots left</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
