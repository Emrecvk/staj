import { Suspense } from "react";
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

  // Her dort kartlik sayfayi farkli kok kategorilerden kur. Baslangic
  // kategorisini sayfa bazinda kaydirarak bes kategorinin tamamini kullan.
  for (let sayfa = 0; sayfa < 3; sayfa += 1) {
    const sayfaUrunleri: ProductSummary[] = [];

    for (let ofset = 0; ofset < kategoriHavuzlari.length && sayfaUrunleri.length < 4; ofset += 1) {
      const havuzIndeksi = (sayfa + ofset) % kategoriHavuzlari.length;
      const urun = siradakiKullanilmayanUrunuAl(havuzIndeksi);
      if (!urun) continue;

      sayfaUrunleri.push(urun);
      kullanilanUrunIdleri.add(urun.id);
    }

    secilenler.push(...sayfaUrunleri);
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

  const vitrinSonuclari = await Promise.all(
    VITRIN_SORGULARI.flatMap((vitrin) =>
      categories.map((kategori) =>
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
    const kategoriHavuzlari = categories.map((_, kategoriIndeksi) => {
      const sonucIndeksi = vitrinIndeksi * categories.length + kategoriIndeksi;
      return vitrinSonuclari[sonucIndeksi]?.urunler.kayitlar ?? [];
    });

    urunGruplari[vitrin.id] = kategoriCesitliVitrinUrunleriniSec(
      kategoriHavuzlari,
      kullanilanUrunIdleri,
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      {/* 1. Sade header */}
      <SiteHeader categories={categories} initialCurrency={seciliParaBirimi as "TRY" | "USD"} />

      <main id="icerik" className="flex-grow">
        {/* 2. Kategori + kampanya + hızlı işlemler (açık temalı 3 kolon) */}
        <Suspense fallback={<div className="h-[360px] bg-yuzey-gomulu animate-pulse" />}>
          <HeroB2B
            categories={categories}
            kategoriSayilari={kategoriSayilari}
            stoktakiUrun={ozet?.stoktakiUrun}
          />
        </Suspense>

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
