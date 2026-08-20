const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export type Category = { id: number; ad: string; slug: string; ikonUrl: string | null; yaprakMi: boolean; sira: number; altKategoriler: Category[] };
export type ProductSummary = { id: number; ureticiUrunKodu: string; ureticiAd: string; kisaAciklama: string; anaGorselUrl: string | null; gorselTemsiliMi: boolean; toplamStok: number; baslangicFiyati: number; paraBirimi: string; kampanyaliMi: boolean };
export type FacetOption = { deger: string; hamDeger: string; urunSayisi: number };
export type FacetGroup = { kod: string; ad: string; gosterimTipi: number; secenekler: FacetOption[] };
export type ProductResult = { urunler: { sayfaNo: number; sayfaBoyutu: number; toplamKayit: number; toplamSayfa: number; kayitlar: ProductSummary[] }; filtreler: FacetGroup[] };

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try { const response = await fetch(`${API_URL}${path}`, { cache: "no-store" }); if (!response.ok) return fallback; return await response.json() as T; } catch { return fallback; }
}
export function getCategories() { return safeFetch<Category[]>("/Katalog/kategoriler/agac", []); }
export function getProducts(params: Record<string, string | number | boolean | undefined> = {}) {
  const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
  return safeFetch<ProductResult>(`/Katalog/urunler?${query}`, { urunler: { sayfaNo: 1, sayfaBoyutu: 0, toplamKayit: 0, toplamSayfa: 0, kayitlar: [] }, filtreler: [] });
}
