import { getCart } from "@/lib/cart-actions";
import { getCategories } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="flex flex-col min-h-screen bg-yuzey">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow container mx-auto px-4 py-8" id="icerik">
        {/* Breadcrumb & Başlık */}
        <nav aria-label="Gezinti" className="mb-4 text-xs text-metin-ucuncul flex items-center gap-1.5">
          <Link href="/" className="hover:text-vurgu transition-colors">Ana Sayfa</Link>
          <span>&gt;</span>
          <Link href="/sepet" className="hover:text-vurgu transition-colors">Sepet</Link>
          <span>&gt;</span>
          <span className="text-metin font-medium">Resmi Teklif Talebi</span>
        </nav>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vurgu-zemin text-vurgu">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-metin-marka">Resmi Teklif Talebi (RFQ)</h1>
            <p className="text-xs sm:text-sm text-metin-ikincil mt-0.5">
              Sepetinizdeki ürünler için proje bazlı hedef birim fiyat ve talep termin süresi belirleyin.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <QuoteRequestForm cart={cart} />
          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-yuzey-kart rounded-[var(--radius-kart)] shadow-sm border border-kenar p-6 sticky top-24">
              <h3 className="text-lg font-bold text-metin-marka mb-4 border-b border-kenar pb-3 flex items-center justify-between">
                <span>Teklif Edilecek Kalemler</span>
                <span className="text-xs font-mono text-metin-ucuncul">({cart.kalemler.length})</span>
              </h3>
              
              <div className="max-h-[380px] overflow-y-auto mb-6 pr-1 divide-y divide-kenar">
                {cart.kalemler.map((item) => (
                  <div key={item.kalemId} className="py-3 flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-bold text-metin-marka truncate">{item.urunKodu}</p>
                      <p className="text-[11px] text-metin-ucuncul font-mono mt-0.5">
                        {item.miktar.toLocaleString("tr-TR")} adet talep edildi
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-vurgu-zemin/60 border border-vurgu/20 p-4 rounded-[var(--radius-girdi)] text-xs text-metin">
                <p className="font-bold text-metin-marka mb-1">Teklif Süreci Nasıl İşler?</p>
                <ol className="list-decimal pl-4 space-y-1 mt-2 text-metin-ikincil">
                  <li>Talebiniz kurumsal satış temsilcimize iletilir.</li>
                  <li>Özel hacim iskontosu çalışılarak teklif oluşturulur.</li>
                  <li>Teklif onayınıza sunulur; profilinizden inceleyebilirsiniz.</li>
                  <li>Onayladığınız teklifler anında siparişe dönüşür.</li>
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
