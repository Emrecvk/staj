import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Kapsayici } from "@/components/ui/yuzey";
import { getCategories, getBlogYazilari } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Teknik Kaynaklar",
  description:
    "Elektronik komponentler, RoHS uyumluluğu, tedarik ve tasarım üzerine teknik rehberler ve makaleler.",
};

function tarihBicim(iso?: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso);
  if (isNaN(t.getTime())) return null;
  return t.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const cookieStore = await cookies();
  const seciliParaBirimi = cookieStore.get("site_para_birimi")?.value === "USD" ? "USD" : "TRY";
  const [kategoriler, yazilar] = await Promise.all([getCategories(), getBlogYazilari()]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={kategoriler} initialCurrency={seciliParaBirimi} />

      <main id="icerik" className="flex-grow py-8">
        <Kapsayici>
          <header className="mb-8 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-vurgu">
              Teknik Kaynaklar
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-metin md:text-3xl">
              Blog & Teknik Kaynaklar
            </h1>
            <p className="mt-2 text-sm text-metin-ikincil">
              Komponent seçimi, uyumluluk ve tedarik süreçleri üzerine mühendislik odaklı içerikler.
            </p>
          </header>

          {yazilar.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-token-panel border border-dashed border-kenar py-20 text-center">
              <Newspaper size={40} strokeWidth={1.5} className="mb-3 text-metin-ucuncul" />
              <p className="text-sm font-semibold text-metin">Henüz yayınlanmış içerik yok</p>
              <p className="mt-1 text-xs text-metin-ucuncul">Yakında teknik makaleler burada olacak.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {yazilar.map((yazi) => {
                const tarih = tarihBicim(yazi.yayinTarihi);
                return (
                  <Link
                    key={yazi.id}
                    href={`/blog/${yazi.slug}`}
                    className="group flex flex-col overflow-hidden rounded-token-kart border border-kenar bg-yuzey-kart transition-all duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-token-yukselti"
                  >
                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-yuzey-gomulu">
                      {yazi.kapakGorselUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={yazi.kapakGorselUrl}
                          alt={yazi.baslik}
                          className="h-full w-full object-cover transition-transform duration-[var(--sure-acilir)] group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <Newspaper size={36} strokeWidth={1.5} className="text-metin-ucuncul/60" />
                      )}
                      {yazi.kategori && (
                        <span className="absolute left-3 top-3 rounded-full bg-vurgu px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                          {yazi.kategori}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      {tarih && (
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-metin-ucuncul">
                          <CalendarDays size={13} /> {tarih}
                        </div>
                      )}
                      <h2 className="line-clamp-2 text-base font-bold text-metin transition-colors group-hover:text-vurgu">
                        {yazi.baslik}
                      </h2>
                      <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-metin-ikincil">{yazi.ozet}</p>
                      <span className="mt-3 inline-flex items-center text-xs font-bold text-vurgu transition-transform group-hover:translate-x-0.5">
                        Devamını Oku <ArrowRight size={13} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Kapsayici>
      </main>

      <SiteFooter />
    </div>
  );
}
