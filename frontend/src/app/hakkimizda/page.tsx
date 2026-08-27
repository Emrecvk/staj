import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getKatalogOzeti, getPublicPage, getUreticiler } from "@/lib/api";
import { SolutionHero } from "@/components/solution-hero";

export const metadata: Metadata = { title: "Hakkımızda" };

export default async function HakkimizdaPage() {
  const [categories, page, katalogOzeti, ureticiler] = await Promise.all([
    getCategories(),
    getPublicPage("hakkimizda"),
    getKatalogOzeti(),
    getUreticiler(),
  ]);

  const cozumler = [
    ["Elektronik Komponent Distribütörlüğü", "Geniş katalog ve hızlı tedarik altyapısıyla doğru komponenti projenize ulaştırıyoruz.", "/cozumler/elektronik-komponent-distributorlugu", "bg-navy-900", "/elektronik-komponent-distributorlugu-hero.png"],
    ["FAE ve Ar-Ge Desteği", "Mühendislik ekibimizle ürün seçimi, tasarım ve prototipleme süreçlerinde yanınızdayız.", "/cozumler/fae-ve-arge-destegi", "bg-notr-200", "/fae-arge-hero.png"],
    ["Alüminyum Soğutucu Üretimi", "Elektronik sistemleriniz için yüksek performanslı termal yönetim çözümleri geliştiriyoruz.", "/cozumler/sogutucu-uretimi", "bg-navy-500", "/sogutucu-uretimi-hero.png"],
    ["LED Aydınlatma Çözümleri", "LED komponentlerinden özel modül tasarımına kadar ihtiyacınıza uygun çözümler sunuyoruz.", "/cozumler/led-aydinlatma-cozumleri", "bg-navy-700", null],
  ] as const;
  const gucluYanlar = [
    "Geniş Stok Çeşitliliği",
    "Hızlı Tedarik Altyapısı",
    "Teknik Destek & Proje Desteği",
    "Online Sipariş",
    "Üretim Planlaması",
    "Anahtar Teslim Çözümler",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader categories={categories} />
      <main id="icerik" className="flex-1">
        <SolutionHero variant="distributor" eyebrow="Çevik Elektronik" title="Lider Elektronik Komponent Çözüm Ortağı" description="Elektronik komponent tedarikinden teknik desteğe, projelerinizin her aşamasında güvenilir çözüm ortağınız olarak yanınızdayız." />
        <section className="bg-yuzey-gomulu py-14 md:py-20"><div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch"><div className="rounded-token-panel bg-marka p-8 text-white md:p-10"><p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Çevik Elektronik</p><h2 className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">Hakkımızda</h2>{page ? <div className="mt-6 text-base leading-7 text-white/80 [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: page.icerikHtml }} /> : <p className="mt-6 text-base leading-7 text-white/80">Elektronik komponent distribütörlüğü, teknik destek ve proje bazlı tedarik çözümleri sunuyoruz. Amacımız doğru ürünü, doğru zamanda ve doğru teknik yönlendirmeyle müşterilerimizle buluşturmak.</p>}<div className="mt-10 border-t border-white/20 pt-5 text-sm font-semibold text-white/70">Projeleriniz için güvenilir tedarik ve teknik destek</div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{gucluYanlar.map((madde, index) => <div key={madde} className="group rounded-token-kart border border-kenar bg-yuzey-kart p-6 transition-transform duration-300 hover:-translate-y-1"><div className={`flex h-11 w-11 items-center justify-center rounded-full ${index % 2 === 0 ? "bg-vurgu-zemin text-vurgu" : "bg-basari-50 text-basari-600"}`}><CheckCircle2 size={21} /></div><h3 className="mt-7 text-base font-extrabold leading-6 text-metin-marka">{madde}</h3><div className="mt-5 h-1 w-10 rounded-full bg-vurgu/70 transition-all duration-300 group-hover:w-16" /></div>)}</div></div></section>
        <section className="py-14 md:py-20"><div className="mx-auto max-w-6xl px-4 sm:px-6"><h2 className="text-3xl font-extrabold tracking-tight text-metin-marka md:text-4xl">Çözümlerimiz</h2><div className="mt-8 grid gap-8 md:grid-cols-2">{cozumler.map(([baslik, aciklama, href, renk, gorsel]) => <Link key={href} href={href} className="group"><div className={`relative h-44 overflow-hidden rounded-token-kart bg-cover bg-center ${renk}`} style={gorsel ? { backgroundImage: `linear-gradient(90deg, rgba(15,39,64,.76), rgba(15,39,64,.08)), url("${gorsel}")` } : undefined}><div className="absolute -right-8 -top-10 h-44 w-44 rounded-full border-[18px] border-white/10 transition-transform duration-500 group-hover:scale-110" /><div className="absolute bottom-[-52px] left-8 h-36 w-64 rounded-full bg-white/10 blur-2xl" /></div><h3 className="mt-4 text-lg font-bold text-metin-marka">{baslik}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-metin-ikincil">{aciklama}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-vurgu">Daha Fazla Bilgi Edinin <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span></Link>)}</div></div></section>
        <section className="bg-yuzey-gomulu py-14 md:py-20"><div className="mx-auto max-w-6xl px-4 sm:px-6"><h2 className="text-3xl font-extrabold tracking-tight text-metin-marka md:text-4xl">Öne Çıkan Bilgiler</h2><div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-token-panel border border-kenar bg-kenar md:grid-cols-4">{[[katalogOzeti?.toplamUrun?.toLocaleString("tr-TR") ?? "-", "Toplam Ürün"], [katalogOzeti?.kategoriSayisi?.toLocaleString("tr-TR") ?? "-", "Kategori Sayısı"], [ureticiler.length.toLocaleString("tr-TR"), "Üretici Sayısı"], [katalogOzeti?.stoktakiUrun?.toLocaleString("tr-TR") ?? "-", "Stoktaki Ürün"]].map(([deger, etiket]) => <div key={etiket} className="bg-marka p-6 text-white md:p-8"><strong className="block text-2xl font-extrabold md:text-3xl">{deger}</strong><span className="mt-2 block text-sm text-white/80">{etiket}</span></div>)}</div></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
