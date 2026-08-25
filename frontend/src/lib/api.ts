const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Category = { id: number; ad: string; slug: string; ikonUrl: string | null; yaprakMi: boolean; sira: number; altKategoriler: Category[] };
export type DocumentType = { tip: number; url: string; baslik: string; boyutByte?: number; dil?: string };
export type PriceTier = { minMiktar: number; maxMiktar: number | null; birimFiyat: number; paraBirimi: string; musteriGrubuId?: number | null };
export type PackagingOption = { ambalajId: number; ad: string; ambalajTipi?: number; mpq: number; moq: number; katlamaMiktari: number; stokMiktari: number; gelecekStokMiktari: number; gelecekStokTarihi: string | null; fiyatlar: PriceTier[]; varsayilanMi?: boolean };
export type WarehouseStock = { depoKodu: string; depoAdi: string; stokMiktari: number; teslimSuresiGun: number };
export type PublicPage = { slug: string; baslik: string; icerikHtml: string; seoBaslik?: string | null; seoAciklama?: string | null };
export type PublicFaq = { id: number; kategoriId: number | null; soru: string; cevap: string; sira: number };
export type BlogOzet = {
  id: number;
  baslik: string;
  slug: string;
  ozet: string;
  kapakGorselUrl?: string | null;
  yayinTarihi?: string | null;
  kategori?: string | null;
};
export type BlogDetay = BlogOzet & { icerikHtml: string };

export type ProductSummary = {
  id: number;
  ureticiUrunKodu: string;
  ureticiId?: number;
  ureticiAd: string;
  ureticiLogoUrl?: string | null;
  kategoriId?: number;
  kategoriYolu?: string[];
  kisaAciklama: string;
  detayliAciklama?: string | null;
  anaGorselUrl: string | null;
  gorselUrlleri?: string[];
  gorselTemsiliMi: boolean;
  toplamStok: number;
  baslangicFiyati: number;
  paraBirimi: string;
  kampanyaliMi: boolean;
  urunDurumu?: string | null;
  rohsDurumu?: string | null;
  montajTipi?: string | null;
  ureticiTeslimSuresi?: string | null;
  kilif?: string;
  dokumanlar?: DocumentType[];
  ozellikler?: Record<string, string>;
  ambalajlarVeFiyatlar?: PackagingOption[];
  depoStoklari?: WarehouseStock[];
};

export type UreticiOzet = {
  id: number;
  ad: string;
  slug: string;
  logoUrl?: string | null;
  webSitesi?: string | null;
  yetkiliDistributorMu: boolean;
  urunSayisi: number;
};

export type FacetOption = { deger: string; hamDeger: string; urunSayisi: number };
export type FacetGroup = { kod: string; ad: string; gosterimTipi: number; secenekler: FacetOption[] };
export type ProductResult = { urunler: { sayfaNo: number; sayfaBoyutu: number; toplamKayit: number; toplamSayfa: number; kayitlar: ProductSummary[] }; filtreler: FacetGroup[] };

export type RelatedProductSummary = { id: number; ureticiUrunKodu: string; kisaAciklama: string; anaGorselUrl: string | null };

export type ProductDetail = {
  id: number;
  ureticiUrunKodu: string;
  ureticiId: number;
  ureticiAd: string;
  ureticiLogoUrl?: string | null;
  kategoriId: number;
  kategoriYolu?: string[];
  kisaAciklama: string;
  detayliAciklama: string | null;
  anaGorselUrl: string | null;
  gorselUrlleri: string[];
  gorselTemsiliMi: boolean;
  urunDurumu: string | null;
  rohsDurumu: string | null;
  montajTipi: string | null;
  ureticiTeslimSuresi: string | null;
  dokumanlar: DocumentType[];
  ozellikler: Record<string, string>;
  ambalajlarVeFiyatlar: PackagingOption[];
  depoStoklari?: WarehouseStock[];
  muadiller: RelatedProductSummary[];
  benzerUrunler: RelatedProductSummary[];
  parametrikUrunler: RelatedProductSummary[];
  birlikteKullanilanlar: RelatedProductSummary[];
};

export async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    console.log(`[API] Fetching ${API_URL}${path}`);
    const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!response.ok) {
      console.error(`[API] Fetch failed for ${path}: ${response.status} ${response.statusText}`);
      return fallback;
    }
    const data = await response.json() as T;
    console.log(`[API] Fetch success for ${path}:`, Array.isArray(data) ? `${data.length} items` : 'object');
    return data;
  } catch (error) {
    console.error(`[API] Fetch exception for ${path}:`, error);
    return fallback;
  }
}

export function getCategories() { return safeFetch<Category[]>("/Katalog/kategoriler/agac", []); }

export function getUreticiler() { return safeFetch<UreticiOzet[]>("/Katalog/ureticiler", []); }

export async function getProducts(params: Record<string, string | number | boolean | undefined | string[]> = {}) {
  const query = new URLSearchParams(); 
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });
  
  const result = await safeFetch<ProductResult | null>(`/Katalog/urunler?${query}`, null);
  return result || { urunler: { sayfaNo: 1, sayfaBoyutu: 0, toplamKayit: 0, toplamSayfa: 0, kayitlar: [] }, filtreler: [] };
}

export async function getProduct(id: string, paraBirimi?: "TRY" | "USD") {
  const query = paraBirimi ? `?paraBirimi=${paraBirimi}` : "";
  return safeFetch<ProductDetail | null>(`/Katalog/urunler/${id}${query}`, null);
}

export function getPublicPage(slug: string) {
  return safeFetch<PublicPage | null>(`/icerik/sayfalar/${encodeURIComponent(slug)}`, null);
}

export function getFaqs() {
  return safeFetch<PublicFaq[]>("/icerik/sss", []);
}

export function getBlogYazilari() {
  return safeFetch<BlogOzet[]>("/icerik/blog", []);
}

export function getBlogYazisi(slug: string) {
  return safeFetch<BlogDetay | null>(`/icerik/blog/${encodeURIComponent(slug)}`, null);
}

// Favori ve karsilastirma islemleri lib/katalog-actions.ts icinde,
// gercek API uclarina bagli olarak yer alir. Buradaki sahte
// toggleFavorite/toggleCompare fonksiyonlari kaldirildi.

/**
 * Ana sayfa için katalog özeti.
 *
 * Rakamlar GERÇEK: hepsi API'den geliyor, hiçbiri sabit yazılmadı. Bir
 * distribütörün vitrinde göstereceği en güçlü kanıt zaten envanterinin
 * kendisi; "hızlı teslimat" gibi genel vaatler değil.
 *
 * API kapalıysa null döner ve çağıran taraf şeridi hiç basmaz. Uydurma
 * sayı göstermek, hiç göstermemekten kötüdür.
 */
export async function getKatalogOzeti(): Promise<{
  toplamUrun: number;
  stoktakiUrun: number;
  kategoriSayisi: number;
} | null> {
  const [tumu, stoktakiler, kategoriler] = await Promise.all([
    safeFetch<ProductResult | null>("/Katalog/urunler?sayfaNo=1&sayfaBoyutu=1", null),
    safeFetch<ProductResult | null>("/Katalog/urunler?sayfaNo=1&sayfaBoyutu=1&sadeceStoktakiler=true", null),
    safeFetch<Category[]>("/Katalog/kategoriler/agac", []),
  ]);

  if (!tumu?.urunler) return null;

  const kategoriSay = (dallar: Category[]): number =>
    dallar.reduce((toplam, dal) => toplam + 1 + kategoriSay(dal.altKategoriler ?? []), 0);

  return {
    toplamUrun: tumu.urunler.toplamKayit,
    stoktakiUrun: stoktakiler?.urunler?.toplamKayit ?? 0,
    kategoriSayisi: kategoriSay(kategoriler),
  };
}

/**
 * Verilen kategoriler icin gercek urun sayilarini dondurur (id -> adet).
 * ltree sayesinde bir kok kategori sorgusu tum alt dallarini kapsar.
 * Sayfa boyutu 1: yalnizca toplamKayit'e ihtiyac var, kayit cekilmiyor.
 * Ana sayfa kategori izgarasi burayi kullanir; uydurma SKU sayisi YOK.
 */
export async function getKategoriUrunSayilari(
  kategoriler: Category[],
): Promise<Record<number, number>> {
  const sonuc = await Promise.all(
    kategoriler.map(async (k) => {
      const r = await safeFetch<ProductResult | null>(
        `/Katalog/urunler?sayfaNo=1&sayfaBoyutu=1&kategoriId=${k.id}`,
        null,
      );
      return [k.id, r?.urunler?.toplamKayit ?? 0] as const;
    }),
  );
  return Object.fromEntries(sonuc);
}
