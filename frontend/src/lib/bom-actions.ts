"use server";

import { getProducts, getProduct } from "./api";
import type { BomEslesmeSonucu, BomSatiri, EslesmeAdayi } from "./bom-tipler";

/**
 * BOM satırlarını katalogla eşleştirir.
 *
 * Sunucuda çalışır çünkü her eşleşme için ürün DETAYININ de çekilmesi gerekir:
 * sepete ekleme ambalaj bazlıdır (`urunAmbalajId`), arama sonucu ise ambalaj
 * bilgisi taşımaz. Önceki sürüm bu yüzden `urun.id * 10` diye bir ambalaj
 * kimliği uyduruyordu — sepete yanlış ambalaj ekliyor ya da 404 alıyordu.
 */
export async function bomEslestir(satirlar: BomSatiri[]): Promise<BomEslesmeSonucu[]> {
  const sonuclar: BomEslesmeSonucu[] = [];

  for (const satir of satirlar) {
    const arama = await getProducts({ aramaMetni: satir.mpn });
    const adaylar = arama?.urunler?.kayitlar ?? [];

    if (adaylar.length === 0) {
      sonuclar.push({ ...satir, durum: "eslesmedi", adaylar: [], secilen: null });
      continue;
    }

    // Tam kod eşleşmesi varsa onu seç; yoksa tek aday da kesin sayılır.
    const tamEslesme = adaylar.find(
      a => a.ureticiUrunKodu.toLowerCase() === satir.mpn.toLowerCase());

    const secilenOzet = tamEslesme ?? (adaylar.length === 1 ? adaylar[0] : null);

    if (!secilenOzet) {
      sonuclar.push({
        ...satir,
        durum: "coklu",
        adaylar: adaylar.map(ozetle),
        secilen: null,
      });
      continue;
    }

    const secilen = await ambalajlaZenginlestir(secilenOzet.id, satir.miktar);

    sonuclar.push({
      ...satir,
      durum: secilen ? "eslesti" : "ambalajsiz",
      adaylar: adaylar.map(ozetle),
      secilen,
    });
  }

  return sonuclar;
}

/** Kullanıcı çoklu adaylardan birini seçtiğinde ambalaj bilgisini çözer. */
export async function bomAdaySec(urunId: number, miktar: number) {
  return ambalajlaZenginlestir(urunId, miktar);
}

function ozetle(u: { id: number; ureticiUrunKodu: string; kisaAciklama: string; ureticiAd: string }): EslesmeAdayi {
  return {
    id: u.id,
    ureticiUrunKodu: u.ureticiUrunKodu,
    kisaAciklama: u.kisaAciklama,
    ureticiAd: u.ureticiAd,
  };
}

/**
 * Ürünün varsayılan ambalajını ve miktar kurallarını çözer.
 *
 * Varsayılan ambalaj: istenen miktarı stoktan karşılayabilen en ucuz seçenek;
 * hiçbiri karşılayamıyorsa stoğu en yüksek olan. MOQ ve katlama miktarı da
 * taşınır ki arayüz "500 istediniz, MOQ 1000" uyarısını gösterebilsin.
 */
async function ambalajlaZenginlestir(urunId: number, istenenMiktar: number) {
  const detay = await getProduct(String(urunId));
  if (!detay) return null;

  const ambalajlar = detay.ambalajlarVeFiyatlar ?? [];
  if (ambalajlar.length === 0) return null;

  const karsilayanlar = ambalajlar.filter(a => a.stokMiktari >= istenenMiktar);
  const secili = karsilayanlar.length > 0
    ? karsilayanlar.reduce((enUcuz, a) =>
        (a.fiyatlar[0]?.birimFiyat ?? Infinity) < (enUcuz.fiyatlar[0]?.birimFiyat ?? Infinity) ? a : enUcuz)
    : ambalajlar.reduce((enCok, a) => a.stokMiktari > enCok.stokMiktari ? a : enCok);

  // MOQ ve katlama miktarına göre sipariş edilebilir en küçük geçerli miktar.
  const katlama = secili.katlamaMiktari > 0 ? secili.katlamaMiktari : 1;
  const tabanMiktar = Math.max(istenenMiktar, secili.moq || 1);
  const gecerliMiktar = Math.ceil(tabanMiktar / katlama) * katlama;

  return {
    urunId,
    ureticiUrunKodu: detay.ureticiUrunKodu,
    kisaAciklama: detay.kisaAciklama,
    ureticiAd: detay.ureticiAd,
    ambalajId: secili.ambalajId,
    ambalajAdi: secili.ad,
    moq: secili.moq,
    katlamaMiktari: katlama,
    stokMiktari: secili.stokMiktari,
    birimFiyat: secili.fiyatlar[0]?.birimFiyat ?? null,
    paraBirimi: secili.fiyatlar[0]?.paraBirimi ?? null,
    gecerliMiktar,
    miktarDuzeltildiMi: gecerliMiktar !== istenenMiktar,
    stokYeterliMi: secili.stokMiktari >= gecerliMiktar,
  };
}
