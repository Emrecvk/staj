"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, LayoutGrid, List, ChevronLeft, ChevronRight, X, SlidersHorizontal, ArrowDownAZ } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductListCard } from "@/components/product-list-card";
import type { ProductResult, FacetGroup } from "@/lib/api";


/**
 * Filtre paneli.
 *
 * Modül seviyesinde tanımlıdır: bileşen fonksiyonunun İÇİNDE tanımlanırsa
 * her render yeni bir bileşen TİPİ üretilir; React alt ağacı söküp yeniden
 * kurar ve panelin kaydırma konumu ile odak her filtre tıklamasında sıfırlanır.
 */
function FiltrePaneli({ filtreler, activeFilters, updateFilters, clearFilters }: {
  filtreler: FacetGroup[];
  activeFilters: Record<string, string[]>;
  updateFilters: (key: string, value: string, checked: boolean) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-brand-navy flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filtreler
        </h3>
        {Object.keys(activeFilters).length > 0 && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
            Temizle
          </button>
        )}
      </div>
      
      <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filtreler.map((facetGroup: FacetGroup) => (
          <div key={facetGroup.kod} className="p-4">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">{facetGroup.ad}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {facetGroup.secenekler.map((option) => {
                const isActive = activeFilters[facetGroup.kod]?.includes(option.hamDeger);
                return (
                  <label key={option.hamDeger} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-4 h-4 border border-gray-300 rounded-sm checked:bg-brand-cyan checked:border-brand-cyan transition-all"
                        checked={isActive}
                        onChange={(e) => updateFilters(facetGroup.kod, option.hamDeger, e.target.checked)}
                      />
                      <svg className="absolute w-4 h-4 pointer-events-none hidden peer-checked:block text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className={`text-sm flex-grow ${isActive ? 'text-brand-navy font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {option.deger}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {option.urunSayisi}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductListingClient({ 
  initialData, 
  searchParams 
}: { 
  initialData: ProductResult | null,
  searchParams: Record<string, string | string[] | undefined>
}) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Parse current active filters
  const getActiveFilters = () => {
    const filters: Record<string, string[]> = {};
    searchParamsHook.forEach((value, key) => {
      if (key !== "sayfaNo" && key !== "sayfaBoyutu" && key !== "siralama" && key !== "aramaMetni" && key !== "kategoriId") {
        if (!filters[key]) filters[key] = [];
        filters[key].push(value);
      }
    });
    return filters;
  };

  const activeFilters = getActiveFilters();

  const updateFilters = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    
    // Reset to page 1 on filter change
    params.set("sayfaNo", "1");
    
    if (checked) {
      params.append(key, value);
    } else {
      // Remove specific value for the key
      const values = params.getAll(key);
      params.delete(key);
      values.filter(v => v !== value).forEach(v => params.append(key, v));
    }
    
    router.push(`/urunler?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParamsHook.toString());
    const keysToRemove = Array.from(params.keys()).filter(k => 
      k !== "aramaMetni" && k !== "kategoriId"
    );
    keysToRemove.forEach(k => params.delete(k));
    router.push(`/urunler?${params.toString()}`);
  };

  const updateSort = (sortOption: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    if (sortOption) {
      params.set("siralama", sortOption);
    } else {
      params.delete("siralama");
    }
    params.set("sayfaNo", "1");
    router.push(`/urunler?${params.toString()}`);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("sayfaNo", newPage.toString());
    router.push(`/urunler?${params.toString()}`);
  };

  if (!initialData || !initialData.urunler) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
        <Filter size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sonuç Bulunamadı</h2>
        <p className="text-gray-500 mb-6">Arama kriterlerinize uygun ürün bulunamadı veya API bağlantısı sağlanamadı.</p>
        <button onClick={clearFilters} className="bg-brand-cyan text-white px-6 py-2 rounded-lg font-medium">
          Filtreleri Temizle
        </button>
      </div>
    );
  }

  const { urunler, filtreler } = initialData;


  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Mobile Filter Toggle */}
      <div className="w-full lg:hidden flex gap-2">
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 bg-white border border-gray-200 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium text-brand-navy shadow-sm"
        >
          <Filter size={18} /> Filtrele ({Object.keys(activeFilters).length})
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden flex justify-end">
          <div className="bg-white w-4/5 max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Filtreler</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow overflow-hidden p-4">
               <FiltrePaneli filtreler={filtreler} activeFilters={activeFilters} updateFilters={updateFilters} clearFilters={clearFilters} />
            </div>
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-brand-cyan text-white py-3 rounded-lg font-bold"
              >
                Sonuçları Göster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-1/4 min-w-[280px] flex-shrink-0">
        <FiltrePaneli filtreler={filtreler} activeFilters={activeFilters} updateFilters={updateFilters} clearFilters={clearFilters} />
      </aside>

      {/* Main Content */}
      <div className="flex-grow w-full">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 font-medium">
            Toplam <b className="text-brand-navy">{urunler.toplamKayit}</b> ürün bulundu
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <ArrowDownAZ size={18} className="text-gray-400" />
              <select 
                className="text-sm border border-gray-200 rounded-md py-1.5 px-3 bg-gray-50 outline-none focus:border-brand-cyan"
                value={searchParamsHook.get("siralama") || ""}
                onChange={(e) => updateSort(e.target.value)}
              >
                <option value="">Önerilen</option>
                <option value="fiyat_artan">Fiyat (Artan)</option>
                <option value="fiyat_azalan">Fiyat (Azalan)</option>
                <option value="stok_azalan">Stok (En Çok)</option>
              </select>
            </div>
            
            <div className="flex items-center border border-gray-200 rounded-md bg-gray-50 p-0.5">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-sm transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-brand-cyan" : "text-gray-400 hover:text-gray-600"}`}
                aria-label="Grid Görünümü"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-brand-cyan" : "text-gray-400 hover:text-gray-600"}`}
                aria-label="Liste Görünümü"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid/List */}
        {urunler.kayitlar.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "flex flex-col gap-4"
          }>
            {urunler.kayitlar.map((product) => (
              viewMode === "grid" ? (
                <ProductCard product={product} key={product.id} />
              ) : (
                <ProductListCard product={product} key={product.id} />
              )
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Aradığınız kriterlere uygun ürün bulunamadı.</h3>
            <p className="text-gray-500 mb-6">Lütfen filtreleri azaltarak tekrar deneyin.</p>
            <button onClick={clearFilters} className="bg-brand-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90">
              Tüm Filtreleri Temizle
            </button>
          </div>
        )}

        {/* Pagination */}
        {urunler.toplamSayfa > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button 
              onClick={() => changePage(urunler.sayfaNo - 1)}
              disabled={urunler.sayfaNo <= 1}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, urunler.toplamSayfa) }, (_, i) => {
                let pageNum;
                if (urunler.toplamSayfa <= 5) pageNum = i + 1;
                else if (urunler.sayfaNo <= 3) pageNum = i + 1;
                else if (urunler.sayfaNo >= urunler.toplamSayfa - 2) pageNum = urunler.toplamSayfa - 4 + i;
                else pageNum = urunler.sayfaNo - 2 + i;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === urunler.sayfaNo 
                        ? "bg-brand-cyan text-white shadow-sm" 
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => changePage(urunler.sayfaNo + 1)}
              disabled={urunler.sayfaNo >= urunler.toplamSayfa}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
