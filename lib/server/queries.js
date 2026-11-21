import 'server-only';
import { cache } from 'react';
import { getDb } from './db';
import * as repo from './repo';
import { getManagedEvent, listManagedEvents } from './manage-auth';

// cache() dedupes per request (layout, page and generateMetadata all ask for the event).

export const getEventForPage = cache(async (slug) => repo.getPublicEvent(await getDb(), slug));

export const getManagedEventForPage = cache(async (slug) => getManagedEvent(await getDb(), slug));

export const getTicketForPage = cache(async (code) => repo.getTicketByCode(await getDb(), code));

export async function getPublicEventList() {
  return repo.listPublicEvents(await getDb());
}

export async function getAttendees(eventId) {
  return repo.listAttendees(await getDb(), eventId);
}

export async function getManagedEventList() {
  return listManagedEvents(await getDb());
}
