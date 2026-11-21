'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PartyPopper, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyField } from '@/components/ui/copy-field';
import { newEventDefaults } from '@/config/event-options';
import { manageAccessPath, manageHref } from '@/config/site';
import { createEventAction } from '@/lib/server/actions';
import { EventForm } from './EventForm';

export function CreateEventFlow() {
  const [created, setCreated] = useState(null);
  const [defaults] = useState(newEventDefaults);

  async function handleSubmit(values) {
    const result = await createEventAction(values);
    if (result.ok) {
      setCreated(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return result;
  }

  if (created) {
    return (
      <div className="flex flex-col gap-6" role="status">
        <div className="flex flex-col items-center gap-3 text-center">
          <PartyPopper className="size-10 text-accent" aria-hidden />
          <h2 className="font-serif text-2xl">Your event is live</h2>
          <p className="text-muted">Share the booking link with your audience.</p>
        </div>

        <CopyField label="Public booking link" path={`/events/${created.slug}`} />

        <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4">
          <p className="flex items-center gap-2 font-medium text-amber-200">
            <TriangleAlert className="size-5" aria-hidden /> Save your private manage link
          </p>
          <p className="text-sm text-muted">
            It is the only way to manage this event from another device or browser. Anyone with it can see your
            attendees, so don&apos;t share it publicly. We can&apos;t show it again.
          </p>
          <CopyField
            label="Private manage link"
            path={manageAccessPath(created.slug, created.manageToken)}
            tone="secret"
          />
        </div>

        <div className="flex flex-col-reverse gap-4 sm:flex-row [&>*]:flex-1">
          <Button asChild variant="outline">
            <Link href={`/events/${created.slug}`}>View event page</Link>
          </Button>
          <Button asChild>
            <Link href={manageHref(created.slug)}>Open dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <EventForm mode="create" defaultValues={defaults} onSubmit={handleSubmit} />;
}
