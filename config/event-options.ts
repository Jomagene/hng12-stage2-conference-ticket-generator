import theme from './theme';

export const LIMITS = Object.freeze({
  maxTiers: 6,
  maxPerOrder: 10,
  maxCapacity: 100_000,
});

export const CURRENCIES = Object.freeze([
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'NGN', label: 'Nigerian Naira (₦)' },
  { code: 'GHS', label: 'Ghanaian Cedi (GH₵)' },
  { code: 'KES', label: 'Kenyan Shilling (KSh)' },
  { code: 'ZAR', label: 'South African Rand (R)' },
  { code: 'XAF', label: 'Central African CFA (FCFA)' },
  { code: 'XOF', label: 'West African CFA (CFA)' },
  { code: 'EGP', label: 'Egyptian Pound (E£)' },
  { code: 'MAD', label: 'Moroccan Dirham (MAD)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'CAD', label: 'Canadian Dollar (CA$)' },
]);
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

// Fixed list (not Intl.supportedValuesOf) so server and client render the same options.
export const TIME_ZONES = Object.freeze([
  'Africa/Lagos',
  'Africa/Douala',
  'Africa/Accra',
  'Africa/Abidjan',
  'Africa/Dakar',
  'Africa/Kinshasa',
  'Africa/Nairobi',
  'Africa/Kigali',
  'Africa/Addis_Ababa',
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
]);

export const DEFAULT_ACCENT = theme.defaultAccent;
export const ACCENT_PRESETS = Object.freeze([
  { value: '#24A0B5', label: 'Teal' },
  { value: '#7C5CFF', label: 'Violet' },
  { value: '#E8505B', label: 'Coral' },
  { value: '#F5A623', label: 'Amber' },
  { value: '#2BB673', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
]);

export function newEventDefaults() {
  return {
    name: '',
    tagline: '',
    venue: '',
    startsAtLocal: '',
    timeZone: 'Africa/Lagos',
    currency: 'USD',
    maxPerOrder: 5,
    accentColor: DEFAULT_ACCENT,
    requirePhoto: true,
    extraQuestion: '',
    hostName: '',
    listed: true,
    published: true,
    tiers: [{ id: '', name: 'Regular', description: 'Regular Access', price: 0, capacity: 100, sold: 0 }],
  };
}
