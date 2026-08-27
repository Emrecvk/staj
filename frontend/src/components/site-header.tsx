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
import {
  getKategoriUrunSayilari,
  getKategoriler,
  getUreticiler,
  kategoriAgaciniDuzlestir,
  type Category,
  type UreticiOzet,
} from "@/lib/api";
import { MegaMenu } from "@/components/mega-menu/mega-menu";
import { SmartSearchCombobox } from "@/components/mega-menu/smart-search";
import { MobilMenu } from "@/components/mega-menu/mobil-menu";
import { useHeaderCart, useHeaderUser } from "@/lib/stores/header-state";
import { UrunGorseli } from "@/components/urun-gorseli";
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
  const displayCartTotal = cartTotal;
  const displayCartCur = paraBirimi;
  const [localePanelOpen, setLocalePanelOpen] = useState(false);
  const [cozumlerMenuOpen, setCozumlerMenuOpen] = useState(false);
  const [kurumsalMenuOpen, setKurumsalMenuOpen] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState("tr");
  const [draftCurrency, setDraftCurrency] = useState<"TRY" | "USD">(initialCurrency);
  const [menuKategorileri, setMenuKategorileri] = useState(categories);
  const [kategoriUrunSayilari, setKategoriUrunSayilari] = useState<Record<number, number>>({});
  const [menuUreticileri, setMenuUreticileri] = useState<UreticiOzet[]>([]);

  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const cozumlerRef = useRef<HTMLDivElement>(null);
  const kurumsalRef = useRef<HTMLDivElement>(null);
  const accountCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const ilkKategorilerRef = useRef(categories);

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
      if (cozumlerRef.current && !cozumlerRef.current.contains(e.target as Node)) {
        setCozumlerMenuOpen(false);
      }
      if (kurumsalRef.current && !kurumsalRef.current.contains(e.target as Node)) {
        setKurumsalMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Header her sayfada ayni gercek katalog verisini kullanir. Kategoriler sunucu
  // tarafindan prop olarak gelmediyse API'den tamamlanir; sayilar ve markalar da
  // tek kez cekilip masaustu, mobil ve arama bilesenleri arasinda paylasilir.
  useEffect(() => {
    let iptalEdildi = false;

    const menuVerisiniYukle = async () => {
      const ilkKategoriler = ilkKategorilerRef.current;
      const kategoriAgaci = ilkKategoriler.length > 0
        ? ilkKategoriler
        : await getKategoriler();

      if (iptalEdildi) return;
      setMenuKategorileri(kategoriAgaci);

      const [urunSayilari, ureticiler] = await Promise.all([
        getKategoriUrunSayilari(kategoriAgaciniDuzlestir(kategoriAgaci)),
        getUreticiler(),
      ]);

      if (iptalEdildi) return;
      setKategoriUrunSayilari(urunSayilari);
      setMenuUreticileri(ureticiler);
    };

    void menuVerisiniYukle();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-kenar bg-yuzey-kart shadow-token-hafif">
      {/* =========================================================================
          TIER 2: MAIN ACTION BAR (Logo, Smart Search Combobox & Action Center)
          ========================================================================= */}
      <div className="bg-marka">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left: Mobile Drawer Trigger + Brand Logo (daha görünür) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="lg:hidden">
                <MobilMenu
                  categories={menuKategorileri}
                  urunSayilari={kategoriUrunSayilari}
                />
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
              <SmartSearchCombobox
                categories={menuKategorileri}
                urunSayilari={kategoriUrunSayilari}
                ureticiler={menuUreticileri}
              />
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
                <div className="flex min-h-11 items-center gap-2.5 text-white/80">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="group flex min-h-11 min-w-11 items-center justify-center outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300 xl:min-w-0"
                    aria-expanded={accountMenuOpen}
                    aria-label={isLoggedIn ? `${user?.ad || "Hesabım"} hesap menüsü` : "Hesap menüsünü aç"}
                  >
                    <UserRound
                      size={25}
                      className="group-hover:scale-105 transition-transform"
                      aria-hidden="true"
                    />
                  </button>
                  <div className="hidden min-w-0 text-left leading-tight xl:block">
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex min-h-5 items-center gap-1.5 text-white/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300"
                      aria-expanded={accountMenuOpen}
                    >
                      <span className="max-w-[110px] truncate text-sm font-semibold">
                        {user?.ad ? user.ad : "Hesabım"}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-white/60 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {!isLoggedIn && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
                        <Link
                          href="/giris"
                          onClick={() => setAccountMenuOpen(false)}
                          className="rounded-sm text-white/65 outline-none transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-300"
                        >
                          Giriş Yap
                        </Link>
                        <span className="text-white/30" aria-hidden="true">/</span>
                        <Link
                          href="/kayit"
                          onClick={() => setAccountMenuOpen(false)}
                          className="rounded-sm text-white/65 outline-none transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-300"
                        >
                          Kayıt Ol
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {accountMenuOpen && (
                  <div
                    className={`absolute right-0 top-full mt-3 bg-yuzey-kart border border-kenar rounded-token-kart shadow-token-katman z-50 p-2 text-metin animate-in fade-in duration-150 ${isLoggedIn ? "w-64" : "w-[560px] max-w-[calc(100vw-2rem)]"}`}
                  >
                    <span
                      className="absolute -top-2 right-16 h-4 w-4 rotate-45 border-l border-t border-kenar bg-yuzey-kart"
                      aria-hidden="true"
                    />
                    {isLoggedIn ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-yuzey-gomulu rounded-token-girdi border border-kenar">
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
                            className="block w-full rounded-token-girdi bg-vurgu-dolgu px-4 py-2.5 text-center text-sm font-bold text-metin-marka transition-colors hover:bg-cyan-400"
                          >
                            Giriş Yap
                          </Link>
                          <Link
                            href="/kayit"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block w-full rounded-token-girdi bg-marka px-4 py-2.5 text-center text-sm font-bold text-dolgu-uzeri transition-colors hover:bg-marka-hover"
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
                <Link
                  href="/sepet"
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-vurgu text-white outline-none transition-colors hover:bg-vurgu-guclu focus-visible:ring-2 focus-visible:ring-cyan-300"
                  aria-label={`Sepeti aç, ${cartCount} ürün`}
                >
                  <div className="relative">
                    <ShoppingCart
                      size={22}
                      className="group-hover:scale-105 transition-transform"
                      aria-hidden="true"
                    />
                    <span className="absolute -top-2 -right-2 bg-vurgu-dolgu text-metin-marka text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono tabular-nums shadow-xs">
                      {cartCount}
                    </span>
                  </div>
                </Link>

                {/* Mini-Cart Preview Popover */}
                {cartPreviewOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-yuzey-kart border border-kenar rounded-token-kart shadow-token-katman z-50 p-4 text-metin animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-kenar">
                      <span className="text-xs font-bold text-metin-marka uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingCart size={15} className="text-vurgu" /> Sepet
                        Özeti ({cartCount} Ürün)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCartPreviewOpen(false)}
                        className="flex h-11 w-11 items-center justify-center text-metin-ucuncul hover:text-metin"
                        aria-label="Sepet özetini kapat"
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
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-kenar bg-yuzey-gomulu">
                                <UrunGorseli src={item.anaGorselUrl} urunKodu={item.mpn} className="p-1 [&>span]:hidden [&>svg]:h-4 [&>svg]:w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-mono font-bold text-metin-marka truncate">
                                  {item.mpn}
                                </div>
                                <div className="text-[11px] text-metin-ikincil truncate">
                                  {item.miktar} Adet · {item.baslik}
                                </div>
                              </div>
                              <div className="font-mono font-bold text-right shrink-0">
                                {new Intl.NumberFormat("tr-TR", { style: "currency", currency: item.paraBirimi }).format(item.toplamFiyat)}
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
                            className="py-2 px-3 text-center text-xs font-bold border border-marka text-metin-marka rounded-token-girdi hover:bg-yuzey-gomulu transition-colors"
                          >
                            Sepete Git
                          </Link>
                          <Link
                            href="/odeme"
                            onClick={() => setCartPreviewOpen(false)}
                            className="py-2 px-3 text-center text-xs font-bold bg-vurgu-dolgu text-metin-marka rounded-token-girdi hover:bg-cyan-400 transition-colors"
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
            <SmartSearchCombobox
              categories={menuKategorileri}
              urunSayilari={kategoriUrunSayilari}
              ureticiler={menuUreticileri}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          TIER 3: ALT NAVİGASYON & MEGA MENÜ — beyaz zemin (koyu bg-marka değil)
          ========================================================================= */}
      <div className="hidden border-t border-kenar bg-yuzey-kart md:block">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4">
          <div className="justify-self-start">
            <MegaMenu
              categories={menuKategorileri}
            />
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
              href="/markalar"
              className="px-6 py-3 text-sm font-semibold text-metin transition-colors hover:text-vurgu"
            >
              Üreticiler
            </Link>
            <div
              ref={cozumlerRef}
              className="relative"
              onMouseEnter={() => setCozumlerMenuOpen(true)}
              onMouseLeave={() => setCozumlerMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCozumlerMenuOpen((open) => !open)}
                aria-expanded={cozumlerMenuOpen}
                className="flex items-center gap-1 px-6 py-3 text-sm font-semibold text-metin transition-colors hover:text-vurgu"
              >
                Çözümler
                <ChevronDown size={16} className={cozumlerMenuOpen ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden="true" />
              </button>
              {cozumlerMenuOpen && (
                <div className="absolute left-1/2 top-full z-50 w-[310px] -translate-x-1/2 rounded-token-panel border border-kenar bg-yuzey-kart p-1.5 shadow-token-katman">
                  {[
                    ["Elektronik Komponent Distribütörlüğü", "elektronik-komponent-distributorlugu"],
                    ["FAE ve Ar-Ge Desteği", "fae-ve-arge-destegi"],
                    ["Soğutucu Üretimi", "sogutucu-uretimi"],
                    ["LED Aydınlatma Çözümleri", "led-aydinlatma-cozumleri"],
                  ].map(([ad, slug]) => (
                    <Link key={slug} href={`/cozumler/${slug}`} onClick={() => setCozumlerMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-metin transition-colors hover:bg-vurgu-zemin hover:text-vurgu">
                      {ad}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div ref={kurumsalRef} className="relative" onMouseEnter={() => setKurumsalMenuOpen(true)} onMouseLeave={() => setKurumsalMenuOpen(false)}>
              <button type="button" onClick={() => setKurumsalMenuOpen((open) => !open)} aria-expanded={kurumsalMenuOpen} className="flex items-center gap-1 px-6 py-3 text-sm font-semibold text-metin transition-colors hover:text-vurgu">
                Kurumsal <ChevronDown size={16} className={kurumsalMenuOpen ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden="true" />
              </button>
              {kurumsalMenuOpen && <div className="absolute left-1/2 top-full z-50 w-[310px] -translate-x-1/2 rounded-token-panel border border-kenar bg-yuzey-kart p-1.5 shadow-token-katman">
                <Link href="/hakkimizda" onClick={() => setKurumsalMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-metin transition-colors hover:bg-vurgu-zemin hover:text-vurgu">Hakkımızda</Link>
                <Link href="/sozlesmeler/ozdisan-elektronik-kvkk-politikasi" onClick={() => setKurumsalMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-metin transition-colors hover:bg-vurgu-zemin hover:text-vurgu">KVKK Politikası</Link>
              </div>}
            </div>
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
              <div className="absolute right-0 top-full z-50 mt-2 w-[560px] rounded-token-panel border border-kenar bg-yuzey-kart p-7 shadow-token-katman">
                <div className="grid grid-cols-2 divide-x divide-kenar">
                  <div className="pr-8"><h3 className="text-2xl font-bold text-vurgu">Diller</h3><div className="mt-4 border-t border-kenar pt-3"><button type="button" onClick={() => setDraftLanguage("tr")} className={`flex w-full justify-between py-2 text-lg ${draftLanguage === "tr" ? "font-semibold text-vurgu" : "text-metin"}`}>Türkçe {draftLanguage === "tr" && "✓"}</button><button type="button" onClick={() => setDraftLanguage("en")} className={`flex w-full justify-between py-2 text-lg ${draftLanguage === "en" ? "font-semibold text-vurgu" : "text-metin"}`}>English {draftLanguage === "en" && "✓"}</button></div></div>
                  <div className="pl-8"><h3 className="text-2xl font-bold text-vurgu">Para Birimleri</h3><div className="mt-4 border-t border-kenar pt-3"><button type="button" onClick={() => setDraftCurrency("TRY")} className={`flex w-full justify-between py-2 text-lg ${draftCurrency === "TRY" ? "font-semibold text-vurgu" : "text-metin"}`}>TRY {draftCurrency === "TRY" && "✓"}</button><button type="button" onClick={() => setDraftCurrency("USD")} className={`flex w-full justify-between py-2 text-lg ${draftCurrency === "USD" ? "font-semibold text-vurgu" : "text-metin"}`}>USD {draftCurrency === "USD" && "✓"}</button></div></div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-kenar pt-5"><button type="button" onClick={() => setLocalePanelOpen(false)} className="rounded-full border border-kenar bg-yuzey-gomulu px-5 py-3 text-base font-bold text-metin">Vazgeç</button><button type="button" onClick={() => { document.cookie = `site_para_birimi=${draftCurrency}; Path=/; Max-Age=31536000; SameSite=Lax`; setSiteCurrency(draftCurrency); setLocalePanelOpen(false); window.location.reload(); }} className="rounded-full bg-vurgu px-5 py-3 text-base font-bold text-white transition-colors hover:bg-vurgu-guclu">Kaydet</button></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
