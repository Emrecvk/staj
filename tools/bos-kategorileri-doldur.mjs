// Boş kalan yaprak kategorileri Özdisan'dan çekilen gerçek ürünlerle doldurur.
//
// `ozdisan-katalogunu-indir.mjs` seçimi ÜRETİCİ dengesine göre yapar: 50 markayı
// seçip aralarında round-robin gezer. Yan etkisi, 12.000 ürünün yalnızca 12
// kategoriye düşmesi ve 62 yaprak kategorinin boş kalmasıdır. Bu araç ters
// yönden çalışır — KATEGORİ başına hedef adet toplar ve sonucu mevcut anlık
// görüntüye EKLER; var olan ürünlere dokunmaz.
//
// Kullanım:
//   node tools/bos-kategorileri-doldur.mjs --kesif          # yalnız kaynak yollarını listeler
//   node tools/bos-kategorileri-doldur.mjs                  # kategori başına 4 ürün ekler
//   node tools/bos-kategorileri-doldur.mjs --adet=6
//   node tools/bos-kategorileri-doldur.mjs --slug=antenler,fanlar
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";

import {
  KAYNAK,
  jsonNesnesiniAyikla,
  kategoriEsle,
  metniIndir,
  sayi,
  turkceKucult,
  urunuDonustur,
} from "./ozdisan-katalogunu-indir.mjs";

const ANLIK_GORUNTU = resolve(
  "src/Cevik.Altyapi/Veritabani/Seed/Katalog/Kaynaklar/ozdisan-katalogu.json.gz",
);
const EK_RAPOR = resolve("docs/BOS_KATEGORI_DOLDURMA_RAPORU.md");

// Ana araç kategori yollarını tek bir vitrin sayfasından (/p/466) çıkarıyor ve
// oradan yalnızca 14 yol görünüyor. Kategori sitemap'i 909 yol veriyor; boş
// kategorileri doldurmanın tek yolu bu.
const KATEGORI_SITEMAP = `${KAYNAK}/sitemaps/category-tr-1.xml`;

// robots.txt "Crawl-delay: 1" diyor. Bu araç tek seferlik ve küçük hacimli
// olduğu için gecikmeye harfiyen uyuyoruz.
const ISTEK_ARASI_MS = 1100;

// Liste sayfası boyutu: hedef kategori başına 4-6 ürün olduğundan tek sayfa
// fazlasıyla yetiyor, sayfa büyütmek siteye gereksiz yük.
const SAYFA_BOYUTU = 100;
const EN_FAZLA_SAYFA = 3;

// Elle doğrulanmış kaynak yolları. İki ayrı sorunu birden çözer:
//
// 1) Regex haritası kaynak sitedeki adla örtüşmüyor (site "mikroişlemciler"
//    diyor, bizde "mikrodenetleyiciler").
// 2) Örtüşüyor ama YANLIŞ örtüşüyor. Alt dize eşleşmesi sinsi: "şalterler"
//    içinde "lte" geçtiği için tüm devre kesiciler hücresel modüllere,
//    "kristalize güneş panelleri" kristal osilatörlere, "tornavidalar"
//    ("vida") montaj donanımlarına düşüyordu.
//
// Ayrıca SIRA önemli: araç hedefin birkaç katı aday toplayınca sonraki yola
// geçmiyor, dolayısıyla asıl ürün kategorisi listenin başında olmalı —
// alfabetik sırada aksesuar kategorileri öne geçiyordu ("cob-led-aksesuarlari"
// < "cob-ledler").
//
// Her yol açılıp içindeki ürünler görülerek doğrulandı; tahmin yok.
// `sec` verilmişse karışık kategoriyi açıklamaya göre süzer.
const EK_KATEGORI_YOLLARI = new Map([
  ["ac-dc-guc-kaynaklari", { yollar: ["/ps/ac-dc-adaptorler-119", "/ps/ac-dc-donusturuculer-606"] }],
  ["anahtar-enkoderler", { yollar: ["/ps/toggle-sivicler-489", "/ps/rocker-sivicler-490", "/ps/cevirmeli-sivicler-494", "/ps/dip-sivicler-491"] }],
  ["anahtarlamali-regulatorler", { yollar: ["/ps/dc-anahtarlamali-step-down-regulatorleri-291", "/ps/dc-dc-voltaj-regulatorleri-275"] }],
  // /ps/antenler-150 ürünleri yalnızca serbest metin "Features" taşıyor;
  // parametrik filtre için gereken Antenna Type / Frequency Range yalnızca
  // RF antenlerde var.
  ["antenler", { yollar: ["/ps/rf-antenler-660", "/ps/antenler-150"] }],
  ["arayuz-konnektorleri", { yollar: ["/ps/usb-konnektorler-357", "/ps/d-sub-konnektorler-297", "/ps/hdmi-konnektorler-354"] }],
  ["bellek-entegreleri", { yollar: ["/ps/embedded-hafiza-entegreleri-255", "/ps/diger-hafiza-entegreleri-257"] }],
  // "Dönüştürücü Modüller" hem DC/DC hem AC/DC taşıyor.
  ["dc-dc-konvertor-modulleri", { yollar: ["/ps/dc-dc-donusturuculer-607", "/ps/donusturucu-moduller-116"], sec: /dc\W?dc/i }],
  ["elektrolitik-kondansatorler", { yollar: ["/ps/aluminyum-kapasitorler-180"] }],
  ["fanlar", { yollar: ["/ps/aksiyel-fanlar-907", "/ps/genel-tip-fanlar-450", "/ps/fanlar-112"] }],
  ["film-kondansatorler", { yollar: ["/ps/film-kapasitorler-179", "/ps/power-film-kapasitorler-176"] }],
  ["gate-suruculer", { yollar: ["/ps/gate-suruculer-527", "/ps/izole-gate-suruculeri-1005798"] }],
  ["gelistirme-kartlari-urun", { yollar: ["/ps/arduino-gelistirme-kartlari-614", "/ps/gelistirme-kitleri-ve-aksesuarlari-617"] }],
  ["gerilim-referanslari", { yollar: ["/ps/voltaj-referans-entegreleri-287"] }],
  // GSM ve GNSS kaynakta tek kategoride; ikisini açıklamaya göre ayırıyoruz.
  ["gnss-modulleri", { yollar: ["/ps/gsm-ve-gnss-modulleri-650"], sec: /gnss|gps|glonass|beidou/i }],
  ["guc-bobinleri", { yollar: ["/ps/sabit-induktorler-468"] }],
  ["guc-ledleri", { yollar: ["/ps/cob-ledler-368"] }],
  ["hareket-imu-sensorleri", { yollar: ["/ps/ivmeolcerler-913", "/ps/jiroskoplar-916", "/ps/hareket-sensorleri-922"] }],
  ["hucresel-modulleri", { yollar: ["/ps/gsm-ve-gnss-modulleri-650", "/ps/modem-modulleri-262"], sec: /gsm|gprs|\blte\b|nb\W?iot|cat\W?m|\b[45]g\b|modem/i }],
  ["islemsel-yukseltecler", { yollar: ["/ps/amplifikatorler-242"], sec: /op\W?amp|amplifier|op\.amp/i }],
  ["jumper-test-kablolari", { yollar: ["/ps/mini-jumperlar-324", "/ps/flat-flexible-kablolar-ve-jumperlar-144", "/ps/igne-uclu-problar-815"] }],
  ["kristal-osilatorler", { yollar: ["/ps/kristaller-508", "/ps/osilatorler-510", "/ps/rezonatorler-509"] }],
  ["karsilastiricilar", { yollar: ["/ps/analog-komparatorler-243"] }],
  ["kart-kart-konnektorler", { yollar: ["/ps/array-ve-mezzanine-konnektorler-305", "/ps/card-edge-konnektorler-78"] }],
  ["lineer-regulatorler", { yollar: ["/ps/lineer-voltaj-regulatorleri-279"] }],
  ["lora-subghz-modulleri", { yollar: ["/ps/subghz-moduller-653", "/ps/lorawan-gateway-702"] }],
  ["mikrodenetleyiciler", { yollar: ["/ps/mikroislemciler-218"] }],
  ["montaj-donanimlari",{ yollar: ["/ps/somunlar-ve-rondelalar-794", "/ps/montaj-urunleri-1005795"] }],
  // "Güç Sürücü Entegreleri" gate driver ve motor driver'ı birlikte tutuyor;
  // gate-suruculer kendi yollarından doluyor, buradan yalnız motor alınır.
  ["motor-suruculer", { yollar: ["/ps/guc-surucu-entegreleri-270"], sec: /motor/i }],
  // Kaynaktaki "Pil Şarj Aletleri/Cihazları" bitmiş şarj CİHAZI; entegre değil.
  ["pil-sarj-entegreleri", { yollar: ["/ps/batarya-yonetimi-entegreleri-272"] }],
  ["piller-tutucular", { yollar: ["/ps/pil-yuvalari-484", "/ps/alkalin-piller-482", "/ps/pil-yaylari-351"] }],
  ["potansiyometre-trimpotlar", { yollar: ["/ps/karbon-potansiyometreler-398", "/ps/cevrilebilir-potansiyometreler-397"] }],
  ["programlayici-debugger", { yollar: ["/ps/programlayicilar-375", "/ps/islemci-programlayicilari-610"] }],
  ["roleler", { yollar: ["/ps/genel-tip-roleler-403", "/ps/guvenlik-roleleri-407"] }],
  ["smd-direncler", { yollar: ["/ps/smt-smd-ve-cip-direncler-194"] }],
  ["smd-ledler", { yollar: ["/ps/sinyal-ledler-tek-renkli-361", "/ps/sinyal-ledler-cok-renkli-365", "/ps/aydinlatma-ledleri-tek-renkli-364"], sec: /\bsmd\b/i }],
  ["sogutucular", { yollar: ["/ps/aluminyum-sogutucular-462", "/ps/sogutucular-111"] }],
  ["tactile-butonlar", { yollar: ["/ps/tact-sivicler-485", "/ps/mikro-sivicler-486", "/ps/push-button-sivicler-488"] }],
  ["tantal-kondansatorler", { yollar: ["/ps/tantal-kapasitorler-178"] }],
  ["tht-direncler", { yollar: ["/ps/tht-dip-direncler-193", "/ps/tas-direncler-197"] }],
  ["tht-ledler", { yollar: ["/ps/sinyal-ledler-tek-renkli-361", "/ps/sinyal-ledler-cok-renkli-365", "/ps/ir-uv-ve-gorunur-ledler-945"], sec: /\btht\b|\bdip\b|\d\s?mm\b/i }],
  // Dot-matrix ile aynı kategoride duruyor.
  ["yedi-segment-gostergeler", { yollar: ["/ps/karakter-ve-numerik-led-displayler-173"], sec: /7\s?segment/i }],
]);

// Kaynakta karşılığı olmayan kategoriler. Özdisan DIN ray güç kaynağı
// satmıyor; /ps/guc-kaynaklari-802 masaüstü laboratuvar cihazları taşıyor,
// oradan doldurmak kategoriyi yanlış ürünle doldurmak olurdu.
const KAYNAKSIZ_KATEGORILER = new Set(["din-ray-guc-kaynaklari"]);

const argumanlar = process.argv.slice(2);
const kesifModu = argumanlar.includes("--kesif");
// Kategoriyi ekleyerek değil, SIFIRDAN doldurur: anlık görüntüdeki mevcut
// ürünleri atar. Yanlış kaynaktan doldurulmuş bir kategoriyi düzeltmenin yolu.
const yenileModu = argumanlar.includes("--yenile");
// Ürün SEÇİMİNE dokunmadan yalnızca teknik özellikleri kaynaktan tazeler.
// `ozellikleriDonustur` düzeltilmeden önce çekilen ürünlerde etiket yerine
// sayısal karşılık saklanmıştı (kılıf "TSSOP20" değil "20"); bu mod aynı ürün
// kümesini koruyarak o hasarı onarır.
const ozellikTazeleModu = argumanlar.includes("--ozellik-tazele");
const hedefAdet = Number(
  argumanlar.find((a) => a.startsWith("--adet="))?.slice("--adet=".length) ?? 4,
);
const istenenSluglar = argumanlar
  .find((a) => a.startsWith("--slug="))
  ?.slice("--slug=".length)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const bekle = (ms) => new Promise((tamamla) => setTimeout(tamamla, ms));

function anahtar(urun) {
  return `${turkceKucult(urun.UreticiAd)}|${turkceKucult(urun.Mpn)}`;
}

// Kataloğa girecek ürünün eksiksiz olması şart: görselsiz ürün vitrinde yer
// tutucu gösterir, fiyatsız ürün sepete eklenemez, özelliksiz ürün filtre
// panelini boş bırakır. Bu üçü olmadan kategoriyi doldurmak kategoriyi boş
// bırakmaktan daha kötüdür.
function eksiksizMi(urun) {
  return Boolean(
    urun?.AnaGorselUrl &&
      urun.Ambalaj?.Fiyatlar?.length > 0 &&
      Object.keys(urun.Ozellikler ?? {}).length > 0,
  );
}

function puan(urun) {
  // Stoklu, logolu markalı, datasheet'li ve çok özellikli ürünler önce gelsin.
  return (
    (urun.Ambalaj.StokMiktari > 0 ? 1000 : 0) +
    (urun.UreticiLogoUrl ? 500 : 0) +
    (urun.PdfUrl ? 250 : 0) +
    Math.min(Object.keys(urun.Ozellikler).length, 40) * 5 +
    Math.min(urun.Ambalaj.Fiyatlar.length, 6)
  );
}

async function kategoriYollariniKesfet() {
  const xml = await metniIndir(KATEGORI_SITEMAP);
  const yollar = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((eslesme) => new URL(eslesme[1]).pathname)
    .filter((yol) => yol.includes("/ps/"))
    .sort();

  const harita = new Map();
  for (const yol of yollar) {
    const slug = kategoriEsle(yol);
    if (!slug) continue;
    if (!harita.has(slug)) harita.set(slug, { yollar: [] });
    harita.get(slug).yollar.push(yol);
  }

  // Elle doğrulanmış yollar regex tahminini EZER.
  for (const [slug, tanim] of EK_KATEGORI_YOLLARI) harita.set(slug, tanim);

  return harita;
}

async function kategoriyiTopla(slug, tanim) {
  const adaylar = new Map();

  for (const yol of tanim.yollar) {
    // Hedefin birkaç katı aday toplandıysa sonraki yola gerek yok.
    if (adaylar.size >= hedefAdet * 4) break;

    let toplamSayfa = 1;
    for (let sayfa = 1; sayfa <= Math.min(toplamSayfa, EN_FAZLA_SAYFA); sayfa += 1) {
      const url = `${KAYNAK}${yol}?pageSize=${SAYFA_BOYUTU}&page=${sayfa}&sortOrder=name_asc`;
      let liste;
      try {
        liste = jsonNesnesiniAyikla(await metniIndir(url), "variantList");
      } catch (hata) {
        console.warn(`  ! ${yol} sayfa ${sayfa}: ${hata.message}`);
        break;
      }
      toplamSayfa = Math.max(1, sayi(liste.totalPages, 1));

      for (const ham of Array.isArray(liste.data) ? liste.data : []) {
        const urun = urunuDonustur(ham, slug, yol);
        if (!urun || !eksiksizMi(urun)) continue;
        if (tanim.sec && !tanim.sec.test(urun.Aciklama)) continue;
        adaylar.set(anahtar(urun), urun);
      }

      await bekle(ISTEK_ARASI_MS);
      if (adaylar.size >= hedefAdet * 4) break;
    }
  }

  return [...adaylar.values()].sort(
    (a, b) => puan(b) - puan(a) || a.Mpn.localeCompare(b.Mpn),
  );
}

// Ürünleri geldikleri kaynak kategorisinden yeniden okuyup YALNIZCA
// `Ozellikler` alanını günceller. Seçim, fiyat, stok ve ambalaj dokunulmaz.
async function ozellikleriTazele(katalog) {
  const yolaGore = new Map();
  for (const urun of katalog.Urunler) {
    if (!urun.KaynakKategori) continue;
    if (!yolaGore.has(urun.KaynakKategori)) yolaGore.set(urun.KaynakKategori, []);
    yolaGore.get(urun.KaynakKategori).push(urun);
  }

  console.log(`${katalog.Urunler.length} ürün, ${yolaGore.size} kaynak yolu taranacak.`);

  let tazelenen = 0;
  let bulunamayan = 0;
  const yolListesi = [...yolaGore.entries()].sort((a, b) => b[1].length - a[1].length);

  for (const [yol, urunler] of yolListesi) {
    const kalanlar = new Map(urunler.map((u) => [String(u.KaynakKimligi), u]));
    let toplamSayfa = 1;

    for (let sayfa = 1; sayfa <= toplamSayfa && kalanlar.size > 0; sayfa += 1) {
      let liste;
      try {
        liste = jsonNesnesiniAyikla(
          await metniIndir(`${KAYNAK}${yol}?pageSize=500&page=${sayfa}&sortOrder=name_asc`),
          "variantList",
        );
      } catch (hata) {
        console.warn(`  ! ${yol} sayfa ${sayfa}: ${hata.message}`);
        break;
      }
      toplamSayfa = Math.max(1, sayi(liste.totalPages, 1));

      for (const ham of Array.isArray(liste.data) ? liste.data : []) {
        const taze = urunuDonustur(ham, "gecici", yol);
        if (!taze) continue;
        const hedef = kalanlar.get(String(taze.KaynakKimligi));
        if (!hedef) continue;
        // Kaynak bu ürün için hiç özellik döndürmediyse eldekini KORU;
        // boş sözlük yazmak veriyi kaybetmek olur.
        if (Object.keys(taze.Ozellikler).length > 0) {
          hedef.Ozellikler = taze.Ozellikler;
          tazelenen += 1;
        }
        kalanlar.delete(String(taze.KaynakKimligi));
      }

      await bekle(ISTEK_ARASI_MS);
    }

    bulunamayan += kalanlar.size;
    console.log(
      `  ${yol.padEnd(52)} ${urunler.length - kalanlar.size}/${urunler.length}`,
    );
  }

  console.log(`\n${tazelenen} ürünün özellikleri tazelendi, ${bulunamayan} ürün kaynakta bulunamadı.`);
  return tazelenen;
}

async function calistir() {
  const katalog = JSON.parse(gunzipSync(await readFile(ANLIK_GORUNTU)).toString("utf8"));

  if (ozellikTazeleModu) {
    const tazelenen = await ozellikleriTazele(katalog);
    if (tazelenen === 0) {
      console.log("Hiçbir ürün tazelenmedi; anlık görüntü değiştirilmedi.");
      return;
    }
    await anlikGoruntuyuYaz(katalog, katalog.Urunler, []);
    return;
  }

  if (yenileModu) {
    if (!istenenSluglar) throw new Error("--yenile yalnızca --slug ile kullanılır.");
    const atilan = katalog.Urunler.length;
    katalog.Urunler = katalog.Urunler.filter((u) => !istenenSluglar.includes(u.KategoriSlug));
    console.log(`Yenileme: ${atilan - katalog.Urunler.length} mevcut ürün anlık görüntüden çıkarıldı.`);
  }

  const doluSluglar = new Set(katalog.Urunler.map((u) => u.KategoriSlug));
  const mevcutAnahtarlar = new Set(katalog.Urunler.map(anahtar));

  const yolHaritasi = await kategoriYollariniKesfet();
  const hedefSluglar = (istenenSluglar ?? [...yolHaritasi.keys()])
    .filter((slug) => istenenSluglar || !doluSluglar.has(slug))
    .filter((slug) => yolHaritasi.has(slug))
    .sort();

  console.log(`Anlık görüntü: ${katalog.Urunler.length} ürün, ${doluSluglar.size} dolu kategori.`);
  console.log(`Kaynakta eşleşen kategori: ${yolHaritasi.size}, hedeflenen: ${hedefSluglar.length}.`);
  if (KAYNAKSIZ_KATEGORILER.size > 0) {
    console.log(`Kaynakta karşılığı olmayan: ${[...KAYNAKSIZ_KATEGORILER].join(", ")}`);
  }

  if (kesifModu) {
    for (const slug of hedefSluglar) {
      const t = yolHaritasi.get(slug);
      console.log(`  ${slug.padEnd(30)} ${t.sec ? "[süzgeç] " : ""}<- ${t.yollar.slice(0, 4).join(", ")}${t.yollar.length > 4 ? ` (+${t.yollar.length - 4})` : ""}`);
    }
    return;
  }

  const eklenenler = [];
  const eksikKalanlar = [];

  for (const slug of hedefSluglar) {
    const adaylar = await kategoriyiTopla(slug, yolHaritasi.get(slug));
    const secilen = [];
    for (const urun of adaylar) {
      if (secilen.length >= hedefAdet) break;
      const k = anahtar(urun);
      if (mevcutAnahtarlar.has(k)) continue;
      mevcutAnahtarlar.add(k);
      secilen.push(urun);
    }

    eklenenler.push(...secilen);
    if (secilen.length < hedefAdet) eksikKalanlar.push({ slug, bulunan: secilen.length });
    console.log(
      `${secilen.length === hedefAdet ? "+" : "!"} ${slug.padEnd(30)} ${secilen.length}/${hedefAdet} (aday ${adaylar.length})`,
    );
  }

  if (eklenenler.length === 0) {
    console.log("Eklenecek ürün bulunamadı; anlık görüntü değiştirilmedi.");
    return;
  }

  await anlikGoruntuyuYaz(katalog, [...katalog.Urunler, ...eklenenler], eksikKalanlar);
}

// Anlık görüntüyü ve raporu yazar. Hem doldurma hem özellik tazeleme
// modundan çağrılır; sürüm damgası tek yerde üretilsin diye ayrıldı.
async function anlikGoruntuyuYaz(katalog, tumUrunlerHam, eksikKalanlar) {
  const oncekiler = new Set(katalog.Urunler);
  const eklenenler = tumUrunlerHam.filter((u) => !oncekiler.has(u));
  const tumUrunler = [...tumUrunlerHam].sort(
    (a, b) => a.UreticiAd.localeCompare(b.UreticiAd, "tr") || a.Mpn.localeCompare(b.Mpn),
  );

  const ureticiSayilari = [...Map.groupBy(tumUrunler, (u) => u.UreticiAd).entries()]
    .map(([Ad, liste]) => ({ Ad, UrunSayisi: liste.length }))
    .sort((a, b) => b.UrunSayisi - a.UrunSayisi || a.Ad.localeCompare(b.Ad, "tr"));
  const kategoriSayilari = [...Map.groupBy(tumUrunler, (u) => u.KategoriSlug).entries()]
    .map(([Slug, liste]) => ({ Slug, UrunSayisi: liste.length }))
    .sort((a, b) => b.UrunSayisi - a.UrunSayisi);

  const olusturmaTarihi = new Date().toISOString();
  // Ana araç hash'i yalnızca KaynakKimligi + logo üzerinden alıyor. Burada TÜM
  // yük hash'leniyor: aynı ürün farklı kaynak kategorisinden çekildiğinde
  // Özdisan farklı bir parametre seti döndürüyor (antenlerde "Features" yerine
  // Antenna Type / Frequency Range geliyor). Kimlik değişmediği için sürüm
  // sabit kalıyor, eşitleyici de kısa devre yapıp zenginleşmiş veriyi yazmıyordu.
  const secimHashi = createHash("sha256")
    .update(JSON.stringify(tumUrunler))
    .digest("hex")
    .slice(0, 8);

  const veri = {
    ...katalog,
    // Sürüm DEĞİŞMEK ZORUNDA: OzdisanKatalogEsitleyici'nin kısa devresi
    // KaynakKatalogSurumu eşitliğine bakar; sürüm aynı kalırsa yeni ürünler
    // hiç yazılmaz.
    Surum: `${olusturmaTarihi.slice(0, 10).replaceAll("-", ".")}-${secimHashi}`,
    OlusturmaTarihi: olusturmaTarihi,
    UrunSayisi: tumUrunler.length,
    UreticiSayisi: ureticiSayilari.length,
    Ureticiler: ureticiSayilari,
    Kategoriler: kategoriSayilari,
    Urunler: tumUrunler,
  };

  const json = JSON.stringify(veri);
  await writeFile(ANLIK_GORUNTU, gzipSync(Buffer.from(json), { level: 9 }));

  const eklenenKategoriler = [...Map.groupBy(eklenenler, (u) => u.KategoriSlug).entries()]
    .map(([slug, liste]) => ({ slug, adet: liste.length }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  // Tazeleme modu ürün EKLEMEZ; doldurma raporunun üzerine "0 eklendi"
  // yazmak yapılan işi kayıt dışı bırakır.
  if (ozellikTazeleModu) {
    console.log(`
Anlık görüntü yazıldı. Yeni sürüm: ${veri.Surum}`);
    return;
  }

  await writeFile(
    EK_RAPOR,
    [
      "# Boş kategori doldurma raporu",
      "",
      `- Oluşturma: ${olusturmaTarihi}`,
      `- Yeni sürüm: \`${veri.Surum}\``,
      `- Eklenen ürün: ${eklenenler.length}`,
      `- Doldurulan kategori: ${eklenenKategoriler.length}`,
      `- Toplam ürün: ${tumUrunler.length}`,
      `- SHA-256: \`${createHash("sha256").update(json).digest("hex")}\``,
      "",
      "Her ürün görsel + en az bir fiyat kademesi + en az bir teknik özellik",
      "taşıyacak biçimde süzüldü; bu üçünden biri eksik olan aday alınmadı.",
      "",
      "## Doldurulan kategoriler",
      "",
      "| Kategori | Eklenen |",
      "|---|---:|",
      ...eklenenKategoriler.map((k) => `| ${k.slug} | ${k.adet} |`),
      "",
      ...(eksikKalanlar.length > 0
        ? [
            "## Hedefe ulaşamayan kategoriler",
            "",
            "| Kategori | Bulunan |",
            "|---|---:|",
            ...eksikKalanlar.map((k) => `| ${k.slug} | ${k.bulunan} |`),
            "",
          ]
        : []),
      ...(KAYNAKSIZ_KATEGORILER.size > 0
        ? [
            "## Kaynakta karşılığı olmayan kategoriler",
            "",
            ...[...KAYNAKSIZ_KATEGORILER].map((s) => `- \`${s}\``),
            "",
          ]
        : []),
      "Bu dosya `tools/bos-kategorileri-doldur.mjs` tarafından üretilir.",
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`\n${eklenenler.length} ürün eklendi, ${eklenenKategoriler.length} kategori dolduruldu.`);
  console.log(`Yeni sürüm: ${veri.Surum}`);
  console.log(`Rapor: ${EK_RAPOR}`);
  if (eksikKalanlar.length > 0) {
    console.log(`Hedefe ulaşamayan: ${eksikKalanlar.map((k) => `${k.slug}(${k.bulunan})`).join(", ")}`);
  }
}


calistir().catch((hata) => {
  console.error(hata);
  process.exitCode = 1;
});
