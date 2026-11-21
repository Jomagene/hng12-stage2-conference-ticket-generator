'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from './button';

const subscribeNever = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => '';

export function CopyField({ label, path, description, tone = 'default' }) {
  const id = useId();
  const origin = useSyncExternalStore(subscribeNever, getOrigin, getServerOrigin);
  const url = `${origin}${path}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed. Select the link and copy it manually.');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className={cn(
            'min-w-0 flex-1 rounded-xl border-2 bg-panel px-3 py-2 font-mono text-sm',
            tone === 'secret' ? 'border-amber-400/60' : 'border-line-subtle',
          )}
        />
        <Button variant="outline" size="sm" onClick={copy} aria-label={`Copy ${label}`}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
      </div>
      {description && <p className="text-xs text-muted">{description}</p>}
    </div>
  );
}
