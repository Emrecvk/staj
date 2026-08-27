import type { PackagingOption, PriceTier } from "./api";

/**
 * MOQ / katlama ve kademeli fiyat kurallarının İSTEMCİ TARAFI ÖNİZLEMESİ.
 *
 * ÖNEMLİ: Bu bir kopya değil, önizlemedir. Kuralın tek doğru sahibi
 * sunucudaki `Cevik.Alan.Kurallar.SiparisMiktarKurali` ve
 * `FiyatKademesiSecici`; sepete ekleme, sipariş oluşturma ve teklif
 * dönüşümü hepsi orada yeniden doğrulanır. Burası yalnızca kullanıcı
 * yazarken anında geri bildirim vermek için var.
 *
 * Davranış bilerek sunucuyla birebir:
 *   - Geçersiz miktarda AŞAĞI değil YUKARI yuvarlanır; aşağı yuvarlamak
 *     müşteriye istediğinden az göndermek demektir.
 *   - Doğru kademe, miktarı KAPSAYAN kademedir; "minMiktar'ı geçen sonuncusu"
 *     değil. Aralıklarda boşluk varsa fark ortaya çıkar.
 *
 * Sunucu kuralı değişirse burası da güncellenmeli.
 */

export type MiktarSonucu = {
  gecerliMi: boolean;
  hata: string | null;
  /** Geçersizse önerilen en yakın geçerli üst miktar. */
  onerilenMiktar: number;
};

/** <see cref="SiparisMiktarKurali.YukariYuvarla"/> karşılığı. */
export function yukariYuvarla(deger: number, katlama: number): number {
  if (katlama <= 1) return deger;
  const kalan = deger % katlama;
  return kalan === 0 ? deger : deger + (katlama - kalan);
}

export function miktariDogrula(miktar: number, moq: number, katlamaMiktari: number): MiktarSonucu {
  // Bozuk veri korumasi: katlama 0 ise modulo patlar.
  const katlama = katlamaMiktari > 0 ? katlamaMiktari : 1;
  const enAz = moq > 0 ? moq : 1;

  if (!Number.isFinite(miktar) || miktar <= 0) {
    return { gecerliMi: false, hata: "Miktar sıfırdan büyük olmalıdır.", onerilenMiktar: Math.max(enAz, 1) };
  }

  if (miktar < enAz) {
    return {
      gecerliMi: false,
      hata: `Minimum sipariş miktarı ${enAz.toLocaleString("tr-TR")} adettir.`,
      onerilenMiktar: yukariYuvarla(enAz, katlama),
    };
  }

  if (miktar % katlama !== 0) {
    return {
      gecerliMi: false,
      hata: `Sipariş miktarı ${katlama.toLocaleString("tr-TR")} adedin katı olmalıdır.`,
      onerilenMiktar: yukariYuvarla(miktar, katlama),
    };
  }

  return { gecerliMi: true, hata: null, onerilenMiktar: miktar };
}

export function miktariDogrulaAmbalaj(miktar: number, ambalaj: PackagingOption): MiktarSonucu {
  return miktariDogrula(miktar, ambalaj.moq, ambalaj.katlamaMiktari);
}

/** <see cref="FiyatKademesiSecici.Sec"/> karşılığı (müşteri grubu hariç). */
export function kademeSec(kademeler: PriceTier[], miktar: number): PriceTier | null {
  const kapsayan = kademeler.filter(
    (k) => miktar >= k.minMiktar && (k.maxMiktar === null || miktar <= k.maxMiktar),
  );

  if (kapsayan.length > 0) {
    // Esitlikte ucuz olan kazanir.
    return kapsayan.reduce((ucuz, k) => (k.birimFiyat < ucuz.birimFiyat ? k : ucuz));
  }

  // Hicbir araliga girmiyorsa en yuksek minMiktar'li kademeye dus.
  const altindakiler = kademeler.filter((k) => miktar >= k.minMiktar);
  if (altindakiler.length === 0) return null;

  return altindakiler.reduce((en, k) => (k.minMiktar > en.minMiktar ? k : en));
}

/**
 * Bir kademenin gerçekten sipariş edilebilir olup olmadığı.
 *
 * Katalogda kademeler çoğu zaman 1'den başlar ama ambalajın MOQ'su çok daha
 * yüksek olabilir (ör. Tape & Reel MOQ 3000). Bu durumda "1-49 adet"
 * kademesi tabloda görünür ama SİPARİŞ EDİLEMEZ. Kullanıcıya ulaşılamayan
 * bir fiyat göstermek yanıltıcı; bu yüzden o satırlar işaretleniyor.
 */
export function kademeUlasilabilirMi(kademe: PriceTier, moq: number): boolean {
  const enAz = moq > 0 ? moq : 1;
  return kademe.maxMiktar === null || kademe.maxMiktar >= enAz;
}

export interface PricingCalculationResult {
  gecerliBirimFiyat: number;
  aktifKademe: PriceTier | null;
  toplamTutar: number;
  hataMesaji: string | null;
  uyariMesaji: string | null;
  yuvarlanmisMiktar: number;
}

export function hesaplaB2BFiyat(
  miktar: number,
  ambalaj: PackagingOption
): PricingCalculationResult {
  const dogrulama = miktariDogrula(miktar, ambalaj.moq, ambalaj.katlamaMiktari);
  const hesaplananMiktar = dogrulama.onerilenMiktar;
  const aktifKademe = kademeSec(ambalaj.fiyatlar, hesaplananMiktar);
  const birimFiyat = aktifKademe?.birimFiyat ?? (ambalaj.fiyatlar[0]?.birimFiyat || 0);
  const toplamTutar = hesaplananMiktar * birimFiyat;

  return {
    gecerliBirimFiyat: birimFiyat,
    aktifKademe,
    toplamTutar,
    hataMesaji: dogrulama.gecerliMi ? null : dogrulama.hata,
    uyariMesaji:
      !dogrulama.gecerliMi && dogrulama.onerilenMiktar !== miktar
        ? `Miktar ${dogrulama.onerilenMiktar} adede yuvarlandı.`
        : null,
    yuvarlanmisMiktar: hesaplananMiktar,
  };
}

export function paraBicimle(deger: number, paraBirimi: string, basamak?: number): string {
  const ondalik = basamak ?? (paraBirimi === "TRY" ? 2 : 4);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
    minimumFractionDigits: 2,
    maximumFractionDigits: ondalik,
  }).format(deger);
}
