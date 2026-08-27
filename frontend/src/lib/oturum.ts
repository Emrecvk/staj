import { cookies } from "next/headers";
import {
  API_URL,
  ERISIM_CEREZI,
  ERISIM_SURESI,
  KULLANICI_CEREZI,
  MISAFIR_SEPET_CEREZI,
  YENILEME_CEREZI,
  YENILEME_SURESI,
  cerezSecenekleri,
  kullaniciCereziDegeri,
  tokenYenilemeyiCagir,
  type TokenGovdesi,
} from "./oturum-ortak";

/** Çerez yazma denemesi için kullanılan, hiçbir zaman kalıcı olmayan ad. */
const YAZMA_DENEMESI_CEREZI = "oturum_yazilabilir_mi";

export async function oturumCerezleriniYaz(token: TokenGovdesi) {
  const cerezler = await cookies();
  cerezler.set(ERISIM_CEREZI, token.accessToken, cerezSecenekleri(ERISIM_SURESI));
  cerezler.set(YENILEME_CEREZI, token.refreshToken, cerezSecenekleri(YENILEME_SURESI));
  cerezler.set(KULLANICI_CEREZI, kullaniciCereziDegeri(token), cerezSecenekleri(ERISIM_SURESI, false));
}

export async function oturumCerezleriniSil(misafirSepetiDe = false) {
  const cerezler = await cookies();
  cerezler.delete(ERISIM_CEREZI);
  cerezler.delete(YENILEME_CEREZI);
  cerezler.delete(KULLANICI_CEREZI);
  if (misafirSepetiDe) cerezler.delete(MISAFIR_SEPET_CEREZI);
}

export async function erisimTokeniGetir(): Promise<string | undefined> {
  return (await cookies()).get(ERISIM_CEREZI)?.value;
}

/**
 * Çerez yazılabilir mi — yani Server Action / Route Handler içinde miyiz?
 *
 * Next.js, sunucu bileşeni render'ı sırasında çerez yazmayı yasaklar ve hata
 * fırlatır. Bunu ÖNCEDEN bilmek zorundayız: yenileme rotasyonlu, yani eski
 * token'ı geri dönülemez biçimde tüketiyor. Render sırasında yenileseydik yeni
 * token'ı hiçbir yere yazamaz, bir sonraki istek tüketilmiş token'ı sunar ve
 * sunucu kullanıcının bütün oturumlarını iptal ederdi.
 *
 * Deneme, var olmayan bir çerezi silmeye çalışmaktır: izin varsa yan etkisiz,
 * izin yoksa hata fırlatır.
 */
async function cerezYazilabilirMi(): Promise<boolean> {
  try {
    const cerezler = await cookies();
    cerezler.set(YAZMA_DENEMESI_CEREZI, "", { path: "/", maxAge: 0 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Süresi dolmuş erişim token'ını refresh token ile yeniler.
 *
 * Yalnızca çerez yazılabildiğinde çalışır. Render sırasında sessizce vazgeçer;
 * o durumda yenilemeyi gezinme sırasında rota koruması (`proxy.ts`) yapar.
 */
export async function tokenYenile(): Promise<TokenGovdesi | null> {
  const cerezler = await cookies();
  const yenilemeTokeni = cerezler.get(YENILEME_CEREZI)?.value;
  if (!yenilemeTokeni) return null;

  if (!(await cerezYazilabilirMi())) return null;

  const sonuc = await tokenYenilemeyiCagir(yenilemeTokeni);

  if (sonuc.token) {
    await oturumCerezleriniYaz(sonuc.token);
    return sonuc.token;
  }

  // Yalnızca sunucu token'ı KESİN reddettiyse oturumu kapat. Geçici bir ağ
  // veya 5xx hatası yüzünden kullanıcıyı atmak, çalışan bir oturumu boş yere
  // kaybetmek olurdu.
  if (sonuc.gecersizMi) await oturumCerezleriniSil();

  return null;
}

/**
 * Kimlikli API isteği: 401 alırsa token'ı yenileyip isteği BİR kez tekrarlar.
 *
 * Çağıran kendi başlıklarını verebilir (sepetteki `X-Session-Key` gibi);
 * `Authorization` başlığını bu fonksiyon yönetir.
 */
export async function yetkiliIstek(yol: string, secenekler: RequestInit = {}): Promise<Response> {
  const gonder = async (erisimTokeni: string | undefined) => {
    const basliklar = new Headers(secenekler.headers);
    if (erisimTokeni) basliklar.set("Authorization", `Bearer ${erisimTokeni}`);
    else basliklar.delete("Authorization");

    return fetch(`${API_URL}${yol}`, { ...secenekler, headers: basliklar, cache: "no-store" });
  };

  const yanit = await gonder(await erisimTokeniGetir());
  if (yanit.status !== 401) return yanit;

  const yeni = await tokenYenile();
  if (!yeni) return yanit;

  return gonder(yeni.accessToken);
}
