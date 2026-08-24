import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProduct } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DiffMatrix } from "@/components/karsilastirma/diff-matrix";
import type { ComparisonItem } from "@/lib/stores/comparison-store";
import { ArrowLeftRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Ürün Karşılaştırma | Çevik Elektronik",
  description: "Elektronik komponentleri yan yana parametrik olarak karşılaştırın, teknik farkları ve fiyat kademelerini anında inceleyin.",
};

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function KarsilastirmaPage({ searchParams }: PageProps) {
  const [{ ids }, categories] = await Promise.all([
    searchParams,
    getCategories(),
  ]);

  let initialProducts: ComparisonItem[] = [];

  if (ids) {
    const rawIds = ids.split(",").map((s) => s.trim()).filter(Boolean);
    const fetched = await Promise.all(
      rawIds.slice(0, 4).map(async (idStr) => {
        try {
          const detail = await getProduct(idStr);
          if (!detail) return null;
          const item: ComparisonItem = {
            id: detail.id,
            ureticiUrunKodu: detail.ureticiUrunKodu,
            ureticiAd: detail.ureticiAd,
            anaGorselUrl: detail.anaGorselUrl,
            baslangicFiyati: detail.ambalajlarVeFiyatlar?.[0]?.fiyatlar?.[0]?.birimFiyat || 0,
            paraBirimi: detail.ambalajlarVeFiyatlar?.[0]?.fiyatlar?.[0]?.paraBirimi || "USD",
            toplamStok: detail.depoStoklari?.reduce((acc, d) => acc + d.stokMiktari, 0) || 0,
            kategoriId: detail.kategoriId,
            ozellikler: detail.ozellikler,
          };
          return item;
        } catch {
          return null;
        }
      })
    );
    initialProducts = fetched.filter((p): p is ComparisonItem => p !== null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-yuzey">
      <SiteHeader categories={categories} />

      <main className="flex-grow container mx-auto px-4 py-8" id="icerik">
        {/* Breadcrumb & Başlık */}
        <nav aria-label="Gezinti" className="mb-4 text-xs text-metin-ucuncul flex items-center gap-1.5">
          <Link href="/" className="hover:text-vurgu transition-colors">Ana Sayfa</Link>
          <span>&gt;</span>
          <span className="text-metin font-medium">Ürün Karşılaştırma</span>
        </nav>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vurgu-zemin text-vurgu">
            <ArrowLeftRight size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-metin-marka">
              Ürün Karşılaştırma Matrisi
            </h1>
            <p className="text-xs sm:text-sm text-metin-ikincil mt-0.5">
              Seçilen komponentlerin elektriksel, fiziksel ve çevresel parametrelerini yan yana inceleyin.
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="p-12 text-center text-metin-ucuncul">Yükleniyor...</div>}>
          <DiffMatrix initialProducts={initialProducts} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
