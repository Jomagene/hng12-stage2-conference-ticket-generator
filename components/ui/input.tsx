import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const fieldClasses = cn(
  'w-full rounded-xl border-2 border-line-subtle bg-panel p-3 text-base text-white transition',
  'placeholder:text-white/40 hover:border-accent hover:shadow-glow',
  'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
  'aria-[invalid=true]:border-danger',
  'disabled:cursor-not-allowed disabled:opacity-60',
);

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}
