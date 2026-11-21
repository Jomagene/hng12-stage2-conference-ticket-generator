'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { CircleAlert, CircleCheck, CircleX, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkInAction, undoCheckInAction } from '@/lib/server/actions';
import { formatShortDateTime, pluralize } from '@/lib/format';
import { cn } from '@/lib/utils';

const RESULT_STYLES = {
  checked_in: { icon: CircleCheck, title: 'Checked in', className: 'border-emerald-400/50 bg-emerald-500/10' },
  already_checked_in: { icon: CircleAlert, title: 'Already used', className: 'border-amber-400/50 bg-amber-500/10' },
  not_found: { icon: CircleX, title: 'Ticket not found', className: 'border-danger/50 bg-danger/10' },
};

export function CheckInPanel({ slug, timeZone, ticketPrefix }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();

  function submit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    startTransition(async () => {
      const response = await checkInAction(slug, code);
      setResult(response.ok ? response : { status: 'error', error: response.error });
      if (response.ok) setCode('');
    });
  }

  function undo() {
    const target = result?.attendee?.code;
    if (!target) return;
    startTransition(async () => {
      await undoCheckInAction(slug, target);
      setResult(null);
    });
  }

  const style = result && RESULT_STYLES[result.status];

  return (
    <section
      aria-labelledby="checkin-heading"
      className="flex flex-col gap-4 rounded-3xl border border-line-subtle bg-well p-5">
      <h2 id="checkin-heading" className="flex items-center gap-2 font-serif text-xl">
        <ScanLine className="size-5 text-accent" aria-hidden /> Check-in
      </h2>
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="checkin-code" className="sr-only">
          Ticket code
        </label>
        <Input
          id="checkin-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`${ticketPrefix}-XXXX-XXXX`}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="font-mono uppercase"
        />
        <Button type="submit" disabled={pending || !code.trim()}>
          Check in
        </Button>
      </form>

      <div aria-live="polite">
        {result?.status === 'error' && <p className="text-sm text-danger">{result.error}</p>}
        {style && (
          <div className={cn('flex items-center gap-4 rounded-2xl border p-4', style.className)}>
            {result.attendee?.avatarUrl ? (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={result.attendee.avatarUrl}
                  alt={`Photo of ${result.attendee.name}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <style.icon className="size-10 shrink-0" aria-hidden />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="flex items-center gap-2 font-semibold">
                {result.attendee?.avatarUrl && <style.icon className="size-4" aria-hidden />} {style.title}
              </p>
              {result.attendee && (
                <>
                  <p className="truncate">{result.attendee.name}</p>
                  <p className="text-sm text-muted">
                    {result.attendee.tierName} · {pluralize(result.attendee.quantity, 'person', 'people')}
                    {result.status === 'already_checked_in' &&
                      ` · first used ${formatShortDateTime(result.attendee.checkedInAt, timeZone)}`}
                  </p>
                </>
              )}
            </div>
            {result.status === 'checked_in' && (
              <Button variant="ghost" size="sm" onClick={undo} disabled={pending}>
                Undo
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
