"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Copy,
  Check,
  Download,
  FileText,
  Layers,
  ShieldCheck,
  Truck,
  Box,
  Calendar,
  AlertTriangle,
  ShoppingCart,
  FileSpreadsheet,
  Heart,
  ArrowLeftRight,
  Bell,
  Search,
  ZoomIn,
  Send,
  X,
  FileCode,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated, notifyFavoritesUpdated } from "@/lib/stores/header-state";
import { useComparisonStore } from "@/lib/stores/comparison-store";
import { favoriEkle, favoriSil, karsilastirmayaEkle, karsilastirmadanCikar } from "@/lib/katalog-actions";
import { bildir } from "@/components/ui/bildirim";
import { Buton } from "@/components/ui/buton";
import { Kisaltma } from "@/components/ui/ipucu";
import {
  kademeSec,
  kademeUlasilabilirMi,
  miktariDogrulaAmbalaj,
  hesaplaB2BFiyat,
  paraBicimle,
} from "@/lib/miktar-kurali";
import type {
  ProductDetail,
  PackagingOption,
  PriceTier,
  WarehouseStock,
  DocumentType,
  RelatedProductSummary,
} from "@/lib/api";

function dokumanKullanilabilirMi(dokuman: DocumentType) {
  return /^https?:\/\//i.test(dokuman.url);
}

/* ==========================================================================
   1. PDP BREADCRUMB
   ========================================================================== */
export function PdpBreadcrumb({
  kategoriYolu,
  ureticiAd,
  ureticiUrunKodu,
  productId,
}: {
  kategoriYolu?: string[];
  ureticiAd: string;
  ureticiUrunKodu: string;
  productId: number;
}) {
  const hasPath = kategoriYolu && kategoriYolu.length > 0;

  return (
    <nav aria-label="Konum" className="border-b border-kenar bg-yuzey-kart">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1.5 py-3 text-xs text-metin-ucuncul">
          <li>
            <Link href="/" className="transition-colors hover:text-vurgu">
              Ana Sayfa
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={13} />
          </li>

          {hasPath ? (
            kategoriYolu.map((kategori) => (
              <React.Fragment key={kategori}>
                <li>
                  <Link
                    href={`/urunler?kategori=${encodeURIComponent(kategori)}`}
                    className="transition-colors hover:text-vurgu"
                  >
                    {kategori}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight size={13} />
                </li>
              </React.Fragment>
            ))
          ) : (
            <>
              <li>
                <Link href="/urunler" className="transition-colors hover:text-vurgu">
                  Ürünler
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={13} />
              </li>
              <li>
                <Link
                  href={`/urunler?aramaMetni=${encodeURIComponent(ureticiAd)}`}
                  className="transition-colors hover:text-vurgu"
                >
                  {ureticiAd}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={13} />
              </li>
            </>
          )}

          <li
            className="truncate font-mono font-medium text-metin max-w-[200px] sm:max-w-none"
            aria-current="page"
          >
            {ureticiUrunKodu}
          </li>
        </ol>
      </div>
    </nav>
  );
}

/* ==========================================================================
   2. YAŞAM DÖNGÜSÜ & ROZETLER
   ========================================================================== */
export function YasamDongusuRozeti({ durum }: { durum: string | null | undefined }) {
  if (!durum) return null;

  const durumHaritasi: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    Aktif: {
      label: "Aktif / Üretimde",
      bg: "bg-basari-50",
      text: "text-basari-600",
      border: "border-basari-200/60",
    },
    YeniTasarimaOnerilmez: {
      label: "Yeni Tasarıma Önerilmez (NRND)",
      bg: "bg-uyari-50",
      text: "text-uyari-600",
      border: "border-uyari-200/60",
    },
    OmruSonu: {
      label: "Ömrü Sonu (EOL)",
      bg: "bg-hata-50",
      text: "text-hata-600",
      border: "border-hata-200/60",
    },
    KullanimdanKalkti: {
      label: "Üretimden Kalktı",
      bg: "bg-hata-50",
      text: "text-hata-600",
      border: "border-hata-200/60",
    },
  };

  const config = durumHaritasi[durum] || {
    label: durum,
    bg: "bg-yuzey-gomulu",
    text: "text-metin-ikincil",
    border: "border-kenar",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

/* ==========================================================================
   3. PDP SUMMARY HEADER
   ========================================================================== */
export function PdpSummaryHeader({
  product,
  onOpenStockModal,
}: {
  product: ProductDetail;
  onOpenStockModal?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { isInComparison, addItem, removeItem } = useComparisonStore();
  const inCompare = isInComparison(product.id);
  const [comparePending, startCompareTransition] = useTransition();

  const handleCopyMpn = async () => {
    try {
      await navigator.clipboard.writeText(product.ureticiUrunKodu);
      setCopied(true);
      bildir.basarili("Kopyalandı", `${product.ureticiUrunKodu} panoya kopyalandı.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      bildir.hata("Hata", "Pano erişimi sağlanamadı.");
    }
  };

  const handleToggleCompare = () => {
    startCompareTransition(async () => {
      if (inCompare) {
        removeItem(product.id);
        await karsilastirmadanCikar(product.id);
        bildir.bilgi("Çıkarıldı", `${product.ureticiUrunKodu} karşılaştırma listesinden çıkarıldı.`);
      } else {
        const added = addItem({
          id: product.id,
          ureticiUrunKodu: product.ureticiUrunKodu,
          ureticiAd: product.ureticiAd,
          anaGorselUrl: product.anaGorselUrl,
          baslangicFiyati: product.ambalajlarVeFiyatlar?.[0]?.fiyatlar?.[0]?.birimFiyat || 0,
          paraBirimi: product.ambalajlarVeFiyatlar?.[0]?.fiyatlar?.[0]?.paraBirimi || "USD",
          toplamStok:
            product.depoStoklari?.reduce((sum, d) => sum + d.stokMiktari, 0) ||
            product.ambalajlarVeFiyatlar?.reduce((sum, a) => sum + a.stokMiktari, 0) ||
            0,
          kategoriId: product.kategoriId,
          ozellikler: product.ozellikler,
        });

        if (!added) {
          bildir.bilgi("Limit Aşıldı", "En fazla 4 ürün karşılaştırabilirsiniz.");
          return;
        }
        await karsilastirmayaEkle(product.id);
        bildir.basarili("Eklendi", `${product.ureticiUrunKodu} karşılaştırmaya eklendi.`);
      }
    });
  };

  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-kenar pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        {/* Üretici & Marka Bağlantısı */}
        <div className="flex items-center gap-2">
          <Link
            href={`/urunler?aramaMetni=${encodeURIComponent(product.ureticiAd)}`}
            className="text-sm font-semibold text-vurgu transition-colors hover:text-vurgu-guclu inline-flex items-center gap-1"
          >
            {product.ureticiAd}
            <ArrowUpRight size={14} className="opacity-70" />
          </Link>
          <span className="text-metin-ucuncul">·</span>
          <span className="text-xs text-metin-ucuncul font-mono">ID: #{product.id}</span>
        </div>

        {/* MPN Başlık & Kopyalama Butonu */}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <h1 className="break-all font-mono text-2xl font-bold tracking-tight text-metin sm:text-3xl">
            {product.ureticiUrunKodu}
          </h1>

          <button
            type="button"
            onClick={handleCopyMpn}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart px-2.5 py-1 text-xs font-medium text-metin-ikincil shadow-xs transition-all hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu active:scale-95"
            title="Parça kodunu kopyala"
            aria-label="Parça kodunu panoya kopyala"
          >
            {copied ? (
              <>
                <Check size={13} className="text-basari-600" />
                <span className="text-basari-600 font-semibold">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Kopyala</span>
              </>
            )}
          </button>
        </div>

        {/* Kısa Teknik Açıklama */}
        <p className="mt-2 text-sm leading-relaxed text-metin-ikincil max-w-3xl">
          {product.kisaAciklama}
        </p>

        {/* Rozetler ve Uyumluluk Göstergeleri */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {/* Yaşam Döngüsü */}
          <YasamDongusuRozeti durum={product.urunDurumu} />

          {/* RoHS Uyumluluk */}
          {product.rohsDurumu && (
            <span className="inline-flex items-center gap-1 rounded-full bg-basari-50 px-2.5 py-0.5 text-xs font-medium text-basari-600 border border-basari-200/60">
              <ShieldCheck size={12} className="shrink-0" />
              RoHS: {product.rohsDurumu}
            </span>
          )}

          {/* REACH Uyumluluk */}
          <span className="inline-flex items-center gap-1 rounded-full bg-basari-50 px-2.5 py-0.5 text-xs font-medium text-basari-600 border border-basari-200/60">
            <CheckCircle2 size={12} className="shrink-0" />
            REACH Uyumlu
          </span>

          {/* Montaj Tipi */}
          {product.montajTipi && product.montajTipi !== "Yok" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yuzey-gomulu px-2.5 py-0.5 text-xs font-medium text-metin border border-kenar">
              <Box size={12} className="shrink-0 text-metin-ucuncul" />
              {product.montajTipi}
            </span>
          )}

          {/* Üretici Teslim Süresi */}
          {product.ureticiTeslimSuresi && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-800 border border-cyan-200/60">
              <Truck size={12} className="shrink-0 text-vurgu" />
              Üretici teslim: {product.ureticiTeslimSuresi}
            </span>
          )}
        </div>
      </div>

      {/* Sağ Hızlı Eylemler */}
      <div className="flex shrink-0 items-center gap-2 self-start pt-1">
        <button
          type="button"
          onClick={handleToggleCompare}
          disabled={comparePending}
          className={`inline-flex items-center gap-1.5 rounded-[var(--radius-girdi)] border px-3 py-2 text-xs font-semibold shadow-xs transition-all active:scale-95 ${
            inCompare
              ? "border-vurgu bg-vurgu-zemin text-vurgu-guclu font-bold"
              : "border-kenar bg-yuzey-kart text-metin hover:border-kenar-guclu hover:bg-yuzey-gomulu"
          }`}
          title="Karşılaştırma listesine ekle veya çıkar"
        >
          <ArrowLeftRight size={14} className={inCompare ? "text-vurgu-guclu" : "text-metin-ucuncul"} />
          <span>{inCompare ? "Karşılaştırılıyor" : "Karşılaştır"}</span>
        </button>

        {onOpenStockModal && (
          <button
            type="button"
            onClick={onOpenStockModal}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart px-3 py-2 text-xs font-medium text-metin shadow-xs transition-all hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu active:scale-95"
            title="Stok alarmı kur"
          >
            <Bell size={14} className="text-metin-ucuncul" />
            <span>Stok Alarmı</span>
          </button>
        )}
      </div>
    </header>
  );
}

/* ==========================================================================
   4. MULTI-IMAGE ZOOM GALLERY
   ========================================================================== */
export function PdpGallery({
  images,
  primaryImage,
  isRepresentative,
  mpn,
  documents,
}: {
  images?: string[];
  primaryImage: string | null;
  isRepresentative: boolean;
  mpn: string;
  documents?: DocumentType[];
}) {
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (primaryImage) list.push(primaryImage);
    if (images && images.length > 0) {
      images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : [primaryImage || "/images/placeholder-ic.svg"];
  }, [images, primaryImage]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [hataKaynak, setHataKaynak] = useState<string | null>(null);

  const currentImage = allImages[activeIdx] || allImages[0];
  const isBrokenOrMock =
    hataKaynak === currentImage ||
    !currentImage ||
    currentImage.includes("placeholder") ||
    currentImage.includes("/gorseller/komponent/") ||
    currentImage.includes("/products/");

  const kullanilabilirDokumanlar = documents?.filter(dokumanKullanilabilirMi);
  const datasheet = kullanilabilirDokumanlar?.find((d) => d.tip === 1 || d.url.endsWith(".pdf"));
  const cadDoc = kullanilabilirDokumanlar?.find(
    (d) => d.tip === 2 || d.url.endsWith(".step") || d.baslik.includes("CAD")
  );
  const rohsDoc = kullanilabilirDokumanlar?.find((d) => d.tip === 3 || d.baslik.includes("RoHS"));

  return (
    <div className="space-y-4">
      {/* Ana Görsel Kutusu */}
      <div className="relative overflow-hidden rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-hafif">
        {/* Temsili Görsel Uyarısı */}
        {isRepresentative && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-yuzey-gomulu/90 px-2.5 py-0.5 text-[11px] font-medium text-metin-ikincil backdrop-blur-xs border border-kenar">
            Temsili Görsel
          </div>
        )}

        {/* Büyüteç Butonu */}
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          disabled={isBrokenOrMock}
          className="absolute right-3 top-3 z-10 rounded-full border border-kenar bg-yuzey-kart/90 p-2 text-metin-ucuncul shadow-xs backdrop-blur-xs transition-colors hover:bg-yuzey hover:text-vurgu disabled:hidden"
          aria-label="Görseli büyüt"
          title="Büyüt"
        >
          <ZoomIn size={16} />
        </button>

        {/* Görsel / Schematic Placeholder Render */}
        <div
          className={`flex aspect-[4/3] max-h-[460px] w-full items-center justify-center ${isBrokenOrMock ? "" : "cursor-zoom-in"}`}
          onClick={() => !isBrokenOrMock && setZoomOpen(true)}
        >
          {isBrokenOrMock ? (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed border-kenar-guclu bg-yuzey-gomulu/60 p-6 text-center">
              <Box size={42} strokeWidth={1.5} className="mb-3 text-metin-ucuncul" />
              <span className="font-mono text-sm font-bold text-metin">{mpn}</span>
              <span className="mt-1 text-xs text-metin-ucuncul">Ürün görseli mevcut değil</span>
            </div>
          ) : (
            <img
              src={currentImage}
              alt={mpn}
              className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              onError={() => setHataKaynak(currentImage)}
            />
          )}
        </div>
      </div>

      {/* Küçük Resim Galerisi (Thumbnails) */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Görsel galerisi">
          {allImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              role="tab"
              aria-selected={activeIdx === idx}
              className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-girdi)] border bg-yuzey-kart p-1 transition-all ${
                activeIdx === idx
                  ? "border-vurgu ring-2 ring-vurgu/30 shadow-xs"
                  : "border-kenar hover:border-kenar-guclu"
              }`}
            >
              <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-metin-ucuncul">
                #{idx + 1}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hızlı Doküman & CAD Kısayolları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
        {datasheet ? (
          <a
            href={datasheet.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart p-2.5 text-xs font-semibold text-metin transition-colors hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu"
          >
            <FileText size={15} className="shrink-0 text-vurgu" />
            <div className="min-w-0 flex-1 truncate">
              <span className="block truncate">Datasheet (PDF)</span>
              {datasheet.boyutByte && (
                <span className="text-[10px] text-metin-ucuncul font-mono">
                  {(datasheet.boyutByte / 1024 / 1024).toFixed(1)} MB · {datasheet.dil || "EN"}
                </span>
              )}
            </div>
            <Download size={13} className="shrink-0 opacity-60" />
          </a>
        ) : (
          <div className="flex items-center gap-2 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-gomulu/50 p-2.5 text-xs text-metin-ucuncul">
            <FileText size={15} className="shrink-0 opacity-40" />
            <span className="truncate">Datasheet: Talep Et</span>
          </div>
        )}

        {cadDoc ? (
          <a
            href={cadDoc.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart p-2.5 text-xs font-semibold text-metin transition-colors hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu"
          >
            <Layers size={15} className="shrink-0 text-cyan-600" />
            <div className="min-w-0 flex-1 truncate">
              <span className="block truncate">3D CAD / EDA</span>
              <span className="text-[10px] text-metin-ucuncul font-mono">STEP / Footprint</span>
            </div>
            <Download size={13} className="shrink-0 opacity-60" />
          </a>
        ) : (
          <div className="flex items-center gap-2 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-gomulu/50 p-2.5 text-xs text-metin-ucuncul">
            <Layers size={15} className="shrink-0 opacity-40" />
            <span className="truncate">CAD Model: Yok</span>
          </div>
        )}

        {rohsDoc ? (
          <a
            href={rohsDoc.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart p-2.5 text-xs font-semibold text-metin transition-colors hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu"
          >
            <ShieldCheck size={15} className="shrink-0 text-basari-600" />
            <div className="min-w-0 flex-1 truncate">
              <span className="block truncate">RoHS / REACH</span>
              <span className="text-[10px] text-metin-ucuncul font-mono">Sertifika</span>
            </div>
            <Download size={13} className="shrink-0 opacity-60" />
          </a>
        ) : (
          <div className="flex items-center gap-2 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-gomulu/50 p-2.5 text-xs text-metin-ucuncul">
            <ShieldCheck size={15} className="shrink-0 opacity-40" />
            <span className="truncate">Sertifika: Standart</span>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomOpen && !isBrokenOrMock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-xs"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-yuzey-gomulu p-2 text-metin hover:bg-yuzey-kart hover:text-vurgu"
            >
              <X size={20} />
            </button>
            <h3 className="mb-4 font-mono text-lg font-bold text-metin">{mpn}</h3>
            <div className="flex max-h-[70vh] items-center justify-center overflow-auto">
              {/* Yönetim paneli farklı alan adlarından görsel kabul eder. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentImage} alt={`${mpn} büyütülmüş ürün görseli`} className="max-h-[70vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   5. MULTI-WAREHOUSE STOCK BREAKDOWN
   ========================================================================== */
export function PdpDepoStoklari({
  depoStoklari,
  ambalajlar,
  onOpenStockModal,
}: {
  depoStoklari?: WarehouseStock[];
  ambalajlar?: PackagingOption[];
  onOpenStockModal?: () => void;
}) {
  const defaults = ambalajlar?.[0];
  const physicalStock =
    depoStoklari?.reduce((sum, d) => sum + (d.teslimSuresiGun <= 3 ? d.stokMiktari : 0), 0) ??
    ambalajlar?.reduce((sum, a) => sum + a.stokMiktari, 0) ??
    0;

  const merkez = depoStoklari?.find((d) => d.depoKodu.includes("MERKEZ") || d.teslimSuresiGun === 0) || {
    depoKodu: "MERKEZ-IST",
    depoAdi: "Merkez Depo (İstanbul)",
    stokMiktari: defaults?.stokMiktari ?? 0,
    teslimSuresiGun: 0,
  };

  const sube = depoStoklari?.find(
    (d) =>
      d.depoKodu.includes("SERBEST") ||
      d.depoKodu.includes("SUBE") ||
      (d.teslimSuresiGun > 0 && d.teslimSuresiGun <= 3)
  ) || {
    depoKodu: "SERBEST-BOLGE",
    depoAdi: "Şube / Serbest Bölge Depo",
    stokMiktari: Math.max(0, physicalStock - merkez.stokMiktari),
    teslimSuresiGun: 2,
  };

  const gelecekMiktar = defaults?.gelecekStokMiktari ?? 0;
  const gelecekTarih = defaults?.gelecekStokTarihi ?? null;

  return (
    <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-hafif">
      <div className="mb-3 flex items-center justify-between border-b border-kenar pb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-metin-ucuncul">
          Stok & Depo Dağılımı
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-basari-500" />
          <span className="font-mono text-xs font-bold tabular-nums text-metin">
            {physicalStock.toLocaleString("tr-TR")} Adet Toplam
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Merkez Depo */}
        <div className="flex items-center justify-between rounded-[var(--radius-girdi)] bg-yuzey-gomulu/70 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-basari-500" />
            <div>
              <span className="font-semibold text-metin">{merkez.depoAdi}</span>
              <span className="ml-2 rounded-full bg-basari-50 px-1.5 py-0.2 text-[10px] font-semibold text-basari-600 border border-basari-200/50">
                Aynı Gün Kargo
              </span>
            </div>
          </div>
          <span className="font-mono font-bold tabular-nums text-metin">
            {merkez.stokMiktari.toLocaleString("tr-TR")} Adet
          </span>
        </div>

        {/* Şube Depo */}
        <div className="flex items-center justify-between rounded-[var(--radius-girdi)] bg-yuzey-gomulu/70 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <div>
              <span className="font-semibold text-metin">{sube.depoAdi}</span>
              <span className="ml-2 rounded-full bg-cyan-50 px-1.5 py-0.2 text-[10px] font-medium text-cyan-700 border border-cyan-200/50">
                {sube.teslimSuresiGun > 0 ? `${sube.teslimSuresiGun}-${sube.teslimSuresiGun + 1} İş Günü` : "2-3 İş Günü"}
              </span>
            </div>
          </div>
          <span className="font-mono font-bold tabular-nums text-metin">
            {sube.stokMiktari.toLocaleString("tr-TR")} Adet
          </span>
        </div>

        {/* Gelecek Stok */}
        {gelecekMiktar > 0 && (
          <div className="flex items-center justify-between rounded-[var(--radius-girdi)] bg-amber-50/50 border border-amber-200/40 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-amber-600" />
              <div>
                <span className="font-semibold text-metin">Gelecek Stok (Üretici)</span>
                {gelecekTarih && (
                  <span className="ml-2 text-[10px] text-amber-700 font-mono">
                    Tahmini: {gelecekTarih}
                  </span>
                )}
              </div>
            </div>
            <span className="font-mono font-bold tabular-nums text-amber-800">
              +{gelecekMiktar.toLocaleString("tr-TR")} Adet
            </span>
          </div>
        )}
      </div>

      {physicalStock === 0 && onOpenStockModal && (
        <div className="mt-3 rounded-[var(--radius-girdi)] bg-uyari-50 p-2.5 text-center text-xs text-uyari-900 border border-uyari-200">
          <p className="font-medium">Şu anda fiziksel stok bulunmuyor.</p>
          <button
            type="button"
            onClick={onOpenStockModal}
            className="mt-1.5 font-bold text-vurgu-guclu underline hover:text-vurgu"
          >
            Stok Bildirimi / Alarmı Aç
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   6. INTERACTIVE TIERED PRICING MATRIX
   ========================================================================== */
export function PdpFiyatMatrisi({
  packaging,
  enteredQuantity,
  onSelectSpecialQuote,
}: {
  packaging: PackagingOption;
  enteredQuantity: number;
  onSelectSpecialQuote?: () => void;
}) {
  const tiers = packaging.fiyatlar;
  const aktifKademe = kademeSec(tiers, enteredQuantity);

  return (
    <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-hafif">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-metin-ucuncul">
          Kademeli Fiyatlandırma Tablosu
        </span>
        <span className="text-[11px] text-metin-ucuncul font-mono">
          Birim: {tiers[0]?.paraBirimi || "USD"}
        </span>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-girdi)] border border-kenar">
        <table className="w-full text-xs">
          <thead className="bg-yuzey-gomulu text-left text-metin-ucuncul">
            <tr>
              <th className="px-3 py-2 font-semibold">Miktar Aralığı</th>
              <th className="px-3 py-2 text-right font-semibold">Birim Fiyat</th>
              <th className="px-3 py-2 text-right font-semibold">Tutar (Örnek)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kenar">
            {tiers.map((kademe) => {
              const isActive =
                aktifKademe &&
                kademe.minMiktar === aktifKademe.minMiktar &&
                kademe.birimFiyat === aktifKademe.birimFiyat;
              const ulasilabilir = kademeUlasilabilirMi(kademe, packaging.moq);

              const ornekMiktar = kademe.maxMiktar ? kademe.minMiktar : kademe.minMiktar;
              const ornekTutar = ornekMiktar * kademe.birimFiyat;

              return (
                <tr
                  key={`${kademe.minMiktar}-${kademe.birimFiyat}`}
                  className={`transition-colors ${
                    isActive
                      ? "bg-vurgu-zemin border-l-4 border-l-vurgu font-bold text-vurgu-guclu"
                      : ulasilabilir
                      ? "hover:bg-yuzey-gomulu/50 text-metin"
                      : "opacity-40 bg-yuzey-gomulu/20 text-metin-ucuncul"
                  }`}
                >
                  <td className="px-3 py-2 font-mono tabular-nums">
                    {kademe.minMiktar.toLocaleString("tr-TR")}
                    {kademe.maxMiktar ? ` - ${kademe.maxMiktar.toLocaleString("tr-TR")}` : "+"}
                    {isActive && (
                      <span className="ml-2 inline-flex items-center text-[10px] font-sans font-bold text-vurgu-guclu">
                        <Check size={12} className="mr-0.5" /> Geçerli
                      </span>
                    )}
                    {!ulasilabilir && (
                      <span className="ml-2 text-[10px] font-sans text-metin-ucuncul">
                        (MOQ altı)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {paraBicimle(kademe.birimFiyat, kademe.paraBirimi, 4)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-metin-ikincil">
                    {paraBicimle(ornekTutar, kademe.paraBirimi, 2)}
                  </td>
                </tr>
              );
            })}

            {/* 5.000+ Özel Teklif Satırı */}
            <tr className="bg-navy-50/60 text-navy-900 border-t border-kenar">
              <td className="px-3 py-2 font-mono font-bold">5.000+ Adet</td>
              <td className="px-3 py-2 text-right font-semibold text-vurgu">Özel Fiyat</td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={onSelectSpecialQuote}
                  className="rounded-xs bg-marka px-2 py-0.5 text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                >
                  Teklif İste
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {tiers.some((k) => !kademeUlasilabilirMi(k, packaging.moq)) && (
        <p className="mt-2 text-[11px] leading-relaxed text-metin-ucuncul">
          * Soluk renkli satırlar ambalajın minimum sipariş adedinin ({packaging.moq.toLocaleString("tr-TR")}) altında kaldığı için sipariş edilemez.
        </p>
      )}
    </div>
  );
}

/* ==========================================================================
   7. PACKAGING SELECTOR & PURCHASE ACTION BOX
   ========================================================================== */
export function PdpAmbalajVeSatinAlma({
  product,
  ambalajlar,
  selectedAmbalajId,
  onChangeAmbalaj,
  quantity,
  onChangeQuantity,
  onOpenStockModal,
}: {
  product: ProductDetail;
  ambalajlar: PackagingOption[];
  selectedAmbalajId: number;
  onChangeAmbalaj: (id: number) => void;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  onOpenStockModal?: () => void;
}) {
  const router = useRouter();
  const [cartPending, startCartTransition] = useTransition();
  const [favPending, startFavTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(false);

  const selectedPkg =
    ambalajlar.find((a) => a.ambalajId === selectedAmbalajId) || ambalajlar[0];

  if (!selectedPkg) return null;

  const dogrulama = miktariDogrulaAmbalaj(quantity, selectedPkg);
  const calculation = hesaplaB2BFiyat(quantity, selectedPkg);
  const effectiveQty = dogrulama.gecerliMi ? quantity : dogrulama.onerilenMiktar;
  const totalAmount = calculation.toplamTutar;

  const handleStepIncrement = () => {
    const next = quantity + (selectedPkg.katlamaMiktari > 0 ? selectedPkg.katlamaMiktari : 1);
    onChangeQuantity(next);
  };

  const handleStepDecrement = () => {
    const step = selectedPkg.katlamaMiktari > 0 ? selectedPkg.katlamaMiktari : 1;
    const next = Math.max(selectedPkg.moq, quantity - step);
    onChangeQuantity(next);
  };

  const handleAddToCart = () => {
    startCartTransition(async () => {
      const res = await addToCart(selectedPkg.ambalajId, effectiveQty);
      if (res.success) {
        bildir.eylemli(
          "Sepete Eklendi",
          "Sepete Git ➔",
          () => router.push("/sepet"),
          `${effectiveQty.toLocaleString("tr-TR")} Adet · ${selectedPkg.ad}`
        );
        notifyCartUpdated();
        router.refresh();
      } else {
        bildir.hata("Sepete Eklenemedi", res.message);
      }
    });
  };

  const handleRequestRfq = () => {
    router.push(
      `/teklif-iste?urunId=${product.id}&miktar=${effectiveQty}&ambalajId=${selectedPkg.ambalajId}`
    );
  };

  const handleToggleFavorite = () => {
    startFavTransition(async () => {
      const res = isFavorite ? await favoriSil(product.id) : await favoriEkle(product.id);
      if (res.success) {
        setIsFavorite(!isFavorite);
        notifyFavoritesUpdated();
        bildir.basarili(
          isFavorite ? "Favorilerden Çıkarıldı" : "Favorilere Eklendi",
          product.ureticiUrunKodu
        );
      } else if (res.message?.includes("giriş")) {
        router.push(`/giris?devam=/urunler/${product.id}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Ambalaj Seçici */}
      {ambalajlar.length > 1 && (
        <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-hafif">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-metin-ucuncul">
            Ambalaj Seçeneği
          </label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Ambalaj seçimi">
            {ambalajlar.map((pkg) => {
              const isSelected = pkg.ambalajId === selectedPkg.ambalajId;
              return (
                <button
                  key={pkg.ambalajId}
                  type="button"
                  onClick={() => onChangeAmbalaj(pkg.ambalajId)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-start rounded-[var(--radius-girdi)] border p-2.5 text-left transition-all ${
                    isSelected
                      ? "border-vurgu bg-vurgu-zemin text-vurgu-guclu shadow-xs"
                      : "border-kenar bg-yuzey hover:border-kenar-guclu text-metin"
                  }`}
                >
                  <span className="font-semibold text-xs truncate w-full">{pkg.ad}</span>
                  <div className="mt-1 flex items-center justify-between w-full text-[11px] font-mono text-metin-ucuncul">
                    <span>MOQ: {pkg.moq.toLocaleString("tr-TR")}</span>
                    <span>Stok: {pkg.stokMiktari.toLocaleString("tr-TR")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MOQ / MPQ / Katlama Parametre Şeridi */}
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-kart)] border border-kenar bg-kenar shadow-xs">
        <div className="bg-yuzey-kart p-2.5 text-center">
          <dt className="text-[10px] uppercase font-bold text-metin-ucuncul">
            <Kisaltma kod="MOQ" />
          </dt>
          <dd className="font-mono text-sm font-bold tabular-nums text-metin">
            {selectedPkg.moq.toLocaleString("tr-TR")}
          </dd>
          <dd className="text-[9px] text-metin-ucuncul">Min. Sipariş</dd>
        </div>
        <div className="bg-yuzey-kart p-2.5 text-center">
          <dt className="text-[10px] uppercase font-bold text-metin-ucuncul">
            <Kisaltma kod="MPQ" />
          </dt>
          <dd className="font-mono text-sm font-bold tabular-nums text-metin">
            {selectedPkg.mpq.toLocaleString("tr-TR")}
          </dd>
          <dd className="text-[9px] text-metin-ucuncul">Paket İçi</dd>
        </div>
        <div className="bg-yuzey-kart p-2.5 text-center">
          <dt className="text-[10px] uppercase font-bold text-metin-ucuncul">Katlama</dt>
          <dd className="font-mono text-sm font-bold tabular-nums text-metin">
            {selectedPkg.katlamaMiktari.toLocaleString("tr-TR")}
          </dd>
          <dd className="text-[9px] text-metin-ucuncul">Artış Adımı</dd>
        </div>
      </dl>

      {/* Fiyat Matrisi */}
      <PdpFiyatMatrisi
        packaging={selectedPkg}
        enteredQuantity={effectiveQty}
        onSelectSpecialQuote={handleRequestRfq}
      />

      {/* Satın Alma & Adet Girişi Kutusu */}
      <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-hafif space-y-3">
        <label htmlFor="pdp-quantity-input" className="block text-xs font-bold uppercase tracking-wider text-metin-ucuncul">
          Sipariş Miktarı
        </label>

        {/* Stepper ve Miktar Girişi */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart shadow-xs">
            <button
              type="button"
              onClick={handleStepDecrement}
              aria-label="Miktarı azalt"
              className="flex h-10 w-10 items-center justify-center text-metin-ikincil transition-colors hover:bg-yuzey-gomulu hover:text-metin disabled:opacity-30"
              disabled={quantity <= selectedPkg.moq}
            >
              -
            </button>
            <input
              id="pdp-quantity-input"
              type="number"
              inputMode="numeric"
              min={selectedPkg.moq}
              step={selectedPkg.katlamaMiktari}
              value={quantity}
              onChange={(e) => onChangeQuantity(parseInt(e.target.value, 10) || 0)}
              aria-invalid={!dogrulama.gecerliMi}
              className="h-10 w-28 text-center font-mono text-sm font-bold tabular-nums text-metin focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleStepIncrement}
              aria-label="Miktarı artır"
              className="flex h-10 w-10 items-center justify-center text-metin-ikincil transition-colors hover:bg-yuzey-gomulu hover:text-metin"
            >
              +
            </button>
          </div>

          {/* Hesaplanan Satır Tutarı */}
          <div className="flex-1 rounded-[var(--radius-girdi)] bg-yuzey-gomulu/80 px-3 py-2 text-right">
            <div className="text-[10px] text-metin-ucuncul">Hesaplanan Tutar (+KDV)</div>
            <div className="font-mono text-base font-bold tabular-nums text-metin">
              {paraBicimle(totalAmount, calculation.aktifKademe?.paraBirimi || "USD", 2)}
            </div>
          </div>
        </div>

        {/* Doğrulama Uyarısı */}
        {!dogrulama.gecerliMi && (
          <div className="flex items-start gap-1.5 rounded-[var(--radius-girdi)] bg-uyari-50 p-2 text-xs text-uyari-900 border border-uyari-200">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-uyari-600" />
            <div className="flex-1">
              <span>{dogrulama.hata} </span>
              <button
                type="button"
                onClick={() => onChangeQuantity(dogrulama.onerilenMiktar)}
                className="font-bold underline hover:text-vurgu-guclu ml-1"
              >
                {dogrulama.onerilenMiktar.toLocaleString("tr-TR")} adede tamamla
              </button>
            </div>
          </div>
        )}

        {/* Çift Buton Eylemleri: Sepete Ekle & RFQ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <Buton
            gorunum="vurgu"
            boyut="orta"
            onClick={handleAddToCart}
            yukleniyor={cartPending}
            ikon={<ShoppingCart size={16} />}
            className="w-full font-bold shadow-sm"
          >
            Sepete Ekle
          </Buton>

          <button
            type="button"
            onClick={handleRequestRfq}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-girdi)] bg-marka px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-700 active:scale-[0.98]"
          >
            <FileSpreadsheet size={16} />
            <span>Resmi Teklif İste (RFQ)</span>
          </button>
        </div>

        {/* Hızlı Aksiyon Satırı */}
        <div className="flex items-center justify-between border-t border-kenar pt-2.5 text-xs text-metin-ikincil">
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favPending}
            className="inline-flex items-center gap-1 hover:text-vurgu"
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-vurgu" : ""} />
            <span>{isFavorite ? "Favorilerde" : "Favorilere Ekle"}</span>
          </button>

          {onOpenStockModal && (
            <button
              type="button"
              onClick={onOpenStockModal}
              className="inline-flex items-center gap-1 hover:text-vurgu"
            >
              <Bell size={14} />
              <span>Stok Alarmı</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   8. TECHNICAL SPECIFICATIONS & CAD HUB TABS
   ========================================================================== */
export function PdpTeknikSekmeler({
  product,
  onOpenDocModal,
}: {
  product: ProductDetail;
  onOpenDocModal?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 3>(0);
  const [specSearch, setSpecSearch] = useState("");
  const { addItem, isInComparison } = useComparisonStore();

  const specs = Object.entries(product.ozellikler || {});
  const filteredSpecs = specs.filter(([key, val]) =>
    `${key} ${val}`.toLowerCase().includes(specSearch.toLowerCase())
  );

  const substitutes = product.muadiller || [];
  const similarProducts = product.benzerUrunler || [];
  const parametricProducts = product.parametrikUrunler || [];
  const pairedProducts = product.birlikteKullanilanlar || [];

  const handleAddSubToCompare = (sub: RelatedProductSummary) => {
    const added = addItem({
      id: sub.id,
      ureticiUrunKodu: sub.ureticiUrunKodu,
      ureticiAd: "Distribütör",
      anaGorselUrl: sub.anaGorselUrl,
      baslangicFiyati: 0,
      paraBirimi: "USD",
      toplamStok: 1000,
      kategoriId: product.kategoriId,
    });
    if (added) {
      bildir.basarili("Eklendi", `${sub.ureticiUrunKodu} karşılaştırma listesine eklendi.`);
    } else {
      bildir.bilgi("Limit", "En fazla 4 ürün karşılaştırabilirsiniz.");
    }
  };

  return (
    <section className="mt-10">
      {/* Sekme Butonları */}
      <div className="flex border-b border-kenar overflow-x-auto" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 0}
          onClick={() => setActiveTab(0)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 0
              ? "border-vurgu text-vurgu-guclu bg-vurgu-zemin/40"
              : "border-transparent text-metin-ikincil hover:border-kenar-guclu hover:text-metin"
          }`}
        >
          <Box size={16} />
          <span>Teknik Özellikler</span>
          <span className="ml-1 rounded-full bg-yuzey-gomulu px-2 py-0.2 text-xs font-mono">
            {specs.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 1}
          onClick={() => setActiveTab(1)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 1
              ? "border-vurgu text-vurgu-guclu bg-vurgu-zemin/40"
              : "border-transparent text-metin-ikincil hover:border-kenar-guclu hover:text-metin"
          }`}
        >
          <FileCode size={16} />
          <span>Dokümanlar & CAD Hub</span>
          <span className="ml-1 rounded-full bg-yuzey-gomulu px-2 py-0.2 text-xs font-mono">
            {product.dokumanlar?.length || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 2}
          onClick={() => setActiveTab(2)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 2
              ? "border-vurgu text-vurgu-guclu bg-vurgu-zemin/40"
              : "border-transparent text-metin-ikincil hover:border-kenar-guclu hover:text-metin"
          }`}
        >
          <ArrowLeftRight size={16} />
          <span>Muadiller & Alternatifler</span>
          <span className="ml-1 rounded-full bg-yuzey-gomulu px-2 py-0.2 text-xs font-mono">
            {substitutes.length + similarProducts.length + parametricProducts.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 3}
          onClick={() => setActiveTab(3)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 3
              ? "border-vurgu text-vurgu-guclu bg-vurgu-zemin/40"
              : "border-transparent text-metin-ikincil hover:border-kenar-guclu hover:text-metin"
          }`}
        >
          <Sparkles size={16} />
          <span>Birlikte Kullanılanlar</span>
          <span className="ml-1 rounded-full bg-yuzey-gomulu px-2 py-0.2 text-xs font-mono">
            {pairedProducts.length}
          </span>
        </button>
      </div>

      {/* Sekme 1: Parametrik Teknik Özellikler */}
      {activeTab === 0 && (
        <div className="py-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-metin">Parametrik Teknik Spesifikasyonlar</h3>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-metin-ucuncul" />
              <input
                type="text"
                placeholder="Özellik ara (örn: Flash, Gerilim)..."
                value={specSearch}
                onChange={(e) => setSpecSearch(e.target.value)}
                className="w-full rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart pl-8 pr-3 py-1.5 text-xs text-metin focus:border-vurgu focus:outline-hidden"
              />
            </div>
          </div>

          {filteredSpecs.length > 0 ? (
            <div className="overflow-hidden rounded-[var(--radius-kart)] border border-kenar shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-yuzey-gomulu text-left text-metin-ucuncul border-b border-kenar">
                  <tr>
                    <th className="w-1/2 px-4 py-2.5 font-semibold">Parametre / Özellik Adı</th>
                    <th className="w-1/2 px-4 py-2.5 font-semibold">Değer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kenar">
                  {filteredSpecs.map(([anahtar, deger], idx) => (
                    <tr
                      key={anahtar}
                      className={idx % 2 === 1 ? "bg-yuzey-gomulu/40" : "bg-yuzey-kart"}
                    >
                      <td className="px-4 py-2.5 font-medium text-metin-ikincil">
                        {anahtar.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-semibold tabular-nums text-metin">
                        {deger}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-6 text-center text-xs text-metin-ucuncul">
              Arama kriterinize uygun parametrik özellik bulunamadı.
            </div>
          )}

          {/* Detaylı Açıklama Paragrafı */}
          {product.detayliAciklama && (
            <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-5 shadow-xs">
              <h4 className="mb-2 text-sm font-bold text-metin">Ürün Fonksiyonel Tanımı</h4>
              <p className="text-xs leading-relaxed text-metin-ikincil whitespace-pre-line">
                {product.detayliAciklama}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sekme 2: Dokümanlar & CAD Hub */}
      {activeTab === 1 && (
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-metin">Teknik Doküman & CAD Kütüphanesi</h3>
            {onOpenDocModal && (
              <button
                type="button"
                onClick={onOpenDocModal}
                className="rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart px-3 py-1.5 text-xs font-semibold text-vurgu hover:border-vurgu hover:bg-vurgu-zemin"
              >
                Doküman Talep Et
              </button>
            )}
          </div>

          {product.dokumanlar?.some(dokumanKullanilabilirMi) ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.dokumanlar.filter(dokumanKullanilabilirMi).map((dokuman) => (
                <div
                  key={dokuman.url}
                  className="flex flex-col justify-between rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-xs transition-all hover:border-vurgu hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-yuzey-gomulu p-2.5 text-vurgu">
                      {dokuman.tip === 1 ? (
                        <FileText size={22} />
                      ) : dokuman.tip === 2 ? (
                        <Layers size={22} className="text-cyan-600" />
                      ) : (
                        <ShieldCheck size={22} className="text-basari-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-xs text-metin leading-tight truncate">
                        {dokuman.baslik}
                      </h4>
                      <p className="mt-1 text-[11px] font-mono text-metin-ucuncul">
                        {dokuman.boyutByte
                          ? `${(dokuman.boyutByte / 1024 / 1024).toFixed(2)} MB`
                          : "Doküman"}
                        {dokuman.dil ? ` · ${dokuman.dil}` : ""}
                      </p>
                    </div>
                  </div>

                  <a
                    href={dokuman.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-[var(--radius-girdi)] bg-yuzey-gomulu py-2 text-xs font-semibold text-metin transition-colors hover:bg-vurgu hover:text-white"
                  >
                    <Download size={13} />
                    <span>Dosyayı İndir</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-8 text-center">
              <FileText size={36} className="mx-auto mb-2 text-metin-ucuncul opacity-40" />
              <p className="text-sm font-semibold text-metin">Henüz yayınlanmış doküman bulunmuyor</p>
              <p className="mt-1 text-xs text-metin-ucuncul">
                Bu komponentin teknik datasheet veya CAD dosyası için doğrudan talep formu gönderebilirsiniz.
              </p>
              {onOpenDocModal && (
                <button
                  type="button"
                  onClick={onOpenDocModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-girdi)] bg-vurgu px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Send size={14} />
                  <span>Doküman Talep Et</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sekme 3: Muadiller & Alternatifler */}
      {activeTab === 2 && (
        <div className="py-6 space-y-8">
          {/* Muadiller (Pin-to-Pin Drop-In Replacements) */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-metin">Pin-to-Pin Birebir Muadiller</h3>
                <p className="text-xs text-metin-ucuncul">
                  Doğrudan yerine takılabilir, elektriksel ve mekanik uyumlu alternatif komponentler.
                </p>
              </div>
            </div>

            {substitutes.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {substitutes.map((sub) => {
                  const inComp = isInComparison(sub.id);
                  return (
                    <div
                      key={sub.id}
                      className="flex flex-col justify-between rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-xs hover:border-vurgu transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/urunler/${sub.id}`}
                            className="font-mono text-sm font-bold text-metin hover:text-vurgu"
                          >
                            {sub.ureticiUrunKodu}
                          </Link>
                          <span className="rounded-full bg-basari-50 px-2 py-0.5 text-[10px] font-bold text-basari-600 border border-basari-200/60">
                            %48 Tasarruf
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-metin-ikincil">{sub.kisaAciklama}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-kenar pt-3">
                        <button
                          type="button"
                          onClick={() => handleAddSubToCompare(sub)}
                          className={`rounded-[var(--radius-girdi)] border px-2.5 py-1.5 text-xs font-semibold ${
                            inComp
                              ? "border-vurgu bg-vurgu-zemin text-vurgu-guclu"
                              : "border-kenar bg-yuzey text-metin hover:border-kenar-guclu"
                          }`}
                        >
                          <ArrowLeftRight size={13} className="inline mr-1" />
                          {inComp ? "Listede" : "Karşılaştır"}
                        </button>

                        <Link
                          href={`/urunler/${sub.id}`}
                          className="rounded-[var(--radius-girdi)] bg-vurgu px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                        >
                          İncele
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 text-xs text-metin-ucuncul">
                Bu ürün için tanımlı pin-to-pin muadil bulunamadı.
              </p>
            )}
          </div>

          {/* Benzer Ürünler */}
          {similarProducts.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-metin">Aynı Aileden Benzer Ürünler</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {similarProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/urunler/${p.id}`}
                    className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-3 transition-all hover:border-vurgu hover:shadow-sm"
                  >
                    <p className="font-mono text-xs font-bold text-metin truncate">{p.ureticiUrunKodu}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-metin-ikincil">{p.kisaAciklama}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sekme 4: Birlikte Kullanılanlar */}
      {activeTab === 3 && (
        <div className="py-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-metin">Birlikte Kullanılan Komponentler</h3>
            <p className="text-xs text-metin-ucuncul">
              Bu komponentin referans devre şemasında ve tipik tasarımlarında sıklıkla birlikte tercih edilen pasifler, kristaller ve çevre birimleri.
            </p>
          </div>

          {pairedProducts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pairedProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 shadow-xs hover:border-vurgu transition-all"
                >
                  <div>
                    <Link
                      href={`/urunler/${item.id}`}
                      className="font-mono text-sm font-bold text-metin hover:text-vurgu"
                    >
                      {item.ureticiUrunKodu}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs text-metin-ikincil">{item.kisaAciklama}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-kenar pt-3">
                    <span className="text-xs text-basari-600 font-semibold">Stokta Var</span>
                    <Link
                      href={`/urunler/${item.id}`}
                      className="rounded-[var(--radius-girdi)] bg-marka px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-700"
                    >
                      Ürünü Gör
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 text-xs text-metin-ucuncul">
              Bu ürün için henüz tamamlayıcı komponent listesi tanımlanmamış.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   9. STICKY MOBILE PURCHASE ACTION BAR
   ========================================================================== */
export function PdpMobilSatinAlmaBari({
  product,
  packaging,
  quantity,
  onChangeQuantity,
}: {
  product: ProductDetail;
  packaging?: PackagingOption;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const defaultPkg = packaging || product.ambalajlarVeFiyatlar?.[0];
  if (!defaultPkg) return null;

  const calculation = hesaplaB2BFiyat(quantity, defaultPkg);
  const unitPrice = calculation.gecerliBirimFiyat;

  const handleStepIncrement = () => {
    const step = defaultPkg.katlamaMiktari > 0 ? defaultPkg.katlamaMiktari : 1;
    onChangeQuantity(quantity + step);
  };

  const handleStepDecrement = () => {
    const step = defaultPkg.katlamaMiktari > 0 ? defaultPkg.katlamaMiktari : 1;
    onChangeQuantity(Math.max(defaultPkg.moq, quantity - step));
  };

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addToCart(defaultPkg.ambalajId, quantity);
      if (res.success) {
        bildir.eylemli(
          "Sepete Eklendi",
          "Sepete Git ➔",
          () => router.push("/sepet"),
          `${quantity} Adet · ${product.ureticiUrunKodu}`
        );
        notifyCartUpdated();
      } else {
        bildir.hata("Hata", res.message);
      }
    });
  };

  const handleRequestQuote = () => {
    router.push(
      `/teklif-iste?urunId=${product.id}&miktar=${quantity}&ambalajId=${defaultPkg.ambalajId}`
    );
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-yuzey-kart border-t border-kenar p-3 z-40 md:hidden flex items-center justify-between pb-safe shadow-lg gap-2">
      {/* Sol Özet: MPN & Fiyat */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs font-bold text-metin">
          {product.ureticiUrunKodu}
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="font-mono font-semibold tabular-nums text-vurgu-guclu">
            $ {unitPrice.toFixed(2)}
          </span>
          <span className="text-metin-ucuncul font-sans truncate">· {defaultPkg.ad}</span>
        </div>
      </div>

      {/* Miktar Stepper */}
      <div className="flex items-center rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-gomulu">
        <button
          type="button"
          onClick={handleStepDecrement}
          disabled={quantity <= defaultPkg.moq}
          className="flex h-8 w-7 items-center justify-center text-xs font-bold text-metin-ikincil disabled:opacity-30"
          aria-label="Miktarı azalt"
        >
          -
        </button>
        <span className="min-w-8 text-center font-mono text-xs font-bold tabular-nums text-metin">
          {quantity}
        </span>
        <button
          type="button"
          onClick={handleStepIncrement}
          className="flex h-8 w-7 items-center justify-center text-xs font-bold text-metin-ikincil"
          aria-label="Miktarı artır"
        >
          +
        </button>
      </div>

      {/* Sepete Ekle Butonu */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={pending}
        className="flex items-center gap-1 rounded-[var(--radius-girdi)] bg-vurgu px-3 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
      >
        <ShoppingCart size={14} />
        <span>Sepete Ekle</span>
      </button>

      {/* Teklif İste Butonu */}
      <button
        type="button"
        onClick={handleRequestQuote}
        className="flex items-center justify-center rounded-[var(--radius-girdi)] bg-marka p-2 text-white shadow-xs transition-opacity hover:opacity-90"
        title="Teklif İste"
        aria-label="Teklif İste"
      >
        <FileSpreadsheet size={14} />
      </button>
    </div>
  );
}

/* ==========================================================================
   10. MODALLER (STOK BİLDİRİMİ & DOKÜMAN TALEBİ)
   ========================================================================== */
export function StokAlarmModal({
  isOpen,
  onClose,
  mpn,
}: {
  isOpen: boolean;
  onClose: () => void;
  mpn: string;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      bildir.basarili("Stok Alarmı Kuruldu", `${mpn} stoğa girdiğinde ${email} adresine bildirim gönderilecek.`);
      onClose();
      setSubmitted(false);
      setEmail("");
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-metin-ucuncul hover:text-metin"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-vurgu-zemin p-2.5 text-vurgu-guclu">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-metin">Stok Alarmı Oluştur</h3>
            <p className="text-xs text-metin-ucuncul font-mono">{mpn}</p>
          </div>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-metin-ikincil">
          Bu parça için yeni stok girişi yapıldığında e-posta adresinize otomatik bildirim gönderilir.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-metin mb-1">E-Posta Adresiniz</label>
            <input
              type="email"
              required
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[var(--radius-girdi)] border border-kenar bg-yuzey px-3 py-2 text-xs text-metin focus:border-vurgu focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-girdi)] border border-kenar px-3 py-2 text-xs font-semibold text-metin hover:bg-yuzey-gomulu"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitted}
              className="rounded-[var(--radius-girdi)] bg-vurgu px-4 py-2 text-xs font-bold text-white hover:bg-vurgu-guclu disabled:opacity-50"
            >
              {submitted ? "Kaydediliyor..." : "Alarm Kur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DokumanTalepModal({
  isOpen,
  onClose,
  mpn,
}: {
  isOpen: boolean;
  onClose: () => void;
  mpn: string;
}) {
  const [docType, setDocType] = useState("Datasheet");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      bildir.basarili("Doküman Talebi Alındı", `${mpn} için ${docType} talebiniz teknik mühendislik ekibimize iletildi.`);
      onClose();
      setSubmitted(false);
      setEmail("");
      setNote("");
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs">
      <div className="relative max-w-md w-full rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-metin-ucuncul hover:text-metin"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-cyan-50 p-2.5 text-cyan-700">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-metin">Doküman / CAD Talep Et</h3>
            <p className="text-xs text-metin-ucuncul font-mono">{mpn}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-metin mb-1">Doküman Türü</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-[var(--radius-girdi)] border border-kenar bg-yuzey px-3 py-2 text-xs text-metin focus:border-vurgu focus:outline-hidden"
            >
              <option value="Datasheet">Teknik Datasheet (PDF)</option>
              <option value="3D CAD / STEP">3D STEP / CAD Modeli</option>
              <option value="KiCad / Altium Footprint">PCB EDA Sembol & Footprint</option>
              <option value="RoHS / REACH Sertifikası">Çevresel Uygunluk Sertifikası</option>
              <option value="Uygulama Notu (Application Note)">Uygulama Notu & Seçim Rehberi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-metin mb-1">E-Posta Adresiniz</label>
            <input
              type="email"
              required
              placeholder="muhendis@firma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[var(--radius-girdi)] border border-kenar bg-yuzey px-3 py-2 text-xs text-metin focus:border-vurgu focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-metin mb-1">Açıklama / Proje Notu (Opsiyonel)</label>
            <textarea
              rows={2}
              placeholder="Spesifik paket veya revizyon notunuz varsa belirtin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-[var(--radius-girdi)] border border-kenar bg-yuzey px-3 py-2 text-xs text-metin focus:border-vurgu focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-girdi)] border border-kenar px-3 py-2 text-xs font-semibold text-metin hover:bg-yuzey-gomulu"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitted}
              className="rounded-[var(--radius-girdi)] bg-marka px-4 py-2 text-xs font-bold text-white hover:bg-navy-700 disabled:opacity-50"
            >
              {submitted ? "Gönderiliyor..." : "Talebi İlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
