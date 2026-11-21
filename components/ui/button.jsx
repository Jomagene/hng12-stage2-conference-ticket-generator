import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-serif transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card',
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg hover:shadow-glow hover:brightness-110',
        outline: 'border border-accent text-accent hover:bg-accent/10 hover:shadow-glow',
        light: 'bg-white text-ink hover:scale-105 hover:shadow-glow',
        ghost: 'text-muted hover:bg-white/5 hover:text-white',
      },
      size: {
        md: 'px-6 py-3',
        sm: 'px-3 py-2 text-sm',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export function Button({ className, variant, size, asChild = false, type, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : (type ?? 'button')}
      {...props}
    />
  );
}
