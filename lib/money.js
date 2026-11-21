// Prices are integer minor units. XAF/XOF have 0 decimals, so ask Intl instead of assuming 2.

const digitsCache = new Map();

export function currencyDigits(currency) {
  if (!digitsCache.has(currency)) {
    const { maximumFractionDigits } = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).resolvedOptions();
    digitsCache.set(currency, maximumFractionDigits);
  }
  return digitsCache.get(currency);
}

export function toMinorUnits(amount, currency) {
  return Math.round(Number(amount) * 10 ** currencyDigits(currency));
}

export function fromMinorUnits(minor, currency) {
  return minor / 10 ** currencyDigits(currency);
}

export function formatPrice(minor, currency) {
  if (!minor) return 'Free';
  const amount = fromMinorUnits(minor, currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : undefined,
  }).format(amount);
}
