import { EMPTY_DRAFT, draftSchema, ticketSnapshotSchema } from './booking-schema';
import type { z } from 'zod';
import type { Draft } from './types';

// Values are coerced/validated, so callers may pass raw input (e.g. a select's string).
type DraftPatch = Partial<z.input<typeof draftSchema>>;

export interface StoreState {
  ready: boolean;
  drafts: Readonly<Record<string, Draft>>;
  tickets: readonly z.infer<typeof ticketSnapshotSchema>[];
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

// localStorage: a draft per event and copies of booked tickets (so My Tickets works offline).
// Shaped for useSyncExternalStore; SSR gets SERVER_SNAPSHOT to avoid hydration mismatches.

export const STORAGE_KEY = 'ticz:v1';
const MAX_DRAFTS = 20;

const EMPTY_STATE: StoreState = Object.freeze({
  ready: true,
  drafts: Object.freeze({}),
  tickets: Object.freeze([]),
});

const SERVER_SNAPSHOT: StoreState = Object.freeze({ ...EMPTY_STATE, ready: false });

function parseDraft(value: unknown): Draft {
  const result = draftSchema.safeParse(value ?? {});
  return result.success ? result.data : EMPTY_DRAFT;
}

export function draftFor(state: StoreState, eventId: string): Draft {
  return state.drafts[eventId] ?? EMPTY_DRAFT;
}

export function parsePersistedState(raw: string | null | undefined): StoreState {
  if (!raw) return EMPTY_STATE;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_STATE;
  }
  if (!data || typeof data !== 'object') return EMPTY_STATE;

  const drafts: Record<string, Draft> = {};
  if (data.drafts && typeof data.drafts === 'object') {
    for (const [eventId, draft] of Object.entries(data.drafts).slice(-MAX_DRAFTS)) {
      drafts[eventId] = parseDraft(draft);
    }
  }
  const tickets = Array.isArray(data.tickets)
    ? data.tickets.flatMap((ticket: unknown) => {
        const result = ticketSnapshotSchema.safeParse(ticket);
        return result.success ? [result.data] : [];
      })
    : [];

  return Object.freeze({ ready: true, drafts: Object.freeze(drafts), tickets: Object.freeze(tickets) });
}

export function createTicketStore({ getStorage }: { getStorage: () => StorageLike | null }) {
  let state: StoreState | null = null;
  const listeners = new Set<() => void>();

  function read() {
    try {
      return parsePersistedState(getStorage()?.getItem(STORAGE_KEY));
    } catch {
      // Storage can be blocked (private mode). Fall back to memory.
      return EMPTY_STATE;
    }
  }

  function write(next: StoreState) {
    try {
      getStorage()?.setItem(STORAGE_KEY, JSON.stringify({ drafts: next.drafts, tickets: next.tickets }));
    } catch (error) {
      console.warn('Tickets could not be saved on this device.', error);
    }
  }

  function setState(next: StoreState) {
    state = Object.freeze({ ...next, ready: true });
    write(state);
    listeners.forEach((listener) => listener());
  }

  function onStorageEvent(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;
    state = read();
    listeners.forEach((listener) => listener());
  }

  const store = {
    getSnapshot(): StoreState {
      if (state === null) state = read();
      return state;
    },

    getServerSnapshot(): StoreState {
      return SERVER_SNAPSHOT;
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== 'undefined') {
        window.addEventListener('storage', onStorageEvent);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== 'undefined') {
          window.removeEventListener('storage', onStorageEvent);
        }
      };
    },

    updateDraft(eventId: string, patch: DraftPatch) {
      const current = store.getSnapshot();
      const { [eventId]: previous, ...others } = current.drafts;
      // Re-insert so the oldest drafts are the ones trimmed.
      const entries = Object.entries(others).slice(-(MAX_DRAFTS - 1));
      const drafts = Object.fromEntries([
        ...entries,
        [eventId, parseDraft({ ...(previous ?? EMPTY_DRAFT), ...patch })],
      ]);
      setState({ ...current, drafts: Object.freeze(drafts) });
    },

    resetDraft(eventId: string) {
      const current = store.getSnapshot();
      if (!(eventId in current.drafts)) return;
      const { [eventId]: _removed, ...drafts } = current.drafts;
      setState({ ...current, drafts: Object.freeze(drafts) });
    },

    saveTicket(snapshot: unknown) {
      const result = ticketSnapshotSchema.safeParse(snapshot);
      if (!result.success) return;
      const current = store.getSnapshot();
      const tickets = [result.data, ...current.tickets.filter((t) => t.code !== result.data.code)];
      setState({ ...current, tickets: Object.freeze(tickets) });
    },

    removeTicket(code: string) {
      const current = store.getSnapshot();
      setState({ ...current, tickets: Object.freeze(current.tickets.filter((t) => t.code !== code)) });
    },
  };

  return store;
}

export const ticketStore = createTicketStore({
  getStorage: () => (typeof window === 'undefined' ? null : window.localStorage),
});
