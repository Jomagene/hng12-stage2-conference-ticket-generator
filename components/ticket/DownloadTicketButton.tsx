'use client';

import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { downloadNodeAsPng } from '@/lib/download-ticket';
import type { ComponentProps, RefObject } from 'react';

type DownloadTicketButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
};

export function DownloadTicketButton({ targetRef, fileName, children, ...props }: DownloadTicketButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!targetRef.current || busy) return;
    setBusy(true);
    const toastId = toast.loading('Preparing your ticket…');
    try {
      await downloadNodeAsPng(targetRef.current, fileName);
      toast.success('Ticket downloaded', { id: toastId });
    } catch (error) {
      console.error('Ticket export failed', error);
      toast.error('We could not create the image. Please try again.', { id: toastId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={busy} aria-busy={busy} {...props}>
      {busy ? <LoaderCircle className="animate-spin" aria-hidden /> : <Download aria-hidden />}
      {children}
    </Button>
  );
}
