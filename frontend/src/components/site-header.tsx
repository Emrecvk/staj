import Image from "next/image";
import Link from "next/link";
import { ChevronDown, FileText, Heart, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import type { Category } from "@/lib/api";

export function SiteHeader({ categories }: { categories: Category[] }) {
  return <header>
    <div className="topbar"><div className="container topbar-inner"><div className="topbar-note"><span>Kurumsal elektronik komponent çözümleri</span><span>Hafta içi 08:30–18:00</span></div><div className="topbar-links"><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link><span>TR · USD</span></div></div></div>
    <div className="header-main"><div className="container header-row"><Link className="logo" href="/"><Image src="/logo-cevik-yatay.svg" alt="Çevik Elektronik" width={350} height={120} priority /></Link><form className="header-search" action="/urunler"><input name="aramaMetni" aria-label="Site genelinde ara" placeholder="Ürün kodu veya açıklama ile ara" /><button aria-label="Ara"><Search size={20} /></button></form><nav className="header-actions" aria-label="Kullanıcı işlemleri"><Link className="header-action" href="/favoriler"><Heart /><span>Favoriler</span></Link><Link className="header-action" href="/giris"><UserRound /><span>Hesabım</span></Link><Link className="header-action" href="/sepet"><ShoppingCart /><span>Sepetim</span><b className="cart-count">0</b></Link></nav></div></div>
    <div className="nav-bar"><div className="container nav-inner"><Link href="/urunler" className="all-categories"><Menu size={19} /> Tüm Kategoriler <ChevronDown size={15} /></Link><nav className="nav-links">{categories.slice(0, 4).map((category) => <Link href={`/urunler?kategoriId=${category.id}`} key={category.id}>{category.ad}</Link>)}</nav><Link href="/teklif" className="nav-offer"><FileText size={17} /> Fiyat ve stok talep et</Link></div></div>
  </header>;
}
