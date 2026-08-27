import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Boxes, CheckCircle2, Factory, HandCoins, Layers3, Lightbulb, Package, Settings2, Snowflake, Thermometer, Truck, Wrench } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getKatalogOzeti, getPublicPage, getUreticiler, type Category } from "@/lib/api";
import { PcbTeklifFormu } from "./pcb-teklif-formu";
import { SolutionHero } from "@/components/solution-hero";

type CozumVerisi = {
  baslik: string;
  ozet: string;
  etiket: string;
  ikon: "factory" | "wrench" | "layers" | "snowflake" | "lightbulb" | "settings";
  istatistikler?: [string, string][];
  kartlar: [string, string][];
  adimlar?: string[];
  alanlar?: string[];
  cta?: string;
};

const COZUMLER: Record<string, CozumVerisi> = {
  "elektronik-komponent-distributorlugu": {
    baslik: "Elektronik Komponent Distribütörlüğü",
    etiket: "Tedarik ve dağıtım",
    ikon: "factory",
    ozet: "Dünyanın önde gelen üreticilerinden elektronik komponentleri, gerçek stok görünürlüğü ve kurumsal tedarik desteğiyle sunuyoruz.",
    istatistikler: [["1M+", "Ürün seçeneği"], ["130+", "Yetkili iş ortağı"], ["Aynı gün", "Stoktan sevkiyat"], ["2000+", "Marka ağı"]],
    kartlar: [["Global marka ağı", "Yetkili üretici ve güçlü tedarikçi ağımızla doğru parçaya hızlıca ulaşın."], ["Gerçek stok görünürlüğü", "Ürün, ambalaj, fiyat ve teslimat bilgilerini proje planınıza göre değerlendirin."], ["Kurumsal tedarik", "Tekrarlı siparişler, proje bazlı ihtiyaçlar ve alternatif ürün analizleri için tek temas noktası."], ["Teknik ekip desteği", "MPN, paket, RoHS ve muadil kontrollerinde uzman ekibimizle ilerleyin."]],
  },
  "fae-ve-arge-destegi": {
    baslik: "FAE ve Ar-Ge Desteği", etiket: "Mühendislik desteği", ikon: "wrench",
    ozet: "FAE ve Ar-Ge ekiplerimiz, projenizin her aşamasında doğru komponenti seçmenize ve tasarım risklerini azaltmanıza yardımcı olur.",
    kartlar: [["Teknolojik ürün önerisi", "İhtiyacınıza, elektriksel gereksinimlerinize ve hedef maliyetinize uygun parça seçimi."], ["Workshop", "Üretici teknolojileri ve ürün aileleri üzerine uygulamalı teknik oturumlar."], ["Hata ayıklama", "Projelerdeki olası donanım ve yazılım kaynaklı sorunların birlikte incelenmesi."], ["Design-in süreçleri", "Devre tasarımı, prototip testi ve üretime geçiş için teknik koordinasyon."], ["Hardware & software desteği", "Donanım ve yazılım entegrasyonunda örnek devre ve uygulama desteği."], ["Örnek kod paylaşımı", "Geliştiricilerin süreci hızlandırması için uygulama notları ve kod blokları."]],
    cta: "Teknik destek talebi oluştur",
  },
  "pcb-tedarigi": {
    baslik: "Üstün PCB Çözüm Sağlayıcınız!", etiket: "PCB ve stencil", ikon: "layers",
    ozet: "Prototipten seri üretime PCB ve stencil ihtiyaçlarınız için hızlı teklif, teknik koordinasyon ve güvenilir teslimat süreci.",
    kartlar: [["Sürekli iyileştirme", "Üretim süreçlerini ve tasarım geri bildirimlerini her projede geliştiriyoruz."], ["Kalite ve hassasiyet", "Endüstri standartlarına uygun, kontrol edilebilir ve tekrarlanabilir üretim."], ["Teknik uzmanlık", "Katman, kalınlık, yüzey ve üretilebilirlik kararlarında teknik destek."], ["Hızlı teslimat", "Proje takvimine uygun, planlı ve şeffaf teslimat koordinasyonu."], ["Uyumluluk", "İhtiyaca uygun üretim ve dokümantasyon seçenekleri."], ["Rekabetçi fiyat", "Miktar ve proje kapsamına göre optimize edilmiş tekliflendirme."]],
    adimlar: ["İhtiyaçların toplanması", "Teklifin hazırlanması", "Teklifin gönderilmesi"], cta: "PCB teklifi al",
  },
  "pcb-a-uretimi": {
    baslik: "PCB-A Üretimi", etiket: "Dizgi ve montaj", ikon: "layers",
    ozet: "Elektronik kart dizgi, komponent tedariki ve üretim koordinasyonunu tek bir proje akışında birleştirin.",
    kartlar: [["SMT ve THT dizgi", "Prototip ve seri üretim için kontrollü kart montajı."], ["BOM eşleştirme", "Komponent listenizi stok, muadil ve teslimat seçenekleriyle değerlendirin."], ["Üretim koordinasyonu", "Tedarik, dizgi ve kalite adımlarını proje takviminize göre yönetin."], ["Test ve raporlama", "Üretim sonrası kontroller ve proje çıktıları için izlenebilir süreç."]],
    cta: "PCB-A projesi başlat",
  },
  "sogutucu-uretimi": {
    baslik: "Alüminyum Soğutucu Üretimi", etiket: "Termal çözümler", ikon: "snowflake",
    ozet: "Elektronik sektörüne yönelik yüksek ısıl performanslı alüminyum soğutucu çözümlerini keşfedin.",
    kartlar: [["Skiving teknolojisi", "Daha ince kanatlar ve daha yüksek yüzey alanıyla termal performansı artıran üretim."], ["İhtiyaca özel tasarım", "Ürününüzün güç, boyut ve mekanik gereksinimlerine göre çözüm geliştirme."], ["Kalite kontrol", "Ölçüsel uygunluk ve termal gereksinimlerin üretim boyunca takip edilmesi."], ["Talep bazlı üretim", "Prototipten seri üretime uzanan esnek proje planlaması."]],
    alanlar: ["UPS", "Kaynak makineleri", "İnvertörler", "Aydınlatma", "Regülatörler", "Medikal", "Otomotiv", "Tüketici elektroniği", "Redresörler"], cta: "Talep oluştur",
  },
  "led-aydinlatma-cozumleri": {
    baslik: "LED Aydınlatma Çözümleri", etiket: "Aydınlatma ve elektronik", ikon: "lightbulb",
    ozet: "Yenilikçi LED komponent, modül ve montaj çözümleriyle ihtiyacınıza uygun aydınlatma sistemini birlikte geliştirelim.",
    kartlar: [["Özel LED modül tasarımı", "Farklı güç, renk ve form ihtiyaçlarına göre özel modül geliştirme."], ["Soğutucu çözümleri", "Uzun ömürlü armatürler için yüksek performanslı termal tasarım."], ["Elektronik kart dizgi", "SMT ve THT hatlarında kapsamlı LED kart üretim desteği."], ["Kablolu konnektörler", "Özel kablo boyu ve bağlantı tipi seçenekleri."], ["Optik tasarım", "Işık dağılımı ve verimliliği için uygulamaya uygun optik yaklaşım."]],
    cta: "Aydınlatma projesi oluştur",
  },
  "otomasyon-cozumleri": {
    baslik: "Otomasyon Çözümleri", etiket: "Endüstriyel otomasyon", ikon: "settings",
    ozet: "Fabrika, makine ve proses otomasyonu için PLC, HMI, sürücü, motor ve saha desteğini doğru ürünlerle buluşturuyoruz.",
    kartlar: [["PLC çözümleri", "Güvenilir proses kontrolü ve haberleşme altyapısı."], ["HMI paneller", "Uzaktan kontrol, izleme ve makro özellikli ekran çözümleri."], ["AC sürücüler", "Pompa, fan ve motorlarda hız ve enerji kontrolü."], ["Servo sistemler", "Robotik, CNC ve paketleme uygulamaları için hassas hareket kontrolü."], ["Teknik danışmanlık", "Uygulama gereksinimlerine göre ürün ve sistem eşleştirme."], ["Teknik servis", "Arıza ve devreye alma süreçlerinde hızlı saha desteği."]],
    alanlar: ["CNC sistemleri", "Pres makineleri", "Enjeksiyon kalıplama", "Otomatik ambalajlama", "Ağırlık kontrolü", "Etiketleme sistemleri", "Pompa kontrolü", "Enerji yönetimi", "SCADA entegrasyonu"], cta: "Otomasyon talebi oluştur",
  },
  "fae-ar-ge": { baslik: "FAE ve Ar-Ge Desteği", etiket: "Mühendislik desteği", ikon: "wrench", ozet: "Projenizin teknik gereksinimlerini doğru komponent ve tedarik seçenekleriyle buluşturun.", kartlar: [["MPN ve muadil analizi", "Doğru ürün ve alternatifleri birlikte değerlendirin."], ["Tasarım desteği", "Prototipten seri üretime teknik yol haritası oluşturun."], ["Tedarik planlama", "Stok, teslimat ve maliyet dengesini kurun."]] },
  "pcb-tedarik-montaj": { baslik: "PCB Tedarik ve Montaj", etiket: "PCB ve dizgi", ikon: "layers", ozet: "Prototipten seri üretime uzanan PCB tedarik ve montaj ihtiyaçlarınızı tek kanaldan yönetin.", kartlar: [["BOM eşleştirme", "Listenizi gerçek stok ve muadil seçenekleriyle kontrol edin."], ["Üretim planı", "Proje miktarına ve teslimat tarihinize uygun planlama."], ["Kalite takibi", "Üretim adımlarında izlenebilir kontrol süreci."]] },
  otomasyon: { baslik: "Otomasyon Uygulamaları", etiket: "Endüstriyel otomasyon", ikon: "settings", ozet: "Kontrol, güç, sensör ve bağlantı komponentlerini uygulamanıza uygun şekilde tedarik edin.", kartlar: [["Kontrol komponentleri", "PLC, HMI ve haberleşme ürünleri."], ["Güç ve sürücü", "Motor, pompa ve proses kontrolü için çözümler."], ["Uygulama desteği", "Tekrarlı tedarik ve proje bazlı kurumsal fiyatlandırma."]] },
};

function Ikon({ tip }: { tip: CozumVerisi["ikon"] }) {
  const Icon = { factory: Factory, wrench: Wrench, layers: Layers3, snowflake: Snowflake, lightbulb: Lightbulb, settings: Settings2 }[tip];
  return <Icon size={25} />;
}

function kategoriAgaciniDuzlestir(kategoriler: Category[]): Category[] {
  return kategoriler.flatMap((kategori) => [kategori, ...kategoriAgaciniDuzlestir(kategori.altKategoriler ?? [])]);
}

async function ElektronikKomponentSayfasi({ kategoriler }: { kategoriler: Category[] }) {
  const [ozet, ureticiler] = await Promise.all([getKatalogOzeti(), getUreticiler()]);
  const tumKategoriler = kategoriAgaciniDuzlestir(kategoriler);
  const istatistikler = [
    [Package, ozet?.toplamUrun ? `${ozet.toplamUrun.toLocaleString("tr-TR")}+` : "-", "Ürün Sayısı"],
    [Boxes, `${tumKategoriler.length}+`, "Kategori Sayısı"],
    [Truck, ozet?.stoktakiUrun ? ozet.stoktakiUrun.toLocaleString("tr-TR") : "-", "Stoktan Teslim Ürün"],
    [BadgeCheck, `${ureticiler.filter((uretici) => uretici.yetkiliDistributorMu).length}+`, "Yetkili Marka"],
    [HandCoins, `${ureticiler.length}+`, "Sunulan Marka"],
  ] as const;

  return (
    <>
      <SolutionHero variant="distributor" eyebrow="Global tedarik ve dağıtım" title="Elektronik Komponent Distribütörlüğü" description="Geniş marka ağımız ve gerçek stok görünürlüğümüzle projeniz için doğru elektronik komponentleri hızlıca bulun." />
      <section className="bg-yuzey-kart py-14 md:py-20" aria-labelledby="one-cikan-bilgiler">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="one-cikan-bilgiler" className="text-4xl font-extrabold tracking-tight text-metin-marka md:text-5xl">Öne Çıkan Bilgiler</h2>
          <div className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {istatistikler.map(([Icon, deger, baslik]) => <div key={baslik}><div className="flex h-16 w-16 items-center justify-center rounded-full bg-vurgu-zemin text-vurgu"><Icon size={28} strokeWidth={1.7} /></div><p className="mt-5 text-base text-metin">{baslik}</p><strong className="mt-5 block text-2xl font-extrabold text-metin-marka md:text-3xl">{deger}</strong></div>)}
          </div>
        </div>
      </section>
      <section className="bg-yuzey-kart pb-16 md:pb-24" aria-labelledby="komponent-kategorileri">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="komponent-kategorileri" className="text-3xl font-extrabold tracking-tight text-metin-marka md:text-4xl">Elektronik Komponent Kategorileri</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {tumKategoriler.map((kategori) => <Link key={kategori.id} href={`/urunler?kategoriId=${kategori.id}`} className="group block"><div className="flex h-32 items-center justify-center rounded-lg bg-yuzey-gomulu text-vurgu transition-colors group-hover:bg-vurgu-zemin"><Boxes size={54} strokeWidth={1.2} /></div><h3 className="mt-3 text-sm font-semibold text-metin-marka group-hover:text-vurgu">{kategori.ad}</h3></Link>)}
          </div>
        </div>
      </section>
    </>
  );
}

function FaeArgeSayfasi() {
  const cozumler = [
    ["Teknolojik Ürün Önerisi", "İhtiyacınıza, tasarım gereksinimlerinize ve hedef maliyetinize uygun parça seçimi."],
    ["Workshop", "Üretici teknolojileri ve ürün aileleri üzerine uygulamalı teknik oturumlar."],
    ["Hardware & Software Desteği", "Donanım ve yazılım entegrasyonunda teknik yönlendirme ve uygulama desteği."],
    ["Örnek Kod Paylaşma", "Geliştiricilerin süreci hızlandırması için uygulama notları ve örnek kod blokları."],
    ["Hata Ayıklama", "Projelerdeki olası donanım ve yazılım kaynaklı sorunların birlikte incelenmesi."],
    ["Elektronik Design-in Süreçleri", "Devre tasarımı, prototip testi ve üretime geçiş için teknik koordinasyon."],
    ["Test & Raporlama", "Prototip testlerini gerçekleştirip sonuçları anlaşılır ve izlenebilir raporlara dönüştürme."],
    ["Dokümantasyon ve Teknik Destek", "İn-design süreçleri için gerekli dokümanları ve uzman desteğini sağlama."],
  ];
  return (
    <div className="bg-yuzey-kart">
      <SolutionHero variant="fae" eyebrow="Mühendislik ve teknik destek" title="FAE ve Ar-Ge Desteği" description="FAE ve Ar-Ge ekiplerindeki mühendislerimiz, istediğiniz zaman projelerinize teknik destek vererek doğru parçaları seçmenize yardımcı olur." />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24"><div className="text-lg leading-9 text-metin-ikincil"><p>Saha Uygulama Mühendisliği ekibimiz, müşterilerimizin projeleri için ihtiyaç duydukları en uygun çözümleri sunmayı amaçlar.</p><p className="mt-8">Doğru ürün ve teknolojiler ile ilgili workshoplar düzenleyerek tasarım aşamalarında hardware ve software desteği sağlar. Gerektiğinde örnek kodları paylaşır, olası hataları derinlemesine inceler ve hata ayıklama işlemlerini gerçekleştirir.</p><p className="mt-8">Tasarımınızın her aşamasında teknik ekibimizle birlikte ilerleyerek yeni ürünlere daha kısa sürede adapte olabilirsiniz.</p></div><div className="flex min-h-[360px] items-center justify-center rounded-token-panel bg-yuzey-gomulu p-10"><div className="relative h-52 w-72 rounded-xl border-8 border-navy-500 bg-navy-100 shadow-xl"><div className="absolute left-8 top-8 h-4 w-32 rounded bg-navy-500" /><div className="absolute left-8 top-20 h-4 w-48 rounded bg-navy-300" /><div className="absolute bottom-7 left-8 h-10 w-10 rounded-full bg-navy-900" /><div className="absolute bottom-7 left-24 h-10 w-10 rounded-full bg-cyan-400" /></div></div></section>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-4 sm:px-6 md:grid-cols-2 md:items-center md:py-12"><div className="order-2 flex min-h-[360px] items-center justify-center rounded-token-panel bg-navy-100 p-10 md:order-1"><div className="relative h-56 w-72 rounded-lg bg-navy-950 p-6 shadow-xl"><div className="grid grid-cols-5 gap-3 opacity-80">{Array.from({ length: 25 }).map((_, index) => <span key={index} className="h-2 rounded-full bg-cyan-300" />)}</div><div className="mt-8 h-3 w-40 rounded bg-navy-400" /><div className="mt-3 h-3 w-56 rounded bg-navy-600" /></div></div><div className="order-1 text-lg leading-9 text-metin-ikincil md:order-2"><p>Ar-Ge ve Teknik Destek ekibimiz, müşterilerin proje hedeflerini en yüksek standartlarda gerçekleştirebilmeleri için kapsamlı ve özelleştirilmiş hizmetler sunar.</p><p className="mt-8">Elektronik design-in süreçleri kapsamında elektronik devreler tasarlayarak projelerin temellerini atar. Tasarım sonrası üretilen prototiplerin testlerini gerçekleştirip sonuçlarını ayrıntılı olarak raporlar.</p><p className="mt-8">Gerekli dokümantasyonları temin ederek projelerin her aşamasında eksiksiz bilgi akışı sağlar.</p></div></section>
      <section className="bg-yuzey-gomulu py-16 md:py-24"><div className="mx-auto max-w-6xl px-4 sm:px-6"><h2 className="text-4xl font-extrabold tracking-tight text-metin-marka md:text-6xl">Çözümlerimiz</h2><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cozumler.map(([baslik, aciklama], index) => <article key={baslik} className="rounded-2xl bg-yuzey-kart p-7 shadow-sm transition-shadow hover:shadow-token-yukselti"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-vurgu text-white"><span className="font-mono text-sm font-bold">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-6 text-lg font-bold text-metin-marka">{baslik}</h3><p className="mt-3 text-sm leading-6 text-metin-ikincil">{aciklama}</p></article>)}</div></div></section>
    </div>
  );
}

function PcbTedariğiSayfasi() {
  const vaatler = [
    ["Sürekli İyileştirme ve Yenilik", "PCB teknolojisindeki gelişmeleri takip ederek üretim süreçlerini sürekli geliştiriyoruz."],
    ["Ödünsüz Kalite ve Hassasiyet", "PCB üretiminde yüksek kalite standartlarını ve ölçüsel hassasiyeti koruyoruz."],
    ["Teknik Uzmanlık ve Destek", "Projeniz için doğru üretim seçeneklerini teknik ekibimizle birlikte değerlendiriyoruz."],
    ["Hızlı ve Güvenilir Teslimat", "Proje takviminize uygun, planlı ve güvenilir teslimat koordinasyonu sağlıyoruz."],
    ["Endüstri Standartlarıyla Uyumluluk", "Üretim gerekliliklerini karşılayan ve dokümante edilebilir çözümler sunuyoruz."],
    ["Müşteri Memnuniyeti Garantisi", "İhtiyaçlarınızı baştan sona takip ederek şeffaf iletişim kuruyoruz."],
    ["Sürdürülebilirlik Taahhüdü", "Malzeme ve süreç seçimlerinde çevresel etkileri azaltmaya odaklanıyoruz."],
    ["Rekabetçi Fiyatlandırma", "Proje kapsamına göre dengeli ve şeffaf teklif seçenekleri hazırlıyoruz."],
  ];
  return (
    <div className="bg-yuzey-kart">
      <section className="bg-navy-950 py-10 text-white md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[360px_1fr] lg:gap-16">
          <PcbTeklifFormu />
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">PCB ve Stencil Tedariği</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">Üstün <span className="text-cyan-300">PCB</span> Çözüm Sağlayıcınız!</h1><p className="mt-6 text-lg leading-8 text-notr-200">Sektöründe lider yenilikçi ve hassas PCB çözümleri sunuyoruz. Fikirlerinizi hayata geçirmeye kendini adamış ekibimiz her adımda mükemmellik için çabalıyor.</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-24">
        <h2 className="text-3xl font-extrabold tracking-tight text-metin-marka md:text-5xl">Proje ihtiyaçlarınızı mükemmeliyetle buluşturmak için buradayız!</h2><p className="mt-4 text-lg font-semibold text-metin-ikincil">Sorunsuz bir şekilde <span className="text-vurgu">PCB</span> ile ilgili fiyat teklifinizi alabilmeniz için her şeyi basitleştirdik.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">{["İhtiyaçların Toplanması", "Teklifin Hazırlanması", "Teklifin Gönderilmesi"].map((adim, index) => <div key={adim} className="relative text-left md:text-center"><div className="mx-auto flex h-32 max-w-[220px] items-center justify-center rounded-token-panel border border-cyan-200 bg-vurgu-zemin text-vurgu"><span className="text-5xl font-extrabold">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-5 text-lg font-bold text-metin-marka"><span className="mr-2 text-2xl text-cyan-300">0{index + 1}</span>{adim}</h3>{index < 2 && <div className="absolute right-[-18%] top-16 hidden h-1 w-[36%] bg-cyan-300 md:block" />}</div>)}</div>
      </section>
      <section className="border-t border-kenar bg-yuzey-gomulu py-16 md:py-24"><div className="mx-auto max-w-6xl px-4 sm:px-6"><h2 className="text-center text-3xl font-extrabold tracking-tight text-metin-marka md:text-5xl"><span className="text-vurgu">Çevik Elektronik</span> ne vadediyor?</h2><div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">{vaatler.map(([baslik, aciklama], index) => <article key={baslik} className="flex gap-5 border-b border-kenar pb-6"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-vurgu bg-yuzey-kart text-vurgu"><span className="font-mono text-sm font-bold">{String(index + 1).padStart(2, "0")}</span></div><div><h3 className="text-lg font-bold text-metin-marka">{baslik}</h3><p className="mt-2 text-sm leading-6 text-metin-ikincil">{aciklama}</p></div></article>)}</div></div></section>
    </div>
  );
}

function SogutucuSayfasi() {
  return (
    <div className="bg-yuzey-kart">
      <SolutionHero variant="thermal" eyebrow="Termal yönetim ve üretim" title="Alüminyum Soğutucu" description="Elektronik sektörü için geliştirmekte olduğumuz, yüksek ısıl performansa sahip tüm alüminyum soğutucu ürünlerimizi keşfedin." />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24"><div className="text-lg leading-9 text-metin-ikincil"><p>Alüminyum soğutucu tasarımı ve imalatı konusunda uzmanlaşmış ekibimiz, elektronik cihazlarınızın yüksek hassasiyetle üretilmesini ve termal yönetim sistemine uygun olmasını sağlar.</p><p className="mt-8">Ar-Ge ve inovasyona verdiğimiz önemle sektördeki teknolojik gelişmeleri yakından takip ediyor ve skiving makinemizle çok daha ince kanatlara ve daha yüksek termal performansa sahip ürünler sunarak termal yönetim çözümlerinde fark yaratıyoruz.</p><p className="mt-8">Ürünlerimiz, kalite ve dayanıklılığı bir arada sunarak elektronik komponentlerinizi en verimli şekilde soğutmanıza yardımcı olur.</p></div><div className="flex min-h-[360px] items-center justify-center rounded-token-panel bg-yuzey-gomulu p-10"><div className="relative h-64 w-64 rounded-full border-[22px] border-slate-400 bg-slate-200 shadow-xl before:absolute before:inset-[-42px] before:rounded-full before:border-[18px] before:border-dashed before:border-slate-400 after:absolute after:inset-[-82px] after:rounded-full after:border-[14px] after:border-dotted after:border-slate-300" aria-label="Skiving soğutucu görseli" /></div></section>
      <section className="bg-yuzey-gomulu py-16 md:py-24"><div className="mx-auto max-w-6xl px-4 sm:px-6"><h2 className="text-4xl font-extrabold tracking-tight text-metin-marka md:text-6xl">Temel Uygulama Alanları</h2><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{["UPS", "Kaynak Makineleri", "İnvertörler", "Aydınlatma", "Regülatörler", "Medikal", "Otomotiv", "Tüketici Elektroniği", "Redresörler"].map((alan) => <div key={alan} className="flex items-center gap-5 rounded-2xl bg-yuzey-kart p-7 shadow-sm"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-vurgu text-white"><Thermometer size={24} /></span><span className="text-lg font-semibold text-metin-marka">{alan}</span></div>)}</div></div></section>
    </div>
  );
}

function LedAydinlatmaSayfasi() {
  const kategoriler = ["COB LED'ler ve LED Modüller", "Lamba Çeşitleri", "LED Devre Koruyucular", "LED Komponentler", "LED Optikleri", "LED Sürücüler", "Mobilya Aydınlatma", "Aydınlatma Konnektörleri"];
  const cozumler = [
    ["Talebe Özel LED Modül Tasarımı", "Farklı aydınlatma ihtiyaçları için özel LED modül çözümleri."],
    ["Soğutucu Çözümleri", "Uzun ömürlü bir LED armatür için yüksek performanslı LED soğutucular."],
    ["Elektronik Kart Dizgi", "Tam donanımlı hatlarımızda kapsamlı SMT ve THT dizgi hizmeti."],
    ["Kablolu Konnektörler", "Özel kablo boyutu ve çeşitli konnektör tiplerine sahip çözümler."],
    ["Optik Tasarım", "Işık dağılımını ve verimliliğini optimize etmek için optik tasarım desteği."],
  ];
  return (
    <div className="bg-yuzey-kart">
      <SolutionHero variant="led" eyebrow="LED teknoloji ve aydınlatma" title="LED Aydınlatma Çözümleri" description="Yenilikçi ürünlerimizi keşfedin ve ihtiyaçlarınıza en uygun aydınlatma çözümünü bulun." />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24"><h2 className="text-3xl font-extrabold tracking-tight text-metin-marka md:text-5xl">LED Aydınlatma Kategorileri</h2><div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{kategoriler.map((kategori, index) => <Link key={kategori} href="/urunler" className="group block"><div className={`flex h-36 items-center justify-center rounded-lg border border-kenar bg-yuzey-gomulu transition-colors group-hover:border-vurgu ${index % 3 === 0 ? "text-uyari-500" : index % 3 === 1 ? "text-cyan-500" : "text-vurgu"}`}><Lightbulb size={58} strokeWidth={1.2} /></div><h3 className="mt-4 text-base font-semibold text-metin-marka group-hover:text-vurgu">{kategori}</h3></Link>)}</div></section>
      <section className="bg-yuzey-gomulu py-16 md:py-24"><div className="mx-auto max-w-6xl px-4 sm:px-6"><h2 className="text-4xl font-extrabold tracking-tight text-metin-marka md:text-6xl">Çözümlerimiz</h2><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cozumler.map(([baslik, aciklama]) => <article key={baslik} className="rounded-2xl bg-yuzey-kart p-7 shadow-sm transition-shadow hover:shadow-token-yukselti"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-vurgu text-white"><Lightbulb size={23} /></div><h3 className="mt-6 text-lg font-bold text-metin-marka">{baslik}</h3><p className="mt-3 text-sm leading-6 text-metin-ikincil">{aciklama}</p></article>)}</div></div></section>
    </div>
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const veri = COZUMLER[(await params).slug];
  return { title: veri?.baslik ?? "Çözümler", description: veri?.ozet };
}

export default async function CozumSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (["pcb-a-uretimi", "pcb-tedarigi", "pcb-tedarik-montaj", "otomasyon-cozumleri", "otomasyon"].includes(slug)) notFound();
  const veri = COZUMLER[slug] ?? COZUMLER["elektronik-komponent-distributorlugu"];
  const [kategoriler, cms] = await Promise.all([
    getCategories(),
    COZUMLER[slug] ? Promise.resolve(null) : getPublicPage(slug),
  ]);
  if (slug === "elektronik-komponent-distributorlugu") {
    return <div className="flex min-h-screen flex-col bg-yuzey"><SiteHeader categories={kategoriler} /><main id="icerik" className="min-w-0 flex-grow overflow-x-clip"><ElektronikKomponentSayfasi kategoriler={kategoriler} /></main><SiteFooter /></div>;
  }
  if (slug === "fae-ve-arge-destegi") {
    return <div className="flex min-h-screen flex-col bg-yuzey"><SiteHeader categories={kategoriler} /><main id="icerik" className="min-w-0 flex-grow overflow-x-clip"><FaeArgeSayfasi /></main><SiteFooter /></div>;
  }
  if (slug === "pcb-tedarigi") {
    return <div className="flex min-h-screen flex-col bg-yuzey"><SiteHeader categories={kategoriler} /><main id="icerik" className="min-w-0 flex-grow overflow-x-clip"><PcbTedariğiSayfasi /></main><SiteFooter /></div>;
  }
  if (slug === "sogutucu-uretimi") {
    return <div className="flex min-h-screen flex-col bg-yuzey"><SiteHeader categories={kategoriler} /><main id="icerik" className="min-w-0 flex-grow overflow-x-clip"><SogutucuSayfasi /></main><SiteFooter /></div>;
  }
  if (slug === "led-aydinlatma-cozumleri") {
    return <div className="flex min-h-screen flex-col bg-yuzey"><SiteHeader categories={kategoriler} /><main id="icerik" className="min-w-0 flex-grow overflow-x-clip"><LedAydinlatmaSayfasi /></main><SiteFooter /></div>;
  }
  const baslik = cms?.baslik ?? veri.baslik;

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader categories={kategoriler} />
      <main id="icerik" className="flex-grow">
        <section className="bg-marka py-16 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-cyan-300"><Ikon tip={veri.ikon} /> {veri.etiket}</div>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">{baslik}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">{veri.ozet}</p>
            {veri.cta && <Link href="/teklif-iste" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-marka hover:bg-cyan-50">{veri.cta} <ArrowRight size={16} /></Link>}
          </div>
        </section>

        {veri.istatistikler && <section className="border-b border-kenar bg-yuzey-kart"><div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-kenar px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6">{veri.istatistikler.map(([deger, ad]) => <div key={ad} className="p-6 text-center"><strong className="block text-2xl font-extrabold text-vurgu">{deger}</strong><span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-metin-ucuncul">{ad}</span></div>)}</div></section>}

        {cms?.icerikHtml ? <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><article className="max-w-3xl text-base leading-8 text-metin-ikincil [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-metin-marka" dangerouslySetInnerHTML={{ __html: cms.icerikHtml }} /></section> : null}

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <div className="mb-8 max-w-2xl"><p className="text-xs font-bold uppercase tracking-wider text-vurgu">Çözümlerimiz</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-metin-marka">İhtiyacınıza göre birlikte ilerleyelim</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{veri.kartlar.map(([baslikKart, aciklama], index) => <article key={baslikKart} className="rounded-token-kart border border-kenar bg-yuzey-kart p-6"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-token-girdi bg-vurgu-zemin text-vurgu"><span className="font-mono text-sm font-bold">{String(index + 1).padStart(2, "0")}</span></div><h3 className="text-lg font-bold text-metin-marka">{baslikKart}</h3><p className="mt-2 text-sm leading-6 text-metin-ikincil">{aciklama}</p></article>)}</div>
        </section>

        {veri.adimlar && <section className="border-y border-kenar bg-yuzey-gomulu"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><h2 className="text-2xl font-extrabold text-metin-marka">Süreç nasıl ilerliyor?</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{veri.adimlar.map((adim, index) => <div key={adim} className="flex gap-4 rounded-token-kart border border-kenar bg-yuzey-kart p-5"><span className="font-mono text-2xl font-bold text-vurgu">0{index + 1}</span><div><h3 className="font-bold text-metin-marka">{adim}</h3><p className="mt-1 text-sm text-metin-ikincil">Projeniz için net, takip edilebilir ve hızlı bir sonraki adım.</p></div></div>)}</div></div></section>}

        {veri.alanlar && <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><h2 className="text-2xl font-extrabold text-metin-marka">Uygulama alanları</h2><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{veri.alanlar.map((alan) => <div key={alan} className="flex items-center gap-2 rounded-token-girdi border border-kenar bg-yuzey-kart px-4 py-3 text-sm font-semibold text-metin"><CheckCircle2 size={16} className="text-basari-600" />{alan}</div>)}</div></section>}

        <section className="mx-auto mb-16 max-w-6xl px-4 sm:px-6"><div className="flex flex-col items-start justify-between gap-5 rounded-token-panel bg-vurgu-zemin p-7 sm:flex-row sm:items-center"><div><h2 className="text-xl font-extrabold text-metin-marka">Projenizi birlikte değerlendirelim</h2><p className="mt-1 text-sm text-metin-ikincil">İhtiyacınızı paylaşın, uygun tedarik ve teknik destek seçeneklerini birlikte planlayalım.</p></div><Link href="/teklif-iste" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-marka px-5 py-3 text-sm font-bold text-white hover:bg-marka-hover">Talep oluştur <ArrowRight size={16} /></Link></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
