"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  UserRound,
  ShoppingCart,
  ChevronDown,
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
import { useHeaderCart, useHeaderUser } from "@/lib/stores/header-state";
import { logout } from "@/lib/auth";

interface SiteHeaderProps {
  categories?: Category[];
  initialCurrency?: "TRY" | "USD";
}

export function SiteHeader({ categories = [], initialCurrency = "TRY" }: SiteHeaderProps) {
  // Client state from stores
  const {
    itemCount: cartCount,
    toplamTutar: cartTotal,
    paraBirimi,
    kalemler: cartItems,
  } = useHeaderCart();
  const { user, isLoggedIn } = useHeaderUser();

  // Dropdown states
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [siteCurrency, setSiteCurrency] = useState(initialCurrency);
  let displayCartTotal = cartTotal;
  let displayCartCur = paraBirimi;
  if (paraBirimi === "USD" && siteCurrency === "TRY") {
    displayCartTotal = cartTotal * 35.24;
    displayCartCur = "TRY";
  } else if (paraBirimi === "TRY" && siteCurrency === "USD") {
    displayCartTotal = cartTotal / 35.24;
    displayCartCur = "USD";
  } else if (siteCurrency) {
    displayCartCur = siteCurrency;
  }
  const [localePanelOpen, setLocalePanelOpen] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState("tr");
  const [draftCurrency, setDraftCurrency] = useState<"TRY" | "USD">(initialCurrency);

  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const accountCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const openAccountMenu = () => {
    if (accountCloseTimerRef.current)
      clearTimeout(accountCloseTimerRef.current);
    setAccountMenuOpen(true);
  };

  const closeAccountMenuWithDelay = () => {
    accountCloseTimerRef.current = setTimeout(
      () => setAccountMenuOpen(false),
      140,
    );
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartPreviewOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-kenar bg-yuzey-kart shadow-[var(--shadow-hafif)]">
      {/* =========================================================================
          TIER 2: MAIN ACTION BAR (Logo, Smart Search Combobox & Action Center)
          ========================================================================= */}
      <div className="bg-[#0F2740]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left: Mobile Drawer Trigger + Brand Logo (daha görünür) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="lg:hidden">
                <MobilMenu categories={categories} />
              </div>
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src="/logo-cevik-mono-beyaz.svg"
                  alt="Çevik Elektronik"
                  width={220}
                  height={64}
                  priority
                  className="h-12 w-auto md:h-14"
                />
              </Link>
            </div>

            {/* Central Smart Search Combobox */}
            <div className="hidden max-w-xl flex-grow md:block">
              <SmartSearchCombobox categories={categories} />
            </div>

            {/* Right: Header Action Center & Badges */}
            <nav
              className="flex shrink-0 items-center gap-3 text-white lg:gap-6"
              aria-label="Kullanıcı İşlemleri ve Sepet"
            >
              {/* Favori ve Karşılaştırma birincil alandan çıkarıldı; ikincil
                menüye (Hesabım açılırı) taşındı. */}

              {/* 2. Hesabım (User Account Menu Popover) */}
              <div
                ref={accountRef}
                className="relative"
                onMouseEnter={openAccountMenu}
                onMouseLeave={closeAccountMenuWithDelay}
              >
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2.5 text-white/80 transition-colors outline-none group hover:text-white"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="p-1">
                    <UserRound
                      size={25}
                      className="group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="hidden text-left leading-tight xl:block">
                    <div className="flex items-center gap-1.5">
                      <span className="max-w-[110px] truncate text-sm font-semibold">
                        {user?.ad ? user.ad : "Hesabım"}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-white/60 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                    {!isLoggedIn && (
                      <span className="mt-1 block text-[11px] text-white/55">
                        Giriş Yap / Kayıt Ol
                      </span>
                    )}
                  </div>
                </button>

                {accountMenuOpen && (
                  <div
                    className={`absolute right-0 top-full mt-3 bg-yuzey-kart border border-kenar rounded-[var(--radius-kart)] shadow-[var(--shadow-katman)] z-50 p-2 text-metin animate-in fade-in duration-150 ${isLoggedIn ? "w-64" : "w-[560px] max-w-[calc(100vw-2rem)]"}`}
                  >
                    <span
                      className="absolute -top-2 right-16 h-4 w-4 rotate-45 border-l border-t border-kenar bg-yuzey-kart"
                      aria-hidden="true"
                    />
                    {isLoggedIn ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-yuzey-gomulu rounded-[var(--radius-girdi)] border border-kenar">
                          <div className="font-bold text-xs text-metin-marka truncate">
                            {user?.ad}
                          </div>
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
                            <UserRound size={14} className="text-vurgu" />{" "}
                            Hesabım Özeti
                          </Link>
                          <Link
                            href="/profil/siparisler"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                          >
                            <PackageCheck size={14} className="text-vurgu" />{" "}
                            Siparişlerim
                          </Link>
                          <Link
                            href="/profil/teklifler"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                          >
                            <FileText size={14} className="text-vurgu" /> Teklif
                            Taleplerim
                          </Link>
                          <Link
                            href="/profil/adresler"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                          >
                            <MapPin size={14} className="text-vurgu" /> Adres
                            Yönetimi
                          </Link>
                          {user?.firmaMi && (
                            <Link
                              href="/profil/firma"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-yuzey-gomulu hover:text-vurgu transition-colors"
                            >
                              <Building2 size={14} className="text-vurgu" />{" "}
                              Firma Bilgileri & Kredi
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
                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href="/giris"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block w-full rounded-[var(--radius-girdi)] bg-vurgu-dolgu px-4 py-2.5 text-center text-sm font-bold text-metin-marka transition-colors hover:bg-cyan-400"
                          >
                            Giriş Yap
                          </Link>
                          <Link
                            href="/kayit"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block w-full rounded-[var(--radius-girdi)] bg-marka px-4 py-2.5 text-center text-sm font-bold text-dolgu-uzeri transition-colors hover:bg-marka-hover"
                          >
                            Kayıt Ol
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 pt-4 text-sm font-medium">
                          <Link
                            href="/profil"
                            className="flex items-center gap-3 rounded px-2 py-2.5 hover:bg-yuzey-gomulu"
                          >
                            <UserRound size={18} className="text-vurgu" />{" "}
                            Profil
                          </Link>
                          <Link
                            href="/profil/siparisler"
                            className="flex items-center gap-3 rounded px-2 py-2.5 hover:bg-yuzey-gomulu"
                          >
                            <PackageCheck size={18} className="text-vurgu" />{" "}
                            Siparişlerim
                          </Link>
                          <Link
                            href="/profil/teklifler"
                            className="flex items-center gap-3 rounded px-2 py-2.5 hover:bg-yuzey-gomulu"
                          >
                            <FileText size={18} className="text-vurgu" />{" "}
                            Tekliflerim
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
                  className="flex items-center rounded-full bg-[#2376c4] p-2.5 text-white transition-colors outline-none group hover:bg-[#24547E]"
                  aria-expanded={cartPreviewOpen}
                >
                  <div className="relative">
                    <ShoppingCart
                      size={22}
                      className="group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -top-2 -right-2 bg-vurgu-dolgu text-metin-marka text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono tabular-nums shadow-xs">
                      {cartCount}
                    </span>
                  </div>
                </button>

                {/* Mini-Cart Preview Popover */}
                {cartPreviewOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-yuzey-kart border border-kenar rounded-[var(--radius-kart)] shadow-[var(--shadow-katman)] z-50 p-4 text-metin animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-kenar">
                      <span className="text-xs font-bold text-metin-marka uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingCart size={15} className="text-vurgu" /> Sepet
                        Özeti ({cartCount} Ürün)
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
                        <ShoppingCart
                          size={32}
                          className="mx-auto text-metin-ucuncul opacity-40"
                        />
                        <p className="text-xs font-semibold text-metin">
                          Sepetinizde ürün bulunmuyor
                        </p>
                        <p className="text-[11px] text-metin-ikincil">
                          Parça aramak için yukarıdaki arama motorunu
                          kullanabilirsiniz.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-3">
                        {/* Items list */}
                        <div className="max-h-56 overflow-y-auto divide-y divide-kenar pr-1 space-y-1">
                          {cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="py-2 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-mono font-bold text-metin-marka truncate">
                                  {item.mpn}
                                </div>
                                <div className="text-[11px] text-metin-ikincil truncate">
                                  {item.miktar} Adet · {item.baslik}
                                </div>
                              </div>
                              <div className="font-mono font-bold text-right shrink-0">
                                {((item.paraBirimi === "USD" && siteCurrency === "TRY") ? item.toplamFiyat * 35.24 : (item.paraBirimi === "TRY" && siteCurrency === "USD") ? item.toplamFiyat / 35.24 : item.toplamFiyat).toFixed(2)} {siteCurrency || item.paraBirimi}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Subtotal */}
                        <div className="pt-3 border-t border-kenar space-y-1">
                          <div className="flex justify-between text-xs text-metin-ikincil">
                            <span>Ara Toplam:</span>
                            <span className="font-mono font-bold text-metin-marka tabular-nums">
                              {displayCartTotal.toFixed(2)} {displayCartCur}
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
      </div>

      {/* =========================================================================
          TIER 3: ALT NAVİGASYON & MEGA MENÜ — beyaz zemin (koyu bg-marka değil)
          ========================================================================= */}
      <div className="hidden border-t border-kenar bg-yuzey-kart md:block">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4">
          <div className="justify-self-start">
            <MegaMenu categories={categories} />
          </div>

          <nav
            className="flex items-center justify-center"
            aria-label="Ana navigasyon"
          >
            <Link
              href="/urunler"
              className="px-6 py-3 text-sm font-semibold text-metin transition-colors hover:text-vurgu"
            >
              Ürünler
            </Link>
            <Link
              href="/#cozumler"
              className="px-6 py-3 text-sm font-semibold text-metin transition-colors hover:text-vurgu"
            >
              Çözümler
            </Link>
            <Link
              href="/hakkimizda"
              className="px-6 py-3 text-sm font-semibold text-metin transition-colors hover:text-vurgu"
            >
              Kurumsal
            </Link>
            <a
              href="mailto:destek@cevik.com.tr"
              className="px-6 py-3 text-sm font-semibold text-metin transition-colors hover:text-vurgu"
            >
              İletişim
            </a>
          </nav>

          <div className="relative justify-self-end">
            <button type="button" onClick={() => setLocalePanelOpen((open) => !open)} className="flex items-center gap-2 rounded px-2 py-2 text-sm font-semibold text-metin-ikincil hover:text-vurgu" aria-expanded={localePanelOpen}>
              {draftLanguage === "tr" ? "Türkçe" : "English"} <span className="text-kenar-guclu">|</span> {siteCurrency === "TRY" ? "TL" : siteCurrency}
            </button>
            {localePanelOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[560px] rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart p-7 shadow-[var(--shadow-katman)]">
                <div className="grid grid-cols-2 divide-x divide-kenar">
                  <div className="pr-8"><h3 className="text-2xl font-bold text-vurgu">Diller</h3><div className="mt-4 border-t border-kenar pt-3"><button type="button" onClick={() => setDraftLanguage("tr")} className={`flex w-full justify-between py-2 text-lg ${draftLanguage === "tr" ? "font-semibold text-vurgu" : "text-metin"}`}>Türkçe {draftLanguage === "tr" && "✓"}</button><button type="button" onClick={() => setDraftLanguage("en")} className={`flex w-full justify-between py-2 text-lg ${draftLanguage === "en" ? "font-semibold text-vurgu" : "text-metin"}`}>English {draftLanguage === "en" && "✓"}</button></div></div>
                  <div className="pl-8"><h3 className="text-2xl font-bold text-vurgu">Para Birimleri</h3><div className="mt-4 border-t border-kenar pt-3"><button type="button" onClick={() => setDraftCurrency("TRY")} className={`flex w-full justify-between py-2 text-lg ${draftCurrency === "TRY" ? "font-semibold text-vurgu" : "text-metin"}`}>TRY {draftCurrency === "TRY" && "✓"}</button><button type="button" onClick={() => setDraftCurrency("USD")} className={`flex w-full justify-between py-2 text-lg ${draftCurrency === "USD" ? "font-semibold text-vurgu" : "text-metin"}`}>USD {draftCurrency === "USD" && "✓"}</button></div></div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-kenar pt-5"><button type="button" onClick={() => setLocalePanelOpen(false)} className="rounded-full border border-kenar bg-yuzey-gomulu px-5 py-3 text-base font-bold text-metin">Vazgeç</button><button type="button" onClick={() => { setSiteCurrency(draftCurrency); window.dispatchEvent(new CustomEvent("site-currency-change", { detail: draftCurrency })); setLocalePanelOpen(false); }} className="rounded-full bg-[#1834b8] px-5 py-3 text-base font-bold text-white">Kaydet</button></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
