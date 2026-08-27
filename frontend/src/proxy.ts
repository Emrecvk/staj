import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ERISIM_CEREZI,
  ERISIM_SURESI,
  KULLANICI_CEREZI,
  YENILEME_CEREZI,
  YENILEME_SURESI,
  cerezSecenekleri,
  kullaniciCereziDegeri,
  tokenYenilemeyiCagir,
  type TokenGovdesi,
} from '@/lib/oturum-ortak';
import { tokenYenilenmeliMi } from '@/lib/token-suresi';

/**
 * Rota koruması (Next.js middleware) + oturum tazeleme.
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

// Not: Next.js 16'da proxy dosyası her zaman Node.js çalışma zamanında koşar
// (segment yapılandırması da bu yüzden yasak). Token yenileme için bu şart:
// `API_INTERNAL_URL` yalnızca çalışma anında tanımlı, Edge'de derleme anında
// gömülen değer boş kalırdı.

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

/** Tazelenen ya da sonlanan oturumu giden yanıta işler. */
function oturumuYanitaIsle(
  yanit: NextResponse,
  yeniOturum: TokenGovdesi | null,
  oturumBittiMi: boolean,
): NextResponse {
  if (yeniOturum) {
    yanit.cookies.set(ERISIM_CEREZI, yeniOturum.accessToken, cerezSecenekleri(ERISIM_SURESI));
    yanit.cookies.set(YENILEME_CEREZI, yeniOturum.refreshToken, cerezSecenekleri(YENILEME_SURESI));
    yanit.cookies.set(KULLANICI_CEREZI, kullaniciCereziDegeri(yeniOturum), cerezSecenekleri(ERISIM_SURESI, false));
  } else if (oturumBittiMi) {
    yanit.cookies.delete(ERISIM_CEREZI);
    yanit.cookies.delete(YENILEME_CEREZI);
    yanit.cookies.delete(KULLANICI_CEREZI);
  }

  return yanit;
}

export async function proxy(request: NextRequest) {
  const yol = request.nextUrl.pathname;

  let token = request.cookies.get(ERISIM_CEREZI)?.value;
  const yenilemeTokeni = request.cookies.get(YENILEME_CEREZI)?.value;

  let yeniOturum: TokenGovdesi | null = null;
  let oturumBittiMi = false;

  /**
   * Access token çerezi, JWT ile aynı anda (2 saat) ölüyor. Yenileme olmadan
   * kullanıcı, elinde 7 gün geçerli bir refresh token varken giriş ekranına
   * atılıyordu. Tazeleme burada yapılır: gezinme başına bir kez çalışır ve
   * yanıta çerez yazabilir — sunucu bileşeni render'ı ikisini de yapamaz.
   */
  if (tokenYenilenmeliMi(token) && yenilemeTokeni) {
    const sonuc = await tokenYenilemeyiCagir(yenilemeTokeni);

    if (sonuc.token) {
      yeniOturum = sonuc.token;
      token = sonuc.token.accessToken;

      // Render'ın da tazelenmiş token'ı görmesi için istek çerezleri
      // güncellenir; aksi halde sayfa, çerez yanıtta yenilenmiş olsa bile
      // bu ilk gezinmede hâlâ "giriş yapılmamış" gibi çizilir.
      request.cookies.set(ERISIM_CEREZI, sonuc.token.accessToken);
      request.cookies.set(YENILEME_CEREZI, sonuc.token.refreshToken);
      request.cookies.set(KULLANICI_CEREZI, kullaniciCereziDegeri(sonuc.token));
    } else if (sonuc.gecersizMi) {
      oturumBittiMi = true;
      request.cookies.delete(YENILEME_CEREZI);
      request.cookies.delete(KULLANICI_CEREZI);
    }
  }

  const kimlikSayfasi = yol.startsWith('/giris') || yol.startsWith('/kayit');
  const profilSayfasi = yol.startsWith('/profil');
  const yonetimSayfasi = yol.startsWith('/yonetim');

  // Girişsiz kullanıcı korumalı alanlara giremez; nereden geldiği korunur ki
  // giriş sonrası aynı sayfaya dönebilsin.
  if ((profilSayfasi || yonetimSayfasi) && !token) {
    const hedef = new URL('/giris', request.url);
    hedef.searchParams.set('devam', yol);
    // Oturum yenilenemediyse kullanıcı bunu "kendiliğinden çıkış yaptım"
    // diye değil, süre dolumu olarak görmeli.
    if (oturumBittiMi) hedef.searchParams.set('oturum', 'doldu');
    return oturumuYanitaIsle(NextResponse.redirect(hedef), null, oturumBittiMi);
  }

  // Yönetim alanı yalnızca yetkili rollere açık.
  if (yonetimSayfasi && token) {
    const rol = tokendanRolOku(token);
    if (!rol || !YONETIM_ROLLERI.includes(rol)) {
      return oturumuYanitaIsle(
        NextResponse.redirect(new URL('/profil?hata=yetkisiz', request.url)),
        yeniOturum,
        oturumBittiMi,
      );
    }
  }

  if (kimlikSayfasi && token) {
    // Giriş sonrası varsayılan hedefle (auth.ts login()) tutarlı: giriş yapmış
    // kullanıcı /giris veya /kayit'i tekrar açarsa ana sayfaya döner.
    return oturumuYanitaIsle(NextResponse.redirect(new URL('/', request.url)), yeniOturum, oturumBittiMi);
  }

  const devam = NextResponse.next({ request: { headers: request.headers } });
  return oturumuYanitaIsle(devam, yeniOturum, oturumBittiMi);
}

/**
 * Yenilemenin işe yaraması için koruma her sayfa gezinmesinde çalışmalı:
 * oturum yalnızca /profil'e girildiğinde değil, katalogda gezerken de
 * tazelenmeli. Statik varlıklar ve API vekili dışarıda bırakılır; kalan iş
 * yalnızca bir çerez okumasıdır.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|pdf)$).*)',
  ],
};
