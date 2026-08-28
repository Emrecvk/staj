import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroB2B } from "@/components/home/hero-b2b";
import { AltPromos } from "@/components/home/alt-promos";
import { VitrinSekmeleri } from "@/components/home/vitrin-sekmeleri";
import { DistributorVitrini } from "@/components/home/distributor-vitrini";
import { YukariCik } from "@/components/ui/yukari-cik";
import {
  type ProductSummary,
  getCategories,
  getProducts,
  getKatalogOzeti,
  getKategoriUrunSayilari,
  getUreticiler,
} from "@/lib/api";

export const dynamic = "force-dynamic";

type VitrinId = "coksatan" | "yeni" | "firsat" | "onecikan";

const VITRIN_URUN_SAYISI = 12;
const KATEGORI_BASINA_ADAY_SAYISI = 16;

// API kategori ağacını teknik katalog sırasıyla döndürüyor. Bu sıra ilk dört
// kartı yarı iletken, güç yönetimi, ayrık yarı iletken ve pasif ürünlerden
// kurduğu için ürünler farklı kategorilerde olsalar bile görsel olarak çok
// benzer görünüyordu. Vitrinde önce biçimi ve kullanım alanı belirgin biçimde
// farklı aileleri yan yana getir; menüdeki özgün kategori sırasını değiştirme.
const VITRIN_KATEGORI_SIRASI = [
  "gelistirme-kartlari",
  "guc-kaynaklari",
  "elektromekanik",
  "optoelektronik",
  "kablosuz-rf",
  "sensorler",
  "termal-mekanik",
  "kablo-baglanti",
  "pasif-komponentler",
  "yari-iletkenler",
  "devre-koruma",
  "guc-yonetimi",
  "ayrik-yari-iletkenler",
] as const;

const VITRIN_SORGULARI: Array<{
  id: VitrinId;
  siralama: "populer" | "yeni" | "fiyat_artan" | "stok";
}> = [
  { id: "coksatan", siralama: "populer" },
  { id: "yeni", siralama: "yeni" },
  { id: "firsat", siralama: "fiyat_artan" },
  { id: "onecikan", siralama: "stok" },
];

function kategoriCesitliVitrinUrunleriniSec(
  kategoriHavuzlari: ProductSummary[][],
  kullanilanUrunIdleri: Set<number>,
  kategoriBaslangicOfseti: number,
) {
  const secilenler: ProductSummary[] = [];
  const havuzKonumlari = kategoriHavuzlari.map(() => 0);

  const siradakiKullanilmayanUrunuAl = (havuzIndeksi: number) => {
    const havuz = kategoriHavuzlari[havuzIndeksi] ?? [];

    while (havuzKonumlari[havuzIndeksi] < havuz.length) {
      const urun = havuz[havuzKonumlari[havuzIndeksi]];
      havuzKonumlari[havuzIndeksi] += 1;
      if (!kullanilanUrunIdleri.has(urun.id)) return urun;
    }

    return null;
  };

  // On iki kartı on iki ayrı kök kategoriden seç. Önceki sayfa bazlı +1
  // kaydırma 0-3, 1-4, 2-5 havuzlarını kullanıyor ve ilk altı kategoriye
  // tekrar tekrar dönüyordu. Kart bazlı ilerleme 0-11 havuzlarını kullanır;
  // böylece dört kartlık her görünüm de kendi içinde kategori çeşitliliğine
  // sahip olur.
  const kullanilanHavuzIndeksleri = new Set<number>();
  for (let kartSirasi = 0; kartSirasi < VITRIN_URUN_SAYISI; kartSirasi += 1) {
    for (let aramaOfseti = 0; aramaOfseti < kategoriHavuzlari.length; aramaOfseti += 1) {
      const havuzIndeksi = (
        kategoriBaslangicOfseti + kartSirasi + aramaOfseti
      ) % kategoriHavuzlari.length;
      if (kullanilanHavuzIndeksleri.has(havuzIndeksi)) continue;

      const urun = siradakiKullanilmayanUrunuAl(havuzIndeksi);
      if (!urun) continue;

      secilenler.push(urun);
      kullanilanUrunIdleri.add(urun.id);
      kullanilanHavuzIndeksleri.add(havuzIndeksi);
      break;
    }
  }

  // Bir kategori havuzu beklenmedik sekilde bos kalirsa vitrini diger gercek
  // adaylarla tamamla; yine daha once kullanilan bir urunu tekrarlama.
  for (let havuzIndeksi = 0; havuzIndeksi < kategoriHavuzlari.length && secilenler.length < VITRIN_URUN_SAYISI; havuzIndeksi += 1) {
    let urun = siradakiKullanilmayanUrunuAl(havuzIndeksi);
    while (urun && secilenler.length < VITRIN_URUN_SAYISI) {
      secilenler.push(urun);
      kullanilanUrunIdleri.add(urun.id);
      urun = siradakiKullanilmayanUrunuAl(havuzIndeksi);
    }
  }

  return secilenler;
}

export default async function Home() {
  const cookieStore = await cookies();
  const seciliParaBirimi = cookieStore.get("site_para_birimi")?.value === "USD" ? "USD" : "TRY";
  const [categories, ozet, ureticiler] = await Promise.all([
    getCategories(),
    getKatalogOzeti(),
    getUreticiler(),
  ]);

  const vitrinKategoriSirasi = new Map<string, number>(
    VITRIN_KATEGORI_SIRASI.map((slug, indeks) => [slug, indeks]),
  );
  const vitrinKategorileri = categories
    .map((kategori, ozgunIndeks) => ({ kategori, ozgunIndeks }))
    .sort((a, b) => {
      const aSirasi = vitrinKategoriSirasi.get(a.kategori.slug) ?? Number.MAX_SAFE_INTEGER;
      const bSirasi = vitrinKategoriSirasi.get(b.kategori.slug) ?? Number.MAX_SAFE_INTEGER;
      return aSirasi - bSirasi || a.ozgunIndeks - b.ozgunIndeks;
    })
    .map(({ kategori }) => kategori);

  const vitrinSonuclari = await Promise.all(
    VITRIN_SORGULARI.flatMap((vitrin) =>
      vitrinKategorileri.map((kategori) =>
        getProducts({
          kategoriId: kategori.id,
          sayfaNo: 1,
          sayfaBoyutu: KATEGORI_BASINA_ADAY_SAYISI,
          sadeceStoktakiler: true,
          siralama: vitrin.siralama,
          paraBirimi: seciliParaBirimi,
        }),
      ),
    ),
  );

  // Kategori urun sayilari: kategoriler geldikten sonra gercek sayimla.
  const kategoriSayilari = await getKategoriUrunSayilari(categories);

  // Her vitrin, her kok kategorinin kendi gercek ve amacina uygun siralanmis
  // havuzundan beslenir. Boylece kartlar hem kategori/fiyat/stok bakimindan
  // cesitlenir hem de ayni urun baska bir vitrinde tekrarlanmaz.
  const kullanilanUrunIdleri = new Set<number>();
  const urunGruplari = {} as Record<VitrinId, ProductSummary[]>;

  VITRIN_SORGULARI.forEach((vitrin, vitrinIndeksi) => {
    const kategoriHavuzlari = vitrinKategorileri.map((_, kategoriIndeksi) => {
      const sonucIndeksi = vitrinIndeksi * vitrinKategorileri.length + kategoriIndeksi;
      return vitrinSonuclari[sonucIndeksi]?.urunler.kayitlar ?? [];
    });

    urunGruplari[vitrin.id] = kategoriCesitliVitrinUrunleriniSec(
      kategoriHavuzlari,
      kullanilanUrunIdleri,
      (vitrinIndeksi * 4) % Math.max(vitrinKategorileri.length, 1),
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      {/* 1. Sade header */}
      <SiteHeader categories={categories} initialCurrency={seciliParaBirimi as "TRY" | "USD"} />

      <main id="icerik" className="flex-grow">
        {/* 2. Kategori + kampanya + hızlı işlemler (açık temalı 3 kolon) */}
        {/*
          Burada bilerek Suspense YOK.

          Sayfa force-dynamic ve HeroB2B'nin aldığı verinin tamamı
          (categories, kategoriSayilari, ozet) render'dan ÖNCE await
          ediliyor — yani boundary'nin bekleyeceği bir şey yoktu. Buna
          rağmen React içeriği <template id="B:0"> içine koyup sarmalayıcı
          <div id="S:0"> öğesini display:none bırakıyordu: hero hiç
          görünmüyor, kullanıcı 360px'lik boş iskeleti kalıcı olarak
          görüyordu.
        */}
        <HeroB2B
          categories={categories}
          kategoriSayilari={kategoriSayilari}
          stoktakiUrun={ozet?.stoktakiUrun}
        />

        <AltPromos siteParaBirimi={seciliParaBirimi} />

        {/* Yetkili distribütör markaları (gerçek üretici verisi) */}
        <DistributorVitrini ureticiler={ureticiler} />

        {/* 3. Stoktan teslim edilebilen ürünler */}
        <VitrinSekmeleri urunGruplari={urunGruplari} />

      </main>

      {/* 9. Sade footer */}
      <SiteFooter />
      <YukariCik />
    </div>
  );
}
