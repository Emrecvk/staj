"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type {
  Adres, EylemSonucu, Favori, FirmaBilgisi, SiparisOzeti, TeklifDetayi, TeklifOzeti,
} from "./profil-tipler";

const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function yetkiBasliklari() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
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
  const basliklar = await yetkiBasliklari();
  if (!basliklar) return { success: false, message: "Giriş yapmalısınız." };

  try {
    const yanit = await fetch(`${API_URL}${yol}`, {
      ...secenekler, headers: basliklar, cache: "no-store",
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
  return liste<Favori>("/Profil/favoriler");
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
  return liste<SiparisOzeti>("/Siparis");
}

export async function siparisDetayGetir(id: number) {
  return istek<SiparisOzeti & { araToplam: number; kdvTutari: number; kargoUcreti: number }>(
    `/Siparis/${id}`);
}

// ---------------------------------------------------------------------------
// Teklifler
// ---------------------------------------------------------------------------

export async function teklifleriGetir() {
  return liste<TeklifOzeti>("/Teklif");
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
