import { describe, expect, it, vi } from 'vitest';
import { EMPTY_DRAFT } from '../booking-schema';
import { STORAGE_KEY, createTicketStore, draftFor, parsePersistedState } from '../ticket-store';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

const makeStore = (storage = memoryStorage()) => ({ store: createTicketStore({ getStorage: () => storage }), storage });

const SNAPSHOT = {
  code: 'TF27-AAAA-BBBB',
  eventSlug: 'techember',
  event: {
    name: 'Techember',
    venue: 'Lagos',
    startsAt: '2027-03-15T18:00:00.000Z',
    timeZone: 'Africa/Lagos',
    accentColor: '#24A0B5',
    extraQuestion: null,
  },
  tierName: 'VIP',
  quantity: 2,
  name: 'Ada',
  email: 'ada@example.com',
  avatarUrl: '',
  extraAnswer: '',
  bookedAt: '2026-11-21T10:00:00.000Z',
};

describe('ticket store', () => {
  it('starts empty and ready; serves a not-ready snapshot for SSR', () => {
    const { store } = makeStore();
    expect(store.getSnapshot()).toMatchObject({ ready: true, drafts: {}, tickets: [] });
    expect(store.getServerSnapshot().ready).toBe(false);
  });

  it('returns a stable snapshot between changes (required by useSyncExternalStore)', () => {
    const { store } = makeStore();
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('keeps one draft per event and persists it', () => {
    const storage = memoryStorage();
    const { store } = makeStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);

    store.updateDraft('event-a', { tierId: 'vip', quantity: '3' });
    store.updateDraft('event-b', { name: 'Ada' });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(draftFor(store.getSnapshot(), 'event-a')).toMatchObject({ tierId: 'vip', quantity: 3, name: '' });
    expect(draftFor(store.getSnapshot(), 'event-b')).toMatchObject({ name: 'Ada' });
    expect(draftFor(store.getSnapshot(), 'unknown')).toEqual(EMPTY_DRAFT);

    // Survives a reload.
    const reloaded = makeStore(storage).store;
    expect(draftFor(reloaded.getSnapshot(), 'event-a').tierId).toBe('vip');
  });

  it('resets only the given event draft', () => {
    const { store } = makeStore();
    store.updateDraft('a', { name: 'A' });
    store.updateDraft('b', { name: 'B' });
    store.resetDraft('a');
    expect(Object.keys(store.getSnapshot().drafts)).toEqual(['b']);
  });

  it('caps the number of stored drafts, dropping the oldest', () => {
    const { store } = makeStore();
    for (let i = 0; i < 25; i++) store.updateDraft(`e${i}`, { name: `n${i}` });
    const ids = Object.keys(store.getSnapshot().drafts);
    expect(ids).toHaveLength(20);
    expect(ids[0]).toBe('e5');
    expect(ids.at(-1)).toBe('e24');
  });

  it('saves tickets newest first without duplicates and removes them', () => {
    const { store } = makeStore();
    store.saveTicket(SNAPSHOT);
    store.saveTicket({ ...SNAPSHOT, code: 'TF27-CCCC-DDDD' });
    store.saveTicket(SNAPSHOT);
    expect(store.getSnapshot().tickets.map((t) => t.code)).toEqual(['TF27-AAAA-BBBB', 'TF27-CCCC-DDDD']);

    store.removeTicket('TF27-AAAA-BBBB');
    expect(store.getSnapshot().tickets.map((t) => t.code)).toEqual(['TF27-CCCC-DDDD']);
  });

  it('ignores malformed tickets', () => {
    const { store } = makeStore();
    store.saveTicket({ code: 'x' });
    expect(store.getSnapshot().tickets).toEqual([]);
  });

  it('keeps working in memory when storage is unavailable', () => {
    const store = createTicketStore({
      getStorage: () => {
        throw new Error('SecurityError');
      },
    });
    expect(() => store.updateDraft('a', { name: 'Ada' })).not.toThrow();
    expect(draftFor(store.getSnapshot(), 'a').name).toBe('Ada');
  });
});

describe('parsePersistedState', () => {
  it('survives corrupt JSON', () => {
    expect(parsePersistedState('{not json').tickets).toEqual([]);
  });

  it('drops invalid tickets and repairs drafts field by field', () => {
    const state = parsePersistedState(
      JSON.stringify({
        drafts: { a: { quantity: 999, name: 'Ada', email: 42 } },
        tickets: [{ code: 'bad' }, SNAPSHOT],
      }),
    );
    expect(state.drafts.a).toMatchObject({ quantity: 1, name: 'Ada', email: '' });
    expect(state.tickets.map((t) => t.code)).toEqual([SNAPSHOT.code]);
  });

  it('reads the key the store writes', () => {
    const storage = memoryStorage();
    makeStore(storage).store.saveTicket(SNAPSHOT);
    expect(parsePersistedState(storage.getItem(STORAGE_KEY)).tickets).toHaveLength(1);
  });
});
