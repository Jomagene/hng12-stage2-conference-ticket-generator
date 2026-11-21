'use client';

import { useFieldArray, useFormState } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form-fields';
import { LIMITS } from '@/config/event-options';

const NEW_TIER = { id: '', name: '', description: '', price: 0, capacity: 50, sold: 0 };

export function TierFields({ control }) {
  // RHF uses `id` as its row key by default, which would overwrite the tier ids.
  const tiers = useFieldArray({ control, name: 'tiers', keyName: 'rowKey' });
  const { errors } = useFormState({ control, name: 'tiers' });
  const listError = errors.tiers?.message ?? errors.tiers?.root?.message;

  return (
    <>
      <ol className="flex flex-col gap-4">
        {tiers.fields.map((tier, index) => {
          const sold = tier.sold ?? 0;
          return (
            <li key={tier.rowKey} className="flex flex-col gap-4 rounded-2xl border border-line-muted bg-panel p-4">
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
                <TextField
                  control={control}
                  name={`tiers.${index}.name`}
                  label="Name *"
                  placeholder="VIP"
                  maxLength={40}
                />
                <TextField
                  control={control}
                  name={`tiers.${index}.description`}
                  label="What it includes"
                  placeholder="VIP Access"
                  maxLength={60}
                />
                <TextField
                  control={control}
                  name={`tiers.${index}.price`}
                  label="Price (0 = free)"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                />
                <TextField
                  control={control}
                  name={`tiers.${index}.capacity`}
                  label="Spots *"
                  type="number"
                  min={Math.max(1, sold)}
                  inputMode="numeric"
                />
              </div>
            </li>
          );
        })}
      </ol>
      {listError && (
        <p role="alert" className="text-sm text-danger">
          {listError}
        </p>
      )}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        disabled={tiers.fields.length >= LIMITS.maxTiers}
        onClick={() => tiers.append(NEW_TIER)}>
        <Plus aria-hidden /> Add ticket type
      </Button>
    </>
  );
}
