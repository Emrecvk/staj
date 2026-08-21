const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Category = { id: number; ad: string; slug: string; ikonUrl: string | null; yaprakMi: boolean; sira: number; altKategoriler: Category[] };
export type ProductSummary = { id: number; ureticiUrunKodu: string; ureticiAd: string; kisaAciklama: string; anaGorselUrl: string | null; gorselTemsiliMi: boolean; toplamStok: number; baslangicFiyati: number; paraBirimi: string; kampanyaliMi: boolean };
export type FacetOption = { deger: string; hamDeger: string; urunSayisi: number };
export type FacetGroup = { kod: string; ad: string; gosterimTipi: number; secenekler: FacetOption[] };
export type ProductResult = { urunler: { sayfaNo: number; sayfaBoyutu: number; toplamKayit: number; toplamSayfa: number; kayitlar: ProductSummary[] }; filtreler: FacetGroup[] };

export type DocumentType = { tip: number; url: string; baslik: string };
export type PriceTier = { minMiktar: number; maxMiktar: number | null; birimFiyat: number; paraBirimi: string };
export type PackagingOption = { ambalajId: number; ad: string; mpq: number; moq: number; katlamaMiktari: number; stokMiktari: number; gelecekStokMiktari: number; gelecekStokTarihi: string | null; fiyatlar: PriceTier[] };
export type RelatedProductSummary = { id: number; ureticiUrunKodu: string; kisaAciklama: string; anaGorselUrl: string | null };

export type ProductDetail = {
  id: number;
  ureticiUrunKodu: string;
  ureticiAd: string;
  kisaAciklama: string;
  detayliAciklama: string | null;
  gorselUrlleri: string[];
  gorselTemsiliMi: boolean;
  urunDurumu: string | null;
  rohsDurumu: string | null;
  montajTipi: string | null;
  ureticiTeslimSuresi: string | null;
  dokumanlar: DocumentType[];
  ozellikler: Record<string, string>;
  ambalajlarVeFiyatlar: PackagingOption[];
  muadiller: RelatedProductSummary[];
  benzerUrunler: RelatedProductSummary[];
  parametrikUrunler: RelatedProductSummary[];
  birlikteKullanilanlar: RelatedProductSummary[];
};

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try { 
    const response = await fetch(`${API_URL}${path}`, { cache: "no-store" }); 
    if (!response.ok) return fallback; 
    return await response.json() as T; 
  } catch { 
    return fallback; 
  }
}

export function getCategories() { return safeFetch<Category[]>("/Katalog/kategoriler/agac", []); }

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

export async function getProduct(id: string) {
  return safeFetch<ProductDetail | null>(`/Katalog/urunler/${id}`, null);
}

// Favori ve karsilastirma islemleri lib/katalog-actions.ts icinde,
// gercek API uclarina bagli olarak yer alir. Buradaki sahte
// toggleFavorite/toggleCompare fonksiyonlari kaldirildi.
