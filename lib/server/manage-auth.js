import 'server-only';
import { cookies } from 'next/headers';
import { findEventBySlug, getEventsForCredentials, verifyManageToken } from './events-repo';

// No accounts: organiser access is the manage token, kept in a cookie per event.

export const MANAGE_COOKIE_PREFIX = 'ticz_manage_';
export const manageCookieName = (eventId) => `${MANAGE_COOKIE_PREFIX}${eventId}`;

export const manageCookieOptions = Object.freeze({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
});

export async function getManagedEvent(db, slug) {
  const found = await findEventBySlug(db, slug, { includeUnpublished: true });
  if (!found) return null;
  const token = (await cookies()).get(manageCookieName(found.row.id))?.value;
  return verifyManageToken(found.row, token) ? found.event : null;
}

export async function listManagedEvents(db) {
  const credentials = (await cookies())
    .getAll()
    .filter((cookie) => cookie.name.startsWith(MANAGE_COOKIE_PREFIX))
    .map((cookie) => ({ eventId: cookie.name.slice(MANAGE_COOKIE_PREFIX.length), token: cookie.value }));
  return getEventsForCredentials(db, credentials);
}
