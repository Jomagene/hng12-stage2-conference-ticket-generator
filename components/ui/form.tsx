'use client';

import { type ComponentProps, createContext, useContext, useId } from 'react';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from './label';

// Based on shadcn/ui. FormControl's child must be the input itself, not a wrapper.

export const Form = FormProvider;

const FormFieldContext = createContext<{ name: string } | null>(null);
const FormItemContext = createContext<{ id: string } | null>(null);

export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>, TTransformed = TValues>(
  props: ControllerProps<TValues, TName, TTransformed>,
) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const field = useContext(FormFieldContext);
  const item = useContext(FormItemContext);
  if (!field || !item) throw new Error('useFormField must be used inside <FormField> and <FormItem>');

  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: field.name });
  const fieldState = getFieldState(field.name, formState);

  return {
    name: field.name,
    formItemId: `${item.id}-form-item`,
    formDescriptionId: `${item.id}-form-item-description`,
    formMessageId: `${item.id}-form-item-message`,
    ...fieldState,
  };
}

export function FormItem({ className, ...props }: ComponentProps<'div'>) {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('flex flex-col gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }: ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();
  return <Label className={cn(error && 'text-danger', className)} htmlFor={formItemId} {...props} />;
}

export function FormControl(props: ComponentProps<typeof Slot>) {
  const { error, formItemId, formMessageId } = useFormField();
  return (
    <Slot id={formItemId} aria-describedby={error ? formMessageId : undefined} aria-invalid={!!error} {...props} />
  );
}

export function FormMessage({ className, children, ...props }: ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message) : children;
  if (!body) return null;
  return (
    <p id={formMessageId} role="alert" className={cn('text-sm text-danger', className)} {...props}>
      {body}
    </p>
  );
}
