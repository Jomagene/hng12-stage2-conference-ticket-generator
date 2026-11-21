import { cn } from '@/lib/utils';
import { fieldClasses } from './input';

export function Textarea({ className, ...props }) {
  return <textarea className={cn(fieldClasses, 'min-h-32 resize-y', className)} {...props} />;
}
