'use client';

import { useEffect } from 'react';
import { type FieldPath, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { CheckboxField, Form, FormSection, SelectField, TextField } from '@/components/ui/form-fields';
import { CURRENCIES, LIMITS, TIME_ZONES } from '@/config/event-options';
import { accentStyle } from '@/lib/color';
import { eventInputSchema } from '@/lib/event-schema';
import { AccentField } from './AccentField';
import { TicketPreview } from './TicketPreview';
import { TierFields } from './TierFields';
import type { ActionResult, EventFormValues, EventInput } from '@/lib/types';

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c.code, label: c.label }));
const zoneOption = (zone: string) => ({ value: zone, label: zone.replaceAll('_', ' ') });

// onSubmit returns the server action result ({ ok, error, field }).
interface EventFormProps {
  defaultValues: EventFormValues;
  mode: 'create' | 'edit';
  onSubmit: (values: EventInput) => Promise<ActionResult<object>>;
}

export function EventForm({ defaultValues, mode, onSubmit }: EventFormProps) {
  const isEdit = mode === 'edit';
  const form = useForm<EventFormValues, unknown, EventInput>({
    resolver: zodResolver(eventInputSchema),
    mode: 'onTouched',
    defaultValues,
  });
  const { control } = form;
  const accent = useWatch({ control, name: 'accentColor' });
  const timeZone = useWatch({ control, name: 'timeZone' });
  const zones = TIME_ZONES.includes(timeZone) ? TIME_ZONES : [timeZone, ...TIME_ZONES];

  // New events default to the browser's time zone.
  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (local && !isEdit && !form.getFieldState('timeZone').isDirty) form.setValue('timeZone', local);
  }, [form, isEdit]);

  async function handleSubmit(values: EventInput) {
    const result = await onSubmit(values);
    if (result.ok) return;
    if (result.field)
      form.setError(result.field as FieldPath<EventFormValues>, { message: result.error }, { shouldFocus: true });
    toast.error(result.error);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
        style={accentStyle(accent)}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Event details">
            <TextField
              control={control}
              name="name"
              label="Event name *"
              placeholder="Techember Fest ”27"
              maxLength={80}
            />
            <TextField
              control={control}
              name="tagline"
              label="Short description *"
              multiline
              className="min-h-20"
              placeholder="What is it, and who is it for?"
              maxLength={200}
            />
            <TextField
              control={control}
              name="hostName"
              label="Hosted by"
              placeholder="Your name or organization"
              maxLength={80}
            />
          </FormSection>

          <FormSection title="Date & place">
            <TextField
              control={control}
              name="venue"
              label="Venue *"
              placeholder="04 Rumens road, Ikoyi, Lagos"
              maxLength={120}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                control={control}
                name="startsAtLocal"
                label="Starts *"
                type="datetime-local"
                className="[color-scheme:dark]"
              />
              <SelectField control={control} name="timeZone" label="Time zone *" options={zones.map(zoneOption)} />
            </div>
          </FormSection>

          <FormSection title="Tickets" description="Free and paid ticket types, each with its own number of spots.">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField control={control} name="currency" label="Currency" options={CURRENCY_OPTIONS} />
              <TextField
                control={control}
                name="maxPerOrder"
                label="Max tickets per booking"
                type="number"
                min={1}
                max={LIMITS.maxPerOrder}
                inputMode="numeric"
              />
            </div>
            <TierFields control={control} />
          </FormSection>

          <FormSection title="Booking form" description="What attendees provide when they book.">
            <CheckboxField
              control={control}
              name="requirePhoto"
              label="Require a profile photo"
              description="Printed on the ticket so door staff can match faces; makes ticket resale harder."
            />
            <TextField
              control={control}
              name="extraQuestion"
              label="Custom question (optional)"
              placeholder="T-shirt size? Dietary needs? Company?"
              maxLength={80}
            />
          </FormSection>

          <FormSection title="Appearance & visibility">
            <AccentField control={control} />
            <CheckboxField
              control={control}
              name="listed"
              label="Show on the public events page"
              description="Off: only people with the link can book."
            />
            <CheckboxField
              control={control}
              name="published"
              label="Open for booking"
              description="Off: the event page is hidden from everyone."
            />
          </FormSection>

          <Button type="submit" disabled={form.formState.isSubmitting} className="sm:self-end">
            {form.formState.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
          </Button>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <TicketPreview control={control} />
          </div>
        </aside>
      </form>
    </Form>
  );
}
