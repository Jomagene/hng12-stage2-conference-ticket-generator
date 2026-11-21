'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Divider, StepActions } from '@/components/layout/PageCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { BOOKING_STEPS } from '@/config/site';
import { ticketStore, useTicketStore } from '@/hooks/use-ticket-store';
import { makeAttendeeSchema } from '@/lib/booking-schema';
import { bookTicketAction } from '@/lib/server/actions';
import { draftFor } from '@/lib/ticket-store';
import { AvatarUploader } from './AvatarUploader';
import { resolveTier } from './TicketSelectionForm';

const FORM_FIELDS = new Set(['name', 'email', 'avatarUrl', 'extraAnswer']);

// Mount the form only once the draft is loaded, otherwise defaultValues are empty.
export function AttendeeForm({ event }) {
  const state = useTicketStore();
  if (!state.ready) return <div className="h-[760px] animate-pulse rounded-3xl bg-well" aria-busy="true" />;

  const draft = draftFor(state, event.id);
  const tier = resolveTier(event, draft.tierId);
  if (event.isPast || !tier) {
    return (
      <EmptyState
        title={event.isPast ? 'Bookings are closed' : 'This event is sold out'}
        description="Pick another ticket type or event."
        actionLabel="Back to ticket selection"
        actionHref={BOOKING_STEPS.selection.href(event.slug)}
      />
    );
  }
  return <AttendeeFormFields event={event} draft={draft} tier={tier} />;
}

function AttendeeFormFields({ event, draft, tier }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const schema = useMemo(() => makeAttendeeSchema(event), [event]);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: draft.name,
      email: draft.email,
      avatarUrl: draft.avatarUrl,
      extraAnswer: draft.extraAnswer,
    },
  });

  // Save the draft as the user types.
  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values }) => ticketStore.updateDraft(event.id, values),
      }),
    [form, event.id],
  );

  async function onSubmit(values) {
    const quantity = Math.min(draft.quantity, event.maxPerOrder, tier.remaining);
    const result = await bookTicketAction(event.slug, { ...values, tierId: tier.id, quantity });

    if (!result.ok) {
      if (FORM_FIELDS.has(result.field)) form.setError(result.field, { message: result.error });
      toast.error(result.error);
      if (result.code === 'SOLD_OUT' || result.code === 'CLOSED') router.refresh();
      return;
    }

    ticketStore.saveTicket(result.ticket);
    ticketStore.resetDraft(event.id);
    router.push(BOOKING_STEPS.ready.href(result.ticket.code));
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field, fieldState }) => (
            <FormItem>
              <AvatarUploader
                title={event.requirePhoto ? 'Upload Profile Photo' : 'Upload Profile Photo (optional)'}
                value={field.value}
                onChange={(url) => form.setValue('avatarUrl', url, { shouldValidate: true, shouldDirty: true })}
                onUploadingChange={setUploading}
                invalid={!!fieldState.error}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Divider />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter your name *</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter your email *</FormLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2" aria-hidden />
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="hello@avioflagos.io"
                    className="pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {event.extraQuestion && (
          <FormField
            control={form.control}
            name="extraAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{event.extraQuestion} (optional)</FormLabel>
                <FormControl>
                  <Textarea maxLength={300} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <StepActions>
          <Button asChild variant="outline">
            <Link href={BOOKING_STEPS.selection.href(event.slug)}>Back</Link>
          </Button>
          <Button type="submit" disabled={uploading || submitting}>
            {uploading ? 'Uploading photo…' : submitting ? 'Booking…' : `Get My ${tier.name} Ticket`}
          </Button>
        </StepActions>
      </form>
    </Form>
  );
}
