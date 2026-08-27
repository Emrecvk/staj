import Link from "next/link";
import { cookies } from "next/headers";
import { getCart } from "@/lib/cart-actions";
import { getCategories } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChevronRight, PackageCheck } from "lucide-react";
import { CartItems } from "./cart-items";
import type { Sepet } from "@/lib/sepet-tipler";

export default async function CartPage() {
  const [categories, cartData, cookieStore] = await Promise.all([
    getCategories(),
    getCart(),
    cookies(),
  ]);
  const girisYapildiMi = Boolean(cookieStore.get("accessToken")?.value);

  const cart: Sepet = cartData || {
    sepetId: 0,
    oturumAnahtari: null,
    kalemler: [],
    genelToplam: 0,
    paraBirimi: "USD",
  };

  return (
    <div className="flex flex-col min-h-screen bg-yuzey">
      <SiteHeader categories={categories} />
      
      <main className="mx-auto w-full max-w-[1440px] flex-grow px-4 py-6 sm:px-6 lg:px-8" id="icerik">
        <nav aria-label="Gezinti" className="mb-5 flex items-center gap-1.5 text-sm text-metin-ikincil">
          <Link href="/" className="hover:text-vurgu transition-colors">Ana Sayfa</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="font-semibold text-metin">Alışveriş Sepeti</span>
        </nav>

        <section className="relative mb-8 min-h-28 overflow-hidden rounded-token-panel bg-marka px-6 py-6 text-dolgu-uzeri sm:px-10" aria-label="Kargo kampanyası">
          <div className="absolute inset-y-0 right-0 w-2/5 bg-[linear-gradient(135deg,transparent_10%,rgba(0,180,216,0.14)_10%,rgba(0,180,216,0.14)_50%,transparent_50%)] bg-[length:26px_26px]" aria-hidden="true" />
          <PackageCheck className="absolute right-8 top-1/2 hidden -translate-y-1/2 text-cyan-300/80 sm:block" size={72} strokeWidth={1.4} aria-hidden="true" />
          <div className="relative z-10 max-w-xl">
            <p className="text-2xl font-bold leading-tight tracking-[-0.025em] sm:text-3xl">1.500 TL ve üzeri siparişlerde kargo ücretsiz</p>
            <p className="mt-2 text-xs text-white/65">Kargo avantajı uygun siparişlerde ödeme adımında otomatik uygulanır.</p>
          </div>
        </section>

        <h1 className="mb-5 text-3xl font-bold tracking-[-0.03em] text-metin-marka">Alışveriş Sepeti</h1>

        <ol className="mb-8 grid grid-cols-4 gap-1 rounded-token-panel border border-kenar bg-yuzey-kart p-2 sm:gap-3" aria-label="Sipariş adımları">
          {["Sepetim", "Fatura ve Gönderim", "Teslimat Yöntemi", "Ödeme Yöntemi"].map((adim, index) => (
            <li key={adim} aria-current={index === 0 ? "step" : undefined} className={`flex min-h-11 items-center justify-center rounded-token-girdi px-2 text-center text-[11px] font-semibold sm:text-sm ${index === 0 ? "bg-marka text-dolgu-uzeri" : "text-metin-ucuncul"}`}>
              {adim}
            </li>
          ))}
        </ol>

        <CartItems initialCart={cart} girisYapildiMi={girisYapildiMi} />
      </main>
      
      <SiteFooter />
    </div>
  );
}
