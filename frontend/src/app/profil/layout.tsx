import { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { User, MapPin, Heart, Building2, Package, FileText, LogOut, Tags } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCategories } from "@/lib/api";
import { logout } from "@/lib/auth";

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const categories = await getCategories();
  
  // Parse user cookie
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  let user = { ad: "Kullanıcı", firmaMi: false, firmaId: null };
  if (userCookie) {
    try { user = JSON.parse(userCookie); } catch (e) {}
  }

  const menuItems = [
    { href: "/profil", icon: User, label: "Hesap Özeti" },
    { href: "/profil/siparisler", icon: Package, label: "Siparişlerim" },
    { href: "/profil/teklifler", icon: FileText, label: "Tekliflerim" },
    { href: "/profil/favoriler", icon: Heart, label: "Favorilerim" },
    { href: "/profil/urun-kodlarim", icon: Tags, label: "Ürün Kodlarım" },
    { href: "/profil/adresler", icon: MapPin, label: "Adreslerim" },
  ];

  if (user.firmaMi) {
    menuItems.push({ href: "/profil/firma", icon: Building2, label: "Firma Bilgilerim" });
  }

  return (
    <div className="flex flex-col min-h-screen bg-yuzey">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar overflow-hidden">
              <div className="p-6 border-b border-kenar bg-marka text-white">
                <div className="font-bold text-lg">{user.ad}</div>
                <div className="text-sm text-cyan-400 mt-1">{user.firmaMi ? "Kurumsal Hesap" : "Bireysel Hesap"}</div>
              </div>
              
              <nav className="flex flex-col p-2">
                {menuItems.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-metin-ikincil hover:bg-yuzey hover:text-vurgu transition-colors"
                  >
                    <item.icon size={18} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
                
                <div className="my-2 border-t border-kenar"></div>
                
                <form action={logout}>
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-hata-600 hover:bg-hata-50 transition-colors">
                    <LogOut size={18} />
                    <span className="font-medium text-sm">Çıkış Yap</span>
                  </button>
                </form>
              </nav>
            </div>
          </aside>
          
          <div className="flex-grow">
            <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar p-6 md:p-8 min-h-[500px]">
              {children}
            </div>
          </div>
          
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
