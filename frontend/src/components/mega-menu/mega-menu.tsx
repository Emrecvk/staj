"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  ChevronDown,
  ChevronRight,
  Cpu,
  Layers,
  ToggleLeft,
  Cable,
  Zap,
  Activity,
  Radio,
  Monitor,
  Boxes,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Category } from "@/lib/api";
import {
  MEGA_MENU_DATA,
  getMergedCategories,
  type MegaMenuCategoryItem,
} from "./category-data";

interface MegaMenuProps {
  categories?: Category[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Layers,
  ToggleLeft,
  Cable,
  Zap,
  Activity,
  Radio,
  Monitor,
  Boxes,
  Wrench,
};

export function MegaMenu({ categories = [] }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number>(MEGA_MENU_DATA[0].id);

  const menuItems = getMergedCategories(categories);
  const activeCategory: MegaMenuCategoryItem =
    menuItems.find((c) => c.id === activeCategoryId) || menuItems[0];

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 150ms Hover Intent Handlers
  const handleCategoryMouseEnter = (id: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategoryId(id);
    }, 120);
  };

  const handleMenuContainerMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <div ref={containerRef} className="relative" onMouseLeave={handleMenuContainerMouseLeave}>
      {/* Mega Menu Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Tüm Kategoriler Menüsü"
        className={`flex items-center gap-2.5 px-5 py-2.5 font-bold text-sm uppercase tracking-wider transition-all select-none ${
          isOpen
            ? "bg-yuzey-gomulu text-metin-marka"
            : "bg-yuzey-kart text-metin hover:bg-yuzey-gomulu"
        }`}
      >
        <Menu size={18} className="stroke-[2.5]" />
        <span>Tüm Kategoriler</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* 3-Tier Mega Menu Flyout Panel */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-0 w-[1140px] xl:w-[1240px] max-w-[95vw] bg-yuzey-kart border border-kenar rounded-b-[var(--radius-panel)] shadow-[var(--shadow-katman)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-metin"
          role="region"
          aria-label="Kategori Gezinti Paneli"
        >
          <div className="grid grid-cols-12 min-h-[520px]">
            {/* LEVEL 1: Main Category Left Sidebar (3/12 cols) */}
            <div className="col-span-3 bg-yuzey border-r border-kenar py-2 overflow-y-auto max-h-[560px]">
              <div className="px-3 py-1.5 mb-1 text-[11px] font-bold tracking-wider uppercase text-metin-ucuncul">
                Ana Ürün Aileleri
              </div>
              <nav className="space-y-0.5" aria-label="Ana Kategoriler">
                {menuItems.map((cat) => {
                  const IconComponent = ICON_MAP[cat.ikonAdi] || Cpu;
                  const isActive = cat.id === activeCategory.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => handleCategoryMouseEnter(cat.id)}
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold rounded-l-none rounded-r-[var(--radius-girdi)] transition-all group ${
                        isActive
                          ? "bg-yuzey-kart text-vurgu font-bold shadow-sm border-l-4 border-vurgu"
                          : "text-metin hover:bg-yuzey-gomulu hover:text-vurgu"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComponent
                          size={16}
                          className={`shrink-0 ${
                            isActive
                              ? "text-vurgu"
                              : "text-metin-ucuncul group-hover:text-vurgu"
                          }`}
                        />
                        <span className="truncate">{cat.ad}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
                        <span className="text-[10px] font-mono text-metin-ucuncul tabular-nums hidden xl:inline">
                          {(cat.toplamUrun / 1000).toFixed(0)}k
                        </span>
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${
                            isActive
                              ? "text-vurgu translate-x-0.5"
                              : "text-metin-ucuncul group-hover:text-metin"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* LEVEL 2 & LEVEL 3: Subcategories Grid (6/12 cols) */}
            <div className="col-span-6 p-6 overflow-y-auto max-h-[560px] bg-yuzey-kart">
              {/* Category Breadcrumb & Header */}
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-kenar">
                <div>
                  <h3 className="text-lg font-bold text-metin-marka flex items-center gap-2">
                    {activeCategory.ad}
                  </h3>
                  <span className="text-xs text-metin-ikincil font-mono">
                    Toplam {activeCategory.toplamUrun.toLocaleString("tr-TR")} adet ürün ve parça
                  </span>
                </div>
                <Link
                  href={`/urunler?kategoriId=${activeCategory.id}`}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-vurgu hover:text-vurgu-guclu transition-colors"
                >
                  Kataloğu Aç <ArrowRight size={13} />
                </Link>
              </div>

              {/* Subcategories (Level 2) with Leaf Items (Level 3) */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                {activeCategory.altKategoriler.map((sub, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* Level 2 Subcategory Header */}
                    <Link
                      href={`/urunler?aramaMetni=${encodeURIComponent(sub.ad)}`}
                      onClick={() => setIsOpen(false)}
                      className="block font-bold text-xs text-metin-marka hover:text-vurgu pb-1 border-b border-kenar transition-colors group"
                    >
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                        {sub.ad}
                      </span>
                    </Link>

                    {/* Level 3 Leaf Items */}
                    <ul className="space-y-1.5">
                      {sub.yapraklar.map((leaf, leafIdx) => (
                        <li key={leafIdx}>
                          <Link
                            href={`/urunler?aramaMetni=${encodeURIComponent(leaf.ad)}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between text-xs text-metin-ikincil hover:text-vurgu transition-colors group py-0.5"
                          >
                            <span className="truncate group-hover:underline underline-offset-2">
                              {leaf.ad}
                            </span>
                            {leaf.urunSayisi && (
                              <span className="text-[10px] font-mono text-metin-ucuncul tabular-nums shrink-0 ml-1">
                                {leaf.urunSayisi.toLocaleString("tr-TR")}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL: Featured Brands & Promotional Callout (3/12 cols) */}
            <div className="col-span-3 bg-yuzey-gomulu border-l border-kenar p-5 flex flex-col justify-between overflow-y-auto max-h-[560px]">
              {/* Featured Brands Showcase */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <ShieldCheck size={14} className="text-vurgu" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                    Yetkili Distribütörlükler
                  </span>
                </div>

                <div className="space-y-2">
                  {activeCategory.oneCikanMarkalar.map((brand, idx) => (
                    <Link
                      key={idx}
                      href={`/urunler?aramaMetni=${encodeURIComponent(brand.ad)}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-[var(--radius-girdi)] bg-yuzey-kart border border-kenar hover:border-vurgu hover:bg-vurgu-zemin transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-navy-100 text-metin-marka font-bold text-[10px] font-mono flex items-center justify-center border border-navy-200">
                          {brand.logoMetin}
                        </div>
                        <span className="text-xs font-semibold text-metin-marka group-hover:text-vurgu">
                          {brand.ad}
                        </span>
                      </div>
                      <span className="text-[9px] bg-cyan-100 text-vurgu-guclu px-1.5 py-0.5 rounded font-bold uppercase">
                        Orijinal
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Promotional Spotlight Banner */}
              {activeCategory.banner ? (
                <div className="mt-5 p-4 rounded-[var(--radius-kart)] bg-marka text-white space-y-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    <Sparkles size={12} /> Öne Çıkan Seri
                  </div>
                  <h4 className="text-xs font-bold leading-snug">
                    {activeCategory.banner.baslik}
                  </h4>
                  <p className="text-[11px] text-navy-200 leading-relaxed">
                    {activeCategory.banner.aciklama}
                  </p>
                  <Link
                    href={activeCategory.banner.linkUrl}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white pt-1 transition-colors"
                  >
                    {activeCategory.banner.linkMetni} <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="mt-5 p-4 rounded-[var(--radius-kart)] bg-yuzey-kart border border-kenar text-center">
                  <span className="text-xs font-bold text-metin-marka block mb-1">
                    Hızlı BOM ve Teklif
                  </span>
                  <p className="text-[11px] text-metin-ikincil mb-3">
                    Proje listenizi Excel formatında yükleyin, anında teklif alın.
                  </p>
                  <Link
                    href="/bom"
                    onClick={() => setIsOpen(false)}
                    className="inline-block w-full py-1.5 px-3 rounded-[var(--radius-girdi)] bg-vurgu-dolgu text-metin-marka font-bold text-xs text-center hover:bg-opacity-90 transition-colors"
                  >
                    BOM Yükle
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar in Mega Menu Panel */}
          <div className="px-6 py-3 bg-yuzey-gomulu border-t border-kenar flex items-center justify-between text-xs text-metin-ikincil">
            <div className="flex items-center gap-6">
              <span>✓ %100 Orijinal Üretici Garantisi</span>
              <span className="hidden sm:inline">✓ Aynı Gün Stoktan Kargo</span>
              <span className="hidden md:inline">✓ Kurumsal Cari & Kredi Limiti</span>
            </div>
            <Link
              href="/urunler"
              onClick={() => setIsOpen(false)}
              className="font-bold text-vurgu hover:text-vurgu-guclu flex items-center gap-1"
            >
              Tüm Ürün Kataloğu <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
