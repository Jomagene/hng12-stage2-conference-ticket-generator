import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Toaster } from '@/components/ui/toaster';
import { SITE } from '@/config/site';
import theme from '@/config/theme';
import { fontVariables } from '@/lib/fonts';

const description = `${SITE.tagline} Create an event in minutes, share the link, check people in at the door.`;

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} · Event tickets`, template: `%s · ${SITE.name}` },
  description,
  openGraph: { type: 'website', siteName: SITE.name, title: SITE.name, description },
};

export const viewport = {
  themeColor: theme.colors.page,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-page">
          Skip to content
        </a>
        <div className="flex flex-col gap-5 px-4 py-3 sm:gap-12 sm:px-5 sm:py-6 lg:px-[120px]">
          <SiteHeader />
          <main id="content">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
