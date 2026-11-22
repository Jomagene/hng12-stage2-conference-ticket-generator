import type { ReactNode } from 'react';

// template.tsx remounts on every navigation, which gives each page its fade-in.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in motion-reduce:animate-none">{children}</div>;
}
