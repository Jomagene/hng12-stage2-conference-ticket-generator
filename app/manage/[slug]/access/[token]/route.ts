import { type NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { findEventBySlug, verifyManageToken } from '@/lib/server/repo';
import { manageCookieName, manageCookieOptions } from '@/lib/server/manage-auth';

// Swap the token in the URL for a cookie so it doesn't stay in the address bar.
export async function GET(request: NextRequest, { params }: RouteContext<'/manage/[slug]/access/[token]'>) {
  const { slug, token } = await params;
  const found = await findEventBySlug(await getDb(), slug, { includeUnpublished: true });

  if (!found || !verifyManageToken(found.row, token)) {
    return NextResponse.redirect(new URL('/manage?error=invalid-link', request.url));
  }

  const response = NextResponse.redirect(new URL(`/manage/${slug}`, request.url));
  response.cookies.set(manageCookieName(found.row.id), token, manageCookieOptions);
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
