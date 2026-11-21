'use client';

import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input, fieldClasses } from './input';
import { Textarea } from './textarea';

export { Form };

export function FormSection({ title, description, children }) {
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

export function TextField({ control, name, label, multiline = false, icon: Icon, className, ...inputProps }) {
  const Control = multiline ? Textarea : Input;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            {Icon && (
              <Icon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2" aria-hidden />
            )}
            <FormControl>
              <Control className={cn(Icon && 'pl-10', className)} {...inputProps} {...field} />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SelectField({ control, name, label, options }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select className={cn(fieldClasses, 'h-12 [&>option]:bg-panel')} {...field}>
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

export function CheckboxField({ control, name, label, description }) {
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
              checked={value}
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
