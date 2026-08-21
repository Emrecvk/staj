"use client";

import React, { useState } from "react";
import type { ProductDetail } from "@/lib/api";
import {
  PdpBreadcrumb,
  PdpSummaryHeader,
  PdpGallery,
  PdpDepoStoklari,
  PdpAmbalajVeSatinAlma,
  PdpTeknikSekmeler,
  PdpMobilSatinAlmaBari,
  StokAlarmModal,
  DokumanTalepModal,
} from "./pdp-bilesenleri";

export function PdpClient({
  product,
  kategoriYolu,
}: {
  product: ProductDetail;
  kategoriYolu?: string[];
}) {
  const ambalajlar = product.ambalajlarVeFiyatlar || [];
  const defaultPkg = ambalajlar[0] || {
    ambalajId: 1,
    ad: "Tape & Reel",
    kod: "TR",
    moq: 1,
    mpq: 1,
    katlamaMiktari: 1,
    stokMiktari:
      product.ambalajlarVeFiyatlar?.[0]?.stokMiktari ||
      product.depoStoklari?.reduce((s, d) => s + d.stokMiktari, 0) ||
      0,
    gelecekStokMiktari: 0,
    gelecekStokTarihi: null,
    fiyatlar: [
      {
        minMiktar: 1,
        maxMiktar: null,
        birimFiyat: 10,
        paraBirimi: "USD",
      },
    ],
  };

  const [selectedAmbalajId, setSelectedAmbalajId] = useState<number>(
    defaultPkg.ambalajId
  );
  const selectedPkg =
    ambalajlar.find((a) => a.ambalajId === selectedAmbalajId) || defaultPkg;

  const [quantity, setQuantity] = useState<number>(selectedPkg.moq || 1);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);

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
        productId={product.id}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 2. Summary Header */}
        <PdpSummaryHeader
          product={product}
          onOpenStockModal={() => setStockModalOpen(true)}
        />

        {/* 3. Ana Gövde Grid (Sol: Galeri & Depo Stokları, Sağ: Fiyat & Satın Alma) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sol Kolon (5/12) */}
          <div className="space-y-6 lg:col-span-5">
            <PdpGallery
              images={product.gorselUrlleri}
              primaryImage={product.anaGorselUrl}
              isRepresentative={product.gorselTemsiliMi ?? true}
              mpn={product.ureticiUrunKodu}
              documents={product.dokumanlar}
            />

            <PdpDepoStoklari
              depoStoklari={product.depoStoklari}
              ambalajlar={product.ambalajlarVeFiyatlar}
              onOpenStockModal={() => setStockModalOpen(true)}
            />
          </div>

          {/* Sağ Kolon (7/12) */}
          <div className="space-y-6 lg:col-span-7">
            <PdpAmbalajVeSatinAlma
              product={product}
              ambalajlar={ambalajlar}
              selectedAmbalajId={selectedAmbalajId}
              onChangeAmbalaj={handlePackagingChange}
              quantity={quantity}
              onChangeQuantity={setQuantity}
              onOpenStockModal={() => setStockModalOpen(true)}
            />
          </div>
        </div>

        {/* 4. Teknik Doküman, Parametrik Tablo & Muadiller Sekmeleri */}
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
      <StokAlarmModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        mpn={product.ureticiUrunKodu}
      />

      <DokumanTalepModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        mpn={product.ureticiUrunKodu}
      />
    </div>
  );
}
