import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Kapsayici } from "@/components/ui/yuzey";
import { getCategories, getKategoriUreticiSayilari, getUreticiler, type Category } from "@/lib/api";
import { MarkaListesi } from "./marka-listesi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Üreticiler",
  description: "Çevik Elektronik üretici ve marka kataloğunu keşfedin.",
};

function kategorileriDuzlestir(kategoriler: Category[]): Category[] {
  return kategoriler.flatMap((kategori) => [kategori, ...kategorileriDuzlestir(kategori.altKategoriler ?? [])]);
}

export default async function MarkalarPage() {
  const kategoriAgaci = await getCategories();
  const kategoriler = kategorileriDuzlestir(kategoriAgaci);
  const [ureticiler, kategoriSayilari] = await Promise.all([
    getUreticiler(),
    getKategoriUreticiSayilari(kategoriler),
  ]);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={kategoriAgaci} />
      <main id="icerik" className="flex-grow py-10 md:py-14">
        <Kapsayici>
          <nav aria-label="Konum" className="mb-8 flex items-center gap-2 border-b border-kenar pb-5 text-sm text-metin-ikincil">
            <Link href="/" className="transition-colors hover:text-vurgu">Ana Sayfa</Link>
            <ChevronRight size={16} aria-hidden="true" />
            <span className="font-bold text-metin-marka">Üreticiler</span>
          </nav>

          <MarkaListesi
            ureticiler={ureticiler}
            kategoriler={kategoriler}
            kategoriSayilari={kategoriSayilari}
          />
        </Kapsayici>
      </main>
      <SiteFooter />
    </div>
  );
}
