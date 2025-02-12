import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex w-full items-center justify-between rounded-xl border-[2px] border-[#07373F] p-2 focus:outline-none focus:ring-1 focus:ring-[#37a2b5] min-h-[127px] bg-[#08252B]',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
