"use client";

import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import type { ProductDetail } from "@/lib/api";
import {
  PdpBreadcrumb,
  PdpSummaryHeader,
  PdpGallery,
  PdpDepoStoklari,
  PdpAmbalajVeSatinAlma,
  PdpTeknikSekmeler,
  PdpMobilSatinAlmaBari,
  DokumanTalepModal,
} from "./pdp-bilesenleri";
import { StokBildirimModal } from "@/components/stok-bildirim-modal";

export function PdpClient({
  product,
  kategoriYolu,
}: {
  product: ProductDetail;
  kategoriYolu?: string[];
}) {
  const ambalajlar = product.ambalajlarVeFiyatlar || [];
  const defaultPkg = ambalajlar[0] ?? null;

  const [selectedAmbalajId, setSelectedAmbalajId] = useState<number | null>(
    defaultPkg?.ambalajId ?? null
  );
  const selectedPkg =
    ambalajlar.find((a) => a.ambalajId === selectedAmbalajId) ?? defaultPkg;

  const [quantity, setQuantity] = useState<number>(selectedPkg?.moq || 1);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const datasheet = product.dokumanlar?.find((dokuman) => dokuman.tip === 1 || /\.pdf($|\?)/i.test(dokuman.url));
  const kritikOzellikler = Object.entries(product.ozellikler ?? {}).slice(0, 5);

  const handlePackagingChange = (id: number) => {
    setSelectedAmbalajId(id);
    const newPkg = ambalajlar.find((a) => a.ambalajId === id);
    if (newPkg) {
      setQuantity(newPkg.moq);
    }
  };

  return (
    <div className="min-h-screen bg-yuzey">
      {/* 1. Breadcrumb */}
      <PdpBreadcrumb
        kategoriYolu={kategoriYolu}
        ureticiAd={product.ureticiAd}
        ureticiUrunKodu={product.ureticiUrunKodu}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 2. Asimetrik satın alma düzeni: galeri / bilgi / alım */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Sol: büyük ürün görseli ve sade stok özeti */}
          <div className="min-w-0 space-y-5 lg:col-span-5">
            <PdpGallery
              images={product.gorselUrlleri}
              primaryImage={product.anaGorselUrl}
              isRepresentative={product.gorselTemsiliMi ?? true}
              mpn={product.ureticiUrunKodu}
              documents={product.dokumanlar}
            />

            <PdpDepoStoklari
              ambalajlar={product.ambalajlarVeFiyatlar}
              onOpenStockModal={() => setStockModalOpen(true)}
            />
          </div>

          {/* Orta: üretici, parça kodu ve teknik doküman */}
          <div className="min-w-0 space-y-5 lg:col-span-3">
            <PdpSummaryHeader
              product={product}
              onOpenStockModal={() => setStockModalOpen(true)}
            />

            {datasheet && (
              <section className="rounded-token-kart border border-vurgu/30 bg-vurgu-zemin/60 p-3.5" aria-label="Teknik datasheet">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-token-girdi bg-yuzey-kart text-vurgu shadow-xs"><FileText size={20} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-vurgu-guclu">Teknik doküman</p>
                    <h2 className="truncate text-sm font-bold text-metin-marka">{datasheet.baslik || "Datasheet (PDF)"}</h2>
                    <p className="mt-0.5 text-[11px] text-metin-ikincil">{datasheet.boyutByte ? `${(datasheet.boyutByte / 1024 / 1024).toFixed(2)} MB` : "PDF"}{datasheet.dil ? ` · ${datasheet.dil}` : ""}</p>
                  </div>
                  <a href={datasheet.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center rounded-token-girdi bg-marka p-2 text-white transition-colors hover:bg-marka-hover" aria-label="Datasheet'i indir" title="Datasheet'i indir"><Download size={15} /></a>
                </div>
              </section>
            )}

            {kritikOzellikler.length > 0 && (
              <section className="rounded-token-kart border border-kenar bg-yuzey-kart p-3.5" aria-label="Öne çıkan teknik özellikler">
                <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-metin-ucuncul">Öne çıkan özellikler</h2>
                <dl className="divide-y divide-kenar">
                  {kritikOzellikler.map(([ad, deger]) => (
                    <div key={ad} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2 text-xs first:pt-0 last:pb-0">
                      <dt className="truncate text-metin-ikincil">{ad}</dt>
                      <dd className="max-w-[9rem] truncate text-right font-semibold text-metin">{deger}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>

          {/* Sağ: ambalaj, kademeli fiyat ve alım kontrolleri */}
          <div className="min-w-0 space-y-5 lg:col-span-4">
            {selectedPkg && selectedAmbalajId !== null ? (
              <PdpAmbalajVeSatinAlma
                product={product}
                ambalajlar={ambalajlar}
                selectedAmbalajId={selectedAmbalajId}
                onChangeAmbalaj={handlePackagingChange}
                quantity={quantity}
                onChangeQuantity={setQuantity}
                onOpenStockModal={() => setStockModalOpen(true)}
              />
            ) : (
              <section className="rounded-token-kart border border-uyari-200 bg-uyari-50 p-5" aria-label="Satış bilgisi bulunamadı">
                <h2 className="font-bold text-metin">Satış bilgisi henüz tanımlanmamış</h2>
                <p className="mt-2 text-sm leading-relaxed text-metin-ikincil">
                  Bu ürün için ambalaj, stok ve fiyat bilgisi doğrulanmadan sipariş verilemez.
                </p>
                <button type="button" onClick={() => setDocModalOpen(true)} className="mt-4 rounded-token-girdi bg-marka px-4 py-2 text-sm font-bold text-white hover:bg-marka-hover">
                  Satış ekibine sor
                </button>
              </section>
            )}
          </div>
        </div>

        {/* 3. Teknik Doküman, Parametrik Tablo & Muadiller Sekmeleri */}
        <PdpTeknikSekmeler
          product={product}
          onOpenDocModal={() => setDocModalOpen(true)}
        />
      </main>

      {/* 5. Sticky Mobile Action Bar */}
      <PdpMobilSatinAlmaBari
        product={product}
        packaging={selectedPkg}
        quantity={quantity}
        onChangeQuantity={setQuantity}
      />

      {/* Modaller */}
      <StokBildirimModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        mpn={product.ureticiUrunKodu}
        ambalajId={selectedPkg?.ambalajId ?? null}
      />

      <DokumanTalepModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        mpn={product.ureticiUrunKodu}
      />
    </div>
  );
}
