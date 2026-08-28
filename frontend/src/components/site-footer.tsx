"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Loader2, Mail, MapPin, Phone } from "lucide-react";

const katalogBaglantilari = [
  ["Tüm ürünler", "/urunler"], ["Üreticiler", "/markalar"],
  ["BOM yükleme", "/bom"], ["Ürün karşılaştırma", "/karsilastirma"],
] as const;
const hizmetBaglantilari = [
  ["Teklif talebi", "/teklif-iste"], ["Sipariş takibi", "/profil/siparisler"],
  ["Mühendis araçları", "/araclar"], ["Sıkça sorulan sorular", "/sss"],
] as const;
const kurumsalBaglantilar = [
  ["Hakkımızda", "/hakkimizda"], ["Teknik kaynaklar", "/blog"],
  ["Component by Çevik", "/dergi"], ["Kurumsal hesap", "/kayit/kurumsal"],
  ["İletişim", "/iletisim"],
] as const;

function BaglantiGrubu({ baslik, baglantilar }: {
  baslik: string;
  baglantilar: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <nav aria-label={baslik}>
      <h3 className="text-xs font-semibold tracking-[0.14em] text-cyan-200 uppercase">{baslik}</h3>
      <ul className="mt-5 space-y-3.5">
        {baglantilar.map(([etiket, href]) => (
          <li key={href}>
            <Link href={href} className="group inline-flex items-center gap-1.5 text-sm text-navy-200 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              {etiket}
              <ArrowUpRight aria-hidden="true" size={13} className="translate-y-px opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const [kaydedildi, setKaydedildi] = useState(false);
  const [eposta, setEposta] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function bulteneKaydol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGonderiliyor(true);
    setHata(null);

    try {
      const yanit = await fetch("/api/icerik/e-bulten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: eposta.trim() }),
      });

      if (!yanit.ok) {
        setHata(
          yanit.status === 400
            ? "Geçerli bir e-posta adresi girin."
            : "Kaydınız şu anda alınamadı. Lütfen tekrar deneyin.",
        );
        return;
      }

      setEposta("");
      setKaydedildi(true);
    } catch {
      setHata("Bağlantı kurulamadı. Lütfen tekrar deneyin.");
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <footer className="mt-auto overflow-hidden bg-navy-950 text-white">
      <div className="border-b border-white/10 bg-navy-900">
        <div className="mx-auto grid w-full max-w-[1440px] gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)] lg:items-center lg:px-10 lg:py-9">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">Teknik e-bülten</p>
            <h2 className="mt-2 max-w-xl text-xl font-semibold tracking-[-0.02em] text-balance sm:text-2xl">Yeni stoklar ve teknik içerikler, tek e-postada.</h2>
          </div>
          {kaydedildi ? (
            <div role="status" className="flex min-h-12 items-center gap-3 rounded-token-girdi border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-medium text-cyan-100">
              <Check size={18} aria-hidden="true" /> E-posta adresiniz listeye kaydedildi.
            </div>
          ) : (
            <form onSubmit={bulteneKaydol} className="flex min-w-0 flex-wrap gap-2">
              <label htmlFor="footer-eposta" className="sr-only">E-posta adresiniz</label>
              <input
                id="footer-eposta"
                type="email"
                value={eposta}
                onChange={(event) => setEposta(event.target.value)}
                placeholder="E-posta adresiniz"
                required
                maxLength={256}
                aria-invalid={Boolean(hata)}
                aria-describedby={hata ? "footer-eposta-hata" : undefined}
                className="min-w-0 flex-1 rounded-token-girdi border border-white/15 bg-white/8 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-navy-300 focus:border-cyan-300 focus:bg-white/10"
              />
              <button
                type="submit"
                disabled={gonderiliyor}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-token-girdi bg-cyan-400 px-5 py-3 text-sm font-semibold text-navy-950 transition-[background-color,transform] duration-200 hover:bg-cyan-300 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-70"
              >
                {gonderiliyor && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {gonderiliyor ? "Kaydediliyor" : "Kaydol"}
              </button>
              {hata && (
                <p id="footer-eposta-hata" role="alert" className="w-full text-xs text-red-200">
                  {hata}
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-5 pt-12 pb-7 sm:px-8 lg:px-10 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(300px,1.35fr)_repeat(3,minmax(130px,0.65fr))] lg:gap-10">
          <div>
            <Link href="/" aria-label="Çevik Elektronik ana sayfa" className="inline-flex rounded-token-girdi focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              <Image src="/logo-cevik-mono-beyaz.svg" alt="Çevik Elektronik" width={205} height={58} className="h-11 w-auto" />
            </Link>
            <p className="mt-6 max-w-md text-sm leading-7 text-navy-200 text-pretty">Endüstriyel elektronik komponent tedariğinde doğrulanmış ürün bilgisi, güçlü stok ve kurumsal satın alma desteği.</p>
            <address className="mt-8 space-y-3.5 text-sm not-italic text-navy-200">
              <a href="tel:08503044400" className="flex w-fit items-center gap-3 transition-colors hover:text-white">
                <Phone size={16} className="text-cyan-300" aria-hidden="true" />
                <span className="font-mono tabular-nums">0850 304 44 00</span>
                <span className="hidden text-xs text-navy-400 sm:inline">08:30–18:00</span>
              </a>
              <a href="mailto:destek@cevik.com.tr" className="flex w-fit items-center gap-3 transition-colors hover:text-white">
                <Mail size={16} className="text-cyan-300" aria-hidden="true" /> destek@cevik.com.tr
              </a>
              <p className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> İMES Sanayi Sitesi, Ümraniye / İstanbul</p>
            </address>
          </div>
          <div className="grid grid-cols-2 gap-9 sm:grid-cols-3 lg:contents">
            <BaglantiGrubu baslik="Katalog" baglantilar={katalogBaglantilari} />
            <BaglantiGrubu baslik="Hizmetler" baglantilar={hizmetBaglantilari} />
            <BaglantiGrubu baslik="Kurumsal" baglantilar={kurumsalBaglantilar} />
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <p>© 2026 Çevik Elektronik San. ve Tic. A.Ş.</p>
          <nav aria-label="Yasal bağlantılar" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/sozlesmeler/cevik-elektronik-kvkk-politikasi" className="transition-colors hover:text-white">KVKK ve gizlilik</Link>
            <Link href="/sss" className="transition-colors hover:text-white">Yardım merkezi</Link>
            <Link href="/iletisim" className="transition-colors hover:text-white">İletişim</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
