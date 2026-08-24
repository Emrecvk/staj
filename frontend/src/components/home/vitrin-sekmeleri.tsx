"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import { StokRozeti } from "@/components/ui/rozet";
import { FavoriButonu, KarsilastirmaButonu } from "@/components/favori-karsilastirma-butonlari";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { bildir } from "@/components/ui/bildirim";
import type { ProductSummary } from "@/lib/api";

type TabId = "yeni" | "coksatan" | "firsat" | "onecikan";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Sparkles;
  description: string;
  linkText: string;
  linkHref: string;
}

const TABS: TabConfig[] = [
  {
    id: "yeni",
    label: "Yeni Eklenenler",
    icon: Sparkles,
    description: "Kataloğumuza yeni katılan güncel yarı iletken ve pasif komponentler.",
    linkText: "Tüm Yeni Ürünler",
    linkHref: "/urunler?siralama=tarih_azalan",
  },
  {
    id: "coksatan",
    label: "Çok Satanlar",
    icon: TrendingUp,
    description: "Endüstriyel seri üretim projelerinde en çok tercih edilen popüler MPN'ler.",
    linkText: "Çok Satanları Gör",
    linkHref: "/urunler?siralama=populerlik",
  },
  {
    id: "firsat",
    label: "Stok Fırsatları",
    icon: Flame,
    description: "Yüksek hacimli makara ve tepsi alımlarında özel fiyat avantajlı stoklar.",
    linkText: "Fırsat Ürünleri",
    linkHref: "/urunler?kampanyaliMi=true",
  },
  {
    id: "onecikan",
    label: "Öne Çıkanlar",
    icon: Star,
    description: "Mühendislerimizin seçtiği yüksek performanslı referans tasarım parçaları.",
    linkText: "Öne Çıkan Kataloğu",
    linkHref: "/urunler?sadeceStoktakiler=true",
  },
];

function formatPrice(val: number, cur: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: cur || "USD",
    maximumFractionDigits: 4,
  }).format(val);
}

export function VitrinSekmeleri({ urunler = [] }: { urunler?: ProductSummary[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("yeni");
  const [startIndex, setStartIndex] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];

  // Yalnizca gercek urunler. API bos donduyse sahte urun UYDURULMAZ,
  // asagida durust bir bos durum gosterilir.
  const tabProducts =
    activeTab === "firsat"
      ? urunler.filter((u) => u.kampanyaliMi).length > 0
        ? urunler.filter((u) => u.kampanyaliMi)
        : urunler
      : urunler;

  // Carousel navigation bounds
  const totalItems = tabProducts.length;
  const visibleCount = 4; // desktop base

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + 1, Math.max(0, totalItems - visibleCount)));
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  // Quick MOQ Add to Cart action
  const handleQuickAdd = async (product: ProductSummary) => {
    setAddingId(product.id);
    startTransition(async () => {
      // Default MOQ based on component type
      const defaultAmbalajId = product.id * 10 + 1; // standard generated mock ID or fallback
      const defaultMoq = product.ureticiUrunKodu.includes("GRM")
        ? 4000
        : product.ureticiUrunKodu.includes("LM358")
        ? 2500
        : 90;

      const result = await addToCart(defaultAmbalajId, defaultMoq);

      if (result.success) {
        bildir.eylemli(
          "Sepete eklendi",
          "Sepete Git",
          () => router.push("/sepet"),
          `${product.ureticiUrunKodu} (${defaultMoq.toLocaleString("tr-TR")} Adet)`
        );
        notifyCartUpdated();
        router.refresh();
      } else {
        bildir.hata("Sepete eklenemedi", result.message);
      }
      setAddingId(null);
    });
  };

  return (
    <section className="bg-yuzey-kart py-12 md:py-16 border-b border-kenar" aria-label="Ürün Vitrinleri">
      <Kapsayici>
        {/* Header & Tabs Navigation */}
        <div className="flex flex-col justify-between gap-4 border-b border-kenar pb-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-vurgu">
              Vitrin & Seçilmiş Komponentler
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-metin md:text-3xl">
              Öne Çıkan Komponent Vitrinleri
            </h2>
            <p className="mt-1 text-sm text-metin-ikincil">
              {activeTabConfig.description}
            </p>
          </div>

          {/* Carousel Next/Prev Controls & Catalog Link */}
          <div className="flex items-center gap-3">
            <Link
              href={activeTabConfig.linkHref}
              className="hidden items-center gap-1 text-xs font-bold text-vurgu transition-colors hover:text-vurgu-guclu sm:inline-flex"
            >
              {activeTabConfig.linkText} <ArrowRight size={14} />
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={startIndex === 0}
                aria-label="Önceki Ürünler"
                className="rounded-full border border-kenar bg-yuzey p-2 text-metin transition-colors hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={startIndex >= Math.max(0, totalItems - visibleCount)}
                aria-label="Sonraki Ürünler"
                className="rounded-full border border-kenar bg-yuzey p-2 text-metin transition-colors hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Buttons (ARIA tablist) */}
        <div
          role="tablist"
          aria-label="Ürün Vitrini Sekmeleri"
          className="mt-6 flex flex-wrap gap-2 border-b border-kenar sm:gap-6"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStartIndex(0);
                }}
                className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-all duration-[var(--sure-ipucu)] ${
                  isActive
                    ? "border-b-2 border-vurgu text-metin-marka font-bold"
                    : "border-b-2 border-transparent text-metin-ikincil hover:border-kenar hover:text-metin"
                }`}
              >
                <Icon size={16} className={isActive ? "text-vurgu" : "text-metin-ucuncul"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel & Carousel Grid */}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="mt-6"
        >
          {tabProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-kart)] border border-dashed border-kenar bg-yuzey-gomulu py-14 text-center">
              <p className="text-sm font-semibold text-metin">
                Bu sekmede şu an gösterilecek ürün yok.
              </p>
              <p className="mt-1 text-xs text-metin-ucuncul">
                Tüm kataloğu inceleyerek stoktaki parçalara ulaşabilirsiniz.
              </p>
              <Link
                href="/urunler"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-girdi)] bg-vurgu px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-vurgu-guclu"
              >
                Kataloğu Aç
              </Link>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tabProducts.slice(startIndex, startIndex + 4).map((product) => {
              const isAdding = addingId === product.id && isPending;

              return (
                <article
                  key={product.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 transition-all duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-[var(--shadow-yukselti)]"
                >
                  {/* Top Badges & Actions */}
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-[var(--radius-girdi)] bg-yuzey-gomulu px-2 py-0.5 text-[11px] font-bold text-metin-marka">
                          {product.ureticiAd}
                        </span>
                        {product.kampanyaliMi && (
                          <span className="rounded-[var(--radius-girdi)] bg-uyari-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-uyari-600">
                            Fırsat
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <FavoriButonu urunId={product.id} />
                        <KarsilastirmaButonu urunId={product.id} />
                      </div>
                    </div>

                    {/* MPN Code & Title */}
                    <h3 className="font-mono text-base font-bold text-metin transition-colors group-hover:text-vurgu">
                      <Link
                        href={`/urunler/${product.id}`}
                        className="line-clamp-1 hover:underline"
                        title={product.ureticiUrunKodu}
                      >
                        {product.ureticiUrunKodu}
                      </Link>
                    </h3>

                    {/* Description */}
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-metin-ikincil">
                      {product.kisaAciklama}
                    </p>
                  </div>

                  {/* Stock, Price & Quick Action */}
                  <div className="mt-5 border-t border-kenar pt-3">
                    <div className="mb-3 flex items-center justify-between">
                      <StokRozeti miktar={product.toplamStok} />
                      <span className="text-[11px] font-medium text-metin-ucuncul">
                        Aynı Gün Kargo
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-medium text-metin-ucuncul">
                          Başlangıç Fiyatı (1+):
                        </div>
                        <div className="font-mono text-base font-bold tracking-tight text-metin-marka sayisal tabular-nums">
                          {formatPrice(product.baslangicFiyati, product.paraBirimi)}
                        </div>
                      </div>

                      {/* B2B Fast MOQ Add Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        disabled={isAdding}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-girdi)] bg-vurgu px-3 py-2 text-xs font-bold text-white transition-[background-color,transform] hover:bg-vurgu-guclu active:scale-[0.97] disabled:opacity-50"
                        title="Varsayılan paket MOQ miktarıyla sepete hızlı ekle"
                      >
                        {isAdding ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={14} />
                        )}
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          )}
        </div>
      </Kapsayici>
    </section>
  );
}
