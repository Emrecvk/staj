import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories } from "@/lib/api";
import { EpostaEylemleri } from "./eposta-eylemleri";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Çevik Elektronik satış, sipariş ve teknik destek ekiplerine ulaşın.",
};

const destekKanallari = [
  {
    baslik: "Fiyat, stok ve toplu alım",
    aciklama: "Ürün listeniz için resmi ve izlenebilir bir teklif talebi oluşturun.",
    etiket: "Teklif talebi oluştur",
    href: "/teklif-iste",
  },
  {
    baslik: "Sipariş ve hesap desteği",
    aciklama: "Mevcut siparişlerinizi görüntüleyin veya kurumsal hesabınıza ulaşın.",
    etiket: "Siparişlerime git",
    href: "/profil/siparisler",
  },
  {
    baslik: "Teknik ürün seçimi",
    aciklama: "Komponent seçimi, tasarım ve prototipleme sürecinde mühendislik desteği alın.",
    etiket: "FAE desteğini incele",
    href: "/cozumler/fae-ve-arge-destegi",
  },
  {
    baslik: "Kurumsal üyelik",
    aciklama: "Firma hesabı, satın alma yetkileri ve kurumsal fiyatlandırma için başvurun.",
    etiket: "Kurumsal hesap aç",
    href: "/kayit/kurumsal",
  },
] as const;

export default async function IletisimPage() {
  const kategoriler = await getCategories();

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader categories={kategoriler} />
      <main id="icerik" className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-marka text-white">
          <div className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full border-[48px] border-cyan-300/10" />
          <div className="absolute -bottom-44 left-[35%] -z-10 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">İletişim</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Sorunuz doğru ekibe hızlıca ulaşsın.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-navy-100 sm:text-lg">
                Ürün seçimi, fiyat ve stok talepleri, sipariş desteği veya kurumsal üyelik için size en uygun kanalı seçin.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="tel:08503044400" className="inline-flex min-h-12 items-center gap-2 rounded-token-girdi bg-cyan-300 px-5 py-3 text-sm font-extrabold text-navy-950 transition-colors hover:bg-cyan-200">
                  <Phone size={17} aria-hidden="true" /> 0850 304 44 00
                </a>
                <Link href="/teklif-iste" className="inline-flex min-h-12 items-center gap-2 rounded-token-girdi border border-white/25 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  Teklif talebi <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="border-l border-white/20 pl-6 sm:pl-8">
              <Clock3 size={24} className="text-cyan-300" aria-hidden="true" />
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-cyan-100">Müşteri desteği</p>
              <p className="mt-2 text-2xl font-extrabold">Hafta içi 08:30–18:00</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-navy-200">Satış ve teknik destek ekiplerimiz çalışma saatleri içinde taleplerinizi karşılar.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="ulasim-basligi" className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 md:py-20 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-vurgu">Doğrudan ulaşın</p>
            <h2 id="ulasim-basligi" className="mt-3 text-3xl font-extrabold tracking-tight text-metin-marka sm:text-4xl">İletişim kanalları</h2>
          </div>
          <div className="mt-9 grid gap-px overflow-hidden rounded-token-panel border border-kenar bg-kenar lg:grid-cols-3">
            <article className="bg-yuzey-kart p-7 sm:p-8">
              <Phone size={24} className="text-vurgu" aria-hidden="true" />
              <h3 className="mt-6 text-lg font-extrabold text-metin-marka">Telefon</h3>
              <p className="mt-2 text-sm leading-6 text-metin-ikincil">Satış, sipariş ve ürün desteği için müşteri ekibimizi arayın.</p>
              <a href="tel:08503044400" className="mt-5 inline-block font-mono text-lg font-bold tabular-nums text-vurgu hover:text-vurgu-guclu">0850 304 44 00</a>
            </article>
            <article className="bg-yuzey-kart p-7 sm:p-8">
              <Mail size={24} className="text-vurgu" aria-hidden="true" />
              <h3 className="mt-6 text-lg font-extrabold text-metin-marka">E-posta</h3>
              <p className="mt-2 text-sm leading-6 text-metin-ikincil">E-posta uygulamanız yoksa adresi tek tıkla kopyalayabilirsiniz.</p>
              <p className="mt-4 font-mono text-sm font-bold text-metin-marka">destek@cevik.com.tr</p>
              <EpostaEylemleri />
            </article>
            <article className="bg-yuzey-kart p-7 sm:p-8">
              <MapPin size={24} className="text-vurgu" aria-hidden="true" />
              <h3 className="mt-6 text-lg font-extrabold text-metin-marka">Adres</h3>
              <address className="mt-2 text-sm not-italic leading-6 text-metin-ikincil">İMES Sanayi Sitesi<br />Ümraniye / İstanbul</address>
              <a href="https://www.google.com/maps/search/?api=1&query=IMES+Sanayi+Sitesi+Umraniye+Istanbul" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-vurgu hover:text-vurgu-guclu">
                Haritada görüntüle <ArrowRight size={15} aria-hidden="true" />
              </a>
            </article>
          </div>
        </section>

        <section aria-labelledby="destek-basligi" className="border-y border-kenar bg-yuzey-gomulu">
          <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
            <div>
              <Headphones size={28} className="text-vurgu" aria-hidden="true" />
              <h2 id="destek-basligi" className="mt-5 text-3xl font-extrabold tracking-tight text-metin-marka">Talebiniz için doğru kanal</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-metin-ikincil">İlgili sürece doğrudan giderek talebinizin gerekli bilgilerle birlikte daha hızlı işleme alınmasını sağlayın.</p>
              <div className="mt-7 flex items-start gap-3 text-sm text-metin-ikincil">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-basari-600" aria-hidden="true" />
                İletişim bilgileriniz yalnızca talebinizi yanıtlamak için kullanılır.
              </div>
            </div>
            <div className="divide-y divide-kenar border-y border-kenar">
              {destekKanallari.map((kanal) => (
                <Link key={kanal.href} href={kanal.href} className="group grid gap-3 py-6 sm:grid-cols-[1fr_1.35fr_auto] sm:items-center sm:gap-6">
                  <h3 className="font-extrabold text-metin-marka transition-colors group-hover:text-vurgu">{kanal.baslik}</h3>
                  <p className="text-sm leading-6 text-metin-ikincil">{kanal.aciklama}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-vurgu">{kanal.etiket}<ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
