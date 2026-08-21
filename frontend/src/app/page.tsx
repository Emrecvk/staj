import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, Cpu, Headphones, PackageCheck, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getProducts } from "@/lib/api";

const categoryIcons = [Cpu, Zap, Sparkles, Box, ShieldCheck, BadgeCheck];

export default async function Home() {
  const [categories, productResult] = await Promise.all([
    getCategories(),
    getProducts({ sayfaNo: 1, sayfaBoyutu: 8 }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-brand-navy text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-cyan to-transparent"></div>
          
          <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="flex flex-col items-start space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 text-brand-cyan px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                <Zap size={16} /> Türkiye&apos;nin hızlı komponent tedarikçisi
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Doğru komponenti <br />
                <span className="text-brand-cyan">hızla bulun.</span>
              </h1>
              
              <p className="text-lg text-gray-300 max-w-xl">
                Binlerce elektronik komponent, güçlü parametrik filtreleme ve adet bazlı avantajlı fiyatlarla tek platformda.
              </p>
              
              <form className="w-full max-w-lg flex flex-col sm:flex-row gap-2 mt-4" action="/urunler">
                <input 
                  name="aramaMetni" 
                  aria-label="Ürün ara" 
                  placeholder="Ürün kodu, marka veya kategori ara..." 
                  className="flex-grow px-5 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
                <button 
                  type="submit"
                  className="bg-brand-cyan hover:bg-opacity-90 text-white font-bold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Ürün Ara <ArrowRight size={18} />
                </button>
              </form>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
                <span>Popüler:</span>
                <Link href="/urunler?aramaMetni=STM32" className="hover:text-brand-cyan border-b border-dashed border-gray-600">STM32</Link>
                <Link href="/urunler?aramaMetni=LM358" className="hover:text-brand-cyan border-b border-dashed border-gray-600">LM358</Link>
                <Link href="/urunler?aramaMetni=ESP32" className="hover:text-brand-cyan border-b border-dashed border-gray-600">ESP32</Link>
                <Link href="/urunler?kategoriId=7" className="hover:text-brand-cyan border-b border-dashed border-gray-600">Direnç</Link>
              </div>
            </div>
            
            <div className="hidden md:flex justify-center items-center relative h-full">
              {/* Abstract Hero Visual */}
              <div className="relative w-72 h-72 bg-gradient-to-br from-brand-cyan/20 to-brand-navy/50 rounded-2xl border border-brand-cyan/30 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                <div className="w-48 h-48 bg-gray-900 rounded-lg border-2 border-gray-700 shadow-inner flex flex-col items-center justify-center relative">
                   <div className="absolute top-4 left-4 text-xs font-mono text-gray-500 tracking-widest">ÇEVİK</div>
                   <div className="text-3xl font-black text-white font-mono tracking-tighter">CVK32</div>
                   <div className="text-xs text-brand-cyan mt-1">INDUSTRIAL MCU</div>
                   
                   {/* Pins */}
                   <div className="absolute -left-2 top-4 bottom-4 flex flex-col justify-between">
                     {[...Array(4)].map((_, i) => <div key={`l-${i}`} className="w-2 h-4 bg-gray-400 rounded-l-sm" />)}
                   </div>
                   <div className="absolute -right-2 top-4 bottom-4 flex flex-col justify-between">
                     {[...Array(4)].map((_, i) => <div key={`r-${i}`} className="w-2 h-4 bg-gray-400 rounded-r-sm" />)}
                   </div>
                </div>
                
                {/* Floating Badges */}
                <div className="absolute -bottom-6 -left-10 bg-white text-gray-900 p-3 rounded-lg shadow-xl flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-md text-green-600"><PackageCheck size={20} /></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">Stoktan teslim</span>
                    <span className="text-xs text-gray-500">Aynı gün kargo</span>
                  </div>
                </div>
                
                <div className="absolute -top-6 -right-6 bg-white text-gray-900 p-3 rounded-lg shadow-xl flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-md text-blue-600"><BadgeCheck size={20} /></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">%100 Orijinal</span>
                    <span className="text-xs text-gray-500">Yetkili tedarik</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="bg-white border-b border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: PackageCheck, title: "Hızlı Teslimat", desc: "Stoktan aynı gün çıkış" },
                { icon: ShieldCheck, title: "Güvenli Alışveriş", desc: "Korunan ödeme altyapısı" },
                { icon: BadgeCheck, title: "Orijinal Ürün", desc: "İzlenebilir tedarik zinciri" },
                { icon: Headphones, title: "Teknik Destek", desc: "Uzman ekibimiz yanınızda" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-brand-cyan"><item.icon size={36} strokeWidth={1.5} /></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-brand-navy">{item.title}</span>
                    <span className="text-xs text-gray-500 hidden sm:block">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-brand-cyan font-bold text-sm tracking-wider uppercase mb-2 block">ÜRÜN GRUPLARI</span>
              <h2 className="text-3xl font-extrabold text-brand-navy">Kategorileri keşfedin</h2>
            </div>
            <Link href="/urunler" className="inline-flex items-center gap-2 text-brand-navy font-semibold hover:text-brand-cyan transition-colors">
              Tüm ürünleri görüntüle <ArrowRight size={17} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length] ?? Cpu;
              return (
                <Link 
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 flex flex-col h-full" 
                  href={`/urunler?kategoriId=${category.id}`} 
                  key={category.id}
                >
                  <div className="bg-gray-50 w-16 h-16 rounded-lg flex items-center justify-center text-brand-cyan mb-6 group-hover:scale-110 group-hover:bg-brand-cyan group-hover:text-white transition-all">
                    <Icon size={30} strokeWidth={1.7} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{category.ad}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-grow">
                    {category.altKategoriler?.map((item) => item.ad).slice(0, 3).join(" · ")}
                    {(!category.altKategoriler || category.altKategoriler.length === 0) && "Tüm ürünler"}
                  </p>
                  <span className="text-sm font-semibold text-brand-navy flex items-center gap-2 group-hover:text-brand-cyan transition-colors">
                    {category.altKategoriler?.length || 0} alt kategori <ArrowRight size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-white border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-brand-cyan font-bold text-sm tracking-wider uppercase mb-2 block">ÖNE ÇIKANLAR</span>
                <h2 className="text-3xl font-extrabold text-brand-navy">Popüler ürünler</h2>
              </div>
              <Link href="/urunler" className="inline-flex items-center gap-2 text-brand-navy font-semibold hover:text-brand-cyan transition-colors">
                Tüm ürünler <ArrowRight size={17} />
              </Link>
            </div>
            
            {productResult?.urunler?.kayitlar?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {productResult.urunler.kayitlar.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <Box size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">Ürünler Yüklenemedi</h3>
                <p className="text-gray-500 max-w-md">Şu anda API bağlantısı kurulamadığı için ürünler gösterilemiyor. Lütfen daha sonra tekrar deneyin.</p>
              </div>
            )}
          </div>
        </section>

        {/* B2B Banner */}
        <section className="py-16 container mx-auto px-4">
          <div className="bg-brand-cyan rounded-2xl overflow-hidden relative shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-navy opacity-10 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-white max-w-2xl">
                <span className="font-bold text-sm tracking-wider uppercase mb-3 block text-brand-navy">KURUMSAL ÇÖZÜMLER</span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Firmanıza özel fiyatlar ve teklif yönetimi</h2>
                <p className="text-lg opacity-90 text-white">Toplu alımlarda özel fiyat alın, geçmiş siparişlerinizi ve tekliflerinizi tek panelden yönetin.</p>
              </div>
              <Link 
                href="/kayit" 
                className="bg-brand-navy hover:bg-white hover:text-brand-navy text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                Firma hesabı oluştur <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}
