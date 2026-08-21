"use client";

import Link from "next/link";
import { ArrowLeftRight, X, Trash2, ArrowRight } from "lucide-react";
import { useComparisonStore, type ComparisonItem } from "@/lib/stores/comparison-store";

function fiyatBicimle(deger: number, paraBirimi: string = "USD") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
    maximumFractionDigits: 4,
  }).format(deger);
}

export function KarsilastirmaDock() {
  const { items, removeItem, clear } = useComparisonStore();

  if (!items || items.length === 0) {
    return null;
  }

  const maxItems = 4;
  const compareUrl = items.length >= 2 
    ? `/karsilastirma?ids=${items.map((i) => i.id).join(",")}`
    : "/karsilastirma";

  return (
    <aside
      aria-label="Ürün Karşılaştırma Çubuğu"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="rounded-[var(--radius-kart)] border-2 border-kenar-guclu bg-yuzey-kart p-3 sm:p-4 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Sol Başlık & Bilgi */}
          <div className="flex items-center justify-between sm:justify-start gap-3 border-b sm:border-b-0 border-kenar pb-2 sm:pb-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vurgu-zemin text-vurgu">
                <ArrowLeftRight size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-marka">Karşılaştırma</span>
                  <span className="rounded-full bg-marka px-1.5 py-0.2 text-[11px] font-bold text-white font-mono">
                    {items.length}/{maxItems}
                  </span>
                </div>
                <p className="text-[10px] text-metin-ucuncul hidden sm:block">
                  {items.length < 2 ? "En az 2 ürün seçin" : "Özellikleri yan yana inceleyin"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => clear()}
              className="text-[11px] font-medium text-metin-ucuncul hover:text-hata-600 transition-colors flex items-center gap-1 sm:hidden"
              title="Tümünü Temizle"
            >
              <Trash2 size={13} />
              Temizle
            </button>
          </div>

          {/* Orta: Ürün Slotları (Maksimum 4) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 sm:max-w-xl">
            {Array.from({ length: maxItems }).map((_, index) => {
              const item: ComparisonItem | undefined = items[index];

              if (item) {
                return (
                  <div
                    key={item.id}
                    className="group relative flex items-center gap-2 rounded-md border border-kenar bg-yuzey p-1.5 pr-6 hover:border-vurgu transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-yuzey-kart border border-kenar overflow-hidden text-[9px] font-mono text-metin-ucuncul font-bold text-center">
                      {item.anaGorselUrl ? (
                        <img
                          src={item.anaGorselUrl}
                          alt={item.ureticiUrunKodu}
                          className="h-full w-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="line-clamp-1 p-0.5">{item.ureticiUrunKodu.slice(0, 4)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-bold text-metin truncate leading-tight">
                        {item.ureticiUrunKodu}
                      </p>
                      <p className="text-[10px] text-metin-ucuncul truncate">
                        {item.ureticiAd || "Distribütör"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-metin-ucuncul hover:bg-hata-50 hover:text-hata-600 transition-colors"
                      aria-label={`${item.ureticiUrunKodu} ürününü çıkar`}
                      title="Listeden Çıkar"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={`empty-${index}`}
                  className="hidden sm:flex items-center justify-center rounded-md border border-dashed border-kenar-guclu bg-yuzey/50 p-2 text-center text-[10px] text-metin-ucuncul"
                >
                  <span>+ Ürün Ekle</span>
                </div>
              );
            })}
          </div>

          {/* Sağ Aksiyon Butonları */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-kenar">
            <button
              type="button"
              onClick={() => clear()}
              className="hidden sm:flex text-xs font-medium text-metin-ucuncul hover:text-hata-600 transition-colors items-center gap-1 px-2 py-1.5"
              title="Tümünü Temizle"
            >
              <Trash2 size={14} />
              Temizle
            </button>

            <Link
              href={compareUrl}
              className={`flex items-center justify-center gap-1.5 rounded-[var(--radius-girdi)] px-4 py-2 text-xs font-bold transition-colors shadow-sm ${
                items.length >= 2
                  ? "bg-vurgu hover:bg-vurgu-guclu text-white"
                  : "bg-yuzey-gomulu text-metin-ikincil hover:bg-kenar"
              }`}
            >
              <span>Karşılaştır ({items.length}/4)</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
