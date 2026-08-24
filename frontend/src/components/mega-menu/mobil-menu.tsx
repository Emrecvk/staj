"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  Search,
  FileText,
  Heart,
  ShoppingCart,
  Phone,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Cpu,
  ToggleLeft,
  Cable,
  Zap,
  Activity,
  Radio,
  Monitor,
  Boxes,
  Wrench,
} from "lucide-react";
import { Drawer } from "vaul";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/api";
import {
  getMergedCategories,
  type MegaMenuCategoryItem,
} from "./category-data";

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

interface MobilMenuProps {
  categories?: Category[];
}

export function MobilMenu({ categories = [] }: MobilMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MegaMenuCategoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = getMergedCategories(categories);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleClose();
      router.push(`/urunler?aramaMetni=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSelectedCategory(null);
      }}
      direction="left"
    >
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label="Menüyü Aç"
          className="p-2 text-metin hover:text-vurgu rounded-[var(--radius-girdi)] transition-colors"
        >
          <Menu size={24} />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs" />
        <Drawer.Content
          className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col bg-yuzey-kart border-r border-kenar outline-none text-metin shadow-2xl"
        >
          {/* Mobile Drawer Header */}
          <div className="p-4 bg-marka text-white flex items-center justify-between border-b border-navy-700">
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> Ana Kategoriler
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">ÇEVİK ELEKTRONİK</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Menüyü Kapat"
              className="p-1 rounded text-navy-300 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Mobile Search */}
          <div className="p-3 bg-yuzey-gomulu border-b border-kenar">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Komponent veya parça ara..."
                className="w-full h-9 pl-3 pr-8 rounded-[var(--radius-girdi)] bg-yuzey-kart border border-kenar text-xs text-metin placeholder:text-metin-ucuncul outline-none focus:border-vurgu"
              />
              <button
                type="submit"
                aria-label="Ara"
                className="absolute right-2 text-metin-ucuncul hover:text-vurgu"
              >
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Scrollable Navigation Body */}
          <div className="flex-grow overflow-y-auto overscroll-contain">
            {selectedCategory ? (
              /* LEVEL 2 & 3: Selected Category Drill-down */
              <div className="p-4 space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-kenar flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-metin-marka">{selectedCategory.ad}</h3>
                    <span className="text-xs text-metin-ikincil font-mono">
                      {selectedCategory.toplamUrun.toLocaleString("tr-TR")} Ürün
                    </span>
                  </div>
                  <Link
                    href={`/urunler?kategoriId=${selectedCategory.id}`}
                    onClick={handleClose}
                    className="text-xs font-bold text-vurgu hover:underline flex items-center gap-1"
                  >
                    Tümünü Gör <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Subcategories */}
                <div className="space-y-4">
                  {selectedCategory.altKategoriler.map((sub, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <Link
                        href={`/urunler?aramaMetni=${encodeURIComponent(sub.ad)}`}
                        onClick={handleClose}
                        className="block font-bold text-xs text-metin-marka hover:text-vurgu py-1 border-b border-kenar"
                      >
                        {sub.ad}
                      </Link>
                      <ul className="pl-2 space-y-1 pt-1">
                        {sub.yapraklar.map((leaf, leafIdx) => (
                          <li key={leafIdx}>
                            <Link
                              href={`/urunler?aramaMetni=${encodeURIComponent(leaf.ad)}`}
                              onClick={handleClose}
                              className="flex items-center justify-between py-1 text-xs text-metin-ikincil hover:text-vurgu"
                            >
                              <span>{leaf.ad}</span>
                              {leaf.urunSayisi && (
                                <span className="text-[10px] font-mono text-metin-ucuncul">
                                  {leaf.urunSayisi}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured Brands for Category */}
                {selectedCategory.oneCikanMarkalar.length > 0 && (
                  <div className="pt-3 border-t border-kenar space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul flex items-center gap-1">
                      <ShieldCheck size={12} className="text-vurgu" /> Yetkili Markalar
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCategory.oneCikanMarkalar.map((b, i) => (
                        <Link
                          key={i}
                          href={`/urunler?aramaMetni=${encodeURIComponent(b.ad)}`}
                          onClick={handleClose}
                          className="px-2 py-1 bg-yuzey-gomulu rounded text-xs font-semibold text-metin-marka border border-kenar"
                        >
                          {b.ad}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LEVEL 1: Root Categories & Quick Navigation */
              <div className="p-3 space-y-4">
                {/* Categories List */}
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                    Ürün Kategorileri
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {menuItems.map((cat) => {
                      const IconComponent = ICON_MAP[cat.ikonAdi] || Cpu;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className="w-full flex items-center justify-between p-2.5 rounded-[var(--radius-girdi)] hover:bg-yuzey-gomulu text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComponent size={17} className="text-vurgu" />
                            <span className="text-xs font-bold text-metin group-hover:text-vurgu">
                              {cat.ad}
                            </span>
                          </div>
                          <ChevronRight size={14} className="text-metin-ucuncul group-hover:text-vurgu" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* B2B Services & Quick Shortcuts */}
                <div className="pt-3 border-t border-kenar">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                    B2B Hızlı İşlemler
                  </div>
                  <div className="space-y-1 mt-1">
                    <Link
                      href="/bom"
                      onClick={handleClose}
                      className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-girdi)] text-xs font-semibold text-metin-marka hover:bg-vurgu-zemin transition-colors"
                    >
                      <FileText size={16} className="text-vurgu" /> BOM Yükle (Excel/CSV)
                    </Link>
                    <Link
                      href="/teklif-iste"
                      onClick={handleClose}
                      className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-girdi)] text-xs font-semibold text-metin-marka hover:bg-vurgu-zemin transition-colors"
                    >
                      <Building2 size={16} className="text-vurgu" /> Resmi Teklif Talebi (RFQ)
                    </Link>
                    <Link
                      href="/karsilastirma"
                      onClick={handleClose}
                      className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-girdi)] text-xs font-semibold text-metin-marka hover:bg-vurgu-zemin transition-colors"
                    >
                      <Layers size={16} className="text-vurgu" /> Ürün Karşılaştırma
                    </Link>
                  </div>
                </div>

                {/* Corporate Links */}
                <div className="pt-3 border-t border-kenar">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                    Kurumsal
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1 px-2 text-xs text-metin-ikincil">
                    <Link href="/hakkimizda" onClick={handleClose} className="hover:text-vurgu">Hakkımızda</Link>
                    <Link href="/iletisim" onClick={handleClose} className="hover:text-vurgu">İletişim</Link>
                    <Link href="/kayit/kurumsal" onClick={handleClose} className="hover:text-vurgu">Kurumsal Üyelik</Link>
                    <Link href="/sss" onClick={handleClose} className="hover:text-vurgu">S.S.S.</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Drawer Footer */}
          <div className="p-4 bg-yuzey-gomulu border-t border-kenar text-xs space-y-2">
            <div className="flex items-center justify-between text-metin-ikincil">
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-vurgu" /> 0850 304 44 00
              </span>
              <span className="font-mono font-bold text-metin-marka">TR · USD</span>
            </div>
            <div className="text-[11px] text-metin-ucuncul">
              Hafta içi 08:30 – 18:00 Müşteri Desteği
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
