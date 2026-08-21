import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FavoriButonu } from "@/components/favori-karsilastirma-butonlari";
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
 * Ürün kartı.
 *
 * Üç bilinçli karar:
 *
 * 1. Nabız atan stok noktası kaldırıldı. Bir ızgarada 20+ kart var ve her
 *    birinde sonsuz döngü çalışıyordu. Gerçek sinyal zaten adet; yanıp sönen
 *    nokta bilgi taşımıyor, sadece dikkat çalıyor.
 *
 * 2. Sepet butonu yerine "İncele". Sepete ekleme ambalaj seçimi gerektiriyor
 *    (MOQ, MPQ ve katlama kuralları ambalaj bazında); ızgaradan tek tıkla
 *    eklemek bu kuralı atlamak olurdu. Önceki sürümde buton zaten hiçbir şeye
 *    bağlı değildi.
 *
 * 3. Görsel yerine MPN. Seed verisi /gorseller/... yolunu veriyor ama o
 *    dosyalar mevcut değil. Kırık görsel yerine parça kodunu mono ile
 *    göstermek bu sektörde standart; Digi-Key ve Mouser da fotoğrafı
 *    olmayan parçalarda aynısını yapıyor.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-kart)]
                 border border-kenar bg-yuzey-kart
                 transition-[border-color,box-shadow] duration-[var(--sure-acilir)]
                 ease-[var(--ease-cikis)] hover:border-kenar-guclu hover:shadow-[var(--shadow-yukselti)]"
    >
      <div className="relative shrink-0 border-b border-kenar bg-yuzey-gomulu">
        <Link
          href={`/urunler/${product.id}`}
          className="flex aspect-[4/3] items-center justify-center p-4"
          aria-label={`${product.ureticiUrunKodu} ürün detayı`}
        >
          <span className="break-all text-center font-mono text-sm font-medium text-metin-ucuncul">
            {product.ureticiUrunKodu}
          </span>
        </Link>

        {product.kampanyaliMi && (
          <span
            className="absolute left-2 top-2 rounded-full bg-uyari-500 px-2 py-0.5
                       text-[10px] font-bold uppercase tracking-wide text-white"
          >
            Fırsat
          </span>
        )}

        {/* Odaklanınca da görünür: klavye kullanıcısı favoriye erişebilmeli. */}
        <div
          className="absolute right-2 top-2 opacity-0 transition-opacity
                     duration-[var(--sure-acilir)] focus-within:opacity-100 group-hover:opacity-100"
        >
          <FavoriButonu urunId={product.id} />
        </div>
      </div>

      <div className="flex flex-grow flex-col p-4">
        <span className="mb-1 text-xs font-medium text-metin-ucuncul">{product.ureticiAd}</span>

        <h3 className="mb-2 font-mono text-sm font-bold leading-tight text-metin">
          <Link
            href={`/urunler/${product.id}`}
            className="line-clamp-1 transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu"
          >
            {product.ureticiUrunKodu}
          </Link>
        </h3>

        <p className="mb-3 line-clamp-2 flex-grow text-xs leading-relaxed text-metin-ikincil">
          {product.kisaAciklama}
        </p>

        <div className="mb-3">
          <StokRozeti miktar={product.toplamStok} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-kenar pt-3">
          <div>
            <div className="text-[10px] text-metin-ucuncul">Başlangıç fiyatı</div>
            <div className="font-mono text-base font-bold tabular-nums text-metin">
              {fiyatBicimle(product.baslangicFiyati, product.paraBirimi)}
            </div>
          </div>

          <Link
            href={`/urunler/${product.id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-girdi)]
                       border border-kenar-guclu px-2.5 py-1.5 text-xs font-semibold text-metin
                       transition-[background-color,border-color,color,transform]
                       duration-[var(--sure-basma)] ease-[var(--ease-cikis)]
                       hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu active:scale-[0.97]"
          >
            İncele <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
