'use client';

import { useSyncExternalStore } from 'react';
import { ticketStore } from '@/lib/ticket-store';

// `ready` is false during SSR and hydration.
export function useTicketStore() {
  return useSyncExternalStore(ticketStore.subscribe, ticketStore.getSnapshot, ticketStore.getServerSnapshot);
}

export { ticketStore };
