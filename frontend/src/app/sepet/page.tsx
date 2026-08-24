import Link from "next/link";
import { getCart } from "@/lib/cart-actions";
import { getCategories } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShoppingCart } from "lucide-react";
import { CartItems } from "./cart-items";
import type { Sepet } from "@/lib/sepet-tipler";

export default async function CartPage() {
  const [categories, cartData] = await Promise.all([
    getCategories(),
    getCart()
  ]);

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
      
      <main className="flex-grow container mx-auto px-4 py-8" id="icerik">
        {/* Breadcrumb & Başlık */}
        <nav aria-label="Gezinti" className="mb-4 text-xs text-metin-ucuncul flex items-center gap-1.5">
          <Link href="/" className="hover:text-vurgu transition-colors">Ana Sayfa</Link>
          <span>&gt;</span>
          <span className="text-metin font-medium">Alışveriş Sepeti</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-metin-marka mb-6 flex items-center gap-3">
          <ShoppingCart size={28} /> B2B Alışveriş Sepeti & Sipariş
        </h1>

        <CartItems initialCart={cart} />
      </main>
      
      <SiteFooter />
    </div>
  );
}
