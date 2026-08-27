/** BOM eşleştirme tipleri. bom-actions.ts "use server" olduğu için ayrı dosyada. */

export type BomSatiri = {
  mpn: string;
  miktar: number;
  /** Kaynak dosyadaki satır numarası — hatalı satırı kullanıcıya göstermek için. */
  satirNo: number;
};

export type EslesmeAdayi = {
  id: number;
  ureticiUrunKodu: string;
  kisaAciklama: string;
  ureticiAd: string;
};

export type SecilenEslesme = {
  urunId: number;
  ureticiUrunKodu: string;
  kisaAciklama: string;
  ureticiAd: string;
  ambalajId: number;
  ambalajAdi: string;
  moq: number;
  mpq: number;
  katlamaMiktari: number;
  stokMiktari: number;
  birimFiyat: number | null;
  paraBirimi: string | null;
  /** MOQ ve katlama kuralına göre düzeltilmiş, sipariş edilebilir miktar. */
  gecerliMiktar: number;
  miktarDuzeltildiMi: boolean;
  stokYeterliMi: boolean;
};

export type BomDurumu = "eslesti" | "coklu" | "eslesmedi" | "ambalajsiz";

export type BomEslesmeSonucu = BomSatiri & {
  listeId: number;
  kalemId: number;
  durum: BomDurumu;
  adaylar: EslesmeAdayi[];
  secilen: SecilenEslesme | null;
};

/**
 * CSV / TSV / noktalı virgül ayrılmış metni BOM satırlarına çevirir.
 *
 * Harici bir ayrıştırıcı kullanmıyoruz: npm'deki `xlsx` paketinin
 * düzeltilmemiş prototype pollution ve ReDoS açıkları var ve burada
 * ayrıştırılan veri kullanıcıdan geliyor. Excel dosyaları için kullanıcı
 * "CSV olarak kaydet" adımına yönlendirilir.
 *
 * Tırnak içine alınmış alanlar desteklenir ("BC547, NPN", 100 gibi satırlar
 * aksi hâlde yanlış bölünür).
 */
export function bomMetniniAyristir(metin: string): { satirlar: BomSatiri[]; atlanan: number[] } {
  const satirlar: BomSatiri[] = [];
  const atlanan: number[] = [];

  metin.split(/\r?\n/).forEach((hamSatir, indeks) => {
    const satirNo = indeks + 1;
    const satir = hamSatir.trim();
    if (!satir) return;

    const alanlar = satiriBol(satir);
    const mpn = alanlar[0]?.trim();
    if (!mpn) return;

    // Başlık satırını atla.
    if (indeks === 0 && /^(mpn|part|par[çc]a|[üu]r[üu]n)/i.test(mpn)) return;

    // Miktar ilk sayısal alandan okunur; bazı dışa aktarımlarda araya
    // açıklama sütunu girer.
    const miktarAlani = alanlar.slice(1).find(a => /^\d[\d.\s]*$/.test(a.trim()));
    const miktar = miktarAlani ? parseInt(miktarAlani.replace(/[.\s]/g, ""), 10) : NaN;

    if (!Number.isFinite(miktar) || miktar <= 0) {
      atlanan.push(satirNo);
      return;
    }

    satirlar.push({ mpn, miktar, satirNo });
  });

  return { satirlar, atlanan };
}

/** Tırnak farkındalıklı ayırıcı bölme (virgül, noktalı virgül veya sekme). */
function satiriBol(satir: string): string[] {
  const alanlar: string[] = [];
  let mevcut = "";
  let tirnakIcinde = false;

  for (let i = 0; i < satir.length; i++) {
    const karakter = satir[i];

    if (karakter === '"') {
      // Çift tırnak, tırnak içinde kaçış anlamına gelir.
      if (tirnakIcinde && satir[i + 1] === '"') { mevcut += '"'; i++; }
      else tirnakIcinde = !tirnakIcinde;
      continue;
    }

    if (!tirnakIcinde && (karakter === "," || karakter === ";" || karakter === "\t")) {
      alanlar.push(mevcut);
      mevcut = "";
      continue;
    }

    mevcut += karakter;
  }

  alanlar.push(mevcut);
  return alanlar;
}
