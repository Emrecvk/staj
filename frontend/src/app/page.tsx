import { Suspense } from "react";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroB2B } from "@/components/home/hero-b2b";
import { AltPromos } from "@/components/home/alt-promos";
import { VitrinSekmeleri } from "@/components/home/vitrin-sekmeleri";
import { DistributorVitrini } from "@/components/home/distributor-vitrini";
import { B2BDegerOnerisi } from "@/components/home/b2b-deger-onerisi";
import { YukariCik } from "@/components/ui/yukari-cik";
import {
  getCategories,
  getProducts,
  getKatalogOzeti,
  getKategoriUrunSayilari,
  getUreticiler,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const seciliParaBirimi = cookieStore.get("site_para_birimi")?.value === "USD" ? "USD" : "TRY";
  const [categories, productResult, ozet, ureticiler] = await Promise.all([
    getCategories(),
    getProducts({
      sayfaNo: 1,
      sayfaBoyutu: 12,
      sadeceStoktakiler: true,
      paraBirimi: seciliParaBirimi,
    }),
    getKatalogOzeti(),
    getUreticiler(),
  ]);

  // Kategori urun sayilari: kategoriler geldikten sonra gercek sayimla.
  const kategoriSayilari = await getKategoriUrunSayilari(categories);

  const urunler = productResult?.urunler?.kayitlar ?? [];

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
        <div>
          <VitrinSekmeleri urunler={urunler} baslangicSekmesi="coksatan" siteParaBirimi={seciliParaBirimi} />
          <VitrinSekmeleri urunler={urunler} baslangicSekmesi="yeni" siteParaBirimi={seciliParaBirimi} />
          <VitrinSekmeleri urunler={urunler} baslangicSekmesi="onecikan" siteParaBirimi={seciliParaBirimi} />
          <VitrinSekmeleri urunler={urunler} baslangicSekmesi="firsat" siteParaBirimi={seciliParaBirimi} />
        </div>

        {/* BOM/RFQ çözümleri ve iletişim alanı */}
        <div id="cozumler">
          <B2BDegerOnerisi />
        </div>
      </main>

      {/* 9. Sade footer */}
      <SiteFooter />
      <YukariCik />
    </div>
  );
}
