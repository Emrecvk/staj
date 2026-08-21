import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroB2B } from "@/components/home/hero-b2b";
import { EnvanterSeridi } from "@/components/home/envanter-seridi";
import { KategoriIzgarasi } from "@/components/home/kategori-izgarasi";
import { VitrinSekmeleri } from "@/components/home/vitrin-sekmeleri";
import { DistributorVitrini } from "@/components/home/distributor-vitrini";
import { B2BDegerOnerisi } from "@/components/home/b2b-deger-onerisi";
import { getCategories, getProducts, getKatalogOzeti } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, productResult, ozet] = await Promise.all([
    getCategories(),
    getProducts({ sayfaNo: 1, sayfaBoyutu: 12, sadeceStoktakiler: true }),
    getKatalogOzeti(),
  ]);

  const urunler = productResult?.urunler?.kayitlar ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      {/* 1. Global 3-Tier Header & Mega Menu */}
      <SiteHeader categories={categories} />

      <main id="icerik" className="flex-grow">
        {/* 2. Split B2B Hero Section (Slider 65% + Quick BOM Widget 35%) */}
        <Suspense fallback={<div className="h-[480px] bg-marka animate-pulse" />}>
          <HeroB2B />
        </Suspense>

        {/* 3. Live Inventory Metrics Strip */}
        <EnvanterSeridi ozet={ozet} />

        {/* 4. Category Icon Grid with Live SKU Counts (6x2) */}
        <KategoriIzgarasi categories={categories} />

        {/* 5. Tabbed Product Showcase Carousels (New, Bestsellers, Stock Deals, Featured) */}
        <VitrinSekmeleri urunler={urunler} />

        {/* 6. Authorized Supplier Line-Card Showcase */}
        <DistributorVitrini />

        {/* 7. B2B Corporate Solutions & Value Propositions */}
        <B2BDegerOnerisi />
      </main>

      {/* 8. Global Site Footer */}
      <SiteFooter />
    </div>
  );
}
