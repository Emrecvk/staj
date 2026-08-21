import Link from "next/link";
import { getCart } from "@/lib/cart-actions";
import { getCategories } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShoppingCart, ArrowRight, Trash2, Package } from "lucide-react";
import { CartItems } from "./cart-items";

export default async function CartPage() {
  const [categories, cartData] = await Promise.all([
    getCategories(),
    getCart()
  ]);

  // Sahte sepet fallback'i kaldirildi: API dustugunde kullaniciya hayali
  // urunler gostermek yerine bos sepet ekrani cizilir.
  const cart = cartData;

  const isEmpty = !cart || !cart.kalemler || cart.kalemler.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-yuzey">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-marka mb-8 flex items-center gap-3">
          <ShoppingCart size={32} /> Sepetim
        </h1>

        {isEmpty ? (
          <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar p-12 text-center flex flex-col items-center">
            <ShoppingCart size={64} className="text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-metin mb-2">Sepetiniz Boş</h2>
            <p className="text-metin-ucuncul mb-8 max-w-md">Sepetinizde henüz ürün bulunmuyor. Kapsamlı kataloğumuzu inceleyerek hemen alışverişe başlayabilirsiniz.</p>
            <Link href="/urunler" className="bg-vurgu hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-md transition-colors inline-flex items-center gap-2">
              Ürünleri Keşfet <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <CartItems initialCart={cart} />
            </div>
            
            <div className="w-full lg:w-1/3">
              <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar p-6 sticky top-24">
                <h3 className="text-xl font-bold text-metin mb-6 border-b border-kenar pb-4">Sipariş Özeti</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-metin-ikincil">
                    <span>Ara Toplam</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam)}
                    </span>
                  </div>
                  <div className="flex justify-between text-metin-ikincil">
                    <span>KDV (%20)</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam * 0.20)}
                    </span>
                  </div>
                  <div className="flex justify-between text-metin-ikincil">
                    <span>Kargo</span>
                    <span className="font-medium text-basari-600">Ücretsiz</span>
                  </div>
                  <div className="border-t border-kenar pt-4 flex justify-between items-end">
                    <span className="text-lg font-bold text-metin">Genel Toplam</span>
                    <span className="text-2xl font-extrabold text-marka">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam * 1.20)}
                    </span>
                  </div>
                </div>
                
                <Link 
                  href="/odeme" 
                  className="w-full bg-marka hover:bg-opacity-90 text-white font-bold py-4 rounded-md transition-colors flex items-center justify-center gap-2 mb-4 shadow-sm"
                >
                  <Package size={20} /> Siparişi Tamamla
                </Link>
                
                <Link 
                  href="/teklif-iste" 
                  className="w-full bg-yuzey-kart border border-brand-cyan text-vurgu hover:bg-vurgu-zemin font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  Teklif İste
                </Link>
                <p className="text-xs text-metin-ucuncul text-center mt-3">Kurumsal müşteriyseniz sepetinizdeki ürünler için teklif isteyebilirsiniz.</p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <SiteFooter />
    </div>
  );
}
