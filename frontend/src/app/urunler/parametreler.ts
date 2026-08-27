/**
 * Katalog sorgu parametreleri.
 *
 * İki ayrı biçim var ve karıştırılmamalı:
 *
 *   URL (kullanıcıya görünen, paylaşılabilir)
 *     /urunler?kategoriId=5&kilif=SOIC-8&kanal_sayisi=4
 *
 *   API (ASP.NET Core model binding'in beklediği)
 *     ?KategoriId=5&ParametrikFiltreler[kilif]=SOIC-8&ParametrikFiltreler[kanal_sayisi]=4
 *
 * Backend'de parametrik filtreler `Dictionary<string, List<string>>` olarak
 * tanımlı; model binder bunu ancak `ParametrikFiltreler[anahtar]` biçiminde
 * okuyor. Önceki sürümde URL'deki düz `kanal_sayisi=4` doğrudan API'ye
 * geçiriliyordu ve sunucu bunu SESSİZCE yok sayıyordu: facet paneli
 * tıklanıyor, çip görünüyor, sonuç hiç değişmiyordu.
 */

/** Filtre olmayan, gezinme ve görünüm parametreleri. */
export const GEZINME_ANAHTARLARI = new Set([
  "sayfaNo",
  "sayfaBoyutu",
  "siralama",
  "aramaMetni",
  "kategoriId",
  // Eski kategori bağlantılarında bulunabilir; filtre değildir ve API'ye gönderilmez.
  "slug",
  "sadeceStoktakiler",
  "dil",
  "paraBirimi",
  // Yalnızca arayüz tercihi; API'ye hiç gitmez.
  "gorunum",
]);

/** URL parametrelerini API'nin anladığı biçime çevirir. */
export function apiParametreleriniKur(
  urlParametreleri: Record<string, string | string[] | undefined>,
): Record<string, string | string[]> {
  const cikti: Record<string, string | string[]> = {};

  for (const [anahtar, deger] of Object.entries(urlParametreleri)) {
    if (deger === undefined || anahtar === "gorunum" || anahtar === "slug") continue;

    // Marka filtresi: URL'de sade `ureticiId`, API'de `UreticiIdleri` (List<int>).
    // ASP.NET model binder tekrarlanan anahtarları listeye bağlar.
    if (anahtar === "ureticiId") {
      cikti["UreticiIdleri"] = deger;
      continue;
    }

    if (GEZINME_ANAHTARLARI.has(anahtar)) {
      cikti[anahtar] = deger;
      continue;
    }

    // Geri kalan her şey parametrik filtredir.
    cikti[`ParametrikFiltreler[${anahtar}]`] = deger;
  }

  cikti.sayfaNo ??= "1";
  cikti.sayfaBoyutu ??= "24";

  return cikti;
}
