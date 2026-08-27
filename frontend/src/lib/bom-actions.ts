"use server";

import { safeFetch } from "./api";
import type { BomEslesmeSonucu, BomSatiri, EslesmeAdayi, SecilenEslesme } from "./bom-tipler";

type ApiAday = {
  urunId: number;
  ureticiUrunKodu: string;
  ureticiAd: string;
  kisaAciklama: string;
  ambalajId: number;
  ambalajAdi: string;
  mpq: number;
  moq: number;
  katlamaMiktari: number;
  stokMiktari: number;
  gecerliMiktar: number;
  stokYeterliMi: boolean;
  birimFiyat: number | null;
  paraBirimi: string | null;
};

type ApiKalem = {
  kalemId: number;
  satirNo: number;
  arananKod: string;
  miktar: number;
  eslesmeDurumu: number;
  secilen: ApiAday | null;
  adaylar: ApiAday[];
};

type ApiSonuc = { id: number; kalemler: ApiKalem[] };

/** BOM'u tek istekte backend eşleştirme servisine gönderir ve kalıcı listeyi oluşturur. */
export async function bomEslestir(satirlar: BomSatiri[]): Promise<BomEslesmeSonucu[]> {
  const sonuc = await safeFetch<ApiSonuc | null>("/MalzemeListeleri/yukle", null, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ad: `BOM ${new Date().toISOString().slice(0, 10)}`,
      kalemler: satirlar.map(s => ({ satirNo: s.satirNo, arananKod: s.mpn, miktar: s.miktar })),
    }),
  });

  if (!sonuc) return [];

  return sonuc.kalemler.map(kalem => ({
    listeId: sonuc.id,
    kalemId: kalem.kalemId,
    satirNo: kalem.satirNo,
    mpn: kalem.arananKod,
    miktar: kalem.miktar,
    durum: kalem.secilen
      ? "eslesti"
      : kalem.eslesmeDurumu === 3 ? "eslesmedi" : "coklu",
    adaylar: kalem.adaylar.map(ozetle),
    secilen: kalem.secilen ? secileneCevir(kalem.secilen, kalem.miktar) : null,
  }));
}

/** Belirsiz bir BOM kaleminin seçimini backend'de de kalıcılaştırır. */
export async function bomAdaySec(listeId: number, kalemId: number, urunId: number) {
  const aday = await safeFetch<ApiAday | null>(
    `/MalzemeListeleri/${listeId}/kalemler/${kalemId}/eslesme`,
    null,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urunId }),
    },
  );
  return aday ? secileneCevir(aday) : null;
}

function ozetle(aday: ApiAday): EslesmeAdayi {
  return {
    id: aday.urunId,
    ureticiUrunKodu: aday.ureticiUrunKodu,
    kisaAciklama: aday.kisaAciklama,
    ureticiAd: aday.ureticiAd,
  };
}

function secileneCevir(aday: ApiAday, istenenMiktar?: number): SecilenEslesme {
  return {
    urunId: aday.urunId,
    ureticiUrunKodu: aday.ureticiUrunKodu,
    kisaAciklama: aday.kisaAciklama,
    ureticiAd: aday.ureticiAd,
    ambalajId: aday.ambalajId,
    ambalajAdi: aday.ambalajAdi,
    mpq: aday.mpq,
    moq: aday.moq,
    katlamaMiktari: aday.katlamaMiktari,
    stokMiktari: aday.stokMiktari,
    birimFiyat: aday.birimFiyat,
    paraBirimi: aday.paraBirimi,
    gecerliMiktar: aday.gecerliMiktar,
    miktarDuzeltildiMi: istenenMiktar === undefined || aday.gecerliMiktar !== istenenMiktar,
    stokYeterliMi: aday.stokYeterliMi,
  };
}
