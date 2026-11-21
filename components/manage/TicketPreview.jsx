'use client';

import { useWatch } from 'react-hook-form';
import { TicketCard } from '@/components/ticket/TicketCard';
import { DEFAULT_ACCENT } from '@/config/event-options';
import { HEX_COLOR } from '@/lib/color';
import { ticketPrefixFor } from '@/lib/slug';
import { zonedLocalToUtc } from '@/lib/timezone';

function previewStart(local, timeZone) {
  try {
    return zonedLocalToUtc(local, timeZone).toISOString();
  } catch {
    return new Date().toISOString(); // date not filled in yet
  }
}

export function TicketPreview({ control }) {
  const values = useWatch({ control });
  const name = values.name || 'Your Event';
  const startsAt = previewStart(values.startsAtLocal, values.timeZone);

  const ticket = {
    code: `${ticketPrefixFor(name, startsAt)}-0000-0000`,
    eventSlug: 'preview',
    event: {
      name,
      venue: values.venue || 'Venue',
      startsAt,
      timeZone: values.timeZone || 'UTC',
      accentColor: HEX_COLOR.test(values.accentColor ?? '') ? values.accentColor : DEFAULT_ACCENT,
      extraQuestion: values.extraQuestion?.trim() || null,
    },
    tierName: values.tiers?.[0]?.name || 'Regular',
    quantity: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    avatarUrl: '',
    extraAnswer: '',
    bookedAt: startsAt,
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">Ticket preview</p>
      <TicketCard ticket={ticket} />
    </div>
  );
}
