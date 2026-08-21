import Link from "next/link";
import {
  ArrowRight, Filter, Layers, MessageSquareQuote, BellRing, Search,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButonLink } from "@/components/ui/buton";
import { Kapsayici, HataDurumu } from "@/components/ui/yuzey";
import { getCategories, getProducts, getKatalogOzeti } from "@/lib/api";

export const dynamic = "force-dynamic";

const POPULER_ARAMALAR = ["STM32", "LM358", "ESP32", "1N4148", "NE555"];

export default async function Home() {
  const [categories, productResult, ozet] = await Promise.all([
    getCategories(),
    getProducts({ sayfaNo: 1, sayfaBoyutu: 10, sadeceStoktakiler: true }),
    getKatalogOzeti(),
  ]);

  const urunler = productResult?.urunler?.kayitlar ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={categories} />

      <main id="icerik" className="flex-grow">
        {/* ---------------------------------------------------------------
            HERO

            Arama alanının kendisi hero görselidir. Bir distribütörde
            kullanıcının tek işi doğru parçayı bulmak; sayfanın merkezinde
            duracak şey de o olmalı.

            Önceki sürümde burada div'lerden yapılmış sahte bir çip
            ("CVK32 INDUSTRIAL MCU") vardı. Çevik bir distribütör, çip
            üreticisi değil — var olmayan bir ürünü vitrine koymak yanlıştı.
            Yerine geçen sayılar API'den geliyor.
            --------------------------------------------------------------- */}
        <section className="border-b border-kenar bg-marka text-white">
          <Kapsayici className="py-14 md:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
                Doğru komponenti{" "}
                <span className="text-cyan-400">hızla bulun.</span>
              </h1>

              <p className="mt-4 max-w-xl text-lg leading-relaxed text-navy-200">
                Parametrik filtreleme, anlık stok ve adet bazlı kademeli fiyat.
              </p>

              <form action="/urunler" className="mt-8 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-grow">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-notr-400"
                    aria-hidden
                  />
                  <input
                    name="aramaMetni"
                    aria-label="Ürün kodu, üretici veya kategori ara"
                    placeholder="Ürün kodu, üretici veya kategori ara"
                    className="h-14 w-full rounded-[var(--radius-girdi)] bg-white pl-11 pr-4
                               font-mono text-base text-notr-900 placeholder:font-sans
                               placeholder:text-notr-500 focus-visible:outline-2
                               focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-14 shrink-0 items-center justify-center gap-2
                             rounded-[var(--radius-girdi)] bg-cyan-500 px-8 font-bold text-white
                             transition-[transform,background-color] duration-[var(--sure-basma)]
                             ease-[var(--ease-cikis)] hover:bg-cyan-600 active:scale-[0.97]"
                >
                  Ara <ArrowRight size={18} />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-navy-300">
                <span>Sık aranan:</span>
                {POPULER_ARAMALAR.map((terim) => (
                  <Link
                    key={terim}
                    href={`/urunler?aramaMetni=${terim}`}
                    className="font-mono underline decoration-navy-500 underline-offset-4
                               transition-colors duration-[var(--sure-ipucu)]
                               hover:text-cyan-400 hover:decoration-cyan-400"
                  >
                    {terim}
                  </Link>
                ))}
              </div>
            </div>
          </Kapsayici>
        </section>

        {/* ---------------------------------------------------------------
            ENVANTER ŞERİDİ

            "Hızlı teslimat / güvenli alışveriş" gibi genel vaatler yerine
            ölçülebilir rakamlar. Hepsi API'den; API kapalıysa şerit hiç
            basılmıyor çünkü uydurma sayı göstermek hiç göstermemekten kötü.
            --------------------------------------------------------------- */}
        {ozet && (
          <section className="border-b border-kenar bg-yuzey-kart">
            <Kapsayici>
              <dl className="grid grid-cols-3 divide-x divide-kenar">
                {[
                  { etiket: "Katalogda ürün", deger: ozet.toplamUrun },
                  { etiket: "Stoktan teslim", deger: ozet.stoktakiUrun },
                  { etiket: "Ürün kategorisi", deger: ozet.kategoriSayisi },
                ].map((satir, i) => (
                  <div key={satir.etiket} className={`py-6 ${i === 0 ? "pr-6" : "px-6"}`}>
                    <dd className="font-mono text-2xl font-bold tabular-nums text-metin md:text-3xl">
                      {satir.deger.toLocaleString("tr-TR")}
                    </dd>
                    <dt className="mt-0.5 text-xs text-metin-ikincil md:text-sm">{satir.etiket}</dt>
                  </div>
                ))}
              </dl>
            </Kapsayici>
          </section>
        )}

        {/* ---------------------------------------------------------------
            KATEGORİLER

            İlk kategori geniş hücrede: asimetri hiyerarşi anlatıyor, süs
            değil. Dört eşit kart AI varsayılanı.
            --------------------------------------------------------------- */}
        <section className="py-14">
          <Kapsayici>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-metin md:text-3xl">
                Kategoriler
              </h2>
              <Link
                href="/urunler"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-vurgu
                           transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu-guclu"
              >
                Tüm ürünler <ArrowRight size={15} />
              </Link>
            </div>

            {categories.length === 0 ? (
              <HataDurumu aciklama="Kategoriler şu anda yüklenemiyor. API bağlantısı kurulamadı." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.slice(0, 5).map((kategori, i) => (
                  <Link
                    key={kategori.id}
                    href={`/urunler?kategoriId=${kategori.id}`}
                    className={`group flex flex-col justify-between rounded-[var(--radius-kart)]
                                border border-kenar bg-yuzey-kart p-5
                                transition-[border-color,box-shadow] duration-[var(--sure-acilir)]
                                ease-[var(--ease-cikis)] hover:border-vurgu
                                hover:shadow-[var(--shadow-yukselti)]
                                ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}`}
                  >
                    <div>
                      <h3
                        className={`font-bold text-metin ${
                          i === 0 ? "text-xl md:text-2xl" : "text-base"
                        }`}
                      >
                        {kategori.ad}
                      </h3>
                      {kategori.altKategoriler && kategori.altKategoriler.length > 0 && (
                        <p className="mt-2 text-sm leading-relaxed text-metin-ikincil">
                          {kategori.altKategoriler.map((alt) => alt.ad).slice(0, i === 0 ? 6 : 3).join(", ")}
                        </p>
                      )}
                    </div>

                    <span
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-vurgu
                                 transition-transform duration-[var(--sure-acilir)]
                                 ease-[var(--ease-cikis)] group-hover:translate-x-0.5"
                    >
                      Ürünleri gör <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Kapsayici>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="border-y border-kenar bg-yuzey-kart py-14">
          <Kapsayici>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-metin md:text-3xl">
                  Stoktan teslim ürünler
                </h2>
                <p className="mt-1 text-sm text-metin-ikincil">
                  Şu anda depoda bulunan, aynı gün kargolanabilen komponentler.
                </p>
              </div>
              <Link
                href="/urunler?sadeceStoktakiler=true"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-vurgu
                           transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu-guclu"
              >
                Tümünü gör <ArrowRight size={15} />
              </Link>
            </div>

            {urunler.length === 0 ? (
              <HataDurumu aciklama="Ürünler şu anda yüklenemiyor. API bağlantısı kurulamadı." />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {urunler.map((urun) => (
                  <ProductCard key={urun.id} product={urun} />
                ))}
              </div>
            )}
          </Kapsayici>
        </section>

        {/* ---------------------------------------------------------------
            PLATFORM ÖZELLİKLERİ

            Genel e-ticaret vaatleri değil, bu sistemin gerçekten yaptığı
            işler. Dördü de canlı özellik.
            --------------------------------------------------------------- */}
        <section className="py-14">
          <Kapsayici>
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-metin md:text-3xl">
              Mühendis ve satın almacı için
            </h2>

            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  ikon: Filter,
                  baslik: "Parametrik filtre",
                  metin: "Kılıf, gerilim, tolerans ve onlarca teknik özelliğe göre daraltın. Filtre seçenekleri gerçek ürün sayısını gösterir.",
                },
                {
                  ikon: Layers,
                  baslik: "Kademeli fiyat",
                  metin: "Adet arttıkça birim fiyat düşer. Kademeler ürün sayfasında açıkça listelenir.",
                },
                {
                  ikon: MessageSquareQuote,
                  baslik: "Teklif yönetimi",
                  metin: "Firma hesabıyla toplu alım için teklif isteyin, kabul edin ve tek tıkla siparişe çevirin.",
                },
                {
                  ikon: BellRing,
                  baslik: "Stok bildirimi",
                  metin: "Tükenen ürün için bildirim bırakın, stoğa girdiğinde haber verelim.",
                },
              ].map((ozellik) => (
                <div key={ozellik.baslik}>
                  <ozellik.ikon size={22} strokeWidth={1.75} className="mb-3 text-vurgu" aria-hidden />
                  <h3 className="mb-1.5 font-bold text-metin">{ozellik.baslik}</h3>
                  <p className="text-sm leading-relaxed text-metin-ikincil">{ozellik.metin}</p>
                </div>
              ))}
            </div>
          </Kapsayici>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="border-t border-kenar bg-yuzey-kart py-14">
          <Kapsayici>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight text-metin md:text-3xl">
                  Firmanıza özel fiyat ve vadeli ödeme
                </h2>
                <p className="mt-2 leading-relaxed text-metin-ikincil">
                  Kurumsal hesap açın; toplu alımlarda teklif isteyin, siparişlerinizi ve
                  tekliflerinizi tek panelden yönetin.
                </p>
              </div>
              <ButonLink href="/kayit/kurumsal" gorunum="vurgu" boyut="buyuk" className="shrink-0">
                Firma hesabı aç
              </ButonLink>
            </div>
          </Kapsayici>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
