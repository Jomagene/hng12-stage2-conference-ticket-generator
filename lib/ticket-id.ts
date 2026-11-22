// Crockford Base32 (no I, L, O, U). 256 % 32 === 0, so byte % 32 is unbiased.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// e.g. TF25-7K3M-Q9XA (40 random bits). Uniqueness is enforced by the DB.
export function createTicketId(
  prefix: string,
  fillRandom: (bytes: Uint8Array) => Uint8Array = (bytes) => crypto.getRandomValues(bytes),
) {
  const bytes = fillRandom(new Uint8Array(8));
  const chars = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
  return `${prefix}-${chars.slice(0, 4)}-${chars.slice(4)}`;
}
