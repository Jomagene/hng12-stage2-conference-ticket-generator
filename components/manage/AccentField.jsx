'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ACCENT_PRESETS } from '@/config/event-options';

export function AccentField({ control, name = 'accentColor' }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Brand color</FormLabel>
          <div className="flex flex-wrap items-center gap-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => field.onChange(preset.value)}
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
                aria-label="Custom color"
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
