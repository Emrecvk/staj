"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import type {
  YonetimSonuc, AdminUrunSayfasi, AdminKategori, AdminUretici,
  AdminOzellik, AdminFirma, AdminSiparis, AdminTeklif, AdminBlogYazisi,
  GostergeVerisi,
} from "./admin-tipler";

const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ---------------------------------------------------------------------------
// İstek yardımcıları
// ---------------------------------------------------------------------------

async function yetkiBasliklari(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const basliklar: Record<string, string> = { "Content-Type": "application/json" };
  if (token) basliklar["Authorization"] = `Bearer ${token}`;
  return basliklar;
}

/**
 * API hata gövdesini kullanıcıya gösterilebilir tek bir cümleye indirger.
 *
 * Backend iş kuralı ihlallerini Problem Details olarak 422 ile döndürür;
 * o metin kullanıcı için anlamlıdır ve gösterilmelidir ("Ürünü olan üretici
 * silinemez" gibi). Beklenmeyen durumlarda genel mesaja düşülür.
 */
async function hataMesaji(yanit: Response): Promise<string> {
  if (yanit.status === 401) return "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.";
  if (yanit.status === 403) return "Bu işlem için yetkiniz yok.";

  try {
    const govde = await yanit.json();
    if (typeof govde === "string" && govde) return govde;
    if (govde?.title || govde?.detail) return govde.detail || govde.title;
    if (govde?.errors) {
      const ilk = Object.values(govde.errors as Record<string, string[]>)[0];
      if (ilk?.[0]) return ilk[0];
    }
  } catch {
    // Gövde JSON değil; genel mesaja düş.
  }

  return `İşlem başarısız (HTTP ${yanit.status}).`;
}

async function yonetimIstek<T>(
  yol: string,
  secenekler: RequestInit = {},
): Promise<YonetimSonuc<T>> {
  try {
    const yanit = await fetch(`${API_URL}${yol}`, {
      ...secenekler,
      headers: await yetkiBasliklari(),
      cache: "no-store",
    });

    if (!yanit.ok) return { success: false, message: await hataMesaji(yanit) };

    // 204 No Content gövdesizdir; JSON ayrıştırmaya kalkışmak patlar.
    if (yanit.status === 204 || yanit.headers.get("content-length") === "0") {
      return { success: true, data: undefined as T };
    }

    return { success: true, data: (await yanit.json()) as T };
  } catch {
    return { success: false, message: "API'ye ulaşılamadı. Sunucu çalışıyor mu?" };
  }
}

// ---------------------------------------------------------------------------
// Gösterge paneli
// ---------------------------------------------------------------------------

/**
 * Panel özetini mevcut yönetim uçlarından toplar.
 *
 * Ayrı bir "dashboard" ucu yok; bu yüzden veriler paralel çağrılarla derlenir.
 * Tek bir uç düşerse panelin tamamı boş kalmasın diye her parça bağımsız
 * değerlendirilir ve başarısız olanlar `hatalar` içinde raporlanır.
 */
export async function getGostergeVerisi(): Promise<GostergeVerisi> {
  const [urunler, firmalar, siparisler, teklifler, stokAdaylari] = await Promise.all([
    yonetimIstek<AdminUrunSayfasi>("/yonetim/urun?sayfa=1&boyut=1"),
    yonetimIstek<AdminFirma[]>("/yonetim/firmalar/bekleyen"),
    yonetimIstek<AdminSiparis[]>("/yonetim/siparisler?boyut=200"),
    yonetimIstek<AdminTeklif[]>("/yonetim/teklifler"),
    yonetimIstek<AdminUrunSayfasi>("/yonetim/urun?sayfa=1&boyut=200"),
  ]);

  const hatalar: string[] = [];
  const eklaHata = (etiket: string, sonuc: { success: boolean; message?: string }) => {
    if (!sonuc.success) hatalar.push(`${etiket}: ${sonuc.message}`);
  };

  eklaHata("Ürünler", urunler);
  eklaHata("Firmalar", firmalar);
  eklaHata("Siparişler", siparisler);
  eklaHata("Teklifler", teklifler);

  const dagilimHesapla = <T extends { durum: number }>(kayitlar: T[]) => {
    const sayac = new Map<number, number>();
    for (const k of kayitlar) sayac.set(k.durum, (sayac.get(k.durum) ?? 0) + 1);
    return [...sayac.entries()]
      .map(([durum, adet]) => ({ durum, adet }))
      .sort((a, b) => a.durum - b.durum);
  };

  // Stok uyarısı: stoğu tükenmiş veya kritik seviyedeki aktif ürünler.
  // Eşik ürün bazlı minimum bilgisi olmadığı için sabit tutuldu.
  const KRITIK_STOK_ESIGI = 100;
  const stokUyarilari = (stokAdaylari.success ? stokAdaylari.data.kayitlar : [])
    .filter(u => !u.silindiMi && u.aktif && u.toplamStok < KRITIK_STOK_ESIGI)
    .sort((a, b) => a.toplamStok - b.toplamStok)
    .slice(0, 8)
    .map(u => ({ id: u.id, kod: u.ureticiUrunKodu, aciklama: u.kisaAciklama, stok: u.toplamStok }));

  return {
    urunSayisi: urunler.success ? urunler.data.toplam : 0,
    bekleyenFirmaSayisi: firmalar.success ? firmalar.data.length : 0,
    siparisDurumDagilimi: siparisler.success ? dagilimHesapla(siparisler.data) : [],
    teklifDurumDagilimi: teklifler.success ? dagilimHesapla(teklifler.data) : [],
    stokUyarilari,
    hatalar,
  };
}

// ---------------------------------------------------------------------------
// Ürün yönetimi
// ---------------------------------------------------------------------------

export async function getAdminUrunler(params: {
  arama?: string; silinmisleriGoster?: boolean; sayfa?: number; boyut?: number;
} = {}): Promise<YonetimSonuc<AdminUrunSayfasi>> {
  const sorgu = new URLSearchParams();
  if (params.arama) sorgu.set("arama", params.arama);
  if (params.silinmisleriGoster) sorgu.set("silinmisleriGoster", "true");
  sorgu.set("sayfa", String(params.sayfa ?? 1));
  sorgu.set("boyut", String(params.boyut ?? 50));

  return yonetimIstek<AdminUrunSayfasi>(`/yonetim/urun?${sorgu}`);
}

export async function urunEkle(dto: {
  kategoriId: number; ureticiId: number; ureticiUrunKodu: string;
  kisaAciklama: string; detayliAciklamaTr?: string; anaGorselUrl?: string;
  urunDurumu: number; rohsDurumu: number; montajTipi: number; aktif: boolean;
}) {
  const sonuc = await yonetimIstek<{ id: number }>("/yonetim/urun", {
    method: "POST", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/urunler");
  return sonuc;
}

export async function urunGuncelle(id: number, dto: {
  kisaAciklama: string; detayliAciklamaTr?: string; anaGorselUrl?: string;
  urunDurumu: number; rohsDurumu: number; montajTipi: number;
  kampanyaliMi: boolean; aktif: boolean;
}) {
  const sonuc = await yonetimIstek<void>(`/yonetim/urun/${id}`, {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/urunler");
  return sonuc;
}

/** Soft delete — sipariş geçmişi bozulmasın diye satır fiziksel silinmez. */
export async function urunSil(id: number) {
  const sonuc = await yonetimIstek<void>(`/yonetim/urun/${id}`, { method: "DELETE" });
  if (sonuc.success) revalidatePath("/yonetim/urunler");
  return sonuc;
}

export async function urunGeriAl(id: number) {
  const sonuc = await yonetimIstek<void>(`/yonetim/urun/${id}/geri-al`, { method: "POST" });
  if (sonuc.success) revalidatePath("/yonetim/urunler");
  return sonuc;
}

export async function getAdminUrunDetay(id: number) {
  return yonetimIstek<Record<string, unknown>>(`/yonetim/urun/${id}`);
}

export async function stokGuncelle(dto: {
  urunAmbalajId: number; stokMiktari: number;
  gelecekStokMiktari: number; gelecekStokTarihi?: string | null;
}) {
  const sonuc = await yonetimIstek<void>("/yonetim/urun/stok", {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/urunler");
  return sonuc;
}

export async function fiyatGuncelle(dto: {
  urunAmbalajId: number;
  kademeler: { minMiktar: number; maxMiktar: number | null; birimFiyat: number; paraBirimi: string }[];
}) {
  const sonuc = await yonetimIstek<void>("/yonetim/urun/fiyat", {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/urunler");
  return sonuc;
}

// ---------------------------------------------------------------------------
// Kategori / Üretici / Özellik
// ---------------------------------------------------------------------------

export async function getAdminKategoriler(silinmisleriGoster = false) {
  return yonetimIstek<AdminKategori[]>(
    `/yonetim/kategori?silinmisleriGoster=${silinmisleriGoster}`);
}

export async function kategoriEkle(dto: Record<string, unknown>) {
  const sonuc = await yonetimIstek<{ id: number }>("/yonetim/kategori", {
    method: "POST", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

export async function kategoriGuncelle(id: number, dto: Record<string, unknown>) {
  const sonuc = await yonetimIstek<void>(`/yonetim/kategori/${id}`, {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

export async function kategoriSil(id: number) {
  const sonuc = await yonetimIstek<void>(`/yonetim/kategori/${id}`, { method: "DELETE" });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

export async function getAdminUreticiler(silinmisleriGoster = false) {
  return yonetimIstek<AdminUretici[]>(
    `/yonetim/uretici?silinmisleriGoster=${silinmisleriGoster}`);
}

export async function ureticiEkle(dto: Record<string, unknown>) {
  const sonuc = await yonetimIstek<{ id: number }>("/yonetim/uretici", {
    method: "POST", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

export async function ureticiGuncelle(id: number, dto: Record<string, unknown>) {
  const sonuc = await yonetimIstek<void>(`/yonetim/uretici/${id}`, {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

export async function ureticiSil(id: number) {
  const sonuc = await yonetimIstek<void>(`/yonetim/uretici/${id}`, { method: "DELETE" });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

export async function getAdminOzellikler() {
  return yonetimIstek<AdminOzellik[]>("/yonetim/ozellik");
}

export async function ozellikEkle(dto: Record<string, unknown>) {
  const sonuc = await yonetimIstek<{ id: number }>("/yonetim/ozellik", {
    method: "POST", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

export async function ozellikGuncelle(id: number, dto: Record<string, unknown>) {
  const sonuc = await yonetimIstek<void>(`/yonetim/ozellik/${id}`, {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/kategoriler");
  return sonuc;
}

// ---------------------------------------------------------------------------
// Firma onayı
// ---------------------------------------------------------------------------

export async function getBekleyenFirmalar() {
  return yonetimIstek<AdminFirma[]>("/yonetim/firmalar/bekleyen");
}

export async function firmaOnayla(firmaId: number, durum: number) {
  const sonuc = await yonetimIstek<void>("/yonetim/firma-onay", {
    method: "PUT", body: JSON.stringify({ firmaId, durum }),
  });
  if (sonuc.success) {
    revalidatePath("/yonetim/firmalar");
    revalidatePath("/yonetim");
  }
  return sonuc;
}

// ---------------------------------------------------------------------------
// Sipariş
// ---------------------------------------------------------------------------

export async function getAdminSiparisler(durum?: number) {
  const sorgu = new URLSearchParams({ boyut: "100" });
  if (durum) sorgu.set("durum", String(durum));
  return yonetimIstek<AdminSiparis[]>(`/yonetim/siparisler?${sorgu}`);
}

export async function siparisDurumGuncelle(siparisId: number, yeniDurum: number) {
  const sonuc = await yonetimIstek<void>("/yonetim/siparis-durum", {
    method: "PUT", body: JSON.stringify({ siparisId, yeniDurum }),
  });
  if (sonuc.success) {
    revalidatePath("/yonetim/siparisler");
    revalidatePath("/yonetim");
  }
  return sonuc;
}

// ---------------------------------------------------------------------------
// Teklif
// ---------------------------------------------------------------------------

export async function getAdminTeklifler() {
  return yonetimIstek<AdminTeklif[]>("/yonetim/teklifler");
}

export async function getAdminTeklifDetay(id: number) {
  return yonetimIstek<AdminTeklif>(`/yonetim/teklifler/${id}`);
}

export async function teklifIncelemeyeAl(id: number) {
  const sonuc = await yonetimIstek<void>(`/yonetim/teklifler/${id}/incele`, { method: "POST" });
  if (sonuc.success) revalidatePath("/yonetim/teklifler");
  return sonuc;
}

export async function teklifFiyatlandir(id: number, dto: {
  gecerlilikTarihi: string;
  temsilciNotu?: string;
  kalemler: Record<number, {
    teklifEdilenMiktar?: number | null;
    teklifEdilenBirimFiyat?: number | null;
    paraBirimi?: string | null;
    teklifEdilenTeslimSuresiGun?: number | null;
    satisTemsilcisiNotu?: string | null;
  }>;
}) {
  const sonuc = await yonetimIstek<void>(`/yonetim/teklifler/${id}/fiyatlandir`, {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/teklifler");
  return sonuc;
}

export async function teklifReddet(id: number) {
  const sonuc = await yonetimIstek<void>(`/yonetim/teklifler/${id}/reddet`, { method: "POST" });
  if (sonuc.success) revalidatePath("/yonetim/teklifler");
  return sonuc;
}

// ---------------------------------------------------------------------------
// İçerik
// ---------------------------------------------------------------------------

export async function getAdminBlogYazilari() {
  return yonetimIstek<AdminBlogYazisi[]>("/yonetim/blog");
}

export async function blogYazisiEkle(dto: {
  baslik: string; slug: string; ozet: string; icerikHtml: string;
  kapakGorselUrl?: string; kategori?: string;
}) {
  const sonuc = await yonetimIstek<AdminBlogYazisi>("/yonetim/blog", {
    method: "POST", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/yonetim/icerikler");
  return sonuc;
}
