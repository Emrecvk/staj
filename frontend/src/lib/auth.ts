"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dogrulamaHatalariniEsle, problemMesaji } from "./hata-mesaji";
import { oturumCerezleriniSil, oturumCerezleriniYaz } from "./oturum";
import { API_URL, MISAFIR_SEPET_CEREZI, YENILEME_CEREZI, type TokenGovdesi } from "./oturum-ortak";

export type ActionResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * Giriş sonrası dönülecek yolu doğrular.
 *
 * `proxy.ts`, korumalı bir sayfaya girişsiz gelen kullanıcıyı
 * `/giris?devam=<yol>` adresine yollar. Bu değer kullanıcı denetimindedir;
 * doğrulanmadan `redirect()`e verilirse açık yönlendirme (open redirect)
 * açığı olur: "//kotu.site" ya da "/\kotu.site" tarayıcıda dış adrese gider.
 */
function guvenliYol(deger: FormDataEntryValue | null): string | null {
  if (typeof deger !== "string" || deger.length === 0) return null;
  if (!deger.startsWith("/")) return null;
  if (deger.startsWith("//") || deger.startsWith("/\\")) return null;
  return deger;
}

async function govdeyiCoz(res: Response): Promise<unknown> {
  return await res.json().catch(() => null);
}

/**
 * Kimlik uçlarının hata gövdesini forma uygun biçime çevirir.
 *
 * İki ayrı biçim geliyor ve önceki sürüm yalnızca birini okuyordu:
 *   - FluentValidation → { errors: { "Sifre": [...] } }  (PascalCase!)
 *   - Denetleyici      → { mesaj: "Bu e-posta adresi zaten kullanılıyor." }
 * `errors` bulunamayınca sabit bir metin basıldığı için "e-posta zaten
 * kayıtlı" gibi tek işe yarar mesajlar kullanıcıya hiç ulaşmıyordu.
 */
function hataYanitina(govde: unknown, varsayilan: string): ActionResponse {
  const alanHatalari = dogrulamaHatalariniEsle((govde as { errors?: unknown } | null)?.errors);
  if (alanHatalari) return { success: false, errors: alanHatalari };

  return { success: false, message: problemMesaji(govde, varsayilan) };
}

/**
 * Misafirken doldurulan sepeti giriş yapan kullanıcının sepetiyle birleştirir.
 *
 * Birleştirme mantığı sunucuda (`SepetServisi.SepetBulVeyaOlusturAsync`) hazır,
 * ama iki kimliği BİRLİKTE görmesi şart: JWT + `X-Session-Key`. Normal sepet
 * çağrıları giriş yapılmışsa oturum anahtarını göndermediği için birleştirme
 * hiç tetiklenmiyordu; kullanıcı giriş yaptığı anda sepeti "kayboluyordu".
 */
async function misafirSepetiniBirlestir(accessToken: string) {
  const cookieStore = await cookies();
  const oturumAnahtari = cookieStore.get(MISAFIR_SEPET_CEREZI)?.value;
  if (!oturumAnahtari) return;

  try {
    await fetch(`${API_URL}/Sepet`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Session-Key": oturumAnahtari,
      },
      cache: "no-store",
    });
  } catch {
    // Birleştirme başarısız olsa bile giriş akışı kesilmemeli; sepet
    // misafir anahtarında durmaya devam eder.
    return;
  }

  // Sepet artık kullanıcıya bağlı; misafir anahtarını taşımaya gerek yok.
  cookieStore.delete(MISAFIR_SEPET_CEREZI);
}

/** Girişi yapar ve token gövdesini döner; hata durumunda ActionResponse döner. */
async function girisIstegi(eposta: unknown, sifre: unknown): Promise<TokenGovdesi | ActionResponse> {
  const res = await fetch(`${API_URL}/Kimlik/giris`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eposta, sifre }),
  });

  if (res.ok) return (await res.json()) as TokenGovdesi;

  const govde = await govdeyiCoz(res);

  // 401 önceki sürümde ele alınmıyordu; yanlış şifre giren kullanıcı
  // "bir hata oluştu" görüp neyin yanlış olduğunu anlamıyordu.
  if (res.status === 401) {
    return { success: false, message: problemMesaji(govde, "E-posta veya şifre hatalı.") };
  }

  if (res.status === 429) {
    return { success: false, message: "Çok fazla deneme yapıldı. Lütfen bir dakika sonra tekrar deneyin." };
  }

  if (res.status === 400) return hataYanitina(govde, "Giriş bilgileri geçersiz.");

  return { success: false, message: "Giriş işlemi sırasında bir hata oluştu." };
}

export async function login(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const devam = guvenliYol(formData.get("devam"));

  let sonuc: TokenGovdesi | ActionResponse;
  try {
    sonuc = await girisIstegi(formData.get("eposta"), formData.get("sifre"));
  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }

  if (!("accessToken" in sonuc)) return sonuc;

  await oturumCerezleriniYaz(sonuc);
  await misafirSepetiniBirlestir(sonuc.accessToken);

  // redirect() bir istisna fırlatarak çalışır: try/catch İÇİNDE çağrılırsa
  // kendi catch bloğumuz onu yutar ve yönlendirme sessizce kaybolur.
  redirect(devam ?? "/");
}

/** Kayıt isteğini atar; başarılıysa null, değilse forma basılacak yanıtı döner. */
async function kayitIstegi(alanlar: Record<string, unknown>): Promise<ActionResponse | null> {
  const res = await fetch(`${API_URL}/Kimlik/kayit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alanlar),
  });

  if (res.ok) return null;

  const govde = await govdeyiCoz(res);

  if (res.status === 429) {
    return { success: false, message: "Çok fazla deneme yapıldı. Lütfen bir dakika sonra tekrar deneyin." };
  }

  if (res.status === 400) return hataYanitina(govde, "Kayıt işlemi başarısız.");

  return { success: false, message: "Kayıt işlemi sırasında bir hata oluştu." };
}

export async function registerUser(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { ad, soyad, eposta, telefon, sifre } = Object.fromEntries(formData.entries());

  let hata: ActionResponse | null;
  try {
    hata = await kayitIstegi({ ad, soyad, eposta, telefon, sifre });
  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }

  if (hata) return hata;

  redirect("/giris?kayit=basarili");
}

/**
 * Kurumsal kayıt: tek formdan iki ayrı API çağrısı.
 *
 * `/Kimlik/firma-basvurusu` ucu `[Authorize]`. Önceki sürüm formu doğrudan
 * oraya gönderiyordu; oturum olmadığı için istek HER SEFERİNDE 401 dönüyor ve
 * kurumsal kayıt hiç çalışmıyordu. Doğru sıra: kullanıcıyı oluştur → giriş
 * yap → elde edilen token'la firma başvurusunu gönder.
 */
export async function registerCompany(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { ad, soyad, eposta, telefon, sifre, firmaAdi, vergiDairesi, vergiNo, kepAdresi } =
    Object.fromEntries(formData.entries());

  let token: string;

  try {
    const kayitHatasi = await kayitIstegi({ ad, soyad, eposta, telefon, sifre });

    // Alan doğrulaması patladıysa hesap kesinlikle açılmamıştır; boşuna giriş
    // denemesi yapıp kimlik uçlarının dakikalık deneme hakkını harcamayalım.
    if (kayitHatasi?.errors) return kayitHatasi;

    // Kullanıcı zaten varsa bu, çoğunlukla ikinci adımı (firma bilgileri)
    // düzeltip yeniden gönderen kullanıcıdır: hesap ilk denemede açılmıştır.
    // Aynı parolayla giriş yapabiliyorsa akışa kaldığı yerden devam edilir.
    const giris = await girisIstegi(eposta, sifre);

    if (kayitHatasi && !("accessToken" in giris)) return kayitHatasi;

    if (!("accessToken" in giris)) {
      return {
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı. Giriş yapıp profilinizden firma başvurusu oluşturabilirsiniz.",
      };
    }

    token = giris.accessToken;

    const basvuru = await fetch(`${API_URL}/Kimlik/firma-basvurusu`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ firmaAdi, vergiDairesi, vergiNo, kepAdresi: kepAdresi || null }),
    });

    if (!basvuru.ok) {
      const govde = await govdeyiCoz(basvuru);
      if (basvuru.status === 400) return hataYanitina(govde, "Firma başvurusu yapılamadı.");
      return { success: false, message: "Başvuru işlemi sırasında bir hata oluştu." };
    }
  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }

  redirect("/giris?basvuru=alindi");
}

export async function logout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(YENILEME_CEREZI)?.value;

  // Çerezi silmek yetmez: refresh token sunucuda geçerli kalır ve elinde
  // kopyası olan biri oturumu yeniden açabilir. İptali sunucu yapar.
  if (refreshToken) {
    try {
      await fetch(`${API_URL}/Kimlik/cikis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Sunucuya ulaşılamasa bile yerel oturum kapatılmalı.
    }
  }

  await oturumCerezleriniSil(true);

  redirect("/giris");
}

export async function resetPasswordRequest(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const eposta = formData.get("eposta");

  try {
    const res = await fetch(`${API_URL}/Kimlik/sifre-sifirlama-talebi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eposta }),
    });

    if (!res.ok) {
      const govde = await govdeyiCoz(res);
      if (res.status === 429) {
        return { success: false, message: "Çok fazla deneme yapıldı. Lütfen bir dakika sonra tekrar deneyin." };
      }
      if (res.status === 400) return hataYanitina(govde, "İşlem başarısız.");
      return { success: false, message: "Bir hata oluştu." };
    }

    return { success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." };
  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }
}
