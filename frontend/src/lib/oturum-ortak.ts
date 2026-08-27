/**
 * Oturum/token temelleri — `next/headers` KULLANMAZ.
 *
 * Bu modül hem sunucu eylemlerinden (Node çalışma zamanı) hem de rota
 * korumasından (`proxy.ts`) içe aktarılır. `cookies()` gibi istek bağlamına
 * bağlı API'ler burada olamaz; çerezle ilgili işler `oturum.ts` içinde.
 */

export const API_URL =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const ERISIM_CEREZI = "accessToken";
export const YENILEME_CEREZI = "refreshToken";
export const KULLANICI_CEREZI = "user";
export const MISAFIR_SEPET_CEREZI = "guestCartId";

/** Access token'ın JWT ömrüyle aynı: çerez, token'dan uzun yaşamamalı. */
export const ERISIM_SURESI = 60 * 60 * 2;
export const YENILEME_SURESI = 60 * 60 * 24 * 7;

export type TokenGovdesi = {
  accessToken: string;
  refreshToken: string;
  kullaniciAdi: string;
  firmaMi: boolean;
  firmaId: number | null;
};

export type YenilemeSonucu = {
  token: TokenGovdesi | null;
  /** Sunucu token'ı açıkça reddetti (süresi doldu / iptal edildi). */
  gecersizMi: boolean;
};

export function cerezSecenekleri(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Başlıktaki hesap menüsünün okuduğu gösterim bilgisi (httpOnly değil). */
export function kullaniciCereziDegeri(token: TokenGovdesi) {
  return JSON.stringify({ ad: token.kullaniciAdi, firmaMi: token.firmaMi, firmaId: token.firmaId });
}

// ---------------------------------------------------------------------------
// Süreç içi tek uçuşlu yenileme
// ---------------------------------------------------------------------------

/**
 * Aynı Next.js çalışma zamanı içinde aynı refresh token ile eşzamanlı yapılan
 * çağrılar tek bir ağ isteğini paylaşır. Bu yalnızca gereksiz istekleri azaltan
 * bir optimizasyondur; middleware, sunucu işlemleri ve birden fazla uygulama
 * örneği aynı belleği paylaşmayabilir. Yarış güvenliğinin asıl güvencesi API'nin
 * idempotent token rotasyonudur.
 *
 * Tamamlanmış yanıtları burada saklamıyoruz. Eski bir kesin retin veya erişim
 * tokenının süreç belleğinden tekrar sunulması yerine her yeni dalga API'deki
 * güncel oturum durumunu görür.
 */
const ucustakiYenilemeler = new Map<string, Promise<YenilemeSonucu>>();

/**
 * Refresh token'ı yeni bir oturumla takas eder.
 *
 * İstek tamamlandığında kayıt silinir; sonraki çağrı API'deki güncel durumu
 * denetler. API, çok kısa aralıklı eski-token tekrarlarına aynı ardılı verir.
 */
export function tokenYenilemeyiCagir(yenilemeTokeni: string): Promise<YenilemeSonucu> {
  const mevcut = ucustakiYenilemeler.get(yenilemeTokeni);
  if (mevcut) return mevcut;

  const istek = (async (): Promise<YenilemeSonucu> => {
    try {
      const yanit = await fetch(`${API_URL}/Kimlik/yenile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: yenilemeTokeni }),
        cache: "no-store",
      });

      if (yanit.ok) return { token: (await yanit.json()) as TokenGovdesi, gecersizMi: false };

      // 401 = token süresi dolmuş / iptal edilmiş; oturum gerçekten bitti.
      // Diğer kodlar (5xx) geçici olabilir, oturumu silmeye gerekçe değil.
      return { token: null, gecersizMi: yanit.status === 401 || yanit.status === 400 };
    } catch {
      return { token: null, gecersizMi: false };
    } finally {
      ucustakiYenilemeler.delete(yenilemeTokeni);
    }
  })();

  ucustakiYenilemeler.set(yenilemeTokeni, istek);
  return istek;
}
