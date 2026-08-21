import Image from "next/image";
import Link from "next/link";
import { ChevronDown, FileText, Heart, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import type { Category } from "@/lib/api";

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <header className="bg-yuzey-kart border-b border-kenar">
      <div className="bg-yuzey-gomulu text-xs text-metin-ikincil py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
            <span>Kurumsal elektronik komponent çözümleri</span>
            <span className="hidden sm:inline">Hafta içi 08:30–18:00</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/bom" className="font-semibold text-vurgu hover:text-marka transition-colors">BOM Yükle</Link>
            <Link href="/hakkimizda" className="hover:text-vurgu transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-vurgu transition-colors">İletişim</Link>
            <span className="font-semibold text-marka">TR · USD</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo-cevik-yatay.svg" alt="Çevik Elektronik" width={180} height={60} priority className="h-10 w-auto md:h-12" />
        </Link>
        
        <form className="flex-grow max-w-2xl w-full flex items-center border-2 border-brand-navy rounded-md overflow-hidden" action="/urunler">
          <input 
            name="aramaMetni" 
            aria-label="Site genelinde ara" 
            placeholder="Ürün kodu, üretici veya açıklama ile ara..." 
            className="flex-grow px-4 py-2.5 outline-none text-sm"
          />
          <button aria-label="Ara" className="bg-marka text-white px-5 py-3 hover:bg-opacity-90 transition-colors">
            <Search size={20} />
          </button>
        </form>

        <nav className="flex items-center gap-6 text-sm font-medium text-marka shrink-0" aria-label="Kullanıcı işlemleri">
          <Link href="/profil/favoriler" className="flex flex-col items-center gap-1 hover:text-vurgu transition-colors">
            <Heart size={22} />
            <span className="hidden sm:block">Favoriler</span>
          </Link>
          <Link href="/giris" className="flex flex-col items-center gap-1 hover:text-vurgu transition-colors">
            <UserRound size={22} />
            <span className="hidden sm:block">Hesabım</span>
          </Link>
          <Link href="/sepet" className="flex flex-col items-center gap-1 hover:text-vurgu transition-colors relative">
            <div className="relative">
              <ShoppingCart size={22} />
              <b className="absolute -top-2 -right-2 bg-vurgu text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">0</b>
            </div>
            <span className="hidden sm:block">Sepetim</span>
          </Link>
        </nav>
      </div>

      <div className="bg-marka text-white">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/urunler" className="flex items-center gap-2 bg-vurgu text-marka font-bold px-4 py-3 hover:bg-opacity-90 transition-colors">
              <Menu size={19} /> Tüm Kategoriler <ChevronDown size={15} />
            </Link>
            <nav className="hidden md:flex items-center">
              {categories.slice(0, 5).map((category) => (
                <Link 
                  href={`/urunler?kategoriId=${category.id}`} 
                  key={category.id}
                  className="px-4 py-3 text-sm font-medium hover:text-vurgu transition-colors"
                >
                  {category.ad}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/teklif" className="hidden sm:flex items-center gap-2 text-sm font-medium text-vurgu hover:text-white transition-colors py-3">
            <FileText size={17} /> Fiyat ve stok talep et
          </Link>
        </div>
      </div>
    </header>
  );
}
