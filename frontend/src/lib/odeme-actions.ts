"use server";

import { cookies } from "next/headers";

import { yetkiliIstek } from "./oturum";
import { ERISIM_CEREZI, YENILEME_CEREZI } from "./oturum-ortak";

export type OdemeYaniti = {
  basarili: boolean;
  mesaj: string;
  hataKodu?: string | null;
  yenidenDenenebilir: boolean;
  siparisNo?: string | null;
  siparisDurumu: number;
};

/**
 * Siparişin ödemesini başlatır.
 *
 * KART VERISI GONDERILMEZ. Gerçek entegrasyonda tarayıcı kartı doğrudan
 * sağlayıcıya gönderip tek kullanımlık jeton alır; buraya yalnızca jeton
 * gelir. Sandbox'ta jeton, denenmek istenen senaryonun anahtarıdır.
 */
export async function odemeYap(siparisId: number, odemeJetonu: string, kartSahibi?: string) {
  const cookieStore = await cookies();
  // Erişim token'ı dolmuş olabilir; refresh token duruyorsa oturum sürüyordur
  // ve `yetkiliIstek` 401'de token'ı tazeleyip isteği tekrarlar.
  const oturumVar =
    cookieStore.get(ERISIM_CEREZI)?.value || cookieStore.get(YENILEME_CEREZI)?.value;

  if (!oturumVar) {
    return {
      basarili: false,
      mesaj: "Ödeme için giriş yapmalısınız.",
      yenidenDenenebilir: false,
      siparisDurumu: 0,
    } as OdemeYaniti;
  }

  try {
    const yanit = await yetkiliIstek(`/Odeme/${siparisId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odemeJetonu, kartSahibi }),
    });

    if (yanit.status === 429) {
      return {
        basarili: false,
        mesaj: "Çok fazla ödeme denemesi yaptınız. Lütfen biraz bekleyip tekrar deneyin.",
        yenidenDenenebilir: true,
        siparisDurumu: 0,
      } as OdemeYaniti;
    }

    if (!yanit.ok) {
      // 422 is kurali ihlali (or. zaten odenmis) — Problem Details metnini goster.
      const govde = await yanit.json().catch(() => null);
      return {
        basarili: false,
        mesaj: govde?.detail || govde?.title || `Ödeme başarısız (HTTP ${yanit.status}).`,
        yenidenDenenebilir: false,
        siparisDurumu: 0,
      } as OdemeYaniti;
    }

    return (await yanit.json()) as OdemeYaniti;
  } catch {
    return {
      basarili: false,
      mesaj: "Ödeme sunucusuna ulaşılamadı. Lütfen tekrar deneyin.",
      yenidenDenenebilir: true,
      siparisDurumu: 0,
    } as OdemeYaniti;
  }
}
