"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronRight,
  Layers,
  Menu,
  Phone,
  Search,
  X,
} from "lucide-react";
import { Drawer } from "vaul";
import { kategoriIkonunuGetir } from "@/components/kategori-ikonlari";
import type { Category } from "@/lib/api";

interface MobilMenuProps {
  categories?: Category[];
  urunSayilari?: Record<number, number>;
}

function kategoriUrl(kategori: Category) {
  return `/urunler?kategoriId=${kategori.id}`;
}

export function MobilMenu({
  categories = [],
  urunSayilari = {},
}: MobilMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const siraliKategoriler = useMemo(
    () => [...categories].sort((a, b) => a.sira - b.sira),
    [categories],
  );
  const selectedCategory =
    siraliKategoriler.find((kategori) => kategori.id === selectedCategoryId) ?? null;
  const handleClose = () => {
    setIsOpen(false);
    setSelectedCategoryId(null);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const aramaMetni = searchQuery.trim();
    if (!aramaMetni) return;

    handleClose();
    router.push(`/urunler?aramaMetni=${encodeURIComponent(aramaMetni)}`);
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSelectedCategoryId(null);
      }}
      direction="left"
    >
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label="Menüyü aç"
          className="rounded-token-girdi p-2 text-metin transition-colors hover:text-vurgu"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs" />
        <Drawer.Content className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col border-r border-kenar bg-yuzey-kart text-metin shadow-2xl outline-none">
          <Drawer.Title className="sr-only">Ürün kategorileri ve site menüsü</Drawer.Title>

          <div className="flex items-center justify-between border-b border-navy-700 bg-marka p-4 text-white">
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 transition-colors hover:text-white"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Ana Kategoriler
              </button>
            ) : (
              <span className="text-sm font-bold tracking-wide">ÇEVİK ELEKTRONİK</span>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Menüyü kapat"
              className="rounded p-1 text-navy-300 transition-colors hover:text-white"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="border-b border-kenar bg-yuzey-gomulu p-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Komponent veya parça ara..."
                aria-label="Komponent veya parça ara"
                className="h-9 w-full rounded-token-girdi border border-kenar bg-yuzey-kart pl-3 pr-8 text-xs text-metin outline-none placeholder:text-metin-ucuncul focus:border-vurgu"
              />
              <button
                type="submit"
                aria-label="Ara"
                className="absolute right-2 text-metin-ucuncul hover:text-vurgu"
              >
                <Search size={14} aria-hidden="true" />
              </button>
            </form>
          </div>

          <div className="flex-grow overflow-y-auto overscroll-contain">
            {selectedCategory ? (
              <div className="space-y-5 p-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-kenar pb-3">
                  <div>
                    <h3 className="text-base font-bold text-metin-marka">{selectedCategory.ad}</h3>
                    {typeof urunSayilari[selectedCategory.id] === "number" && (
                      <span className="font-mono text-xs text-metin-ikincil">
                        {urunSayilari[selectedCategory.id].toLocaleString("tr-TR")} ürün
                      </span>
                    )}
                  </div>
                  <Link
                    href={kategoriUrl(selectedCategory)}
                    onClick={handleClose}
                    className="flex items-center gap-1 text-xs font-bold text-vurgu hover:underline"
                  >
                    Tümünü Gör <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </div>

                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                    Alt Kategoriler
                  </div>
                  <div className="divide-y divide-kenar">
                    {selectedCategory.altKategoriler.map((altKategori) => (
                      <Link
                        key={altKategori.id}
                        href={kategoriUrl(altKategori)}
                        onClick={handleClose}
                        className="flex items-center justify-between py-2.5 text-xs text-metin-ikincil transition-colors hover:text-vurgu"
                      >
                        <span className="pr-3 font-semibold">{altKategori.ad}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          {typeof urunSayilari[altKategori.id] === "number" && (
                            <span className="font-mono text-[10px] tabular-nums text-metin-ucuncul">
                              {urunSayilari[altKategori.id].toLocaleString("tr-TR")}
                            </span>
                          )}
                          <ChevronRight size={13} aria-hidden="true" />
                        </span>
                      </Link>
                    ))}
                    {selectedCategory.altKategoriler.length === 0 && (
                      <p className="py-3 text-xs text-metin-ikincil">
                        Bu kategori doğrudan ürünlere bağlanıyor.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4 p-3">
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                    Ürün Kategorileri
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {siraliKategoriler.map((kategori) => {
                      const Icon = kategoriIkonunuGetir(kategori.slug);
                      return (
                        <button
                          key={kategori.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(kategori.id)}
                          className="group flex w-full items-center justify-between rounded-token-girdi p-2.5 text-left transition-colors hover:bg-yuzey-gomulu"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <Icon size={17} className="shrink-0 text-vurgu" aria-hidden="true" />
                            <span className="truncate text-xs font-bold text-metin group-hover:text-vurgu">
                              {kategori.ad}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {typeof urunSayilari[kategori.id] === "number" && (
                              <span className="font-mono text-[10px] tabular-nums text-metin-ucuncul">
                                {urunSayilari[kategori.id].toLocaleString("tr-TR")}
                              </span>
                            )}
                            <ChevronRight size={14} className="text-metin-ucuncul group-hover:text-vurgu" aria-hidden="true" />
                          </span>
                        </button>
                      );
                    })}
                    {siraliKategoriler.length === 0 && (
                      <p className="px-2 py-3 text-xs text-metin-ikincil">
                        Kategori verisi şu anda alınamıyor.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-kenar pt-3">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                    B2B Hızlı İşlemler
                  </div>
                  <div className="mt-1 space-y-1">
                    <Link href="/teklif-iste" onClick={handleClose} className="flex items-center gap-2.5 rounded-token-girdi p-2.5 text-xs font-semibold text-metin-marka transition-colors hover:bg-vurgu-zemin">
                      <Building2 size={16} className="text-vurgu" aria-hidden="true" /> Resmi Teklif Talebi (RFQ)
                    </Link>
                    <Link href="/karsilastirma" onClick={handleClose} className="flex items-center gap-2.5 rounded-token-girdi p-2.5 text-xs font-semibold text-metin-marka transition-colors hover:bg-vurgu-zemin">
                      <Layers size={16} className="text-vurgu" aria-hidden="true" /> Ürün Karşılaştırma
                    </Link>
                  </div>
                </div>

                <div className="border-t border-kenar pt-3">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">Kurumsal</div>
                  <div className="mt-1 grid grid-cols-2 gap-2 px-2 text-xs text-metin-ikincil">
                    <Link href="/hakkimizda" onClick={handleClose} className="hover:text-vurgu">Hakkımızda</Link>
                    <a href="mailto:destek@cevik.com.tr" onClick={handleClose} className="hover:text-vurgu">İletişim</a>
                    <Link href="/kayit/kurumsal" onClick={handleClose} className="hover:text-vurgu">Kurumsal Üyelik</Link>
                    <Link href="/sss" onClick={handleClose} className="hover:text-vurgu">S.S.S.</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-kenar bg-yuzey-gomulu p-4 text-xs">
            <div className="flex items-center justify-between text-metin-ikincil">
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-vurgu" aria-hidden="true" /> 0850 304 44 00
              </span>
              <span className="font-mono font-bold text-metin-marka">TR · USD</span>
            </div>
            <div className="text-[11px] text-metin-ucuncul">Hafta içi 08:30 – 18:00 Müşteri Desteği</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
