export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

export default function ManageLayout({ children }: LayoutProps<'/manage'>) {
  return children;
}
