import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FavoriButonu, KarsilastirmaButonu } from "@/components/favori-karsilastirma-butonlari";
import { StokRozeti } from "@/components/ui/rozet";
import type { ProductSummary } from "@/lib/api";

function fiyatBicimle(deger: number, paraBirimi: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
    maximumFractionDigits: 4,
  }).format(deger);
}

/**
 * Liste görünümü kartı.
 */
export function ProductListCard({ product }: { product: ProductSummary }) {
  return (
    <article
      className="group flex items-center gap-4 rounded-[var(--radius-kart)] border border-kenar
                 bg-yuzey-kart p-3 transition-[border-color,box-shadow]
                 duration-[var(--sure-acilir)] ease-[var(--ease-cikis)]
                 hover:border-kenar-guclu hover:shadow-[var(--shadow-yukselti)]"
    >
      <Link
        href={`/urunler/${product.id}`}
        className="flex size-20 shrink-0 items-center justify-center rounded-[var(--radius-girdi)]
                   border border-kenar bg-yuzey-gomulu p-2"
        aria-label={`${product.ureticiUrunKodu} ürün detayı`}
      >
        <span className="break-all text-center font-mono text-[10px] leading-tight text-metin-ucuncul">
          {product.ureticiUrunKodu}
        </span>
      </Link>

      <div className="min-w-0 flex-grow">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="text-xs text-metin-ucuncul">{product.ureticiAd}</span>
          {product.kampanyaliMi && (
            <span className="rounded-full bg-uyari-50 px-1.5 text-[10px] font-bold uppercase text-uyari-600">
              Fırsat
            </span>
          )}
        </div>

        <h3 className="truncate font-mono text-sm font-bold text-metin">
          <Link
            href={`/urunler/${product.id}`}
            className="transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu"
          >
            {product.ureticiUrunKodu}
          </Link>
        </h3>

        <p className="mt-0.5 truncate text-xs text-metin-ikincil">{product.kisaAciklama}</p>
      </div>

      {/* Sabit genişlikli sütunlar */}
      <div className="hidden w-32 shrink-0 sm:block">
        <StokRozeti miktar={product.toplamStok} />
      </div>

      <div className="w-28 shrink-0 text-right">
        <div className="text-[10px] text-metin-ucuncul">Başlangıç</div>
        <div className="font-mono text-sm font-bold tabular-nums text-metin">
          {fiyatBicimle(product.baslangicFiyati, product.paraBirimi)}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <KarsilastirmaButonu
          urunId={product.id}
          product={{
            id: product.id,
            ureticiUrunKodu: product.ureticiUrunKodu,
            ureticiAd: product.ureticiAd,
            anaGorselUrl: product.anaGorselUrl,
            baslangicFiyati: product.baslangicFiyati,
            paraBirimi: product.paraBirimi,
            toplamStok: product.toplamStok,
            kategoriId: product.kategoriId,
            ozellikler: product.ozellikler,
          }}
        />
        <FavoriButonu urunId={product.id} />
        <Link
          href={`/urunler/${product.id}`}
          className="inline-flex items-center gap-1 rounded-[var(--radius-girdi)] border
                     border-kenar-guclu px-2.5 py-1.5 text-xs font-semibold text-metin
                     transition-[background-color,border-color,color,transform]
                     duration-[var(--sure-basma)] ease-[var(--ease-cikis)]
                     hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu active:scale-[0.97]"
        >
          İncele <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
