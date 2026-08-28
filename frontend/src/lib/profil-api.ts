"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type {
  Adres, EylemSonucu, Favori, FirmaBilgisi, MusteriUrunKodu, SiparisOzeti, TeklifDetayi, TeklifOzeti,
} from "./profil-tipler";
import { yetkiliIstek } from "./oturum";
import { ERISIM_CEREZI, YENILEME_CEREZI } from "./oturum-ortak";

/**
 * Oturum var mı? (Erişim token'ı süresi dolmuşsa bile refresh token duruyorsa
 * oturum sürüyor sayılır — `yetkiliIstek` 401'de token'ı tazeler.)
 */
async function oturumVarMi() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(ERISIM_CEREZI)?.value || cookieStore.get(YENILEME_CEREZI)?.value);
}

async function hataMesaji(yanit: Response): Promise<string> {
  if (yanit.status === 401) return "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.";
  if (yanit.status === 403) return "Bu işlem için yetkiniz yok.";

  try {
    const govde = await yanit.json();
    if (typeof govde === "string" && govde) return govde;
    if (govde?.detail || govde?.title) return govde.detail || govde.title;
  } catch {
    // JSON degil; genel mesaja dus.
  }
  return `İşlem başarısız (HTTP ${yanit.status}).`;
}

async function istek<T>(yol: string, secenekler: RequestInit = {}): Promise<EylemSonucu<T>> {
  if (!(await oturumVarMi())) return { success: false, message: "Giriş yapmalısınız." };

  try {
    const yanit = await yetkiliIstek(yol, {
      ...secenekler,
      headers: { "Content-Type": "application/json", ...secenekler.headers },
    });

    if (!yanit.ok) return { success: false, message: await hataMesaji(yanit) };

    if (yanit.status === 204 || yanit.headers.get("content-length") === "0") {
      return { success: true, data: undefined as T };
    }
    return { success: true, data: (await yanit.json()) as T };
  } catch {
    return { success: false, message: "API'ye ulaşılamadı." };
  }
}

/** Liste uçlarında hata boş listeye indirgenir; sayfa yine de çizilir. */
async function liste<T>(yol: string): Promise<T[]> {
  const sonuc = await istek<T[]>(yol);
  return sonuc.success ? sonuc.data : [];
}

type SayfaliSonuc<T> = { kayitlar: T[] };

async function sayfaliListe<T>(yol: string): Promise<T[]> {
  const ayirici = yol.includes("?") ? "&" : "?";
  const sonuc = await istek<SayfaliSonuc<T>>(`${yol}${ayirici}sayfaNo=1&sayfaBoyutu=100`);
  return sonuc.success ? sonuc.data.kayitlar : [];
}

// ---------------------------------------------------------------------------
// Adresler
// ---------------------------------------------------------------------------

export async function adresleriGetir() {
  return liste<Adres>("/Profil/adresler");
}

export async function adresEkle(dto: Omit<Adres, "id">) {
  const sonuc = await istek<Adres>("/Profil/adresler", {
    method: "POST", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/profil/adresler");
  return sonuc;
}

export async function adresSil(id: number) {
  const sonuc = await istek<void>(`/Profil/adresler/${id}`, { method: "DELETE" });
  if (sonuc.success) revalidatePath("/profil/adresler");
  return sonuc;
}

// ---------------------------------------------------------------------------
// Favoriler
// ---------------------------------------------------------------------------

export async function favorileriGetirTam() {
  return sayfaliListe<Favori>("/Profil/favoriler");
}

// ---------------------------------------------------------------------------
// Müşteri ürün kodları
// ---------------------------------------------------------------------------

export async function musteriUrunKodlariniGetir() {
  return sayfaliListe<MusteriUrunKodu>("/Profil/musteri-urun-kodlari");
}

export async function musteriUrunKoduEkle(dto: { urunId: number; musteriKodu: string; aciklama?: string }) {
  const sonuc = await istek<MusteriUrunKodu>("/Profil/musteri-urun-kodlari", {
    method: "POST", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/profil/urun-kodlarim");
  return sonuc;
}

export async function musteriUrunKoduGuncelle(id: number, dto: { musteriKodu: string; aciklama?: string }) {
  const sonuc = await istek<void>(`/Profil/musteri-urun-kodlari/${id}`, {
    method: "PUT", body: JSON.stringify(dto),
  });
  if (sonuc.success) revalidatePath("/profil/urun-kodlarim");
  return sonuc;
}

export async function musteriUrunKoduSil(id: number) {
  const sonuc = await istek<void>(`/Profil/musteri-urun-kodlari/${id}`, { method: "DELETE" });
  if (sonuc.success) revalidatePath("/profil/urun-kodlarim");
  return sonuc;
}

// ---------------------------------------------------------------------------
// Firma
// ---------------------------------------------------------------------------

export async function firmaBilgisiGetir(): Promise<FirmaBilgisi | null> {
  const sonuc = await istek<FirmaBilgisi>("/Profil/firma");
  return sonuc.success ? sonuc.data : null;
}

// ---------------------------------------------------------------------------
// Siparişler
// ---------------------------------------------------------------------------

export async function siparisleriGetir() {
  return sayfaliListe<SiparisOzeti>("/Siparis");
}

export async function siparisDetayGetir(id: number) {
  return istek<SiparisOzeti & { araToplam: number; indirimTutari: number; kdvTutari: number; kargoUcreti: number }>(
    `/Siparis/${id}`);
}

// ---------------------------------------------------------------------------
// Teklifler
// ---------------------------------------------------------------------------

export async function teklifleriGetir() {
  return sayfaliListe<TeklifOzeti>("/Teklif");
}

export async function teklifDetayGetir(id: number) {
  return istek<TeklifDetayi>(`/Teklif/${id}`);
}

export async function teklifKabulEt(id: number) {
  const sonuc = await istek<void>(`/Teklif/${id}/kabul`, { method: "POST" });
  if (sonuc.success) {
    revalidatePath("/profil/teklifler");
    revalidatePath(`/profil/teklifler/${id}`);
  }
  return sonuc;
}

export async function teklifReddetMusteri(id: number) {
  const sonuc = await istek<void>(`/Teklif/${id}/red`, { method: "POST" });
  if (sonuc.success) {
    revalidatePath("/profil/teklifler");
    revalidatePath(`/profil/teklifler/${id}`);
  }
  return sonuc;
}

/** Kabul edilen teklifi siparişe çevirir. Sunucu ikinci çevrimi engeller. */
export async function teklifiSiparieCevir(id: number) {
  const sonuc = await istek<{ siparisNo?: string }>(`/Teklif/${id}/siparis`, { method: "POST" });
  if (sonuc.success) {
    revalidatePath("/profil/teklifler");
    revalidatePath("/profil/siparisler");
  }
  return sonuc;
}
