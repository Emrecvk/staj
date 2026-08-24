"use client";

import { useState, useTransition, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  ShoppingCart,
  Loader2,
  FileText,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { bildir } from "@/components/ui/bildirim";
import { UrunGorseli } from "@/components/urun-gorseli";
import type { ProductSummary, PackagingOption } from "@/lib/api";

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
    id: "coksatan",
    label: "Popüler",
    icon: TrendingUp,
    description: "En çok tercih edilen komponentler.",
    linkText: "Tüm Popüler Ürünler",
    linkHref: "/urunler?siralama=populerlik",
  },
  {
    id: "yeni",
    label: "Yeni",
    icon: Sparkles,
    description: "Kataloğumuza yeni katılan güncel yarı iletken ve pasif komponentler.",
    linkText: "Tüm Yeni Ürünler",
    linkHref: "/urunler?siralama=tarih_azalan",
  },
  {
    id: "firsat",
    label: "Fırsat",
    icon: Flame,
    description: "Yüksek hacimli makara ve tepsi alımlarında özel fiyat avantajlı stoklar.",
    linkText: "Fırsat Ürünleri",
    linkHref: "/urunler?kampanyaliMi=true",
  },
  {
    id: "onecikan",
    label: "Öne Çıkan",
    icon: Star,
    description: "Mühendislerimizin seçtiği yüksek performanslı referans tasarım parçaları.",
    linkText: "Öne Çıkan Kataloğu",
    linkHref: "/urunler?sadeceStoktakiler=true",
  },
];

function formatPrice(val: number, cur: string, siteCur?: string) {
  let displayValue = val;
  let displayCur = cur;
  if (cur === "USD" && siteCur === "TRY") {
    displayValue = val * 35.24;
    displayCur = "TRY";
  } else if (cur === "TRY" && siteCur === "USD") {
    displayValue = val / 35.24;
    displayCur = "USD";
  } else if (siteCur) {
    displayCur = siteCur;
  }
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: displayCur || "USD",
    maximumFractionDigits: 4,
  }).format(displayValue);
}

export function VitrinSekmeleri({ urunler = [], baslangicSekmesi, siteParaBirimi }: { urunler?: ProductSummary[]; baslangicSekmesi?: TabId; siteParaBirimi?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>(baslangicSekmesi ?? "yeni");
  const [startIndex, setStartIndex] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];

  const gorselliUrunler = urunler;
  const tabProducts =
    activeTab === "firsat"
      ? gorselliUrunler.filter((u) => u.kampanyaliMi).length > 0
        ? gorselliUrunler.filter((u) => u.kampanyaliMi)
        : gorselliUrunler
      : gorselliUrunler;

  const totalItems = tabProducts.length;
  const visibleCount = 4;
  const totalPages = Math.ceil(totalItems / visibleCount) || 1;

  // Listedeki ozet urunun varsayilan ambalaji (yoksa ilki). Ozet DTO'su
  // ambalaj/fiyat verisini icermeyebilir; o durumda null doner.
  const varsayilanAmbalaj = (p: ProductSummary): PackagingOption | null =>
    p.ambalajlarVeFiyatlar?.find((a) => a.varsayilanMi) ?? p.ambalajlarVeFiyatlar?.[0] ?? null;

  const handleQuickAdd = async (product: ProductSummary) => {
    const ambalaj = varsayilanAmbalaj(product);
    // Ambalaj/MOQ verisi listede yoksa uydurma id/miktar gondermek yerine
    // urun sayfasina yonlendir; kullanici gercek ambalaji orada secsin.
    if (!ambalaj) {
      router.push(`/urunler/${product.id}`);
      return;
    }
    setAddingId(product.id);
    startTransition(async () => {
      const result = await addToCart(ambalaj.ambalajId, ambalaj.moq);
      if (result.success) {
        bildir.eylemli("Sepete eklendi", "Sepete Git", () => router.push("/sepet"), `${product.ureticiUrunKodu} (${ambalaj.moq.toLocaleString("tr-TR")} Adet)`);
        notifyCartUpdated();
        router.refresh();
      } else {
        bildir.hata("Sepete eklenemedi", result.message);
      }
      setAddingId(null);
    });
  };

  // Gercek fiyat kademeleri: varsayilan ambalajin fiyatlar[] dizisinden.
  // Kademe verisi yoksa yalnizca baslangic fiyatini (1 adet) goster; sahte
  // "5 adet %5 indirim" kademesi URETMEZ.
  const fiyatKademeleri = (p: ProductSummary): { miktar: number; fiyat: number; paraBirimi: string }[] => {
    const tiers = varsayilanAmbalaj(p)?.fiyatlar ?? [];
    if (tiers.length === 0) {
      return [{ miktar: 1, fiyat: p.baslangicFiyati, paraBirimi: p.paraBirimi }];
    }
    return [...tiers]
      .sort((a, b) => a.minMiktar - b.minMiktar)
      .slice(0, 2)
      .map((t) => ({ miktar: t.minMiktar, fiyat: t.birimFiyat, paraBirimi: t.paraBirimi }));
  };

  const sectionBgClass =
    activeTab === "coksatan" ? "bg-white" :
    activeTab === "yeni" ? "bg-[#faf9f7]" :
    activeTab === "onecikan" ? "bg-white" :
    activeTab === "firsat" ? "bg-[#1A3F63]" : "bg-white";

  const titleColorClass = activeTab === "firsat" ? "text-white" : "text-metin-marka";

  return (
    <section className={`${sectionBgClass} py-12 md:py-16`} aria-label="Ürün Vitrinleri">
      <Kapsayici>
        {/* Header & Tabs Navigation */}
        <div className="flex flex-col justify-between gap-4 pb-4 sm:flex-row sm:items-end">
          <div><h2 className={`text-3xl font-extrabold tracking-tight md:text-4xl ${titleColorClass}`}>{activeTabConfig.label} Ürünler</h2><p className="sr-only">{activeTabConfig.description}</p></div>

          {/* Pagination Dots */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStartIndex(i * visibleCount)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${startIndex / visibleCount === i ? (activeTab === "firsat" ? "bg-white ring-2 ring-white/30" : "bg-blue-500 ring-2 ring-blue-100") : (activeTab === "firsat" ? "bg-white/30" : "bg-gray-300")}`}
                  aria-label={`Sayfa ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tab Buttons (ARIA tablist) */}
        {!baslangicSekmesi && <div
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
        </div>}

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
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-kenar bg-white p-3 shadow-sm hover:shadow-[var(--shadow-yukselti)] transition-all"
                >
                  {/* Top Right Favorite Button */}
                  <div className="absolute right-3 top-3 z-10">
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-yuzey-gomulu text-metin-ucuncul hover:text-vurgu hover:bg-vurgu-zemin transition-colors">
                      <Star size={16} className="fill-current opacity-20 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  {/* Image */}
                  <Link href={`/urunler/${product.id}`} className="flex h-40 items-center justify-center p-2" aria-hidden="true" tabIndex={-1}>
                    <UrunGorseli src={product.anaGorselUrl} urunKodu={product.ureticiUrunKodu} className="max-h-full max-w-full" />
                  </Link>

                  {/* Info */}
                  <div className="mt-4 text-center px-2">
                    <h3 className="text-sm font-bold text-metin-marka line-clamp-1">
                      <Link href={`/urunler/${product.id}`} title={product.ureticiUrunKodu}>{product.ureticiUrunKodu}</Link>
                    </h3>
                    <p className="text-[11px] text-metin-ikincil line-clamp-1 mt-1 uppercase" title={product.kisaAciklama}>
                      {product.kisaAciklama}
                    </p>
                  </div>

                  {/* Stock & Icons */}
                  <div className="mt-4 flex items-center justify-between px-2">
                    <span className="text-[10px] font-semibold text-[#12ae8c]">
                      {product.toplamStok} STOKTA
                    </span>
                    <div className="flex gap-1.5">
                      <span className="text-[#1834b8] bg-[#1834b8]/10 p-1 rounded"><FileText size={12} /></span>
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div className="mt-3 mx-2 flex h-9 items-center justify-between rounded-full bg-yuzey-gomulu border border-kenar">
                    <button type="button" className="flex h-full w-9 items-center justify-center text-metin-ikincil hover:text-metin">−</button>
                    <span className="text-xs font-bold text-metin">1</span>
                    <button type="button" className="flex h-full w-9 items-center justify-center text-metin-ikincil hover:text-metin">+</button>
                  </div>

                  {/* Prices */}
                  <div className="mt-4 mb-2 flex flex-col items-center justify-center text-[11px]">
                     <div className="text-metin-ikincil font-medium mb-1">Fiyatlar</div>
                     <div className="grid grid-cols-[auto_auto] gap-x-3 text-left">
                       {fiyatKademeleri(product).map((kademe) => (
                         <Fragment key={kademe.miktar}>
                           <span className="text-metin-ikincil">{kademe.miktar}:</span>
                           <span className="font-bold text-[#12ae8c]">{formatPrice(kademe.fiyat, kademe.paraBirimi, siteParaBirimi)}</span>
                         </Fragment>
                       ))}
                     </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-auto pt-3 flex items-center justify-between gap-1.5 px-2">
                    <Link href={`/urunler/${product.id}`} className="rounded-full border border-kenar px-3 py-2 text-[10px] font-bold text-metin hover:bg-yuzey-gomulu flex-1 text-center whitespace-nowrap transition-colors">
                      Fiyatları Gör
                    </Link>
                    <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7a9ed4] text-white hover:bg-[#688bc0] transition-colors" onClick={() => handleQuickAdd(product)} disabled={isAdding}>
                      {isAdding ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
                    </button>
                    <button type="button" className="rounded-full bg-[#1834b8] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#11288f] flex-1 text-center whitespace-nowrap transition-colors" onClick={() => handleQuickAdd(product)} disabled={isAdding}>
                      Hemen Al
                    </button>
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
