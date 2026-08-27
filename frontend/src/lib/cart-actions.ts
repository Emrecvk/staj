"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Sepet, SiparisOlusturIstegi, TeklifOlusturIstegi } from "./sepet-tipler";
import type { PackagingOption } from "./api";
import { miktariDogrulaAmbalaj } from "./miktar-kurali";
import { problemMesaji } from "./hata-mesaji";
import { yetkiliIstek } from "./oturum";
import { API_URL, ERISIM_CEREZI, MISAFIR_SEPET_CEREZI as MISAFIR_CEREZI } from "./oturum-ortak";

/** Sunucunun misafir sepetini tanıdığı başlık — `SepetController.KimlikCoz`. */
const OTURUM_BASLIGI = "X-Session-Key";

const MISAFIR_CEREZ_SURESI = 60 * 60 * 24 * 7;

type IstekBasliklari = { basliklar: Record<string, string>; girisliMi: boolean };

/**
 * Sepet isteklerinin başlıkları.
 *
 * Başlık adı `X-Session-Key` olmak ZORUNDA. Önceki sürüm `X-Guest-Cart-Id`
 * gönderiyordu; sunucu bu başlığı tanımadığı için her istekte misafiri
 * "yeni ziyaretçi" sayıp BOŞ bir sepet açıyordu. Sonuç: misafirin sepete
 * eklediği ürün asla görünmüyor, üstelik her çağrı veritabanına artık bir
 * sepet satırı bırakıyordu.
 *
 * Giriş yapılmışsa bile misafir anahtarı gönderilir: sunucudaki birleştirme
 * (`SepetBulVeyaOlusturAsync`) iki kimliği BİRLİKTE görmek ister; yalnızca
 * JWT gönderilirse misafir sepeti bulunamaz ve birleştirme yapılmaz.
 *
 * `Authorization` başlığını `yetkiliIstek` yönetir — token yenileme sonrası
 * isteği tekrarlarken tazelenmiş token'ı kendisi koyar.
 */
async function istekBasliklari(): Promise<IstekBasliklari> {
  const cookieStore = await cookies();
  const oturumAnahtari = cookieStore.get(MISAFIR_CEREZI)?.value;

  const basliklar: Record<string, string> = { "Content-Type": "application/json" };
  if (oturumAnahtari) basliklar[OTURUM_BASLIGI] = oturumAnahtari;

  return { basliklar, girisliMi: Boolean(cookieStore.get(ERISIM_CEREZI)?.value) };
}

/**
 * Sunucunun ürettiği misafir oturum anahtarını çereze yazar.
 *
 * Anahtar hem yanıt gövdesinde (`oturumAnahtari`) hem de `X-Session-Key`
 * başlığında dönebiliyor; ikisi de denenir. Yalnızca Server Action içinden
 * çağrılmalıdır — render sırasında çerez yazmak Next.js'te hatadır.
 */
async function misafirAnahtariniSakla(yanit: Response, govde: unknown, girisliMi: boolean) {
  if (girisliMi) return;

  const anahtar =
    (govde as { oturumAnahtari?: string } | null)?.oturumAnahtari ?? yanit.headers.get(OTURUM_BASLIGI);

  if (!anahtar) return;

  const cookieStore = await cookies();
  if (cookieStore.get(MISAFIR_CEREZI)?.value === anahtar) return;

  cookieStore.set(MISAFIR_CEREZI, anahtar, {
    sameSite: "lax",
    maxAge: MISAFIR_CEREZ_SURESI,
    path: "/",
  });
}

/** Sepeti değiştiren uçların ortak gövdesi. */
async function sepetIstegi(
  yol: string,
  secenekler: RequestInit,
  varsayilanHata: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const { basliklar, girisliMi } = await istekBasliklari();
    const yanit = await yetkiliIstek(yol, { ...secenekler, headers: basliklar });

    const govde = await yanit.json().catch(() => null);

    if (!yanit.ok) {
      if (yanit.status === 409) {
        return {
          success: false,
          message: "Ürün başka bir işlem tarafından güncellendi. Lütfen sayfayı yenileyip tekrar deneyin.",
        };
      }

      // 422 = iş kuralı ihlali. Mesajın kendisi kullanıcı için yazılmıştır
      // ("Stokta yalnızca 340 adet var...") — yutulursa kullanıcı miktarı
      // neden değiştiremediğini asla öğrenemez.
      return { success: false, message: problemMesaji(govde, varsayilanHata) };
    }

    await misafirAnahtariniSakla(yanit, govde, girisliMi);

    revalidatePath("/sepet");
    return { success: true };
  } catch {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }
}

export async function addToCart(ambalajId: number, miktar: number) {
  return sepetIstegi(
    "/Sepet",
    { method: "POST", body: JSON.stringify({ urunAmbalajId: ambalajId, miktar }) },
    "Ürün sepete eklenemedi.",
  );
}

/**
 * Ürünü, varsayılan ambalajını sunucudan çözerek sepete ekler.
 *
 * Karşılaştırma listesi gibi ambalaj bilgisi taşımayan ekranlar için.
 * Önceki sürüm karşılaştırma sayfasında ambalaj kimliğini `urunId * 10`
 * diye UYDURUYOR, istek başarısız olunca da kullanıcıya yine "sepete
 * eklendi" diyordu; sepette hiçbir zaman görünmeyen bir ürün için sahte
 * başarı bildirimi.
 */
export async function addProductToCart(urunId: number, miktar?: number) {
  let ambalajlar: PackagingOption[];

  try {
    const yanit = await fetch(`${API_URL}/Katalog/urunler/${urunId}`, { cache: "no-store" });
    if (!yanit.ok) return { success: false, message: "Ürün bilgisi alınamadı." };

    const urun = (await yanit.json()) as { ambalajlarVeFiyatlar?: PackagingOption[] };
    ambalajlar = urun.ambalajlarVeFiyatlar ?? [];
  } catch {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }

  const ambalaj = ambalajlar.find((a) => a.varsayilanMi) ?? ambalajlar[0];
  if (!ambalaj) {
    return { success: false, message: "Bu ürün için satılabilir ambalaj bulunamadı." };
  }

  // Miktar verilmediyse ambalajın kendi alt sınırı kullanılır; verildiyse
  // MOQ/katlama kuralına göre yukarı yuvarlanır. Sunucu aynı kuralı
  // yeniden doğrular, burası yalnızca gereksiz 422'yi önler.
  const hedefMiktar = miktariDogrulaAmbalaj(miktar ?? ambalaj.moq, ambalaj).onerilenMiktar;

  return addToCart(ambalaj.ambalajId, hedefMiktar);
}

export async function updateCartItem(kalemId: number, yeniMiktar: number) {
  return sepetIstegi(
    "/Sepet",
    { method: "PUT", body: JSON.stringify({ kalemId, yeniMiktar }) },
    "Miktar güncellenemedi.",
  );
}

export async function removeCartItem(kalemId: number) {
  return sepetIstegi(`/Sepet/${kalemId}`, { method: "DELETE" }, "Ürün sepetten çıkarılamadı.");
}

export async function clearCart() {
  return sepetIstegi("/Sepet/bosalt", { method: "DELETE" }, "Sepet boşaltılamadı.");
}

export async function getCart(): Promise<Sepet | null> {
  try {
    const { basliklar, girisliMi } = await istekBasliklari();

    // Ne oturum ne misafir anahtarı varsa gösterilecek sepet de yok. İstek
    // atmak boşuna: sunucu her GET'te yeni bir boş sepet satırı yaratır.
    if (!girisliMi && !basliklar[OTURUM_BASLIGI]) return null;

    const cookieStore = await cookies();
    const paraBirimi = cookieStore.get("site_para_birimi")?.value === "USD" ? "USD" : "TRY";

    const res = await yetkiliIstek(`/Sepet?paraBirimi=${paraBirimi}`, { headers: basliklar });

    if (!res.ok) return null;
    return (await res.json()) as Sepet;
  } catch {
    return null;
  }
}

export async function createOrder(data: SiparisOlusturIstegi) {
  try {
    const { basliklar } = await istekBasliklari();
    const res = await yetkiliIstek("/Siparis", {
      method: "POST",
      headers: basliklar,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      // Stok yetersizligi ve eszamanlilik catismasi is kurali ihlali olarak
      // 422/409 doner; metni kullaniciya gostermek gerekir.
      const govde = await res.json().catch(() => null);
      return { success: false, message: problemMesaji(govde, "Sipariş oluşturulamadı.") };
    }

    const siparis = await res.json();
    // siparisId odeme adimi icin sart: odeme ayri bir istek.
    return { success: true, siparisId: siparis.id as number, siparisNo: siparis.siparisNo as string };
  } catch {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }
}

export async function createQuote(data: TeklifOlusturIstegi) {
  try {
    const { basliklar } = await istekBasliklari();
    const res = await yetkiliIstek("/Teklif", {
      method: "POST",
      headers: basliklar,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const govde = await res.json().catch(() => null);
      return { success: false, message: problemMesaji(govde, "Teklif talebi oluşturulamadı.") };
    }

    const teklif = await res.json();
    return { success: true, talepNo: teklif.talepNo };
  } catch {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }
}
