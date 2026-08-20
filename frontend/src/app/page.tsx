import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, Cpu, Headphones, PackageCheck, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getProducts } from "@/lib/api";

const categoryIcons = [Cpu, Zap, Sparkles, Box];

export default async function Home() {
  const [categories, productResult] = await Promise.all([
    getCategories(),
    getProducts({ sayfaNo: 1, sayfaBoyutu: 8 }),
  ]);

  return (
    <div className="site-shell">
      <SiteHeader categories={categories} />
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><Zap size={15} /> Türkiye&apos;nin hızlı komponent tedarikçisi</div>
              <h1>Doğru komponenti<br /><span>hızla bulun.</span></h1>
              <p>Binlerce elektronik komponent, güçlü parametrik filtreleme ve adet bazlı avantajlı fiyatlarla tek platformda.</p>
              <form className="hero-search" action="/urunler">
                <input name="aramaMetni" aria-label="Ürün ara" placeholder="Ürün kodu, marka veya kategori ara..." />
                <button type="submit">Ürün Ara <ArrowRight size={18} /></button>
              </form>
              <div className="popular-searches"><span>Popüler:</span><Link href="/urunler?aramaMetni=STM32">STM32</Link><Link href="/urunler?aramaMetni=LM358">LM358</Link><Link href="/urunler?aramaMetni=ESP32">ESP32</Link><Link href="/urunler?kategoriId=7">Direnç</Link></div>
            </div>
            <div className="hero-visual" aria-label="Elektronik komponent vitrini">
              <div className="circuit-lines" />
              <div className="hero-chip">
                <span className="chip-brand">ÇEVİK</span><strong>CVK32</strong><small>INDUSTRIAL MCU</small>
                {Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--pin": index } as React.CSSProperties} />)}
              </div>
              <div className="stock-card"><PackageCheck size={20} /><span><b>Stoktan teslim</b><small>Aynı gün kargo</small></span></div>
              <div className="quality-card"><BadgeCheck size={20} /><span><b>%100 Orijinal</b><small>Yetkili tedarik</small></span></div>
              <div className="hero-stat"><strong>4.992+</strong><span>Aktif ürün</span></div>
            </div>
          </div>
        </section>
        <section className="trust-strip"><div className="container trust-grid">
          <div><PackageCheck /><span><b>Hızlı Teslimat</b><small>Stoktan aynı gün çıkış</small></span></div>
          <div><ShieldCheck /><span><b>Güvenli Alışveriş</b><small>Korunan ödeme altyapısı</small></span></div>
          <div><BadgeCheck /><span><b>Orijinal Ürün</b><small>İzlenebilir tedarik zinciri</small></span></div>
          <div><Headphones /><span><b>Teknik Destek</b><small>Uzman ekibimiz yanınızda</small></span></div>
        </div></section>
        <section className="section categories-section"><div className="container">
          <div className="section-heading"><div><span className="section-kicker">ÜRÜN GRUPLARI</span><h2>Kategorileri keşfedin</h2></div><Link href="/urunler">Tüm ürünleri görüntüle <ArrowRight size={17} /></Link></div>
          <div className="category-grid">{categories.slice(0, 4).map((category, index) => {
            const Icon = categoryIcons[index] ?? Cpu;
            return <Link className="category-card" href={`/urunler?kategoriId=${category.id}`} key={category.id}><div className="category-icon"><Icon size={30} strokeWidth={1.7} /></div><div><h3>{category.ad}</h3><p>{category.altKategoriler.map((item) => item.ad).slice(0, 3).join(" · ")}</p><span>{category.altKategoriler.length} alt kategori <ArrowRight size={15} /></span></div></Link>;
          })}</div>
        </div></section>
        <section className="section products-section"><div className="container">
          <div className="section-heading"><div><span className="section-kicker">ÖNE ÇIKANLAR</span><h2>Popüler ürünler</h2></div><Link href="/urunler">Tüm ürünler <ArrowRight size={17} /></Link></div>
          {productResult.urunler.kayitlar.length > 0 ? <div className="product-grid">{productResult.urunler.kayitlar.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-panel">Ürünler şu anda yüklenemedi.</div>}
        </div></section>
        <section className="container b2b-banner"><div><span className="section-kicker light">KURUMSAL ÇÖZÜMLER</span><h2>Firmanıza özel fiyatlar ve teklif yönetimi</h2><p>Toplu alımlarda özel fiyat alın, tekliflerinizi tek panelden takip edin.</p></div><Link href="/kayit">Firma hesabı oluştur <ArrowRight size={18} /></Link></section>
      </main>
      <SiteFooter />
    </div>
  );
}
