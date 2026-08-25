"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Lock,
  Award,
  ArrowRight,
  FileCheck,
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-yuzey-gomulu border-t border-kenar text-metin mt-auto text-sm">

      {/* Main Footer Links Grid */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Corporate Brand & Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-cevik-yatay.svg"
                alt="Çevik Elektronik"
                width={190}
                height={55}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-metin-ikincil text-xs leading-relaxed max-w-sm">
              Çevik Elektronik, endüstriyel elektronik komponent tedarikinde hız, güven ve teknik
              uzmanlığı bir araya getirir. Geniş stok gücü, parametrik arama motoru ve adet bazlı
              kademeli B2B fiyat avantajlarıyla projelerinizi destekler.
            </p>

            <div className="space-y-2 pt-2 text-xs text-metin-ikincil">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-vurgu shrink-0" />
                <span className="font-mono font-bold text-metin">0850 304 44 00</span>
                <span className="text-[11px] text-metin-ucuncul">(Hafta içi 08:30 – 18:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-vurgu shrink-0" />
                <a
                  href="mailto:destek@cevik.com.tr"
                  className="hover:text-vurgu transition-colors font-mono"
                >
                  destek@cevik.com.tr
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-vurgu shrink-0 mt-0.5" />
                <span>İMES Sanayi Sitesi, Ümraniye / İstanbul</span>
              </div>
            </div>
          </div>

          {/* Col 2: Komponent Kategorileri */}
          <div>
            <h3 className="font-bold text-metin-marka mb-4 uppercase tracking-wider text-xs border-b border-kenar pb-1.5">
              Komponent Kataloğu
            </h3>
            <ul className="space-y-2.5 text-xs text-metin-ikincil">
              <li>
                <Link href="/urunler?kategoriId=1" className="hover:text-vurgu transition-colors">
                  Yarı İletkenler & MCU
                </Link>
              </li>
              <li>
                <Link href="/urunler?kategoriId=2" className="hover:text-vurgu transition-colors">
                  Pasif Komponentler & MLCC
                </Link>
              </li>
              <li>
                <Link href="/urunler?kategoriId=3" className="hover:text-vurgu transition-colors">
                  Elektromekanik & Röle
                </Link>
              </li>
              <li>
                <Link href="/urunler?kategoriId=4" className="hover:text-vurgu transition-colors">
                  Konnektörler & Klemens
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Müşteri Hizmetleri & B2B */}
          <div>
            <h3 className="font-bold text-metin-marka mb-4 uppercase tracking-wider text-xs border-b border-kenar pb-1.5">
              Müşteri & Hizmetler
            </h3>
            <ul className="space-y-2.5 text-xs text-metin-ikincil">
              <li>
                <Link href="/profil/siparisler" className="hover:text-vurgu transition-colors">
                  Sipariş Takibi
                </Link>
              </li>
              <li>
                <Link href="/bom" className="hover:text-vurgu transition-colors">
                  BOM Yükleme & Eşleştirme
                </Link>
              </li>
              <li>
                <Link href="/teklif-iste" className="hover:text-vurgu transition-colors">
                  Resmi Teklif Talebi (RFQ)
                </Link>
              </li>
              <li>
                <Link href="/karsilastirma" className="hover:text-vurgu transition-colors">
                  Ürün Karşılaştırma
                </Link>
              </li>
              <li>
                <Link href="/araclar" className="hover:text-vurgu transition-colors">
                  Mühendis Araçları
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-vurgu transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kurumsal & E-Bülten */}
          <div>
            <h3 className="font-bold text-metin-marka mb-4 uppercase tracking-wider text-xs border-b border-kenar pb-1.5">
              Kurumsal & Destek
            </h3>
            <ul className="space-y-2.5 text-xs text-metin-ikincil mb-5">
              <li>
                <Link href="/hakkimizda" className="hover:text-vurgu transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-vurgu transition-colors">
                  Blog & Teknik Kaynaklar
                </Link>
              </li>
              <li>
                <Link href="/kayit/kurumsal" className="hover:text-vurgu transition-colors">
                  Kurumsal Cari Hesap Başvurusu
                </Link>
              </li>
              <li>
                <a href="mailto:destek@cevik.com.tr" className="hover:text-vurgu transition-colors">
                  İletişim & Lokasyonlar
                </a>
              </li>
            </ul>

            {/* Newsletter Subscription Box */}
            <div className="p-3 bg-yuzey-kart rounded-[var(--radius-girdi)] border border-kenar space-y-2">
              <span className="text-[11px] font-bold text-metin-marka uppercase block">
                Teknik E-Bülten
              </span>
              <p className="text-[10px] text-metin-ucuncul">
                Yeni stoklar ve teknik makalelerden haberdar olun.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("E-bülten kaydınız başarıyla alındı.");
                }}
                className="flex gap-1"
              >
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  required
                  className="w-full px-2 py-1 text-xs rounded bg-yuzey border border-kenar outline-none focus:border-vurgu"
                />
                <button
                  type="submit"
                  aria-label="Kaydol"
                  className="px-2 py-1 bg-marka text-dolgu-uzeri rounded text-xs font-bold hover:bg-marka-hover transition-colors shrink-0"
                >
                  <ArrowRight size={12} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Badges */}
        <div className="pt-6 border-t border-kenar flex flex-col md:flex-row items-center justify-between gap-4 text-metin-ucuncul text-xs">
          <span>© 2026 Çevik Elektronik San. ve Tic. A.Ş. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}
