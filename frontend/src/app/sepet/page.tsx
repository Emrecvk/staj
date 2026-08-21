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

  // If no cart data, show empty state
  // For demonstration, let's mock cart data if null because the backend might not be running
  const cart = cartData || {
    sepetId: 1,
    kalemler: [
      {
        kalemId: 101,
        urunId: 5,
        urunKodu: "1N4148",
        kisaAciklama: "Switching Diode, 100V, 200mA, DO-35",
        urunAmbalajId: 10,
        satistakiKatsayi: 100,
        miktar: 1000,
        birimFiyat: 0.15,
        toplamFiyat: 150.00
      },
      {
        kalemId: 102,
        urunId: 12,
        urunKodu: "LM358",
        kisaAciklama: "Dual Operational Amplifier, SOIC-8",
        urunAmbalajId: 21,
        satistakiKatsayi: 50,
        miktar: 500,
        birimFiyat: 2.50,
        toplamFiyat: 1250.00
      }
    ],
    genelToplam: 1400.00,
    paraBirimi: "TRY"
  };

  const isEmpty = !cart || !cart.kalemler || cart.kalemler.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-brand-navy mb-8 flex items-center gap-3">
          <ShoppingCart size={32} /> Sepetim
        </h1>

        {isEmpty ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
            <ShoppingCart size={64} className="text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
            <p className="text-gray-500 mb-8 max-w-md">Sepetinizde henüz ürün bulunmuyor. Kapsamlı kataloğumuzu inceleyerek hemen alışverişe başlayabilirsiniz.</p>
            <Link href="/urunler" className="bg-brand-cyan hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-md transition-colors inline-flex items-center gap-2">
              Ürünleri Keşfet <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <CartItems initialCart={cart} />
            </div>
            
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Sipariş Özeti</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>KDV (%20)</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam * 0.20)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className="font-medium text-green-600">Ücretsiz</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Genel Toplam</span>
                    <span className="text-2xl font-extrabold text-brand-navy">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam * 1.20)}
                    </span>
                  </div>
                </div>
                
                <Link 
                  href="/odeme" 
                  className="w-full bg-brand-navy hover:bg-opacity-90 text-white font-bold py-4 rounded-md transition-colors flex items-center justify-center gap-2 mb-4 shadow-sm"
                >
                  <Package size={20} /> Siparişi Tamamla
                </Link>
                
                <Link 
                  href="/teklif-iste" 
                  className="w-full bg-white border border-brand-cyan text-brand-cyan hover:bg-cyan-50 font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  Teklif İste
                </Link>
                <p className="text-xs text-gray-500 text-center mt-3">Kurumsal müşteriyseniz sepetinizdeki ürünler için teklif isteyebilirsiniz.</p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <SiteFooter />
    </div>
  );
}
