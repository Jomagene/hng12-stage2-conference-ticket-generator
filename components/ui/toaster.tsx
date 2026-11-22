'use client';

import { Toaster as HotToaster } from 'react-hot-toast';
import theme from '@/config/theme';

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: theme.colors.panel,
          color: '#fff',
          border: `1px solid ${theme.colors.line.DEFAULT}`,
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: theme.defaultAccent, secondary: '#fff' } },
      }}
    />
  );
}
