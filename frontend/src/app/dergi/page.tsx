import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Newspaper } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Kapsayici } from "@/components/ui/yuzey";
import { getBlogYazilari, getCategories } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Component by Çevik",
  description: "Elektronik tasarım, komponent seçimi ve teknoloji gündemi üzerine Component by Çevik yayınları.",
};

function tarihBicim(iso?: string | null): string | null {
  if (!iso) return null;
  const tarih = new Date(iso);
  return Number.isNaN(tarih.getTime())
    ? null
    : tarih.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function DergiPage() {
  const [kategoriler, yazilar] = await Promise.all([getCategories(), getBlogYazilari()]);
  const sayilar = yazilar.filter((yazi) =>
    yazi.kategori?.toLocaleLowerCase("tr-TR").includes("dergi") ||
    yazi.baslik.toLocaleLowerCase("tr-TR").includes("component by"),
  );

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader categories={kategoriler} />
      <main id="icerik" className="flex-1 py-10 md:py-16">
        <Kapsayici>
          <header className="max-w-3xl border-b border-kenar pb-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-vurgu">
              <BookOpen size={16} /> Component by Çevik
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-metin-marka md:text-5xl">
              Mühendislik ve teknoloji gündemi
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-metin-ikincil">
              Komponent seçimi, tasarım kararları ve elektronik dünyasındaki gelişmeleri dergi formatında keşfedin.
            </p>
          </header>

          {sayilar.length === 0 ? (
            <section className="mt-10 rounded-token-panel border border-dashed border-kenar-guclu bg-yuzey-kart p-12 text-center">
              <Newspaper size={42} strokeWidth={1.5} className="mx-auto mb-4 text-metin-ucuncul" />
              <h2 className="text-lg font-bold text-metin-marka">İlk sayı hazırlanıyor</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-metin-ikincil">
                Yayınlanan sayılar burada görünecek. Bu sırada teknik kaynaklarımızdaki güncel yazılara göz atabilirsiniz.
              </p>
              <Link href="/blog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-marka px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-marka-hover">
                Teknik kaynaklara git <ArrowRight size={16} />
              </Link>
            </section>
          ) : (
            <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Dergi sayıları">
              {sayilar.map((sayi) => (
                <Link key={sayi.id} href={`/blog/${sayi.slug}`} className="group overflow-hidden rounded-token-kart border border-kenar bg-yuzey-kart transition-[border-color,box-shadow,transform] duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:-translate-y-1 hover:border-vurgu hover:shadow-token-yukselti">
                  <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-yuzey-gomulu">
                    {sayi.kapakGorselUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sayi.kapakGorselUrl} alt={sayi.baslik} className="h-full w-full object-cover transition-transform duration-[var(--sure-acilir)] group-hover:scale-105" />
                    ) : <Newspaper size={38} strokeWidth={1.5} className="text-metin-ucuncul/60" />}
                  </div>
                  <div className="p-5">
                    {tarihBicim(sayi.yayinTarihi) && <p className="flex items-center gap-1.5 text-xs text-metin-ucuncul"><CalendarDays size={13} /> {tarihBicim(sayi.yayinTarihi)}</p>}
                    <h2 className="mt-2 text-lg font-bold text-metin-marka group-hover:text-vurgu">{sayi.baslik}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-metin-ikincil">{sayi.ozet}</p>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </Kapsayici>
      </main>
      <SiteFooter />
    </div>
  );
}
