'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NAV_LINKS, SITE } from '@/config/site';
import { cn } from '@/lib/utils';

function isActive(pathname, href) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/events/');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="glass-header mx-auto flex w-full max-w-[1200px] items-center justify-between rounded-xl border border-line px-2 py-3 font-serif sm:rounded-3xl sm:px-4">
      <Link href="/" className="rounded-xl p-2 hover:shadow-glow" aria-label={`${SITE.name} home`}>
        <Image src="/logo.png" alt="" width={92} height={36} priority />
      </Link>

      <nav aria-label="Main" className="hidden items-center gap-4 text-lg text-muted md:flex">
        {NAV_LINKS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn('rounded-md px-1 transition hover:text-white', active && 'text-white')}>
              {label}
            </Link>
          );
        })}
      </nav>

      <Button asChild variant="light" className="px-4 py-3 font-serif text-sm sm:px-6 sm:py-4 sm:text-base">
        <Link href="/my-tickets">
          MY TICKETS <ArrowRight aria-hidden />
        </Link>
      </Button>
    </header>
  );
}
