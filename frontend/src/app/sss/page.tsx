import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getFaqs } from "@/lib/api";

export const metadata: Metadata = { title: "Sıkça Sorulan Sorular" };

export default async function SssPage() {
  const [categories, faqs] = await Promise.all([getCategories(), getFaqs()]);

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader categories={categories} />
      <main id="icerik" className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-metin-marka sm:text-4xl">
          Sıkça Sorulan Sorular
        </h1>
        {faqs.length > 0 ? (
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.id} className="group rounded-token-kart border border-kenar bg-yuzey-kart px-5 py-4">
                <summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-metin marker:content-none">
                  {faq.soru}
                </summary>
                <p className="mt-3 max-w-[70ch] text-sm leading-6 text-metin-ikincil">{faq.cevap}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-metin-ikincil">Soru ve yanıtlar şu anda görüntülenemiyor.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
