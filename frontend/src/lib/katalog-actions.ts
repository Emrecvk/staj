"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type EylemSonucu = { success: boolean; message?: string };

/**
 * Karşılaştırma listesi misafir kullanıcı için de çalışır: sunucu kimliği
 * ya JWT'den ya da X-Session-Key başlığından çözer.
 */
async function basliklar(oturumluOlmali: boolean): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (oturumluOlmali && !token) return null;

  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;

  const oturumAnahtari = cookieStore.get("guestCartId")?.value;
  if (!token && oturumAnahtari) h["X-Session-Key"] = oturumAnahtari;

  return h;
}

async function istek(
  yol: string,
  secenekler: RequestInit,
  oturumluOlmali: boolean,
): Promise<EylemSonucu> {
  const h = await basliklar(oturumluOlmali);
  if (!h) return { success: false, message: "Bu işlem için giriş yapmalısınız." };

  try {
    const yanit = await fetch(`${API_URL}${yol}`, { ...secenekler, headers: h, cache: "no-store" });

    if (yanit.status === 401) return { success: false, message: "Oturumunuz sona ermiş." };
    if (!yanit.ok) return { success: false, message: `İşlem başarısız (HTTP ${yanit.status}).` };

    return { success: true };
  } catch {
    return { success: false, message: "Sunucuya ulaşılamadı." };
  }
}

// ---------------------------------------------------------------------------
// Favoriler — giriş zorunlu
// ---------------------------------------------------------------------------

export async function favoriEkle(urunId: number): Promise<EylemSonucu> {
  const sonuc = await istek("/Profil/favoriler", {
    method: "POST",
    body: JSON.stringify({ urunId }),
  }, true);

  if (sonuc.success) revalidatePath("/profil/favoriler");
  return sonuc;
}

export async function favoriSil(urunId: number): Promise<EylemSonucu> {
  const sonuc = await istek(`/Profil/favoriler/${urunId}`, { method: "DELETE" }, true);
  if (sonuc.success) revalidatePath("/profil/favoriler");
  return sonuc;
}

export async function favorileriGetir() {
  const h = await basliklar(true);
  if (!h) return [];

  try {
    const yanit = await fetch(`${API_URL}/Profil/favoriler`, { headers: h, cache: "no-store" });
    if (!yanit.ok) return [];
    return await yanit.json();
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Karşılaştırma — misafir de kullanabilir
// ---------------------------------------------------------------------------

export async function karsilastirmayaEkle(urunId: number): Promise<EylemSonucu> {
  const sonuc = await istek(`/Katalog/karsilastirma/${urunId}`, { method: "POST" }, false);
  if (sonuc.success) revalidatePath("/karsilastirma");
  return sonuc;
}

export async function karsilastirmadanCikar(urunId: number): Promise<EylemSonucu> {
  const sonuc = await istek(`/Katalog/karsilastirma/${urunId}`, { method: "DELETE" }, false);
  if (sonuc.success) revalidatePath("/karsilastirma");
  return sonuc;
}

export async function karsilastirmaListesiGetir() {
  const h = await basliklar(false);

  try {
    const yanit = await fetch(`${API_URL}/Katalog/karsilastirma`, { headers: h!, cache: "no-store" });
    if (!yanit.ok) return null;
    return await yanit.json();
  } catch {
    return null;
  }
}
