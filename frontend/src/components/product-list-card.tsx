import Link from "next/link";
import { ShoppingCart, Image as ImageIcon } from "lucide-react";
import { FavoriButonu } from "@/components/favori-karsilastirma-butonlari";
import type { ProductSummary } from "@/lib/api";

function formatPrice(value: number, currency: string) { 
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 4 }).format(value); 
}

export function ProductListCard({ product }: { product: ProductSummary }) {
  return (
    <article className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row">
      <Link href={`/urunler/${product.id}`} className="block relative w-full sm:w-48 aspect-square sm:aspect-auto sm:min-h-full bg-gray-50 flex-shrink-0 flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-gray-100">
        {product.kampanyaliMi && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm z-10">
            FIRSAT
          </span>
        )}
        
        {/* Placeholder for product image since we don't have actual images */}
        <div className="w-full h-full bg-white border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 relative">
           <ImageIcon size={32} className="mb-2 opacity-50" />
           <span className="text-xs font-mono text-center max-w-[80%] break-all">{product.ureticiUrunKodu}</span>
        </div>
      </Link>
      
      <div className="p-4 sm:p-5 flex flex-col flex-grow w-full">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs text-brand-cyan font-bold uppercase tracking-wider">{product.ureticiAd}</span>
          <FavoriButonu urunId={product.id} />
        </div>
        
        <Link href={`/urunler/${product.id}`} className="group-hover:text-brand-navy transition-colors mb-2 inline-block">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{product.ureticiUrunKodu}</h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 max-w-3xl">{product.kisaAciklama}</p>
        
        <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md self-start">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Stokta {product.toplamStok.toLocaleString("tr-TR")} adet
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Başlangıç fiyatı</div>
              <div className="font-extrabold text-brand-navy text-2xl">{formatPrice(product.baslangicFiyati, product.paraBirimi)}</div>
            </div>
            
            <button 
              className="bg-brand-cyan hover:bg-opacity-90 text-white rounded-lg px-4 py-3 font-bold transition-colors shadow-sm flex items-center gap-2 flex-shrink-0" 
              type="button" 
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Sepete Ekle</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
