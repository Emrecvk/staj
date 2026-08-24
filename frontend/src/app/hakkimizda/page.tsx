import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getPublicPage } from "@/lib/api";

export const metadata: Metadata = { title: "Hakkımızda | Çevik Elektronik" };

export default async function HakkimizdaPage() {
  const [categories, page] = await Promise.all([getCategories(), getPublicPage("hakkimizda")]);

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader categories={categories} />
      <main id="icerik" className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-metin-marka sm:text-4xl">
          {page?.baslik ?? "Hakkımızda"}
        </h1>
        {page ? (
          <div
            className="mt-6 max-w-[70ch] text-base leading-7 text-metin-ikincil [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: page.icerikHtml }}
          />
        ) : (
          <p className="mt-6 text-metin-ikincil">Bu sayfanın içeriği şu anda görüntülenemiyor.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
