import Link from "next/link";
import { ShoppingCart, Image as ImageIcon } from "lucide-react";
import { FavoriButonu } from "@/components/favori-karsilastirma-butonlari";
import type { ProductSummary } from "@/lib/api";

function formatPrice(value: number, currency: string) { 
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value); 
}

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <Link href={`/urunler/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center p-4">
        {product.kampanyaliMi && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm z-10">
            FIRSAT
          </span>
        )}
        
        <div className="absolute top-2 right-2 z-10 opacity-0 transition-all group-hover:opacity-100">
          <FavoriButonu urunId={product.id} />
        </div>
        
        {/* Placeholder for product image since we don't have actual images */}
        <div className="w-full h-full bg-white border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 relative">
           <ImageIcon size={32} className="mb-2 opacity-50" />
           <span className="text-xs font-mono text-center max-w-[80%] break-all">{product.ureticiUrunKodu}</span>
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-brand-cyan font-medium mb-1 uppercase tracking-wider">{product.ureticiAd}</span>
        
        <Link href={`/urunler/${product.id}`} className="group-hover:text-brand-navy transition-colors mb-2">
          <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">{product.ureticiUrunKodu}</h3>
        </Link>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">{product.kisaAciklama}</p>
        
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mb-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Stokta {product.toplamStok.toLocaleString("tr-TR")} adet
        </div>
        
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Başlangıç fiyatı</div>
            <div className="font-bold text-brand-navy text-lg">{formatPrice(product.baslangicFiyati, product.paraBirimi)}</div>
          </div>
          
          <button 
            className="bg-brand-cyan hover:bg-opacity-90 text-white rounded-md p-2.5 transition-colors shadow-sm flex-shrink-0" 
            type="button" 
            aria-label="Sepete ekle"
          >
            <ShoppingCart size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
