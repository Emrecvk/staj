import { getCart, createOrder } from "@/lib/cart-actions";
import { getCategories } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CheckoutForm } from "./checkout-form";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default async function CheckoutPage() {
  const [categories, cartData] = await Promise.all([
    getCategories(),
    getCart()
  ]);

  const cart = cartData || {
    sepetId: 1,
    kalemler: [
      {
        kalemId: 101,
        urunId: 5,
        urunKodu: "1N4148",
        kisaAciklama: "Switching Diode, 100V, 200mA, DO-35",
        miktar: 1000,
        birimFiyat: 0.15,
        toplamFiyat: 150.00
      }
    ],
    genelToplam: 150.00,
    paraBirimi: "TRY"
  };

  if (!cart || !cart.kalemler || cart.kalemler.length === 0) {
    redirect("/sepet");
  }

  // Mock addresses - typically fetched from profile API
  const addresses = [
    { id: 1, baslik: "Ev Adresi", sehir: "Ankara", ilce: "Çankaya", acikAdres: "Tepe Prime A Blok Kat 2" },
    { id: 2, baslik: "İş Adresi", sehir: "İstanbul", ilce: "Şişli", acikAdres: "Perpa Ticaret Merkezi B Blok" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck size={28} className="text-green-600" />
          <h1 className="text-3xl font-extrabold text-brand-navy">Güvenli Ödeme</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <CheckoutForm addresses={addresses} cart={cart} />
          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Sipariş Özeti</h3>
              
              <div className="max-h-60 overflow-y-auto custom-scrollbar mb-6 pr-2">
                <ul className="divide-y divide-gray-100">
                  {cart.kalemler.map((item: any) => (
                    <li key={item.kalemId} className="py-3 flex justify-between">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.urunKodu}</p>
                        <p className="text-xs text-gray-500">{item.miktar} adet x {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi, maximumFractionDigits: 4 }).format(item.birimFiyat)}</p>
                      </div>
                      <div className="text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(item.toplamFiyat)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ara Toplam</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>KDV (%20)</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam * 0.20)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Kargo</span>
                  <span className="font-medium text-green-600">Ücretsiz</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-end mt-3">
                  <span className="text-base font-bold text-gray-900">Genel Toplam</span>
                  <span className="text-2xl font-extrabold text-brand-navy">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(cart.genelToplam * 1.20)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
