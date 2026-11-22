import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import type { EventRow } from '../db/types';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const createManageToken = () => randomBytes(24).toString('base64url');

export function verifyManageToken(eventRow: Pick<EventRow, 'manageTokenHash'> | null | undefined, token: unknown) {
  if (!eventRow?.manageTokenHash || typeof token !== 'string' || token.length < 16) return false;
  const expected = Buffer.from(eventRow.manageTokenHash, 'hex');
  const actual = Buffer.from(hashToken(token), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
