import { getCart } from "@/lib/cart-actions";
import { getCategories } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { QuoteRequestForm } from "./quote-form";

export default async function RequestQuotePage() {
  const [categories, cartData] = await Promise.all([
    getCategories(),
    getCart()
  ]);

  // API dusunce sahte sepet uydurmak yok: kullanici hayali bir urun gormemeli.
  // Sepet bos veya erisilemez ise sepet sayfasina donulur.
  const cart = cartData;

  if (!cart || !cart.kalemler || cart.kalemler.length === 0) {
    redirect("/sepet");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <FileText size={28} className="text-brand-navy" />
          <h1 className="text-3xl font-extrabold text-brand-navy">Teklif İste</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <QuoteRequestForm cart={cart} />
          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Teklif Edilecek Ürünler</h3>
              
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar mb-6 pr-2">
                <ul className="divide-y divide-gray-100">
                  {cart.kalemler.map((item) => (
                    <li key={item.kalemId} className="py-3 flex justify-between">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.urunKodu}</p>
                        <p className="text-xs text-gray-500">{item.miktar} adet talep edildi</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-bold mb-1">Teklif Süreci Nasıl İşler?</p>
                <ol className="list-decimal pl-4 space-y-1 mt-2 text-xs">
                  <li>Talebiniz uzman satış temsilcilerimize iletilir.</li>
                  <li>Özel fiyatlandırma çalışması yapılarak teklif oluşturulur.</li>
                  <li>Teklif onayınıza sunulur. Profilinizden teklifi görüntüleyip onaylayabilirsiniz.</li>
                  <li>Onayladığınız teklifler siparişe dönüşür.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
