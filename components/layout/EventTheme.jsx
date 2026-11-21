import { accentStyle } from '@/lib/color';
import { cn } from '@/lib/utils';

export function EventTheme({ color, className, children }) {
  return (
    <div className={cn('contents', className)} style={accentStyle(color)}>
      {children}
    </div>
  );
}
