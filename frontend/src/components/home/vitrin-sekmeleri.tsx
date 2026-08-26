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
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { bildir } from "@/components/ui/bildirim";
import { UrunGorseli } from "@/components/urun-gorseli";
import type { ProductSummary, PackagingOption } from "@/lib/api";
import { paraBicimle } from "@/lib/miktar-kurali";
import { FavoriButonu } from "@/components/favori-karsilastirma-butonlari";

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
    linkHref: "/urunler?siralama=populer",
  },
  {
    id: "yeni",
    label: "Yeni",
    icon: Sparkles,
    description: "Kataloğumuza yeni katılan güncel yarı iletken ve pasif komponentler.",
    linkText: "Tüm Yeni Ürünler",
    linkHref: "/urunler?siralama=yeni",
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

export function VitrinSekmeleri({ urunGruplari }: { urunGruplari: Record<TabId, ProductSummary[]> }) {
  const router = useRouter();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

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
      .slice(0, 1)
      .map((t) => ({ miktar: t.minMiktar, fiyat: t.birimFiyat, paraBirimi: t.paraBirimi }));
  };

  return (
    <div aria-label="Ürün Vitrinleri">
      {TABS.map((bolum, bolumIndex) => {
        const urunler = urunGruplari[bolum.id] ?? [];
        const koyuBolum = bolum.id === "firsat";
        const arkaPlan = koyuBolum ? "bg-[#1A3F63]" : bolumIndex % 2 === 0 ? "bg-yuzey-kart" : "bg-yuzey";

        return (
          <section key={bolum.id} className={`${arkaPlan} py-12 md:py-16`} aria-labelledby={`vitrin-${bolum.id}`}>
            <Kapsayici>
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 id={`vitrin-${bolum.id}`} className={`text-3xl font-extrabold tracking-tight md:text-4xl ${koyuBolum ? "text-white" : "text-metin-marka"}`}>
                    {bolum.label} Ürünler
                  </h2>
                </div>
                <Link href={bolum.linkHref} className={`inline-flex min-h-11 items-center font-bold transition-colors ${koyuBolum ? "text-cyan-300 hover:text-white" : "text-vurgu hover:text-vurgu-guclu"}`}>
                  {bolum.linkText}
                </Link>
              </div>

              {urunler.length === 0 ? (
                <div className={`flex flex-col items-center justify-center rounded-token-kart border border-dashed py-14 text-center ${koyuBolum ? "border-white/20 bg-white/5 text-white" : "border-kenar bg-yuzey-gomulu text-metin"}`}>
                  <p className="text-sm font-semibold">Bu bölümde şu an gösterilecek ürün yok.</p>
                  <Link href="/urunler" className={`mt-4 inline-flex min-h-11 items-center rounded-token-girdi px-4 text-xs font-bold transition-colors ${koyuBolum ? "bg-white text-metin-marka hover:bg-cyan-100" : "bg-vurgu text-white hover:bg-vurgu-guclu"}`}>Kataloğu Aç</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-4 xl:gap-8">
                  {urunler.slice(0, 4).map((product) => {
              const isAdding = addingId === product.id && isPending;

              return (
                <article
                  key={product.id}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-token-panel border border-kenar-guclu bg-yuzey-kart p-4 shadow-token-kart transition-[border-color,box-shadow,transform] duration-[var(--sure-acilir)] hover:-translate-y-0.5 hover:border-vurgu/40 hover:shadow-token-yukselti"
                >
                  {/* Top Right Favorite Button */}
                  <div className="absolute right-3 top-3 z-10">
                    <FavoriButonu urunId={product.id} boyut="buyuk" />
                  </div>

                  {/* Image */}
                  <Link href={`/urunler/${product.id}`} className="flex h-40 items-center justify-center p-2" aria-hidden="true" tabIndex={-1}>
                    <UrunGorseli src={product.anaGorselUrl} urunKodu={product.ureticiUrunKodu} className="max-h-full max-w-full" />
                  </Link>

                  {/* Info */}
                  <div className="mt-4 text-center px-2">
                    <h3 className="text-base font-bold text-metin-marka line-clamp-1">
                      <Link href={`/urunler/${product.id}`} title={product.ureticiUrunKodu}>{product.ureticiUrunKodu}</Link>
                    </h3>
                    {/*
                      Buyuk harfe cevirmeyin: CSS `uppercase`, mikro isaretini (µ, U+00B5)
                      Yunan buyuk Mu'suna (Μ) cevirir ve "10 µF" -> "10 ΜF" olur. Turkce
                      kucuk 'i' de yanlis eslesir. Aciklamalar zaten dogru buyuk/kucuk
                      harfle uretiliyor (bkz. ParcaKatalogu kaynaklari).
                    */}
                    <p className="text-xs text-metin-ikincil line-clamp-1 mt-1" title={product.kisaAciklama}>
                      {product.kisaAciklama}
                    </p>
                  </div>

                  {/* Stock & Icons */}
                  <div className="mt-4 flex items-center justify-between px-2">
                    <span className="text-[11px] font-semibold text-[#12ae8c]">{product.toplamStok.toLocaleString("tr-TR")} STOKTA</span>
                  </div>

                  {/* Quantity Input */}
                  <div className="mt-4 mx-2 flex h-[38px] items-center justify-between rounded-full bg-white border border-kenar px-1">
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f2f5] text-metin hover:bg-[#e2e6eb] transition-colors">-</button>
                      <span className="text-sm font-bold text-metin">1</span>
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f2f5] text-metin hover:bg-[#e2e6eb] transition-colors">+</button>
                    </div>

                  {/* Prices */}
                  <div className="mt-4 mb-2 flex flex-col items-center justify-center text-[11px]">
                     <div className="text-metin-ikincil font-medium mb-1">Fiyatlar</div>
                     <div className="grid grid-cols-[auto_auto] gap-x-3 text-left">
                       {fiyatKademeleri(product).map((kademe) => (
                         <Fragment key={kademe.miktar}>
                           <span className="text-metin-ikincil">{kademe.miktar}:</span>
                           <span className="font-bold text-[#12ae8c]">{paraBicimle(kademe.fiyat, kademe.paraBirimi)}</span>
                         </Fragment>
                       ))}
                     </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-auto pt-3 flex items-center justify-between gap-1.5 px-2">
                    <Link href={`/urunler/${product.id}`} className="rounded-full border border-kenar px-3 py-2 text-[10px] font-bold text-metin hover:bg-yuzey-gomulu flex-1 text-center whitespace-nowrap transition-colors">
                      Fiyatları Gör
                    </Link>
                    <button type="button" aria-label={`${product.ureticiUrunKodu} ürününü sepete ekle`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7a9ed4] text-white hover:bg-[#688bc0] transition-colors" onClick={() => handleQuickAdd(product)} disabled={isAdding}>
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
            </Kapsayici>
          </section>
        );
      })}
    </div>
  );
}
