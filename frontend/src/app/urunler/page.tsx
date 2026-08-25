import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Kapsayici } from "@/components/ui/yuzey";
import { getCategories, getProducts, getUreticiler } from "@/lib/api";
import { ProductListingClient } from "./client";
import { apiParametreleriniKur } from "./parametreler";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürün Kataloğu",
  description:
    "Parametrik filtreleme ile elektronik komponent arayın: kılıf, gerilim, tolerans ve stok durumuna göre daraltın.",
};

export default async function UrunlerPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametreler = await searchParams;
  const cookieStore = await cookies();
  const seciliParaBirimi = cookieStore.get("site_para_birimi")?.value === "USD" ? "USD" : "TRY";

  // URL parametreleri API bicimine cevrilir; parametrik filtreler
  // ParametrikFiltreler[anahtar] olmadan sunucu tarafindan yok sayiliyor.
  const apiParametreleri = apiParametreleriniKur(parametreler);
  apiParametreleri.paraBirimi = seciliParaBirimi;

  // Marka filtresi aktifse üretici adlarını çöz; aktif-filtre çipinde ham id
  // yerine "Omron" gibi okunur ad göstermek için (yalnızca gerektiğinde çekilir).
  const ureticiFiltresiVar = parametreler.ureticiId !== undefined;

  const [kategoriler, sonuc, ureticiler] = await Promise.all([
    getCategories(),
    getProducts(apiParametreleri),
    ureticiFiltresiVar ? getUreticiler() : Promise.resolve([]),
  ]);

  const ureticiAdlari: Record<string, string> = {};
  for (const u of ureticiler) ureticiAdlari[String(u.id)] = u.ad;

  const aramaMetni = typeof parametreler.aramaMetni === "string" ? parametreler.aramaMetni : null;
  const kategoriId = typeof parametreler.kategoriId === "string" ? parametreler.kategoriId : null;

  // Kategori adini agactan coz; baslikta "Ürün Kataloğu" yerine gercek
  // kategori adini gostermek kullaniciya nerede oldugunu soyluyor.
  const kategoriAdiBul = (dallar: typeof kategoriler): string | null => {
    for (const dal of dallar) {
      if (String(dal.id) === kategoriId) return dal.ad;
      const alt = kategoriAdiBul(dal.altKategoriler ?? []);
      if (alt) return alt;
    }
    return null;
  };
  const kategoriAdi = kategoriId ? kategoriAdiBul(kategoriler) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={kategoriler} initialCurrency={seciliParaBirimi} />

      <main id="icerik" className="flex-grow py-8">
        <Kapsayici>
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-metin">
              {kategoriAdi ?? "Ürün Kataloğu"}
            </h1>
            {aramaMetni && (
              <p className="mt-1 text-sm text-metin-ikincil">
                <span className="font-mono text-metin">{aramaMetni}</span> için sonuçlar
              </p>
            )}
          </header>

          <ProductListingClient initialData={sonuc} ureticiAdlari={ureticiAdlari} />
        </Kapsayici>
      </main>

      <SiteFooter />
    </div>
  );
}
