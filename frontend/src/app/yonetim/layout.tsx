import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, Building2, ShoppingCart, FileText, Settings, LogOut, Grid } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const menuItems = [
    { href: "/yonetim", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/yonetim/urunler", icon: Package, label: "Ürün Yönetimi" },
    { href: "/yonetim/kategoriler", icon: Grid, label: "Kategori & Tanımlar" },
    { href: "/yonetim/firmalar", icon: Building2, label: "Firma Başvuruları" },
    { href: "/yonetim/siparisler", icon: ShoppingCart, label: "Siparişler" },
    { href: "/yonetim/teklifler", icon: FileText, label: "Teklif Yönetimi" },
    { href: "/yonetim/icerikler", icon: Settings, label: "İçerik & Blog" },
  ];

  return (
    <div className="min-h-screen bg-yuzey-gomulu flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-marka text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl tracking-wider flex items-center gap-2">
             <span className="text-vurgu">ÇEVİK</span> ADMIN
          </Link>
        </div>
        
        <nav className="flex-grow py-4 px-2 space-y-1">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-metin-ucuncul hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <Link href="/profil" className="flex items-center gap-3 text-metin-ucuncul hover:text-white transition-colors text-sm font-medium">
            <LogOut size={18} />
            <span>Panele Veda Et</span>
          </Link>
        </div>
      </aside>
      
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="bg-yuzey-kart border-b border-kenar p-4 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-lg font-bold text-metin">Yönetim Paneli</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-vurgu text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>
        
        <div className="p-6 overflow-auto flex-grow">
          {children}
        </div>
      </main>
    </div>
  );
}
