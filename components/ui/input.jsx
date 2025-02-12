import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full rounded-xl border-[2px] border-[#07373F] p-3 focus:outline-none focus:ring-1 focus:ring-[#37a2b5] text-base focus-visible:outline-none focus-visible:ring-2 bg-[#08252B]',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
