import { formatPrice } from './money';

// Rules and summaries for an event as returned by the repo (see repo/mappers.js).

const sum = (items, pick) => items.reduce((total, item) => total + pick(item), 0);

export function seatTotals(event) {
  const sold = sum(event.tiers, (t) => t.sold);
  const capacity = sum(event.tiers, (t) => t.capacity);
  return { sold, capacity, remaining: capacity - sold };
}

export function attendeeTotals(attendees) {
  return {
    checkedIn: sum(
      attendees.filter((a) => a.checkedInAt),
      (a) => a.quantity,
    ),
    bookedValueMinor: sum(attendees, (a) => a.unitPriceMinor * a.quantity),
  };
}

// Saved tier if it still has spots, otherwise the first tier that does.
export function resolveTier(event, tierId) {
  const available = event.tiers.filter((tier) => tier.remaining > 0);
  return available.find((tier) => tier.id === tierId) ?? available[0] ?? null;
}

export function maxQuantity(event, tier) {
  return tier ? Math.min(event.maxPerOrder, tier.remaining) : 1;
}

// "Free", "$50", "Free – $50" or "From $20".
export function priceSummary(event) {
  const prices = event.tiers.map((tier) => tier.priceMinor);
  if (prices.length === 0) return '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max === 0) return 'Free';
  if (min === max) return formatPrice(min, event.currency);
  if (min === 0) return `Free – ${formatPrice(max, event.currency)}`;
  return `From ${formatPrice(min, event.currency)}`;
}

export function availability(event) {
  if (event.isPast) return { label: 'Ended', tone: 'muted' };
  const { remaining } = seatTotals(event);
  if (remaining === 0) return { label: 'Sold out', tone: 'muted' };
  if (remaining <= 10) return { label: `Only ${remaining} left`, tone: 'warn' };
  return { label: `${remaining.toLocaleString('en-US')} spots left`, tone: 'ok' };
}
