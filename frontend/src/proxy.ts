import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/giris') || request.nextUrl.pathname.startsWith('/kayit');
  const isProfilePage = request.nextUrl.pathname.startsWith('/profil');

  if (isProfilePage && !token) {
    return NextResponse.redirect(new URL('/giris', request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/profil', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profil/:path*', '/giris', '/kayit/:path*'],
};
