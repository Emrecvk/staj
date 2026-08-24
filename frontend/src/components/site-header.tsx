"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  ArrowLeftRight,
  Heart,
  FileText,
  UserRound,
  ShoppingCart,
  ChevronDown,
  Sparkles,
  LogOut,
  PackageCheck,
  Building2,
  MapPin,
  X,
} from "lucide-react";
import type { Category } from "@/lib/api";
import { SmartSearchCombobox } from "@/components/mega-menu/smart-search";
import { MegaMenu } from "@/components/mega-menu/mega-menu";
import { MobilMenu } from "@/components/mega-menu/mobil-menu";
import { useComparisonStore } from "@/lib/stores/comparison-store";
import { useHeaderCart, useHeaderCounters, useHeaderUser } from "@/lib/stores/header-state";
import { logout } from "@/lib/auth";

interface SiteHeaderProps {
  categories?: Category[];
}

export function SiteHeader({ categories = [] }: SiteHeaderProps) {
  // Client state from stores
  const { items: comparisonItems } = useComparisonStore();
  const { itemCount: cartCount, toplamTutar: cartTotal, paraBirimi, kalemler: cartItems } = useHeaderCart();
  const { rfqCount, favoritesCount } = useHeaderCounters();
  const { user, isLoggedIn } = useHeaderUser();

  // Dropdown states
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "EUR" | "TRY">("USD");

  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartPreviewOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <header className="w-full bg-yuzey-kart border-b border-kenar sticky top-0 z-40 shadow-[var(--shadow-hafif)]">
      {/* =========================================================================
          TIER 1: TOP UTILITY BAR (B2B Ticker, Support Hotline, Currency, BOM Link)
          ========================================================================= */}
      <div className="bg-yuzey-gomulu text-xs text-metin-ikincil border-b border-kenar py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Left: Support hotline & Live Exchange Rate Ticker */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-medium text-metin">
              <Phone size={13} className="text-vurgu" />
              <span>Kurumsal Destek:</span>
              <a
                href="tel:08503044400"
                className="font-bold text-metin-marka hover:text-vurgu transition-colors font-mono"
              >
                0850 304 44 00
              </a>
              <span className="text-[11px] text-metin-ucuncul">(08:30 – 18:00)</span>
            </div>

            <div className="hidden lg:flex items-center gap-3 border-l border-kenar pl-6">
              <span className="flex items-center gap-1 font-semibold text-[11px] uppercase tracking-wider text-metin-ucuncul">
                <span className="w-2 h-2 rounded-full bg-basari-500 animate-pulse" />
                TCMB Kurları:
              </span>
              <span className="font-mono text-xs font-semibold text-metin-marka">
                USD/TRY: <span className="tabular-nums">34.25 ₺</span>
              </span>
              <span className="text-kenar-guclu">|</span>
              <span className="font-mono text-xs font-semibold text-metin-marka">
                EUR/TRY: <span className="tabular-nums">37.10 ₺</span>
              </span>
            </div>
          </div>

          {/* Right: Fast BOM, About, Contact, Language/Currency Picker */}
          <div className="flex items-center gap-4">
            <Link
              href="/bom"
              className="inline-flex items-center gap-1 font-bold text-vurgu hover:text-vurgu-guclu transition-colors"
            >
              <Sparkles size={12} /> BOM Yükle / Hızlı Parça
            </Link>

            <span className="text-kenar-guclu">|</span>

            <Link href="/hakkimizda" className="hover:text-vurgu transition-colors">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="hover:text-vurgu transition-colors">
              İletişim
            </Link>

            <span className="text-kenar-guclu">|</span>

            {/* Currency / Language Selector Dropdown */}
            <div ref={currencyRef} className="relative">
              <button
                type="button"
                onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                className="flex items-center gap-1 font-bold text-metin-marka hover:text-vurgu transition-colors px-1 py-0.5 rounded"
                aria-expanded={currencyMenuOpen}
              >
                <span>TR · {selectedCurrency}</span>
                <ChevronDown size={12} className="text-metin-ucuncul" />
              </button>

              {currencyMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-yuzey-kart border border-kenar rounded-[var(--radius-girdi)] shadow-[var(--shadow-kart)] z-50 p-1 animate-in fade-in duration-100">
                  {(["USD", "EUR", "TRY"] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(curr);
                        setCurrencyMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded text-left transition-colors ${
                        selectedCurrency === curr
                          ? "bg-vurgu-zemin text-vurgu font-bold"
                          : "text-metin hover:bg-yuzey-gomulu"
                      }`}
                    >
                      <span>TR · {curr}</span>
                      {selectedCurrency === curr && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: MAIN ACTION BAR (Logo, Smart Search Combobox & Action Center)
          ========================================================================= */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="lg:hidden">
              <MobilMenu categories={categories} />
            </div>
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo-cevik-yatay.svg"
                alt="Çevik Elektronik"
                width={190}
                height={55}
                priority
                className="h-9 md:h-11 w-auto"
              />
            </Link>
          </div>

          {/* Central Smart Search Combobox */}
          <div className="flex-grow max-w-2xl hidden md:block">
            <SmartSearchCombobox categories={categories} />
          </div>

          {/* Right: Header Action Center & Badges */}
          <nav
            className="flex items-center gap-3 lg:gap-6 text-metin-marka shrink-0"
            aria-label="Kullanıcı İşlemleri ve Sepet"
          >
            {/* 1. RFQ / Teklif Listesi */}
            <Link
              href="/teklif-iste"
              className="flex flex-col items-center gap-0.5 hover:text-vurgu transition-colors relative group"
              title="Resmi Teklif Talebi (RFQ)"
            >
              <div className="relative p-1">
                <FileText size={22} className="group-hover:scale-105 transition-transform" />
                {rfqCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-vurgu text-dolgu-uzeri text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono">
                    {rfqCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold hidden xl:block">Teklif Listesi</span>
            </Link>

            {/* 2. Favoriler */}
            <Link
              href="/profil/favoriler"
              className="flex flex-col items-center gap-0.5 hover:text-vurgu transition-colors relative group"
              title="Favori Parçalarım"
            >
              <div className="relative p-1">
                <Heart size={22} className="group-hover:scale-105 transition-transform" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-vurgu text-dolgu-uzeri text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold hidden xl:block">Favoriler</span>
            </Link>

            {/* 3. Karşılaştırma Dock Rozeti */}
            <Link
              href="/karsilastirma"
              className="flex flex-col items-center gap-0.5 hover:text-vurgu transition-colors relative group"
              title="Parça Karşılaştırma"
            >
              <div className="relative p-1">
                <ArrowLeftRight size={22} className="group-hover:scale-105 transition-transform" />
                {comparisonItems.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-cyan-600 text-dolgu-uzeri text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono animate-in zoom-in-50 duration-100">
                    {comparisonItems.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold hidden xl:block">Karşılaştır</span>
            </Link>

            {/* 4. Hesabım (User Account Menu Popover) */}
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex flex-col items-center gap-0.5 hover:text-vurgu transition-colors outline-none group"
                aria-expanded={accountMenuOpen}
              >
                <div className="p-1">
                  <UserRound size={22} className="group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[11px] font-semibold hidden xl:block truncate max-w-[90px]">
                    {user?.ad ? user.ad : "Hesabım"}
                  </span>
                  <ChevronDown size={11} className="hidden xl:block text-metin-ucuncul" />
                </div>
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-yuzey-kart border border-kenar rounded-[var(--radius-kart)] shadow-[var(--shadow-katman)] z-50 p-2 text-metin animate-in fade-in duration-150">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-yuzey-gomulu rounded-[var(--radius-girdi)] border border-kenar">
                        <div className="font-bold text-xs text-metin-marka truncate">{user?.ad}</div>
                        {user?.firmaMi && (
                          <div className="flex items-center gap-1 text-[10px] text-vurgu-guclu font-semibold mt-0.5">
                            <Building2 size={11} /> Kurumsal B2B Hesabı
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5 text-xs font-medium">
                        <Link
                          href="/profil"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                        >
                          <UserRound size={14} className="text-vurgu" /> Hesabım Özeti
                        </Link>
                        <Link
                          href="/profil/siparisler"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                        >
                          <PackageCheck size={14} className="text-vurgu" /> Siparişlerim
                        </Link>
                        <Link
                          href="/profil/teklifler"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                        >
                          <FileText size={14} className="text-vurgu" /> Teklif Taleplerim
                        </Link>
                        <Link
                          href="/profil/adresler"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                        >
                          <MapPin size={14} className="text-vurgu" /> Adres Yönetimi
                        </Link>
                        {user?.firmaMi && (
                          <Link
                            href="/profil/firma"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                          >
                            <Building2 size={14} className="text-vurgu" /> Firma Bilgileri & Kredi
                          </Link>
                        )}
                      </div>

                      <div className="pt-2 border-t border-kenar">
                        <form action={logout}>
                          <button
                            type="submit"
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold text-hata-600 hover:bg-hata-50 transition-colors"
                          >
                            <LogOut size={14} /> Güvenli Çıkış
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-3">
                      <div className="text-xs text-metin-ikincil text-center">
                        Kurumsal fiyatlar, anlık stok ve teklif yönetimi için giriş yapın.
                      </div>
                      <div className="space-y-1.5">
                        <Link
                          href="/giris"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full py-2 px-3 text-center text-xs font-bold bg-marka text-dolgu-uzeri rounded-[var(--radius-girdi)] hover:bg-marka-hover transition-colors"
                        >
                          Giriş Yap
                        </Link>
                        <Link
                          href="/kayit/kurumsal"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full py-2 px-3 text-center text-xs font-bold bg-vurgu-zemin text-vurgu-guclu border border-vurgu rounded-[var(--radius-girdi)] hover:bg-cyan-100 transition-colors"
                        >
                          Kurumsal Firma Kaydı
                        </Link>
                      </div>
                      <div className="pt-2 border-t border-kenar text-center">
                        <Link
                          href="/kayit"
                          onClick={() => setAccountMenuOpen(false)}
                          className="text-[11px] text-metin-ucuncul hover:text-vurgu"
                        >
                          Bireysel Üyelik Oluştur
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Sepetim & Mini-Cart Dropdown Preview */}
            <div ref={cartRef} className="relative">
              <button
                type="button"
                onClick={() => setCartPreviewOpen(!cartPreviewOpen)}
                className="flex items-center gap-2 p-1 hover:text-vurgu transition-colors outline-none group"
                aria-expanded={cartPreviewOpen}
              >
                <div className="relative">
                  <ShoppingCart size={24} className="group-hover:scale-105 transition-transform" />
                  <span className="absolute -top-1.5 -right-2 bg-vurgu text-dolgu-uzeri text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono tabular-nums shadow-xs">
                    {cartCount}
                  </span>
                </div>
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-[10px] text-metin-ucuncul uppercase font-bold tracking-wider">
                    Sepetim
                  </span>
                  <span className="text-xs font-bold font-mono text-metin-marka tabular-nums">
                    {cartTotal.toFixed(2)} {paraBirimi}
                  </span>
                </div>
              </button>

              {/* Mini-Cart Preview Popover */}
              {cartPreviewOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-yuzey-kart border border-kenar rounded-[var(--radius-kart)] shadow-[var(--shadow-katman)] z-50 p-4 text-metin animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-kenar">
                    <span className="text-xs font-bold text-metin-marka uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingCart size={15} className="text-vurgu" /> Sepet Özeti ({cartCount} Ürün)
                    </span>
                    <button
                      type="button"
                      onClick={() => setCartPreviewOpen(false)}
                      className="text-metin-ucuncul hover:text-metin"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <ShoppingCart size={32} className="mx-auto text-metin-ucuncul opacity-40" />
                      <p className="text-xs font-semibold text-metin">Sepetinizde ürün bulunmuyor</p>
                      <p className="text-[11px] text-metin-ikincil">
                        Parça aramak için yukarıdaki arama motorunu kullanabilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-3">
                      {/* Items list */}
                      <div className="max-h-56 overflow-y-auto divide-y divide-kenar pr-1 space-y-1">
                        {cartItems.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <div className="font-mono font-bold text-metin-marka truncate">{item.mpn}</div>
                              <div className="text-[11px] text-metin-ikincil truncate">
                                {item.miktar} Adet · {item.baslik}
                              </div>
                            </div>
                            <div className="font-mono font-bold text-right shrink-0">
                              {item.toplamFiyat.toFixed(2)} {item.paraBirimi}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Subtotal */}
                      <div className="pt-3 border-t border-kenar space-y-1">
                        <div className="flex justify-between text-xs text-metin-ikincil">
                          <span>Ara Toplam:</span>
                          <span className="font-mono font-bold text-metin-marka tabular-nums">
                            {cartTotal.toFixed(2)} {paraBirimi}
                          </span>
                        </div>
                        <div className="text-[10px] text-metin-ucuncul">
                          * KDV ve kargo bedeli sipariş adımında hesaplanır.
                        </div>
                      </div>

                      {/* Action CTAs */}
                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <Link
                          href="/sepet"
                          onClick={() => setCartPreviewOpen(false)}
                          className="py-2 px-3 text-center text-xs font-bold border border-marka text-metin-marka rounded-[var(--radius-girdi)] hover:bg-yuzey-gomulu transition-colors"
                        >
                          Sepete Git
                        </Link>
                        <Link
                          href="/odeme"
                          onClick={() => setCartPreviewOpen(false)}
                          className="py-2 px-3 text-center text-xs font-bold bg-vurgu-dolgu text-metin-marka rounded-[var(--radius-girdi)] hover:bg-cyan-400 transition-colors"
                        >
                          Siparişi Tamamla
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="mt-3 md:hidden">
          <SmartSearchCombobox categories={categories} />
        </div>
      </div>

      {/* =========================================================================
          TIER 3: BOTTOM NAVIGATION & MEGA MENU BAR (Navy #0F2740 bg-marka)
          ========================================================================= */}
      <div className="bg-marka text-white shadow-inner hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Mega Menu Trigger & Panel */}
            <MegaMenu categories={categories} />

            {/* Popular Component Categories Horizontal Bar */}
            <nav className="flex items-center ml-2 text-xs font-semibold tracking-wide" aria-label="Popüler Kategoriler">
              {[
                { ad: "Yarı İletkenler", href: "/urunler?kategoriId=1" },
                { ad: "Pasif Komponentler", href: "/urunler?kategoriId=2" },
                { ad: "Elektromekanik", href: "/urunler?kategoriId=3" },
                { ad: "Konnektörler", href: "/urunler?kategoriId=4" },
                { ad: "Güç Kaynakları", href: "/urunler?kategoriId=5" },
                { ad: "Sensörler", href: "/urunler?kategoriId=6" },
                { ad: "Stok Fırsatları", href: "/urunler?sadeceStoktakiler=true", highlight: true },
              ].map((item) => (
                <Link
                  key={item.ad}
                  href={item.href}
                  className={`px-3.5 py-3 hover:text-cyan-300 transition-colors border-b-2 border-transparent hover:border-cyan-400 ${
                    item.highlight ? "text-cyan-300 font-bold" : "text-white/90"
                  }`}
                >
                  {item.ad}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick RFQ / Quote CTA button */}
          <Link
            href="/teklif-iste"
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors py-3 px-2 group"
          >
            <FileText size={15} className="group-hover:scale-110 transition-transform" />
            <span>Fiyat & Stok Teklifi İste</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
