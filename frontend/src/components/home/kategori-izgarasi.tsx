import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import { kategoriIkonunuGetir } from "@/components/kategori-ikonlari";
import type { Category } from "@/lib/api";

interface KategoriIzgarasiProps {
  categories?: Category[];
  /** id -> gercek urun sayisi (getKategoriUrunSayilari). Yoksa sayi gizlenir. */
  urunSayilari?: Record<number, number>;
}

export function KategoriIzgarasi({
  categories = [],
  urunSayilari = {},
}: KategoriIzgarasiProps) {
  // Sadece gercek kategoriler render edilir. API bos donduyse bolum gizlenir.
  if (categories.length === 0) return null;

  const toplamUrun = Object.values(urunSayilari).reduce((a, b) => a + b, 0);

  return (
    <section className="bg-yuzey py-12 md:py-16" aria-label="Temel Komponent Kategorileri">
      <Kapsayici>
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-vurgu">
              Komponent Kataloğu
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-metin md:text-3xl">
              Ürün Aileleri ve Kategoriler
            </h2>
            <p className="mt-1.5 text-sm text-metin-ikincil">
              {toplamUrun > 0
                ? `${categories.length} ana kategoride ${toplamUrun.toLocaleString(
                    "tr-TR",
                  )} aktif komponent.`
                : "Mühendislik ve üretim projeleriniz için parametrik komponent kataloğu."}
            </p>
          </div>

          <Link
            href="/urunler"
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-vurgu transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu-guclu sm:self-auto"
          >
            Tüm Kataloğu Gör <ArrowRight size={16} />
          </Link>
        </div>

        {/* Responsive Category Grid */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {categories.map((cat) => {
            const Icon = kategoriIkonunuGetir(cat.slug);
            const sayi = urunSayilari[cat.id];
            const altlar = (cat.altKategoriler ?? []).map((a) => a.ad).slice(0, 3);
            return (
              <Link
                key={cat.id}
                href={`/urunler?kategoriId=${cat.id}`}
                className="group relative flex flex-col justify-between rounded-token-kart border border-kenar bg-yuzey-kart p-4 transition-all duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-token-yukselti"
              >
                <div>
                  {/* Category Icon */}
                  <div className="mb-3 inline-flex rounded-token-girdi bg-vurgu-zemin p-2.5 text-vurgu transition-colors duration-[var(--sure-ipucu)] group-hover:bg-vurgu group-hover:text-white">
                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  {/* Category Title */}
                  <h3 className="text-sm font-bold leading-snug text-metin transition-colors group-hover:text-vurgu">
                    {cat.ad}
                  </h3>

                  {/* Real SKU Count — sadece API verisi varsa gosterilir */}
                  {typeof sayi === "number" && sayi > 0 && (
                    <div className="mt-1.5">
                      <span className="inline-block font-mono text-xs font-semibold tabular-nums text-metin-ucuncul">
                        {sayi.toLocaleString("tr-TR")} ürün
                      </span>
                    </div>
                  )}
                </div>

                {/* Subcategories preview */}
                {altlar.length > 0 && (
                  <div className="mt-3 border-t border-kenar/60 pt-2">
                    <p className="line-clamp-1 text-[11px] leading-tight text-metin-ikincil">
                      {altlar.join(", ")}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </Kapsayici>
    </section>
  );
}
