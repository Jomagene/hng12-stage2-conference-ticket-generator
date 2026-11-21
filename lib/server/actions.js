'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDb } from './db';
import * as repo from './events-repo';
import { getManagedEvent, manageCookieName, manageCookieOptions } from './manage-auth';

// Actions return { ok, ... } instead of throwing so forms can show field errors.

function failure(error) {
  if (error instanceof repo.DomainError) {
    return { ok: false, code: error.code, error: error.message, field: error.field };
  }
  console.error('[ticz] action failed', error);
  return { ok: false, code: 'SERVER', error: 'Something went wrong on our side. Please try again.' };
}

const FORBIDDEN = Object.freeze({
  ok: false,
  code: 'FORBIDDEN',
  error: 'Open your private manage link on this device to make changes.',
});

export async function bookTicketAction(slug, values) {
  try {
    const ticket = await repo.bookTicket(await getDb(), String(slug), values);
    revalidatePath(`/events/${slug}`);
    revalidatePath(`/manage/${slug}`);
    return { ok: true, ticket };
  } catch (error) {
    return failure(error);
  }
}

export async function createEventAction(values) {
  try {
    const { event, manageToken } = await repo.createEvent(await getDb(), values);
    (await cookies()).set(manageCookieName(event.id), manageToken, manageCookieOptions);
    revalidatePath('/');
    return { ok: true, slug: event.slug, manageToken };
  } catch (error) {
    return failure(error);
  }
}

export async function updateEventAction(slug, values) {
  try {
    const db = await getDb();
    const event = await getManagedEvent(db, String(slug));
    if (!event) return FORBIDDEN;
    await repo.updateEvent(db, event.id, values);
    revalidatePath('/');
    revalidatePath(`/events/${event.slug}`, 'layout');
    revalidatePath(`/manage/${event.slug}`, 'layout');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function checkInAction(slug, code) {
  try {
    const db = await getDb();
    const event = await getManagedEvent(db, String(slug));
    if (!event) return FORBIDDEN;
    const result = await repo.checkInTicket(db, event.id, code);
    revalidatePath(`/manage/${event.slug}`);
    return { ok: true, ...result };
  } catch (error) {
    return failure(error);
  }
}

export async function undoCheckInAction(slug, code) {
  try {
    const db = await getDb();
    const event = await getManagedEvent(db, String(slug));
    if (!event) return FORBIDDEN;
    await repo.undoCheckIn(db, event.id, code);
    revalidatePath(`/manage/${event.slug}`);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
