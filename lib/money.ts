// Prices are integer minor units. XAF/XOF have 0 decimals, so ask Intl instead of assuming 2.

const digitsCache = new Map<string, number>();

export function currencyDigits(currency: string): number {
  const cached = digitsCache.get(currency);
  if (cached !== undefined) return cached;
  const digits =
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  digitsCache.set(currency, digits);
  return digits;
}

export function toMinorUnits(amount: number | string, currency: string) {
  return Math.round(Number(amount) * 10 ** currencyDigits(currency));
}

export function fromMinorUnits(minor: number, currency: string) {
  return minor / 10 ** currencyDigits(currency);
}

export function formatPrice(minor: number, currency: string) {
  if (!minor) return 'Free';
  const amount = fromMinorUnits(minor, currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : undefined,
  }).format(amount);
}
