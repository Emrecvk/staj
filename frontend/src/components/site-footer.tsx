import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-gray-100 pt-16 pb-8 border-t border-gray-200 mt-auto text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Image 
              src="/logo-cevik-yatay.svg" 
              alt="Çevik Elektronik" 
              width={200} 
              height={70} 
              className="h-12 w-auto mb-6 grayscale opacity-80" 
            />
            <p className="text-gray-600 max-w-sm leading-relaxed">
              Elektronik komponent tedarikinde hız, güven ve teknik uzmanlığı bir araya getiriyoruz. 
              Projeniz için doğru bileşeni en kısa sürede sağlıyoruz.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-brand-navy mb-4 uppercase tracking-wider text-xs">Çevik Elektronik</h3>
            <div className="flex flex-col gap-3">
              <Link href="/hakkimizda" className="text-gray-600 hover:text-brand-cyan transition-colors">Hakkımızda</Link>
              <Link href="/iletisim" className="text-gray-600 hover:text-brand-cyan transition-colors">İletişim</Link>
              <Link href="/blog" className="text-gray-600 hover:text-brand-cyan transition-colors">Teknik içerikler</Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-brand-navy mb-4 uppercase tracking-wider text-xs">Müşteri Hizmetleri</h3>
            <div className="flex flex-col gap-3">
              <Link href="/siparisler" className="text-gray-600 hover:text-brand-cyan transition-colors">Sipariş takibi</Link>
              <Link href="/teslimat" className="text-gray-600 hover:text-brand-cyan transition-colors">Teslimat ve iade</Link>
              <Link href="/sss" className="text-gray-600 hover:text-brand-cyan transition-colors">Sık sorulan sorular</Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-brand-navy mb-4 uppercase tracking-wider text-xs">Kurumsal</h3>
            <div className="flex flex-col gap-3">
              <Link href="/kayit" className="text-gray-600 hover:text-brand-cyan transition-colors">Firma hesabı</Link>
              <Link href="/teklif" className="text-gray-600 hover:text-brand-cyan transition-colors">Teklif talebi</Link>
              <Link href="/sozlesmeler" className="text-gray-600 hover:text-brand-cyan transition-colors">Sözleşmeler</Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <span>© 2026 Çevik Elektronik. Tüm hakları saklıdır.</span>
          <div className="flex items-center gap-4">
            <span>256-bit SSL Güvenli Alışveriş</span>
            <span>|</span>
            <span>%100 Orijinal Ürün</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
