'use client';

import type { ComponentProps, ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input, fieldClasses } from './input';
import { Textarea } from './textarea';

export { Form };

interface FieldProps<TValues extends FieldValues, TOutput> {
  control: Control<TValues, unknown, TOutput>;
  name: FieldPath<TValues>;
  label: ReactNode;
}

type NativeInputProps = Omit<
  ComponentProps<'input'>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref'
>;

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
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

export function TextField<TValues extends FieldValues, TOutput = TValues>({
  control,
  name,
  label,
  multiline = false,
  icon: Icon,
  className,
  ...inputProps
}: FieldProps<TValues, TOutput> & NativeInputProps & { multiline?: boolean; icon?: LucideIcon }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const shared = {
          ...field,
          value: (field.value ?? '') as string | number,
          className: cn(Icon && 'pl-10', className),
        };
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="relative">
              {Icon && (
                <Icon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2" aria-hidden />
              )}
              <FormControl>
                {multiline ? (
                  <Textarea {...shared} maxLength={inputProps.maxLength} placeholder={inputProps.placeholder} />
                ) : (
                  <Input {...inputProps} {...shared} />
                )}
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function SelectField<TValues extends FieldValues, TOutput = TValues>({
  control,
  name,
  label,
  options,
}: FieldProps<TValues, TOutput> & { options: ReadonlyArray<{ value: string; label: string }> }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select
              className={cn(fieldClasses, 'h-12 [&>option]:bg-panel')}
              {...field}
              value={String(field.value ?? '')}>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CheckboxField<TValues extends FieldValues, TOutput = TValues>({
  control,
  name,
  label,
  description,
}: FieldProps<TValues, TOutput> & { description?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref } }) => (
        <FormItem className="flex-row items-start gap-3">
          <FormControl>
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-accent"
              name={name}
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              ref={ref}
            />
          </FormControl>
          <div className="flex flex-col gap-0.5">
            <FormLabel className="cursor-pointer">{label}</FormLabel>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
        </FormItem>
      )}
    />
  );
}
