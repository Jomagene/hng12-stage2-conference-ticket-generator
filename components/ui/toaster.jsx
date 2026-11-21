'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#08252B',
          color: '#fff',
          border: '1px solid #197686',
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: '#24A0B5', secondary: '#fff' } },
      }}
    />
  );
}
