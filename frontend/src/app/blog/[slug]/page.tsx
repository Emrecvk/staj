import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getBlogYazisi } from "@/lib/api";

export const dynamic = "force-dynamic";

function tarihBicim(iso?: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso);
  if (isNaN(t.getTime())) return null;
  return t.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const yazi = await getBlogYazisi(slug);
  if (!yazi) return { title: "İçerik bulunamadı" };
  return { title: `${yazi.baslik} | Blog`, description: yazi.ozet };
}

export default async function BlogDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, yazi] = await Promise.all([getCategories(), getBlogYazisi(slug)]);

  if (!yazi) notFound();

  const tarih = tarihBicim(yazi.yayinTarihi);

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader categories={categories} />

      <main id="icerik" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-vurgu transition-colors hover:text-vurgu-guclu"
        >
          <ArrowLeft size={15} /> Tüm Yazılar
        </Link>

        <header className="mt-5 border-b border-kenar pb-6">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {yazi.kategori && (
              <span className="rounded-full bg-vurgu px-2.5 py-0.5 font-bold text-white">
                {yazi.kategori}
              </span>
            )}
            {tarih && (
              <span className="inline-flex items-center gap-1.5 text-metin-ucuncul">
                <CalendarDays size={13} /> {tarih}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-metin-marka sm:text-4xl">
            {yazi.baslik}
          </h1>
          <p className="mt-3 text-base text-metin-ikincil">{yazi.ozet}</p>
        </header>

        <article
          className="mt-6 max-w-[70ch] text-base leading-7 text-metin-ikincil [&_a]:text-vurgu [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-metin [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-metin [&_li]:mb-1 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: yazi.icerikHtml }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
