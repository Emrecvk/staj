/**
 * Yönetim panelinin tip ve sabitleri.
 *
 * Neden ayrı dosya: admin-api.ts "use server" ile işaretli ve Next.js böyle
 * bir modülden yalnızca async fonksiyon export edilmesine izin veriyor.
 * Sabit nesneler ve tipler bu yüzden burada durur.
 */

// ---------------------------------------------------------------------------
// Numaralandırmalar — Cevik.Alan.Ortak.Numaralandirmalar ile birebir aynı.
// API bunları sayı olarak serileştirir; arayüzde okunur ada çevirmek için.
// ---------------------------------------------------------------------------

export const SIPARIS_DURUMLARI: Record<number, string> = {
  1: "Oluşturuldu", 2: "Ödeme Bekliyor", 3: "Onaylandı", 4: "Hazırlanıyor",
  5: "Kargoya Verildi", 6: "Teslim Edildi", 7: "İptal Edildi", 8: "İade Edildi",
};

export const TEKLIF_DURUMLARI: Record<number, string> = {
  1: "Yeni", 2: "İnceleniyor", 3: "Fiyatlandırıldı", 4: "Müşteri Onayı Bekliyor",
  5: "Kabul Edildi", 6: "Reddedildi", 7: "Süresi Doldu", 8: "Siparişe Dönüştürüldü",
};

export const FIRMA_ONAY_DURUMLARI: Record<number, string> = {
  1: "Beklemede", 2: "Onaylandı", 3: "Reddedildi",
};

export const URUN_DURUMLARI: Record<number, string> = {
  1: "Aktif", 2: "Yeni Tasarıma Önerilmez", 3: "Ömrü Sonu", 4: "Kullanımdan Kalktı",
};

// ---------------------------------------------------------------------------
// Tipler
// ---------------------------------------------------------------------------

export type YonetimSonuc<T = void> =
  | { success: true; data: T }
  | { success: false; message: string };

export type AdminUrun = {
  id: number;
  ureticiUrunKodu: string;
  kisaAciklama: string;
  kategoriId: number;
  ureticiId: number;
  urunDurumu: number;
  aktif: boolean;
  silindiMi: boolean;
  toplamStok: number;
};

export type AdminUrunSayfasi = {
  toplam: number;
  sayfa: number;
  boyut: number;
  kayitlar: AdminUrun[];
};

export type AdminKategori = {
  id: number; ustKategoriId: number | null; adTr: string; adEn: string;
  slugTr: string; yol: string; seviye: number; sira: number;
  yaprakMi: boolean; aktif: boolean; silindiMi: boolean;
};

export type AdminUretici = {
  id: number; ad: string; slug: string; logoUrl: string | null;
  webSitesi: string | null; yetkiliDistributorMu: boolean;
  aktif: boolean; silindiMi: boolean; urunSayisi: number;
};

export type AdminOzellik = {
  id: number; kod: string; adTr: string; adEn: string; veriTipi: number;
  birim: string | null; filtrelenebilirMi: boolean; siralanabilirMi: boolean;
  gosterimTipi: number; kullanildigiKategoriSayisi: number;
};

export type AdminFirma = {
  id: number; unvan: string; vergiDairesi: string; vergiNo: string;
  kepAdresi: string | null; onayDurumu: number;
  basvuruTarihi: string; kullaniciSayisi: number;
};

export type AdminSiparis = {
  id: number; siparisNo: string; durum: number; genelToplam: number;
  paraBirimi: string; tarih: string; musteriAdi: string | null;
  firmaUnvani: string | null; kalemSayisi: number; izinliGecisler: number[];
};

export type AdminTeklifKalemi = {
  id: number; urunId: number | null; serbestUrunKodu: string | null;
  miktar: number; teklifEdilenMiktar: number | null;
  hedefBirimFiyat: number | null; teklifEdilenBirimFiyat: number | null;
  paraBirimi: string | null; teklifEdilenTeslimSuresiGun: number | null;
  satisTemsilcisiNotu: string | null;
};

export type AdminTeklif = {
  id: number; talepNo: string; durum: number; gecerlilikTarihi: string | null;
  musteriNotu: string | null; temsilciNotu: string | null;
  kalemler: AdminTeklifKalemi[];
};

export type AdminBlogYazisi = {
  id: number; baslik: string; slug: string; ozet: string;
  icerikHtml: string; kapakGorselUrl: string | null;
  kategori: string | null; yayinTarihi: string | null;
};

export type GostergeVerisi = {
  urunSayisi: number;
  bekleyenFirmaSayisi: number;
  siparisDurumDagilimi: { durum: number; adet: number }[];
  teklifDurumDagilimi: { durum: number; adet: number }[];
  stokUyarilari: { id: number; kod: string; aciklama: string; stok: number }[];
  hatalar: string[];
};
