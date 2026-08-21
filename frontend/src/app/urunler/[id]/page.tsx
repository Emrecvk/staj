import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText, Download, Truck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AmbalajSecici } from "@/components/ambalaj-secici";
import { FavoriButonu, KarsilastirmaButonu } from "@/components/favori-karsilastirma-butonlari";
import { Kapsayici } from "@/components/ui/yuzey";
import { Rozet } from "@/components/ui/rozet";
import { Kisaltma } from "@/components/ui/ipucu";
import { getCategories, getProduct } from "@/lib/api";
import type { ProductDetail, RelatedProductSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const urun = await getProduct(id);

  if (!urun) return { title: "Ürün bulunamadı" };

  return {
    title: `${urun.ureticiUrunKodu} · ${urun.ureticiAd}`,
    description: urun.kisaAciklama,
  };
}

/** Yaşam döngüsü rozeti. "Aktif" normal durumdur, rozet basılmaz. */
function YasamDongusu({ durum }: { durum: string | null }) {
  if (!durum || durum === "Aktif") return null;

  const harita: Record<string, { metin: string; ton: "uyari" | "hata" }> = {
    YeniTasarimaOnerilmez: { metin: "NRND", ton: "uyari" },
    OmruSonu: { metin: "EOL", ton: "hata" },
    KullanimdanKalkti: { metin: "Üretimden kalktı", ton: "hata" },
  };

  const kayit = harita[durum];
  if (!kayit) return null;

  return (
    <Rozet ton={kayit.ton}>
      <Kisaltma kod={kayit.metin} />
    </Rozet>
  );
}

function IliskiliGrup({ baslik, aciklama, urunler }: {
  baslik: string;
  aciklama: string;
  urunler: RelatedProductSummary[];
}) {
  if (urunler.length === 0) return null;

  return (
    <section>
      <h3 className="text-base font-bold text-metin">{baslik}</h3>
      <p className="mb-3 text-sm text-metin-ikincil">{aciklama}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {urunler.map((u) => (
          <Link
            key={u.id}
            href={`/urunler/${u.id}`}
            className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-3
                       transition-[border-color,box-shadow] duration-[var(--sure-acilir)]
                       ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-[var(--shadow-yukselti)]"
          >
            <p className="truncate font-mono text-sm font-bold text-metin">{u.ureticiUrunKodu}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-metin-ikincil">{u.kisaAciklama}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [urun, kategoriler] = await Promise.all([getProduct(id), getCategories()]);
  if (!urun) notFound();

  const ozellikler = Object.entries(urun.ozellikler ?? {});
  const iliskiliVar =
    urun.muadiller.length + urun.benzerUrunler.length +
    urun.parametrikUrunler.length + urun.birlikteKullanilanlar.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={kategoriler} />

      <main id="icerik" className="flex-grow pb-16">
        <nav aria-label="Konum" className="border-b border-kenar bg-yuzey-kart">
          <Kapsayici>
            <ol className="flex items-center gap-1.5 py-3 text-xs text-metin-ucuncul">
              <li><Link href="/" className="hover:text-vurgu">Ana sayfa</Link></li>
              <li aria-hidden><ChevronRight size={13} /></li>
              <li><Link href="/urunler" className="hover:text-vurgu">Ürünler</Link></li>
              <li aria-hidden><ChevronRight size={13} /></li>
              <li>
                <Link href={`/urunler?aramaMetni=${encodeURIComponent(urun.ureticiAd)}`} className="hover:text-vurgu">
                  {urun.ureticiAd}
                </Link>
              </li>
              <li aria-hidden><ChevronRight size={13} /></li>
              <li className="font-mono font-medium text-metin" aria-current="page">
                {urun.ureticiUrunKodu}
              </li>
            </ol>
          </Kapsayici>
        </nav>

        <Kapsayici className="py-8">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                href={`/urunler?aramaMetni=${encodeURIComponent(urun.ureticiAd)}`}
                className="text-sm font-semibold text-vurgu hover:text-vurgu-guclu"
              >
                {urun.ureticiAd}
              </Link>

              <h1 className="mt-1 break-all font-mono text-3xl font-bold tracking-tight text-metin">
                {urun.ureticiUrunKodu}
              </h1>

              <p className="mt-2 max-w-[70ch] text-metin-ikincil">{urun.kisaAciklama}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <YasamDongusu durum={urun.urunDurumu} />
                {urun.rohsDurumu === "Belgeli" && (
                  <Rozet ton="basari"><Kisaltma kod="RoHS" /> belgeli</Rozet>
                )}
                {urun.montajTipi && urun.montajTipi !== "Yok" && (
                  <Rozet ton="notr">
                    <Kisaltma kod={urun.montajTipi === "Smt" ? "SMT" : "THT"} />
                  </Rozet>
                )}
                {urun.ureticiTeslimSuresi && (
                  <Rozet ton="bilgi" ikon={<Truck size={11} />}>
                    Üretici teslim: {urun.ureticiTeslimSuresi}
                  </Rozet>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <FavoriButonu urunId={urun.id} boyut="buyuk" />
              <KarsilastirmaButonu urunId={urun.id} />
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-8">
              {ozellikler.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold text-metin">Teknik özellikler</h2>
                  <dl className="overflow-hidden rounded-[var(--radius-kart)] border border-kenar">
                    {ozellikler.map(([anahtar, deger], i) => (
                      <div
                        key={anahtar}
                        className={`flex justify-between gap-4 px-4 py-2.5 text-sm ${
                          i % 2 === 1 ? "bg-yuzey-gomulu" : "bg-yuzey-kart"
                        }`}
                      >
                        <dt className="text-metin-ikincil">{anahtar.replace(/_/g, " ")}</dt>
                        <dd className="text-right font-mono tabular-nums text-metin">{deger}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {urun.detayliAciklama && (
                <section>
                  <h2 className="mb-3 text-lg font-bold text-metin">Açıklama</h2>
                  <p className="max-w-[70ch] leading-relaxed text-metin-ikincil">
                    {urun.detayliAciklama}
                  </p>
                </section>
              )}

              {urun.dokumanlar.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold text-metin">Dokümanlar</h2>
                  <ul className="divide-y divide-kenar overflow-hidden rounded-[var(--radius-kart)] border border-kenar">
                    {urun.dokumanlar.map((dokuman) => (
                      <li key={dokuman.url}>
                        <a
                          href={dokuman.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-yuzey-kart px-4 py-3 text-sm
                                     transition-colors duration-[var(--sure-ipucu)] hover:bg-yuzey-gomulu"
                        >
                          <FileText size={16} className="shrink-0 text-metin-ucuncul" aria-hidden />
                          <span className="flex-grow text-metin">{dokuman.baslik}</span>
                          <Download size={15} className="shrink-0 text-metin-ucuncul" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Fiyat ve sipariş paneli masaüstünde yapışkan: kullanıcı teknik
                özellikleri okurken fiyatı görme alanında tutuyor. */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              {urun.ambalajlarVeFiyatlar.length > 0 ? (
                <AmbalajSecici ambalajlar={urun.ambalajlarVeFiyatlar} />
              ) : (
                <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-5">
                  <p className="text-sm text-metin-ikincil">
                    Bu ürün için tanımlı ambalaj ve fiyat bulunmuyor. Fiyat ve tedarik süresi
                    için teklif isteyebilirsiniz.
                  </p>
                  <Link
                    href="/teklif-iste"
                    className="mt-3 inline-block text-sm font-semibold text-vurgu hover:text-vurgu-guclu"
                  >
                    Teklif iste
                  </Link>
                </div>
              )}
            </aside>
          </div>

          {/* İlişkili ürünler. Gruplar boşsa hiç basılmıyor; önceki sürümde
              burada uydurma "-ALT1 / -ALT2" ürünleri href="#" ile listeleniyordu. */}
          {iliskiliVar && (
            <div className="mt-14 space-y-10">
              <IliskiliGrup
                baslik="Muadiller"
                aciklama="Aynı işlevi gören, birebir yerine kullanılabilen parçalar."
                urunler={urun.muadiller}
              />
              <IliskiliGrup
                baslik="Benzer ürünler"
                aciklama="Yakın özelliklere sahip alternatifler."
                urunler={urun.benzerUrunler}
              />
              <IliskiliGrup
                baslik="Parametrik alternatifler"
                aciklama="Aynı ailede farklı değer veya kılıf seçenekleri."
                urunler={urun.parametrikUrunler}
              />
              <IliskiliGrup
                baslik="Birlikte kullanılanlar"
                aciklama="Bu parçayla aynı tasarımda sık kullanılan komponentler."
                urunler={urun.birlikteKullanilanlar}
              />
            </div>
          )}
        </Kapsayici>
      </main>

      <SiteFooter />
    </div>
  );
}

/* Tip kontrolu: ProductDetail alanlari degistiginde burasi derlenmez. */
type _AlanKontrolu = Pick<
  ProductDetail,
  "muadiller" | "benzerUrunler" | "parametrikUrunler" | "birlikteKullanilanlar"
>;
