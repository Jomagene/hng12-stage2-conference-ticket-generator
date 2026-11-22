import { accentStyle } from '@/lib/color';
import { cn } from '@/lib/utils';
import type React from 'react';

export function EventTheme({
  color,
  className,
  children,
}: {
  color: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('contents', className)} style={accentStyle(color)}>
      {children}
    </div>
  );
}
