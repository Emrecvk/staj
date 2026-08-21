"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return {
      basarili: false,
      mesaj: "Ödeme için giriş yapmalısınız.",
      yenidenDenenebilir: false,
      siparisDurumu: 0,
    } as OdemeYaniti;
  }

  try {
    const yanit = await fetch(`${API_URL}/Odeme/${siparisId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ odemeJetonu, kartSahibi }),
      cache: "no-store",
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
