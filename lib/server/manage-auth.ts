import 'server-only';
import { cookies } from 'next/headers';
import type { Db } from './db/types';
import { findEventBySlug, getEventsForCredentials, verifyManageToken } from './repo';

// No accounts: organizer access is the manage token, kept in a cookie per event.

const MANAGE_COOKIE_PREFIX = 'ticz_manage_';
export const manageCookieName = (eventId: string) => `${MANAGE_COOKIE_PREFIX}${eventId}`;

export const manageCookieOptions = Object.freeze({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
});

export async function getManagedEvent(db: Db, slug: string) {
  const found = await findEventBySlug(db, slug, { includeUnpublished: true });
  if (!found) return null;
  const token = (await cookies()).get(manageCookieName(found.row.id))?.value;
  return verifyManageToken(found.row, token) ? found.event : null;
}

export async function listManagedEvents(db: Db) {
  const credentials = (await cookies())
    .getAll()
    .filter((cookie) => cookie.name.startsWith(MANAGE_COOKIE_PREFIX))
    .map((cookie) => ({ eventId: cookie.name.slice(MANAGE_COOKIE_PREFIX.length), token: cookie.value }));
  return getEventsForCredentials(db, credentials);
}
