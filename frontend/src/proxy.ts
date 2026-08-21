import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rota koruması (Next.js middleware).
 *
 * ÖNEMLİ: Bu bir güvenlik sınırı DEĞİLDİR, yalnızca gezinme denetimidir.
 * Yetkinin asıl denetimi API tarafındaki YonetimErisimi / IcerikErisimi /
 * SatisErisimi politikalarıdır. Buradaki kontrol, yetkisiz kullanıcıyı boş
 * bir panele sokup 403 yağmuruna tutmak yerine anlamlı bir yere yönlendirir.
 *
 * Rol, istemcinin yazabildiği "user" çerezinden değil, httpOnly saklanan
 * access token'ın içinden okunur. Önceki sürümde rol kontrolü tamamen yorum
 * satırındaydı; giriş yapan HERKES /yonetim'e girebiliyordu.
 */

/** Yönetim paneline girebilen roller — API politikalarıyla hizalı. */
const YONETIM_ROLLERI = ['Admin', 'Editor', 'SatisTemsilcisi'];

/**
 * JWT gövdesini imza doğrulamadan okur.
 *
 * Doğrulamamak burada kasıtlı: middleware'in imza anahtarı yok ve olmamalı.
 * Sahte bir token üretip menüyü açtırmak mümkündür, ama o token'la yapılan
 * her API çağrısı sunucuda reddedilir — panel veri göstermez.
 */
function tokendanRolOku(token: string): string | null {
  try {
    const govde = token.split('.')[1];
    if (!govde) return null;

    // base64url -> base64
    const base64 = govde.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    const claims = JSON.parse(json);

    // JwtSecurityTokenHandler, ClaimTypes.Role'u "role" kısa adına eşler.
    const rol = claims.role ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return Array.isArray(rol) ? rol[0] : (rol ?? null);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const yol = request.nextUrl.pathname;

  const kimlikSayfasi = yol.startsWith('/giris') || yol.startsWith('/kayit');
  const profilSayfasi = yol.startsWith('/profil');
  const yonetimSayfasi = yol.startsWith('/yonetim');

  // Girişsiz kullanıcı korumalı alanlara giremez; nereden geldiği korunur ki
  // giriş sonrası aynı sayfaya dönebilsin.
  if ((profilSayfasi || yonetimSayfasi) && !token) {
    const hedef = new URL('/giris', request.url);
    hedef.searchParams.set('devam', yol);
    return NextResponse.redirect(hedef);
  }

  // Yönetim alanı yalnızca yetkili rollere açık.
  if (yonetimSayfasi && token) {
    const rol = tokendanRolOku(token);
    if (!rol || !YONETIM_ROLLERI.includes(rol)) {
      return NextResponse.redirect(new URL('/profil?hata=yetkisiz', request.url));
    }
  }

  if (kimlikSayfasi && token) {
    return NextResponse.redirect(new URL('/profil', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profil/:path*', '/yonetim/:path*', '/giris', '/kayit/:path*'],
};
