'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, fieldClasses } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TicketCard } from '@/components/ticket/TicketCard';
import { ACCENT_PRESETS, CURRENCIES, LIMITS, TIME_ZONES } from '@/config/event-options';
import { accentStyle } from '@/lib/color';
import { eventInputSchema } from '@/lib/event-schema';
import { ticketPrefixFor } from '@/lib/slug';
import { zonedLocalToUtc } from '@/lib/timezone';
import { cn } from '@/lib/utils';

function Section({ title, description, children }) {
  return (
    <fieldset className="flex flex-col gap-5 rounded-3xl border border-line-subtle bg-well p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden>
        <h2 className="font-serif text-xl">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function NativeSelect({ className, ...props }) {
  return <select className={cn(fieldClasses, 'h-12 [&>option]:bg-panel', className)} {...props} />;
}

function Toggle({ checked, onChange, onBlur, name, inputRef, label, description }) {
  return (
    <FormItem className="flex-row items-start gap-3">
      <FormControl>
        <input
          type="checkbox"
          className="mt-1 size-5 shrink-0 accent-accent"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          name={name}
          ref={inputRef}
        />
      </FormControl>
      <div className="flex flex-col gap-0.5">
        <FormLabel className="cursor-pointer">{label}</FormLabel>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
    </FormItem>
  );
}

const toggleProps = ({ value, onChange, onBlur, name, ref }) => ({
  checked: value,
  onChange,
  onBlur,
  name,
  inputRef: ref,
});

function TicketPreview({ control }) {
  const values = useWatch({ control });
  let startsAt = new Date().toISOString();
  try {
    if (values.startsAtLocal) startsAt = zonedLocalToUtc(values.startsAtLocal, values.timeZone).toISOString();
  } catch {}
  const ticket = {
    code: `${ticketPrefixFor(values.name || 'Your Event', startsAt)}-0000-0000`,
    eventSlug: 'preview',
    event: {
      name: values.name || 'Your Event',
      venue: values.venue || 'Venue',
      startsAt,
      timeZone: values.timeZone || 'UTC',
      accentColor: /^#[0-9a-f]{6}$/i.test(values.accentColor ?? '') ? values.accentColor : '#24A0B5',
      extraQuestion: values.extraQuestion?.trim() || null,
    },
    tierName: values.tiers?.[0]?.name || 'Regular',
    quantity: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    avatarUrl: '',
    extraAnswer: '',
    bookedAt: new Date().toISOString(),
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">Ticket preview</p>
      <TicketCard ticket={ticket} />
    </div>
  );
}

// onSubmit returns the server action result ({ ok, error, field }).
export function EventForm({ defaultValues, mode, onSubmit }) {
  const isEdit = mode === 'edit';
  const form = useForm({ resolver: zodResolver(eventInputSchema), mode: 'onTouched', defaultValues });
  // RHF uses `id` as its row key by default, which would overwrite the tier ids.
  const tiers = useFieldArray({ control: form.control, name: 'tiers', keyName: 'rowKey' });
  const accent = useWatch({ control: form.control, name: 'accentColor' });
  const timeZone = useWatch({ control: form.control, name: 'timeZone' });
  const zones = TIME_ZONES.includes(timeZone) ? TIME_ZONES : [timeZone, ...TIME_ZONES];

  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (local && !isEdit && !form.getFieldState('timeZone').isDirty) form.setValue('timeZone', local);
  }, [form, isEdit]);

  async function handleSubmit(values) {
    const result = await onSubmit(values);
    if (result?.ok) return;
    if (result?.field) form.setError(result.field, { message: result.error }, { shouldFocus: true });
    toast.error(result?.error ?? 'Could not save the event.');
  }

  const tiersError = form.formState.errors.tiers?.message ?? form.formState.errors.tiers?.root?.message;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
        style={accentStyle(accent)}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Section title="Event details">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Techember Fest ”27" maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short description *</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-20"
                      maxLength={200}
                      placeholder="What is it, and who is it for?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hostName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hosted by</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name or organisation" maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="Date & place">
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue *</FormLabel>
                  <FormControl>
                    <Input placeholder="04 Rumens road, Ikoyi, Lagos" maxLength={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startsAtLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" className="[color-scheme:dark]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time zone *</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {zones.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone.replaceAll('_', ' ')}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          <Section title="Tickets" description="Free and paid ticket types, each with its own number of spots.">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxPerOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max tickets per booking</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={LIMITS.maxPerOrder} inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ol className="flex flex-col gap-4">
              {tiers.fields.map((tier, index) => {
                const sold = tier.sold ?? 0;
                return (
                  <li
                    key={tier.rowKey}
                    className="flex flex-col gap-4 rounded-2xl border border-line-muted bg-panel p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted">
                        Ticket type {index + 1}
                        {sold > 0 && ` · ${sold} booked`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => tiers.remove(index)}
                        disabled={tiers.fields.length === 1 || sold > 0}
                        title={sold > 0 ? 'Ticket types with bookings cannot be removed' : undefined}
                        aria-label={`Remove ticket type ${index + 1}`}>
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="VIP" maxLength={40} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What it includes</FormLabel>
                            <FormControl>
                              <Input placeholder="VIP Access" maxLength={60} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (0 = free)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} step="any" inputMode="decimal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.capacity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spots *</FormLabel>
                            <FormControl>
                              <Input type="number" min={Math.max(1, sold)} inputMode="numeric" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
            {tiersError && (
              <p role="alert" className="text-sm text-danger">
                {tiersError}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              disabled={tiers.fields.length >= LIMITS.maxTiers}
              onClick={() => tiers.append({ id: '', name: '', description: '', price: 0, capacity: 50, sold: 0 })}>
              <Plus aria-hidden /> Add ticket type
            </Button>
          </Section>

          <Section title="Booking form" description="What attendees provide when they book.">
            <FormField
              control={form.control}
              name="requirePhoto"
              render={({ field }) => (
                <Toggle
                  {...toggleProps(field)}
                  label="Require a profile photo"
                  description="Printed on the ticket so door staff can match faces; makes ticket resale harder."
                />
              )}
            />
            <FormField
              control={form.control}
              name="extraQuestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom question (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="T-shirt size? Dietary needs? Company?" maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="Appearance & visibility">
            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand colour</FormLabel>
                  <div className="flex flex-wrap items-center gap-3">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => form.setValue('accentColor', preset.value, { shouldDirty: true })}
                        aria-label={preset.label}
                        aria-pressed={field.value.toUpperCase() === preset.value.toUpperCase()}
                        className="size-9 rounded-full border-2 border-white/10 transition aria-pressed:scale-110 aria-pressed:border-white"
                        style={{ backgroundColor: preset.value }}
                      />
                    ))}
                    <FormControl>
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        className="h-9 w-14 cursor-pointer rounded-lg border-2 border-line-subtle bg-transparent"
                        aria-label="Custom colour"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="listed"
              render={({ field }) => (
                <Toggle
                  {...toggleProps(field)}
                  label="Show on the public events page"
                  description="Off: only people with the link can book."
                />
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <Toggle
                  {...toggleProps(field)}
                  label="Open for booking"
                  description="Off: the event page is hidden from everyone."
                />
              )}
            />
          </Section>

          <Button type="submit" disabled={form.formState.isSubmitting} className="sm:self-end">
            {form.formState.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
          </Button>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <TicketPreview control={form.control} />
          </div>
        </aside>
      </form>
    </Form>
  );
}
