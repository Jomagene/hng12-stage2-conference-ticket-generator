'use client';

import { type FormEvent, useState, useTransition } from 'react';
import Image from 'next/image';
import { CircleAlert, CircleCheck, CircleX, type LucideIcon, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkInAction, undoCheckInAction } from '@/lib/server/actions';
import { formatShortDateTime, pluralize } from '@/lib/format';
import type { CheckInResult } from '@/lib/server/repo';
import { cn } from '@/lib/utils';

const RESULT_STYLES: Record<CheckInResult['status'], { icon: LucideIcon; title: string; className: string }> = {
  checked_in: { icon: CircleCheck, title: 'Checked in', className: 'border-emerald-400/50 bg-emerald-500/10' },
  already_checked_in: { icon: CircleAlert, title: 'Already used', className: 'border-amber-400/50 bg-amber-500/10' },
  not_found: { icon: CircleX, title: 'Ticket not found', className: 'border-danger/50 bg-danger/10' },
};

type PanelState = CheckInResult | { status: 'error'; error: string };

export function CheckInPanel({
  slug,
  timeZone,
  ticketPrefix,
}: {
  slug: string;
  timeZone: string;
  ticketPrefix: string;
}) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<PanelState | null>(null);
  const [pending, startTransition] = useTransition();
  const outcome = result && result.status !== 'error' ? result : null;
  const style = outcome ? RESULT_STYLES[outcome.status] : null;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;
    startTransition(async () => {
      const response = await checkInAction(slug, code);
      setResult(response.ok ? response : { status: 'error', error: response.error });
      if (response.ok) setCode('');
    });
  }

  function undo() {
    const target = outcome?.attendee?.code;
    if (!target) return;
    startTransition(async () => {
      await undoCheckInAction(slug, target);
      setResult(null);
    });
  }

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
        {outcome && style && (
          <div className={cn('flex items-center gap-4 rounded-2xl border p-4', style.className)}>
            {outcome.attendee?.avatarUrl ? (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={outcome.attendee.avatarUrl}
                  alt={`Photo of ${outcome.attendee.name}`}
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
                {outcome.attendee?.avatarUrl && <style.icon className="size-4" aria-hidden />} {style.title}
              </p>
              {outcome.attendee && (
                <>
                  <p className="truncate">{outcome.attendee.name}</p>
                  <p className="text-sm text-muted">
                    {outcome.attendee.tierName} · {pluralize(outcome.attendee.quantity, 'person', 'people')}
                    {outcome.status === 'already_checked_in' &&
                      outcome.attendee.checkedInAt &&
                      ` · first used ${formatShortDateTime(outcome.attendee.checkedInAt, timeZone)}`}
                  </p>
                </>
              )}
            </div>
            {outcome.status === 'checked_in' && (
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
