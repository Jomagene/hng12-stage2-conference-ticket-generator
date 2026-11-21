import { EMPTY_DRAFT, draftSchema, ticketSnapshotSchema } from './booking-schema';

// localStorage: a draft per event and copies of booked tickets (so My Tickets works offline).
// Shaped for useSyncExternalStore; SSR gets SERVER_SNAPSHOT to avoid hydration mismatches.

export const STORAGE_KEY = 'ticz:v1';
const MAX_DRAFTS = 20;

const EMPTY_STATE = Object.freeze({
  ready: true,
  drafts: Object.freeze({}),
  tickets: Object.freeze([]),
});

export const SERVER_SNAPSHOT = Object.freeze({ ...EMPTY_STATE, ready: false });

function parseDraft(value) {
  const result = draftSchema.safeParse(value ?? {});
  return result.success ? result.data : EMPTY_DRAFT;
}

export function draftFor(state, eventId) {
  return state.drafts[eventId] ?? EMPTY_DRAFT;
}

export function parsePersistedState(raw) {
  if (!raw) return EMPTY_STATE;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_STATE;
  }
  if (!data || typeof data !== 'object') return EMPTY_STATE;

  const drafts = {};
  if (data.drafts && typeof data.drafts === 'object') {
    for (const [eventId, draft] of Object.entries(data.drafts).slice(-MAX_DRAFTS)) {
      drafts[eventId] = parseDraft(draft);
    }
  }
  const tickets = Array.isArray(data.tickets)
    ? data.tickets.flatMap((ticket) => {
        const result = ticketSnapshotSchema.safeParse(ticket);
        return result.success ? [result.data] : [];
      })
    : [];

  return Object.freeze({ ready: true, drafts: Object.freeze(drafts), tickets: Object.freeze(tickets) });
}

export function createTicketStore({ getStorage }) {
  let state = null;
  const listeners = new Set();

  function read() {
    try {
      return parsePersistedState(getStorage()?.getItem(STORAGE_KEY));
    } catch {
      // Storage can be blocked (private mode). Fall back to memory.
      return EMPTY_STATE;
    }
  }

  function write(next) {
    try {
      getStorage()?.setItem(STORAGE_KEY, JSON.stringify({ drafts: next.drafts, tickets: next.tickets }));
    } catch (error) {
      console.warn('Tickets could not be saved on this device.', error);
    }
  }

  function setState(next) {
    state = Object.freeze({ ...next, ready: true });
    write(state);
    listeners.forEach((listener) => listener());
  }

  function onStorageEvent(event) {
    if (event.key !== STORAGE_KEY) return;
    state = read();
    listeners.forEach((listener) => listener());
  }

  const store = {
    getSnapshot() {
      if (state === null) state = read();
      return state;
    },

    getServerSnapshot() {
      return SERVER_SNAPSHOT;
    },

    subscribe(listener) {
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

    updateDraft(eventId, patch) {
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

    resetDraft(eventId) {
      const current = store.getSnapshot();
      if (!(eventId in current.drafts)) return;
      const { [eventId]: _removed, ...drafts } = current.drafts;
      setState({ ...current, drafts: Object.freeze(drafts) });
    },

    saveTicket(snapshot) {
      const result = ticketSnapshotSchema.safeParse(snapshot);
      if (!result.success) return;
      const current = store.getSnapshot();
      const tickets = [result.data, ...current.tickets.filter((t) => t.code !== result.data.code)];
      setState({ ...current, tickets: Object.freeze(tickets) });
    },

    removeTicket(code) {
      const current = store.getSnapshot();
      setState({ ...current, tickets: Object.freeze(current.tickets.filter((t) => t.code !== code)) });
    },
  };

  return store;
}

export const ticketStore = createTicketStore({
  getStorage: () => (typeof window === 'undefined' ? null : window.localStorage),
});
