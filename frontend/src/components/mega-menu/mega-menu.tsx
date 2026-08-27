"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  ChevronRight,
  Cpu,
  Layers,
  Lightbulb,
  Menu,
  ToggleRight,
  type LucideIcon,
} from "lucide-react";
import { VITRIN_KATEGORI_AGACI } from "@/components/home/vitrin-kategori-verisi";
import { kategoriBaglantisiniKur } from "@/lib/kategori-baglantisi";
import type { Category } from "@/lib/api";

interface MegaMenuProps {
  categories?: Category[];
}

const KATEGORI_IKONLARI: LucideIcon[] = [
  Cpu,
  Lightbulb,
  Layers,
  ToggleRight,
  Boxes,
];

export function MegaMenu({ categories = [] }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [aktifKategori, setAktifKategori] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kategori = VITRIN_KATEGORI_AGACI[aktifKategori] ?? VITRIN_KATEGORI_AGACI[0];

  useEffect(() => {
    const disariTiklamayiKapat = (olay: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(olay.target as Node)) {
        setIsOpen(false);
      }
    };
    const escapeIleKapat = (olay: KeyboardEvent) => {
      if (olay.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", disariTiklamayiKapat);
    window.addEventListener("keydown", escapeIleKapat);
    return () => {
      document.removeEventListener("mousedown", disariTiklamayiKapat);
      window.removeEventListener("keydown", escapeIleKapat);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const kategoriUzerineGel = (index: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setAktifKategori(index), 120);
  };

  const baglanti = (ad: string) => kategoriBaglantisiniKur(categories, ad);
  const menuyuKapat = () => setIsOpen(false);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseLeave={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((acik) => !acik)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Tüm kategoriler menüsü"
        className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all select-none ${
          isOpen
            ? "bg-yuzey-gomulu text-metin-marka"
            : "bg-yuzey-kart text-metin hover:bg-yuzey-gomulu"
        }`}
      >
        <Menu size={18} className="stroke-[2.5]" aria-hidden="true" />
        <span>Tüm Kategoriler</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && kategori && (
        <div
          className="absolute left-0 top-full z-50 w-[920px] max-w-[95vw] overflow-hidden rounded-b-[var(--radius-panel)] border border-kenar bg-yuzey-kart text-metin shadow-token-katman animate-in fade-in slide-in-from-top-1 duration-150 xl:w-[980px]"
          role="region"
          aria-label="Kategori gezinme paneli"
        >
          <div className="grid min-h-[300px] grid-cols-12">
            <div className="col-span-4 max-h-[560px] overflow-y-auto border-r border-kenar bg-yuzey py-2">
              <div className="mb-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul">
                Ana Ürün Aileleri
              </div>
              <nav className="space-y-0.5" aria-label="Ana kategoriler">
                {VITRIN_KATEGORI_AGACI.map((dal, index) => {
                  const Icon = KATEGORI_IKONLARI[index] ?? Boxes;
                  const aktif = index === aktifKategori;
                  return (
                    <Link
                      key={dal.ad}
                      href={baglanti(dal.ad)}
                      onMouseEnter={() => kategoriUzerineGel(index)}
                      onClick={menuyuKapat}
                      className={`group flex w-full items-center justify-between rounded-r-[var(--radius-girdi)] px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                        aktif
                          ? "border-l-4 border-vurgu bg-yuzey-kart font-bold text-vurgu shadow-sm"
                          : "text-metin hover:bg-yuzey-gomulu hover:text-vurgu"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          size={16}
                          className={aktif ? "shrink-0 text-vurgu" : "shrink-0 text-metin-ucuncul group-hover:text-vurgu"}
                          aria-hidden="true"
                        />
                        <span>{dal.ad}</span>
                      </span>
                      <ChevronRight size={14} aria-hidden="true" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="col-span-8 max-h-[560px] overflow-y-auto bg-yuzey-kart p-6">
              <div className="mb-5 flex items-center justify-between border-b border-kenar pb-3">
                <h3 className="text-lg font-bold text-metin-marka">{kategori.ad}</h3>
                <Link
                  href={baglanti(kategori.ad)}
                  onClick={menuyuKapat}
                  className="inline-flex items-center gap-1 text-xs font-bold text-vurgu transition-colors hover:text-vurgu-guclu"
                >
                  Kataloğu Aç <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {kategori.altlar.map((altKategori) => (
                  <Link
                    key={altKategori.ad}
                    href={baglanti(altKategori.ad)}
                    onClick={menuyuKapat}
                    className="group flex items-center justify-between border-b border-kenar/70 py-2.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-vurgu"
                  >
                    <span className="min-w-0 pr-3 font-semibold group-hover:underline group-hover:underline-offset-2">
                      {altKategori.ad}
                    </span>
                    {altKategori.altlar.length > 0 && <ChevronRight size={14} aria-hidden="true" />}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
