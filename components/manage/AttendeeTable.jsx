'use client';

import { useDeferredValue, useState, useTransition } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkInAction, undoCheckInAction } from '@/lib/server/actions';
import { formatShortDateTime } from '@/lib/format';

function matches(attendee, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return [attendee.name, attendee.email, attendee.code, attendee.tierName].some((v) => v.toLowerCase().includes(q));
}

export function AttendeeTable({ slug, attendees, timeZone, extraQuestion }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const [pendingCode, setPendingCode] = useState(null);
  const [, startTransition] = useTransition();
  const visible = attendees.filter((a) => matches(a, deferredQuery));

  function toggle(attendee) {
    setPendingCode(attendee.code);
    startTransition(async () => {
      if (attendee.checkedInAt) await undoCheckInAction(slug, attendee.code);
      else await checkInAction(slug, attendee.code);
      setPendingCode(null);
    });
  }

  if (attendees.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-muted p-8 text-center text-muted">
        No bookings yet. Share your event link to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2" aria-hidden />
        <label htmlFor="attendee-search" className="sr-only">
          Search attendees
        </label>
        <Input
          id="attendee-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, code or ticket type"
          className="pl-10"
        />
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-line-subtle">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Attendees</caption>
          <thead className="bg-well text-muted">
            <tr>
              <th scope="col" className="p-3 font-medium">
                Attendee
              </th>
              <th scope="col" className="p-3 font-medium">
                Ticket
              </th>
              <th scope="col" className="p-3 font-medium">
                Code
              </th>
              {extraQuestion && (
                <th scope="col" className="p-3 font-medium">
                  {extraQuestion}
                </th>
              )}
              <th scope="col" className="p-3 font-medium">
                Booked
              </th>
              <th scope="col" className="p-3 font-medium">
                <span className="sr-only">Check-in</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {visible.map((attendee) => (
              <tr key={attendee.code} className="bg-panel">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                      {attendee.avatarUrl && (
                        <Image src={attendee.avatarUrl} alt="" fill sizes="36px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{attendee.name}</p>
                      <p className="truncate text-muted">{attendee.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {attendee.tierName} × {attendee.quantity}
                </td>
                <td className="p-3 font-mono">{attendee.code}</td>
                {extraQuestion && (
                  <td className="max-w-48 truncate p-3" title={attendee.extraAnswer}>
                    {attendee.extraAnswer || '—'}
                  </td>
                )}
                <td className="whitespace-nowrap p-3 text-muted">{formatShortDateTime(attendee.bookedAt, timeZone)}</td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant={attendee.checkedInAt ? 'ghost' : 'outline'}
                    onClick={() => toggle(attendee)}
                    disabled={pendingCode === attendee.code}
                    aria-label={
                      attendee.checkedInAt ? `Undo check-in for ${attendee.name}` : `Check in ${attendee.name}`
                    }>
                    {attendee.checkedInAt ? '✓ Checked in' : 'Check in'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible.length === 0 && <p className="text-center text-muted">No attendees match “{deferredQuery}”.</p>}
    </div>
  );
}
