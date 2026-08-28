import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

export const KAYNAK = "https://www.ozdisan.com";
const HEDEF_URUN = 12_000;
const HEDEF_URETICI = 50;
export const SAYFA_BOYUTU = 500;
const CIKTI = resolve(
  "src/Cevik.Altyapi/Veritabani/Seed/Katalog/Kaynaklar/ozdisan-katalogu.json.gz",
);
const RAPOR = resolve("docs/OZDISAN_KATALOG_AKTARIM_RAPORU.md");

// /ureticiler sayfasında Özdisan'ın kendi logosuyla yayımladığı markalar.
// Ürün seçimi bu listeyle sınırlandırılır; böylece marka vitrini hiçbir zaman
// baş harf veya uydurma görsel göstermek zorunda kalmaz.
export const OZDISAN_URETICI_LOGOLARI = new Map([
  ["3PEAK", "3peak"],
  ["AI THINKER", "ai-thinker"],
  ["ALCON", "alcon"],
  ["AMTEK", "amtek"],
  ["ASIA DRAGON", "asia-dragon"],
  ["AID", "aid"],
  ["ALLIANCE", "alliance"],
  ["APLUS INTEGRATED", "aplus-integrated"],
  ["ATTEND", "attend"],
  ["AKER", "aker"],
  ["ALPKE", "alpke"],
  ["ARCOL", "arcol"],
  ["BAHCO", "bahco"],
  ["BOARDOZA", "boardoza"],
  ["C&K-LITTELFUSE", "c-k-littelfuse"],
  ["COILMASTER", "coilmaster"],
  ["COSMO", "cosmo"],
  ["CINETECH", "cinetech"],
  ["CONNFLY", "connfly"],
  ["CREE LED", "cree-led"],
  ["CLARE-LITTELFUSE", "clare-littelfuse"],
  ["CORE MASTER", "core-master"],
  ["DC CORP.", "dc-corp"],
  ["DIPTRONICS", "diptronics"],
  ["DEGSON", "degson"],
  ["DUCATI", "ducati"],
  ["DFROBOT", "dfrobot"],
  ["EEMB", "eemb"],
  ["ENNOSTAR (LEXTAR)", "lextar"],
  ["ELESTA", "elesta"],
  ["EVERLIGHT", "everlight"],
  ["ENGINEER", "engineer"],
  ["EXCELITAS", "excelitas"],
  ["FORLINX", "forlinx"],
  ["FUZETEC", "fuzetec"],
  ["FORYARD", "foryard"],
  ["FUJI ELECTRIC", "fuji-electric"],
  ["GOLTEN", "golten"],
  ["GREAT POWER", "great-power"],
  ["HARTING", "harting"],
  ["HONEYWELL", "honeywell"],
  ["HSUAN MAO", "hsuan-mao"],
  ["HENGTAI", "hengtai"],
  ["HOPERF", "hoperf"],
  ["HT DISPLAY", "ht-display"],
  ["HI-LINK", "hi-link"],
  ["HOTTECH", "hottech"],
  ["HTC", "htc"],
  ["IGNION", "ignion"],
  ["ISOCOM", "isocom"],
  ["INVT", "invt"],
  ["IWAVE SYSTEMS", "iwave-systems"],
  ["ISABELLENHÜTTE", "isabellenhutte"],
  ["IXYS-LITTELFUSE", "ixys-littelfuse"],
  ["JAMICON", "jamicon"],
  ["JB CAPACITORS", "jb-capacitors"],
  ["KEMET", "kemet"],
  ["KLS ELECTRONIC", "kls-electronic"],
  ["KENDEIL", "kendeil"],
  ["KOSHIN", "koshin"],
  ["KINGTRONICS", "kingtronics"],
  ["LEDLINK", "ledlink"],
  ["LINDSTRÖM", "lindstrom"],
  ["LEM", "lem"],
  ["LITTELFUSE", "littelfuse"],
  ["LIGHTBO", "lightbo"],
  ["LMEM", "lmem"],
  ["MAXBOTIX", "maxbotix"],
  ["MEISHUO", "meishuo"],
  ["MICROINA", "microina"],
  ["NISSHA FIS, INC.", "nissha-fis-inc"],
  ["NUVOTON", "nuvoton"],
  ["ONCQUE", "oncque"],
  ["PANASONIC(AUTOMATION)", "panasonic-automation"],
  ["PF MOTOR & FAN", "pf-motor-fan"],
  ["PANASONIC(EUROPE)", "panasonic-europe"],
  ["PHILIPS(SIGNIFY)", "philips-signify"],
  ["PANJIT", "panjit"],
  ["QUECTEL", "quectel"],
  ["RALTRON", "raltron"],
  ["RED PITAYA", "red-pitaya"],
  ["RAYTAC", "raytac"],
  ["ROYALOHM", "royalohm"],
  ["RECOM", "recom"],
  ["SAMSUNG", "samsung"],
  ["SATOZ", "satoz"],
  ["SOMACIS-TR", "somacis"],
  ["SUNNYWAY RF", "sunnyway-rf"],
  ["SAMWHA", "samwha"],
  ["SAVIOR COMP.", "savior-comp"],
  ["SOUND COMP.", "sound-comp"],
  ["SUSCON", "suscon"],
  ["SANREX", "sanrex"],
  ["SEEED STUDIO", "seeed-studio"],
  ["SHINDENGEN", "shindengen"],
  ["STRONG BASE", "strong-base"],
  ["TDO", "tdo"],
  ["THINKING", "thinking"],
  ["TESCOM", "tescom"],
  ["TIANBO", "tianbo"],
  ["TEXAS", "texas"],
  ["TSD", "tsd"],
  ["UTC", "utc"],
  ["VIKING", "viking"],
  ["WEEN SEMICONDUCTORS", "ween-semiconductors"],
  ["WESTCODE-IXYS", "westcode-ixys"],
  ["WEIDY", "weidy"],
  ["WINBOND", "winbond"],
  ["WEINTEK", "weintek"],
  ["WINSTAR", "winstar"],
  ["YAGEO", "yageo"],
].map(([ad, slug]) => [
  ad,
  `https://cdn.ozdisan.com/public/product/manufacturer/${slug}/ListLogo.svg`,
]));

// Özdisan'ın yaprak kategori slug'larını mevcut Çevik kategori ağacına bağlar.
// İlk eşleşme kazanır; daha özel kurallar üstte tutulmalıdır.
export const KATEGORI_ESLESMELERI = [
  [/schottky|dogrultucu|hizli-diyot|genel-amacli-diyot|modul-diyot|kopru-diyot/, "diyotlar"],
  [/zener/, "zener-diyotlar"],
  [/mosfet/, "mosfetler"],
  [/igbt/, "igbt-guc-modulleri"],
  [/tristor|triyak/, "tristor-triyaklar"],
  [/transistor|bjt|darlington/, "bipolar-transistorler"],
  [/mikrodenetleyici|microcontroller/, "mikrodenetleyiciler"],
  [/bellek|memory|eeprom|flash-entegre/, "bellek-entegreleri"],
  [/opamp|operasyonel|islemsel-yukseltec/, "islemsel-yukseltecler"],
  [/karsilastirici|comparator/, "karsilastiricilar"],
  [/adc|dac|veri-donusturucu/, "veri-donusturucular"],
  [/lojik|logic|flip-flop|sayici|multiplexer|buffer/, "lojik-entegreler"],
  [/arayuz-entegre|interface|usb-entegre|can-entegre|rs-?485|rs-?232/, "arayuz-entegreleri"],
  [/rtc|gercek-zaman|zamanlayici|timer|clock-entegre/, "saat-zamanlayicilar"],
  [/ldo|lineer-regulator/, "lineer-regulatorler"],
  [/anahtarlamali-regulator|buck|boost|dc-dc-kontrol/, "anahtarlamali-regulatorler"],
  [/gerilim-referans/, "gerilim-referanslari"],
  [/motor-surucu/, "motor-suruculer"],
  [/gate-surucu|mosfet-surucu|igbt-surucu/, "gate-suruculer"],
  [/sarj-entegre|battery-charger|pil-sarj/, "pil-sarj-entegreleri"],
  [/smd-direnc|chip-direnc/, "smd-direncler"],
  [/tht-direnc|film-direnc|tel-sarim-direnc/, "tht-direncler"],
  [/potansiyometre|trimpot/, "potansiyometre-trimpotlar"],
  [/mlcc|seramik-kondansator/, "seramik-kondansatorler"],
  [/elektrolitik-kondansator/, "elektrolitik-kondansatorler"],
  [/tantal-kondansator/, "tantal-kondansatorler"],
  [/film-kondansator/, "film-kondansatorler"],
  [/guc-bobini|power-inductor|smd-bobin/, "guc-bobinleri"],
  [/ferrit|emi-filtre/, "ferrit-boncuklar"],
  [/kristal|osilator/, "kristal-osilatorler"],
  [/smd-led/, "smd-ledler"],
  [/tht-led|standart-led/, "tht-ledler"],
  [/guc-led|power-led|cob-led/, "guc-ledleri"],
  [/lcd|oled|tft-ekran/, "lcd-oled-ekranlar"],
  [/7-segment|yedi-segment/, "yedi-segment-gostergeler"],
  [/optokuplor|optocoupler/, "optokuplorler"],
  [/infrared|kizilotesi|ir-verici|ir-alici/, "kizilotesi-bilesenler"],
  [/kablo-kart|wire-to-board|header-konnektor/, "kablo-kart-konnektorler"],
  [/kart-kart|board-to-board/, "kart-kart-konnektorler"],
  [/pcb-klemens|terminal-blok/, "pcb-klemensler"],
  [/usb-konnektor|d-sub|hdmi|rj45|arayuz-konnektor/, "arayuz-konnektorleri"],
  [/role|relay/, "roleler"],
  [/tactile|tact-switch|buton/, "tactile-butonlar"],
  [/anahtar|switch|enkoder|encoder/, "anahtar-enkoderler"],
  [/sicaklik.*sensor|nem.*sensor|temperature.*sensor|humidity.*sensor/, "sicaklik-nem-sensorleri"],
  [/basinc.*sensor|pressure.*sensor/, "basinc-sensorleri"],
  [/imu|ivme|jiroskop|hareket.*sensor/, "hareket-imu-sensorleri"],
  [/optik.*sensor|yakinlik.*sensor|proximity/, "optik-yakinlik-sensorleri"],
  [/akim.*sensor|current.*sensor/, "akim-sensorleri"],
  [/gaz.*sensor|hava-kalite/, "gaz-hava-kalitesi"],
  [/ntc|ptc-termistor|termistor/, "termistorler"],
  [/wifi|bluetooth/, "wifi-bluetooth-modulleri"],
  [/lora|sub-ghz|subghz/, "lora-subghz-modulleri"],
  [/gnss|gps-modul/, "gnss-modulleri"],
  [/gsm|lte|nb-iot|hucresel/, "hucresel-modulleri"],
  [/anten/, "antenler"],
  [/ptc-sigorta/, "ptc-sigortalar"],
  [/sigorta|fuse/, "sigortalar"],
  [/varistor/, "varistorler"],
  [/tvs|esd|gdt|gaz-desarj/, "tvs-esd-koruma"],
  [/din-ray.*guc|din-ray.*power/, "din-ray-guc-kaynaklari"],
  [/ac-dc|guc-kaynagi|power-supply/, "ac-dc-guc-kaynaklari"],
  [/dc-dc.*modul|dc-dc.*konvertor/, "dc-dc-konvertor-modulleri"],
  [/pil|batarya|battery-holder|pil-tutucu/, "piller-tutucular"],
  [/gelistirme-karti|development-board|evaluation-board/, "gelistirme-kartlari-urun"],
  [/programlayici|debugger/, "programlayici-debugger"],
  [/shield|hat|genisletme-karti/, "genisletme-kartlari"],
  [/sogutucu|heatsink/, "sogutucular"],
  [/fan/, "fanlar"],
  [/muhafaza|kutu|enclosure/, "muhafazalar"],
  [/montaj|spacer|vida|somun/, "montaj-donanimlari"],
  [/jumper|test-kablo|prob/, "jumper-test-kablolari"],
  [/serit-kablo|ribbon/, "serit-kablolar"],
  [/kablo-bagi|kablo-kanali|kablo-yonet/, "kablo-yonetimi"],
];

export function turkceKucult(deger) {
  return String(deger ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

export function kategoriEsle(yol) {
  const slug = turkceKucult(yol);
  return KATEGORI_ESLESMELERI.find(([desen]) => desen.test(slug))?.[1] ?? null;
}

export function jsonNesnesiniAyikla(metin, anahtar) {
  const baslangicAnahtari = `"${anahtar}":`;
  const anahtarKonumu = metin.indexOf(baslangicAnahtari);
  if (anahtarKonumu < 0) throw new Error(`${anahtar} alanı sayfada bulunamadı.`);

  let baslangic = metin.indexOf("{", anahtarKonumu + baslangicAnahtari.length);
  let derinlik = 0;
  let metinIcinde = false;
  let kacis = false;

  for (let i = baslangic; i < metin.length; i += 1) {
    const karakter = metin[i];
    if (metinIcinde) {
      if (kacis) kacis = false;
      else if (karakter === "\\") kacis = true;
      else if (karakter === '"') metinIcinde = false;
      continue;
    }

    if (karakter === '"') metinIcinde = true;
    else if (karakter === "{") derinlik += 1;
    else if (karakter === "}") {
      derinlik -= 1;
      if (derinlik === 0) return JSON.parse(metin.slice(baslangic, i + 1));
    }
  }

  throw new Error(`${anahtar} JSON nesnesi tamamlanmamış.`);
}

export async function metniIndir(url, deneme = 1) {
  const yanit = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
      "user-agent": "Mozilla/5.0 CevikElektronikKatalogAktarici/1.0",
    },
  });

  if (!yanit.ok) {
    if (deneme < 4 && (yanit.status === 429 || yanit.status >= 500)) {
      await new Promise((tamamla) => setTimeout(tamamla, deneme * 1500));
      return metniIndir(url, deneme + 1);
    }
    throw new Error(`${url} -> HTTP ${yanit.status}`);
  }

  return yanit.text();
}

function mutlakUrl(yol) {
  if (!yol) return null;
  if (/^https?:\/\//i.test(yol)) return yol;
  return new URL(yol, KAYNAK).href;
}

export function sayi(deger, varsayilan = 0) {
  const sonuc = Number(String(deger ?? "").replace(",", "."));
  return Number.isFinite(sonuc) ? sonuc : varsayilan;
}

function ilkDolu(...degerler) {
  return degerler.find((deger) => deger !== null && deger !== undefined && deger !== "") ?? null;
}

// Kaynakta özelliğin değeri olmayan hâlleri. Bunları katalogda saklamak
// filtre panelinde "None" seçeneği üretir.
const BOS_OZELLIK_DEGERLERI = new Set(["none", "n/a", "na", "-", "0", "yok", "belirtilmemis"]);

function ozellikleriDonustur(ozellikler) {
  return Object.fromEntries(
    (Array.isArray(ozellikler) ? ozellikler : [])
      .map((ozellik) => [
        String(ilkDolu(ozellik.key, ozellik.name, ozellik.propertyName, "")).trim(),
        // `value` ETİKETTİR, `convertedValue` sayısal normalizasyon.
        // Önceki sürüm convertedValue'yu önceliyordu; kaynak
        // {"key":"Package / Case","value":"TSSOP20","convertedValue":20}
        // döndürdüğü için kılıf adı "20" olarak saklanıyordu — katalogdaki
        // 10.641 kılıf değerinin 10.557'si anlamsız sayıydı, renk ve montaj
        // şekli tamamen sayıya dönmüştü. Frekans da 48 MHz yerine 48000000
        // olarak yazılıp "48000000 MHz" diye gösteriliyordu.
        // Etiket boşsa sayısal karşılığa düşülür.
        String(ilkDolu(ozellik.value, ozellik.propertyValue, ozellik.convertedValue, "")).trim(),
      ])
      .filter(
        ([anahtar, deger]) =>
          anahtar && deger && !BOS_OZELLIK_DEGERLERI.has(turkceKucult(deger)),
      ),
  );
}

function montajTipi(ozellikler) {
  const kayit = Object.entries(ozellikler).find(([anahtar]) =>
    /mounting type|montaj tipi/i.test(anahtar),
  );
  const deger = turkceKucult(kayit?.[1]);
  if (/surface|smd|smt/.test(deger)) return "SMT";
  if (/through|tht|delik/.test(deger)) return "THT";
  return "Yok";
}

function ambalajTipi(deger) {
  const metin = turkceKucult(deger);
  if (/reel|makara/.test(metin)) return "TapeAndReel";
  if (/cut|kesme|tape/.test(metin)) return "CutTape";
  if (/tube|tup/.test(metin)) return "Tube";
  if (/tray|tepsi/.test(metin)) return "Tray";
  if (/box|kutu/.test(metin)) return "Box";
  return "Bulk";
}

function fiyatlariDonustur(fiyatlar) {
  const sonuc = (Array.isArray(fiyatlar) ? fiyatlar : [])
    .map((fiyat) => ({
      MinMiktar: Math.max(1, Math.trunc(sayi(ilkDolu(fiyat.breakQuantity, fiyat.minQuantity), 1))),
      BirimFiyat: sayi(ilkDolu(fiyat.price, fiyat.unitPrice)),
      ParaBirimi: String(ilkDolu(fiyat.currencyCode, fiyat.currency, "TRY")).slice(0, 3).toUpperCase(),
    }))
    .filter((fiyat) => fiyat.BirimFiyat > 0)
    .sort((a, b) => a.MinMiktar - b.MinMiktar);

  return sonuc.map((fiyat, index) => ({
    ...fiyat,
    MaxMiktar: sonuc[index + 1] ? sonuc[index + 1].MinMiktar - 1 : null,
  }));
}

export function urunuDonustur(ham, kategoriSlug, kaynakKategori) {
  const uretici = ilkDolu(ham.manufacturer?.name, ham.manufacturerName);
  const mpn = ilkDolu(ham.sku, ham.mpn, ham.productCode);
  if (!uretici || !mpn) return null;

  const ozellikler = ozellikleriDonustur(ham.properties);
  const uygunluk = ham.availability ?? {};
  const paket = Array.isArray(ham.packagingOptions) ? ham.packagingOptions[0] : ham.packagingOptions;
  const paketAdi = String(ilkDolu(paket?.name, paket?.description, paket, ham.variantPackageType, "Bulk"));
  const fiyatlar = fiyatlariDonustur(ham.prices);

  return {
    KaynakKimligi: String(ilkDolu(ham.erpRefId, ham.id, `${uretici}:${mpn}`)),
    KaynakUrl: mutlakUrl(ham.fullPath ? `/p/${String(ham.fullPath).replace(/^\/+/, "")}` : null),
    KaynakKategori: kaynakKategori,
    KategoriSlug: kategoriSlug,
    UreticiAd: String(uretici).trim(),
    UreticiSlug: String(ilkDolu(ham.manufacturer?.slug, "")).trim(),
    UreticiLogoUrl: OZDISAN_URETICI_LOGOLARI.get(String(uretici).trim()) ?? null,
    Mpn: String(mpn).trim(),
    Aciklama: String(ilkDolu(ham.description, ham.name, mpn)).trim(),
    Montaj: montajTipi(ozellikler),
    Rohs: Boolean(ham.isRohs),
    AnaGorselUrl: mutlakUrl(ilkDolu(ham.medias?.imagePath, ham.imagePath)),
    PdfUrl: mutlakUrl(ilkDolu(ham.medias?.pdfPath, ham.pdfPath)),
    Ozellikler: ozellikler,
    Ambalaj: {
      Ad: paketAdi,
      Tip: ambalajTipi(paketAdi),
      Mpq: Math.max(1, Math.trunc(sayi(uygunluk.mpq, 1))),
      Moq: Math.max(1, Math.trunc(sayi(uygunluk.minimumOrderQuantity, 1))),
      KatlamaMiktari: Math.max(1, Math.trunc(sayi(uygunluk.orderQuantityMultiplier, 1))),
      StokMiktari: Math.max(0, Math.trunc(sayi(uygunluk.totalStock, 0))),
      Fiyatlar: fiyatlar,
    },
  };
}

function dengeliSec(urunler) {
  const ureticiGruplari = Map.groupBy(urunler, (urun) => urun.UreticiAd);
  const seciliUreticiler = [...ureticiGruplari.entries()]
    .filter(([, liste]) => liste.length >= 10)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "tr"))
    .slice(0, HEDEF_URETICI)
    .map(([ad]) => ad);

  if (seciliUreticiler.length < HEDEF_URETICI) {
    throw new Error(`Yalnızca ${seciliUreticiler.length} yeterli üretici bulundu.`);
  }

  const kuyruklar = seciliUreticiler.map((ad) =>
    [...ureticiGruplari.get(ad)].sort(
      (a, b) => a.KategoriSlug.localeCompare(b.KategoriSlug) || a.Mpn.localeCompare(b.Mpn),
    ),
  );
  const secilen = [];

  while (secilen.length < HEDEF_URUN && kuyruklar.some((kuyruk) => kuyruk.length > 0)) {
    for (const kuyruk of kuyruklar) {
      if (kuyruk.length > 0) secilen.push(kuyruk.shift());
      if (secilen.length === HEDEF_URUN) break;
    }
  }

  if (secilen.length < HEDEF_URUN) {
    throw new Error(`Seçilen 50 üreticide yalnızca ${secilen.length} ürün bulundu.`);
  }

  return secilen.sort(
    (a, b) => a.UreticiAd.localeCompare(b.UreticiAd, "tr") || a.Mpn.localeCompare(b.Mpn),
  );
}

async function calistir() {
  const anaSayfa = await metniIndir(`${KAYNAK}/p/466`);
  const kaynakYollar = [
    ...new Set(
      [...anaSayfa.matchAll(/href=["']([^"']*\/ps\/[^"'?#]+)[^"']*["']/g)].map((eslesme) =>
        new URL(eslesme[1], KAYNAK).pathname,
      ),
    ),
  ];

  const kategoriler = kaynakYollar
    .map((yol) => ({ yol, kategoriSlug: kategoriEsle(yol) }))
    .filter((kategori) => kategori.kategoriSlug)
    .sort((a, b) => a.yol.localeCompare(b.yol));

  if (kategoriler.length === 0) throw new Error("Eşleşen Özdisan kategorisi bulunamadı.");

  const urunHaritasi = new Map();
  const durumlar = kategoriler.map((kategori) => ({ ...kategori, sayfa: 1, toplamSayfa: 1 }));
  let istekSayisi = 0;

  // Kategoriler arasında tur atmak marka ve ürün türü çeşitliliğini korur.
  for (let tur = 0; tur < 12; tur += 1) {
    let buTurIstek = 0;
    for (const durum of durumlar) {
      if (durum.sayfa > durum.toplamSayfa) continue;

      const url = `${KAYNAK}${durum.yol}?pageSize=${SAYFA_BOYUTU}&page=${durum.sayfa}&sortOrder=name_asc`;
      const html = await metniIndir(url);
      let liste;
      try {
        liste = jsonNesnesiniAyikla(html, "variantList");
      } catch (hata) {
        console.warn(`\nAtlandı (${durum.yol}): ${hata.message}`);
        durum.sayfa = Number.MAX_SAFE_INTEGER;
        continue;
      }
      durum.toplamSayfa = Math.max(1, sayi(liste.totalPages, 1));

      for (const ham of Array.isArray(liste.data) ? liste.data : []) {
        const urun = urunuDonustur(ham, durum.kategoriSlug, durum.yol);
        if (!urun) continue;
        urunHaritasi.set(`${turkceKucult(urun.UreticiAd)}\u0000${turkceKucult(urun.Mpn)}`, urun);
      }

      durum.sayfa += 1;
      istekSayisi += 1;
      buTurIstek += 1;
      process.stdout.write(
        `\r${istekSayisi} sayfa, ${urunHaritasi.size} benzersiz ürün, ${new Set([...urunHaritasi.values()].map((u) => u.UreticiAd)).size} üretici`,
      );

      const gruplar = Map.groupBy([...urunHaritasi.values()], (urun) => urun.UreticiAd);
      const ilkElliToplami = [...gruplar.values()]
        .sort((a, b) => b.length - a.length)
        .slice(0, HEDEF_URETICI)
        .reduce((toplam, grup) => toplam + grup.length, 0);
      if (gruplar.size >= HEDEF_URETICI && ilkElliToplami >= HEDEF_URUN * 1.08) break;

      // Siteye gereksiz yük bindirmemek için istekler arasında kısa ara.
      await new Promise((tamamla) => setTimeout(tamamla, 120));
    }

    const gruplar = Map.groupBy([...urunHaritasi.values()], (urun) => urun.UreticiAd);
    const ilkElliToplami = [...gruplar.values()]
      .sort((a, b) => b.length - a.length)
      .slice(0, HEDEF_URETICI)
      .reduce((toplam, grup) => toplam + grup.length, 0);
    if (gruplar.size >= HEDEF_URETICI && ilkElliToplami >= HEDEF_URUN * 1.08) break;
    if (buTurIstek === 0) break;
  }

  process.stdout.write("\n");
  const secilen = dengeliSec([...urunHaritasi.values()]);
  const ureticiSayilari = [...Map.groupBy(secilen, (urun) => urun.UreticiAd).entries()]
    .map(([ad, liste]) => ({ Ad: ad, UrunSayisi: liste.length }))
    .sort((a, b) => b.UrunSayisi - a.UrunSayisi || a.Ad.localeCompare(b.Ad, "tr"));
  const kategoriSayilari = [...Map.groupBy(secilen, (urun) => urun.KategoriSlug).entries()]
    .map(([slug, liste]) => ({ Slug: slug, UrunSayisi: liste.length }))
    .sort((a, b) => b.UrunSayisi - a.UrunSayisi);
  const olusturmaTarihi = new Date().toISOString();
  const secimHashi = createHash("sha256")
    .update(secilen.map((urun) => `${urun.KaynakKimligi}:${urun.UreticiLogoUrl}`).join("\n"))
    .digest("hex")
    .slice(0, 8);
  const veri = {
    Surum: `${olusturmaTarihi.slice(0, 10).replaceAll("-", ".")}-${secimHashi}`,
    Kaynak: KAYNAK,
    OlusturmaTarihi: olusturmaTarihi,
    UrunSayisi: secilen.length,
    UreticiSayisi: ureticiSayilari.length,
    Ureticiler: ureticiSayilari,
    Kategoriler: kategoriSayilari,
    Urunler: secilen,
  };

  const json = JSON.stringify(veri);
  const ozet = {
    ...veri,
    Urunler: undefined,
    Sha256: createHash("sha256").update(json).digest("hex"),
    IstekSayisi: istekSayisi,
    EslesenKaynakKategoriSayisi: kategoriler.length,
  };

  await mkdir(dirname(CIKTI), { recursive: true });
  await writeFile(CIKTI, gzipSync(Buffer.from(json), { level: 9 }));

  const raporSatirlari = [
    "# Özdisan katalog aktarım raporu",
    "",
    `- Oluşturma: ${olusturmaTarihi}`,
    `- Kaynak: ${KAYNAK}`,
    `- Ürün: ${secilen.length.toLocaleString("tr-TR")}`,
    `- Üretici: ${ureticiSayilari.length}`,
    `- Yerel kategori: ${kategoriSayilari.length}`,
    `- İndirilen liste sayfası: ${istekSayisi}`,
    `- SHA-256: \`${ozet.Sha256}\``,
    "",
    "## Üreticiler",
    "",
    "| Üretici | Ürün |",
    "|---|---:|",
    ...ureticiSayilari.map((uretici) => `| ${uretici.Ad.replaceAll("|", "\\|")} | ${uretici.UrunSayisi} |`),
    "",
    "## Kategoriler",
    "",
    "| Yerel kategori | Ürün |",
    "|---|---:|",
    ...kategoriSayilari.map((kategori) => `| ${kategori.Slug} | ${kategori.UrunSayisi} |`),
    "",
    "Bu dosya `tools/ozdisan-katalogunu-indir.mjs` tarafından üretilir. Canlı site çalışma anında taranmaz; uygulama sürümlenmiş sıkıştırılmış anlık görüntüyü kullanır.",
    "",
  ];
  await writeFile(RAPOR, raporSatirlari.join("\n"), "utf8");
  console.log(JSON.stringify(ozet, null, 2));
}

// Bu dosya baska bir arac tarafindan import edildiginde (bkz.
// tools/bos-kategorileri-doldur.mjs) tam tarama BASLAMAMALI; yalnizca
// dogrudan calistirildiginda calisir.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  calistir().catch((hata) => {
    console.error(hata);
    process.exitCode = 1;
  });
}
