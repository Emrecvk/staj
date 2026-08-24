"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  Loader2,
  ChevronDown,
  Cpu,
  Layers,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Category } from "@/lib/api";
import { getMergedCategories } from "./category-data";

interface SmartSearchProps {
  categories?: Category[];
  className?: string;
}

interface ProductSuggestion {
  id: number;
  ureticiUrunKodu: string;
  ureticiAd: string;
  kisaAciklama: string;
  anaGorselUrl: string | null;
  toplamStok: number;
  baslangicFiyati: number;
  paraBirimi: string;
}

interface CategorySuggestion {
  ad: string;
  path: string;
  url: string;
  id?: number;
}

interface BrandSuggestion {
  ad: string;
  logoMetin?: string;
  yetkiliDistribitor: boolean;
}

const POPULER_ONERILER = ["STM32", "LM358", "ESP32", "1N4148", "NE555", "100nF MLCC"];

export function SmartSearchCombobox({ categories = [], className = "" }: SmartSearchProps) {
  const router = useRouter();
  const menuData = getMergedCategories(categories);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("tum");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Global shortcut Ctrl+K or / to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA")) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform multi-group search
  const performSearch = async (searchTerm: string, catId: string) => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (trimmed.length < 2) {
      setProductSuggestions([]);
      setCategorySuggestions([]);
      setBrandSuggestions([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 1. Local fast search in taxonomy (Categories & Brands)
    const matchingCats: CategorySuggestion[] = [];
    const matchingBrands: BrandSuggestion[] = [];
    const seenBrands = new Set<string>();

    menuData.forEach((mainCat) => {
      if (catId !== "tum" && String(mainCat.id) !== catId) {
        return;
      }

      // Check main category
      if (mainCat.ad.toLowerCase().includes(trimmed)) {
        matchingCats.push({
          ad: mainCat.ad,
          path: mainCat.ad,
          url: `/urunler?kategoriId=${mainCat.id}`,
          id: mainCat.id,
        });
      }

      // Check subcategories & leaves
      mainCat.altKategoriler.forEach((sub) => {
        if (sub.ad.toLowerCase().includes(trimmed)) {
          matchingCats.push({
            ad: sub.ad,
            path: `${mainCat.ad} > ${sub.ad}`,
            url: `/urunler?aramaMetni=${encodeURIComponent(sub.ad)}`,
          });
        }
        sub.yapraklar.forEach((leaf) => {
          if (leaf.ad.toLowerCase().includes(trimmed)) {
            matchingCats.push({
              ad: leaf.ad,
              path: `${mainCat.ad} > ${sub.ad} > ${leaf.ad}`,
              url: `/urunler?aramaMetni=${encodeURIComponent(leaf.ad)}`,
            });
          }
        });
      });

      // Check brands
      mainCat.oneCikanMarkalar.forEach((brand) => {
        if (brand.ad.toLowerCase().includes(trimmed) && !seenBrands.has(brand.ad.toLowerCase())) {
          seenBrands.add(brand.ad.toLowerCase());
          matchingBrands.push(brand);
        }
      });
    });

    setCategorySuggestions(matchingCats.slice(0, 4));
    setBrandSuggestions(matchingBrands.slice(0, 4));

    // 2. Fetch products from API
    try {
      const params = new URLSearchParams({
        aramaMetni: trimmed,
        sayfaBoyutu: "5",
      });
      if (catId !== "tum") {
        params.set("kategoriId", catId);
      }

      const res = await fetch(`/api/Katalog/urunler?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const records: ProductSuggestion[] = data.urunler?.kayitlar || [];
        setProductSuggestions(records);
        setTotalCount(data.urunler?.toplamKayit || records.length);
      } else {
        // API hata donduyse sahte urun UYDURULMAZ; bos sonuc gosterilir.
        setProductSuggestions([]);
        setTotalCount(0);
      }
    } catch {
      // Fallback graceful
      setProductSuggestions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length >= 2) {
      setIsOpen(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        performSearch(value, selectedCategory);
      }, 250);
    } else {
      setIsOpen(false);
      setProductSuggestions([]);
      setCategorySuggestions([]);
      setBrandSuggestions([]);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setSelectedCategory(newCat);
    if (query.trim().length >= 2) {
      performSearch(query, newCat);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("aramaMetni", query.trim());
    if (selectedCategory !== "tum") params.set("kategoriId", selectedCategory);
    router.push(`/urunler?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectPopularTerm = (term: string) => {
    setQuery(term);
    setIsOpen(true);
    performSearch(term, selectedCategory);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setProductSuggestions([]);
    setCategorySuggestions([]);
    setBrandSuggestions([]);
    inputRef.current?.focus();
  };

  const hasSuggestions =
    productSuggestions.length > 0 ||
    categorySuggestions.length > 0 ||
    brandSuggestions.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleFormSubmit}
        className="flex items-center w-full bg-yuzey-kart border-2 border-marka rounded-[var(--radius-girdi)] overflow-hidden shadow-[var(--shadow-hafif)] focus-within:border-vurgu focus-within:ring-2 focus-within:ring-vurgu/20 transition-all"
        role="search"
      >
        {/* Category Prefix Dropdown */}
        <div className="relative shrink-0 hidden sm:flex items-center border-r border-kenar bg-yuzey-gomulu">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            aria-label="Kategori Seç"
            className="h-10 pl-3 pr-7 bg-transparent text-xs font-semibold text-metin appearance-none cursor-pointer outline-none hover:text-vurgu transition-colors"
          >
            <option value="tum">Tüm Kategoriler</option>
            {menuData.map((cat, idx) => (
              <option key={`${cat.id}-${idx}`} value={cat.id}>
                {cat.ad}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 text-metin-ucuncul"
          />
        </div>

        {/* Search Input Field */}
        <div className="relative flex-grow flex items-center">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="MPN, üretici parça kodu, entegre veya kategori ara..."
            aria-label="Akıllı Ürün ve Parça Arama"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="search-suggestions-list"
            className="w-full h-10 px-3.5 text-sm font-sans text-metin placeholder:text-metin-ucuncul outline-none bg-transparent"
          />

          {/* Quick Clear or Loading Spinner */}
          {isLoading ? (
            <div className="px-2 text-vurgu">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : query ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Aramayı temizle"
              className="p-1.5 mr-1 text-metin-ucuncul hover:text-metin rounded-full transition-colors"
            >
              <X size={15} />
            </button>
          ) : (
            <div className="hidden lg:flex items-center mr-2 px-1.5 py-0.5 rounded border border-kenar-guclu bg-yuzey-gomulu text-[10px] font-mono text-metin-ucuncul">
              Ctrl+K
            </div>
          )}
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          aria-label="Ara"
          className="h-10 px-4 bg-marka hover:bg-marka-hover text-dolgu-uzeri font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Search size={17} />
          <span className="hidden md:inline text-xs font-semibold">Ara</span>
        </button>
      </form>

      {/* Autocomplete Dropdown Overlay */}
      {isOpen && (
        <div
          id="search-suggestions-list"
          className="absolute left-0 right-0 top-full mt-1.5 bg-yuzey-kart border border-kenar rounded-[var(--radius-kart)] shadow-[var(--shadow-katman)] z-50 overflow-hidden text-metin animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
        >
          {isLoading && !hasSuggestions ? (
            <div className="p-8 flex flex-col items-center justify-center text-metin-ikincil gap-2">
              <Loader2 size={24} className="animate-spin text-vurgu" />
              <span className="text-xs">Komponent veritabanı taranıyor...</span>
            </div>
          ) : hasSuggestions ? (
            <div className="max-h-[480px] overflow-y-auto divide-y divide-kenar">
              {/* Group 1: Matching Products */}
              {productSuggestions.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul flex items-center gap-1.5">
                      <Cpu size={13} className="text-vurgu" /> Eşleşen Komponentler
                    </span>
                    <span className="text-[11px] font-mono text-metin-ikincil">
                      {totalCount} sonuç bulundu
                    </span>
                  </div>
                  <div className="space-y-1">
                    {productSuggestions.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/urunler/${prod.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-[var(--radius-girdi)] hover:bg-vurgu-zemin hover:border-vurgu border border-transparent transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded border border-kenar bg-yuzey-gomulu flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {prod.anaGorselUrl ? (
                              <Image
                                src={prod.anaGorselUrl}
                                alt={prod.ureticiUrunKodu}
                                width={36}
                                height={36}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <Cpu size={20} className="text-metin-ucuncul group-hover:text-vurgu" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-metin-marka group-hover:text-vurgu truncate">
                                {prod.ureticiUrunKodu}
                              </span>
                              <span className="text-xs text-metin-ikincil truncate">
                                · {prod.ureticiAd}
                              </span>
                            </div>
                            <p className="text-xs text-metin-ucuncul truncate max-w-md">
                              {prod.kisaAciklama || "Endüstriyel elektronik komponent"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <span className="font-mono font-bold text-sm text-metin tabular-nums">
                            {prod.baslangicFiyati.toFixed(2)} {prod.paraBirimi}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-basari-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-basari-500" />
                            {prod.toplamStok.toLocaleString("tr-TR")} Stokta
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: Matching Categories */}
              {categorySuggestions.length > 0 && (
                <div className="p-3 bg-yuzey">
                  <div className="mb-2 px-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul flex items-center gap-1.5">
                      <Layers size={13} className="text-vurgu" /> İlgili Kategoriler
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {categorySuggestions.map((cat, idx) => (
                      <Link
                        key={idx}
                        href={cat.url}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-girdi)] bg-yuzey-kart border border-kenar hover:border-vurgu hover:text-vurgu text-xs font-medium transition-all group"
                      >
                        <span className="truncate">{cat.path}</span>
                        <ArrowRight
                          size={12}
                          className="shrink-0 text-metin-ucuncul group-hover:text-vurgu group-hover:translate-x-0.5 transition-transform"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 3: Matching Brands */}
              {brandSuggestions.length > 0 && (
                <div className="p-3">
                  <div className="mb-2 px-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul flex items-center gap-1.5">
                      <Building2 size={13} className="text-vurgu" /> Yetkili Üreticiler
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {brandSuggestions.map((brand, idx) => (
                      <Link
                        key={idx}
                        href={`/urunler?aramaMetni=${encodeURIComponent(brand.ad)}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-kenar bg-yuzey-kart hover:border-vurgu hover:bg-vurgu-zemin text-xs font-semibold text-metin-marka transition-all"
                      >
                        <span>{brand.ad}</span>
                        {brand.yetkiliDistribitor && (
                          <span className="text-[9px] bg-cyan-100 text-vurgu-guclu px-1.5 py-0.2 rounded-full uppercase font-bold">
                            Yetkili
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Autocomplete Footer Action */}
              <div className="p-3 bg-yuzey-gomulu flex items-center justify-between text-xs">
                <span className="text-metin-ikincil">
                  İpucu: Sonuçlar arasında doğrudan gezinmek için yukarı/aşağı ok tuşlarını kullanabilirsiniz.
                </span>
                <Link
                  href={`/urunler?aramaMetni=${encodeURIComponent(query)}${
                    selectedCategory !== "tum" ? `&kategoriId=${selectedCategory}` : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-vurgu hover:text-vurgu-guclu flex items-center gap-1 shrink-0"
                >
                  Tüm Sonuçları Gör <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-metin">
                &ldquo;{query}&rdquo; ile eşleşen komponent bulunamadı
              </p>
              <p className="text-xs text-metin-ikincil mt-1">
                Lütfen parça kodunu (MPN) veya üretici adını kontrol edin.
              </p>

              <div className="mt-4 pt-4 border-t border-kenar text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-metin-ucuncul flex items-center gap-1 mb-2">
                  <Sparkles size={12} className="text-vurgu" /> Popüler Parça Aramaları:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULER_ONERILER.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => selectPopularTerm(item)}
                      className="px-2.5 py-1 rounded-[var(--radius-girdi)] bg-yuzey-gomulu hover:bg-vurgu-zemin hover:text-vurgu text-xs font-mono border border-kenar transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
