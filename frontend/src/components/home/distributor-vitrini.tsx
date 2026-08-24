"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronLeft, ChevronRight, ArrowRight, Award, CheckCircle2 } from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";

interface SupplierBrand {
  id: number;
  name: string;
  shortCode: string;
  logoText: string;
  logo?: string;
  authorized: boolean;
  origin: string;
  specialty: string;
}

const AUTHORIZED_SUPPLIERS: SupplierBrand[] = [
  {
    id: 1,
    name: "STMicroelectronics",
    shortCode: "ST",
    logoText: "STMicroelectronics",
    logo: "/brands/st.svg",
    authorized: true,
    origin: "İsviçre / Fransa",
    specialty: "MCU, Güç Yarı İletkenleri & Sensörler",
  },
  {
    id: 2,
    name: "Texas Instruments",
    shortCode: "TI",
    logoText: "Texas Instruments",
    logo: "/brands/ti.svg",
    authorized: true,
    origin: "ABD",
    specialty: "Analog, Güç Yönetimi & DSP",
  },
  {
    id: 3,
    name: "Murata Electronics",
    shortCode: "MURATA",
    logoText: "Murata",
    logo: "/brands/murata.svg",
    authorized: true,
    origin: "Japonya",
    specialty: "MLCC Seramik Kapasitör & RF Filtreler",
  },
  {
    id: 4,
    name: "GigaDevice",
    shortCode: "GD",
    logoText: "GigaDevice",
    logo: "/brands/gigadevice.svg",
    authorized: true,
    origin: "Çin",
    specialty: "Flash Bellek & Yüksek Hızlı MCU",
  },
  {
    id: 5,
    name: "Yageo",
    shortCode: "YAGEO",
    logoText: "Yageo",
    logo: "/brands/yageo.svg",
    authorized: true,
    origin: "Tayvan",
    specialty: "SMD Çip Direnç & İndüktör",
  },
  {
    id: 6,
    name: "Vishay",
    shortCode: "VISHAY",
    logoText: "Vishay",
    logo: "/brands/vishay.svg",
    authorized: true,
    origin: "ABD",
    specialty: "Ayrık Yarı İletkenler & Pasifler",
  },
  {
    id: 7,
    name: "Microchip",
    shortCode: "MCHP",
    logoText: "Microchip",
    logo: "/brands/microchip.svg",
    authorized: true,
    origin: "ABD",
    specialty: "PIC & AVR MCU, EEPROM",
  },
  {
    id: 8,
    name: "Omron",
    shortCode: "OMRON",
    logoText: "Omron",
    logo: "/brands/omron.svg",
    authorized: true,
    origin: "Japonya",
    specialty: "Endüstriyel Röleler & Anahtarlar",
  },
  {
    id: 9,
    name: "Phoenix Contact",
    shortCode: "PHOENIX",
    logoText: "Phoenix Contact",
    logo: "/brands/phoenix.svg",
    authorized: true,
    origin: "Almanya",
    specialty: "PCB Klemens & Endüstriyel Bağlantı",
  },
  {
    id: 10,
    name: "Mean Well",
    shortCode: "MW",
    logoText: "Mean Well",
    logo: "/brands/meanwell.svg",
    authorized: true,
    origin: "Tayvan",
    specialty: "DIN Ray & SMPS Güç Kaynakları",
  },
];

export function DistributorVitrini() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalBrands = AUTHORIZED_SUPPLIERS.length;
  const visibleCount = 5; // desktop visible items

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalBrands - visibleCount));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="bg-yuzey py-12 md:py-16" aria-label="Yetkili Distribütör Markaları">
      <Kapsayici>
        {/* Trust Badge Top Banner */}
        <div className="mb-10 rounded-[var(--radius-panel)] border border-cyan-500/20 bg-vurgu-zemin/60 p-5 md:p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-vurgu text-white shadow-xs">
                <ShieldCheck size={26} strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-metin md:text-lg">
                    %100 Orijinal Ürün Garantisi
                  </h3>
                  <span className="rounded-full bg-basari-50 px-2 py-0.5 text-[10px] font-bold text-basari-600">
                    Fabrika Çıkışlı
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-metin-ikincil md:text-sm">
                  Doğrudan üretici fabrikalarından tedarik edilen orijinal komponentler, tam izlenebilirlik ve üretici sertifikasyonu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch border-t border-cyan-500/10 pt-3 md:self-auto md:border-t-0 md:pt-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-vurgu-guclu">
                <Award size={16} /> Resmi Line-Card Distribütörü
              </div>
            </div>
          </div>
        </div>

        {/* Section Header with Carousel Navigation Controls */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-vurgu">
              Resmi Üretici Ağı
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-metin md:text-3xl">
              Yetkili Distribütör Markaları
            </h2>
            <p className="mt-1 text-sm text-metin-ikincil">
              Küresel ölçekte lider komponent üreticilerinin yetkili Türkiye ve bölge distribütörlüğü.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/urunler"
              className="hidden text-xs font-bold text-vurgu hover:underline sm:inline-block"
            >
              Tüm Markaları Gör ➔
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prev}
                disabled={currentIndex === 0}
                aria-label="Önceki Markalar"
                className="rounded-full border border-kenar bg-yuzey-kart p-2 text-metin transition-colors hover:border-vurgu hover:text-vurgu disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={currentIndex >= totalBrands - visibleCount}
                aria-label="Sonraki Markalar"
                className="rounded-full border border-kenar bg-yuzey-kart p-2 text-metin transition-colors hover:border-vurgu hover:text-vurgu disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Brand Carousel Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {AUTHORIZED_SUPPLIERS.slice(currentIndex, currentIndex + 5).map((supplier) => {
            const brandCatalogUrl = `/urunler?marka=${encodeURIComponent(supplier.name)}`;
            const altText = `${supplier.name} Yetkili Distribütör`;

            return (
              <Link
                key={supplier.id}
                href={brandCatalogUrl}
                aria-label={altText}
                className="group relative flex flex-col justify-between rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 transition-all duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-[var(--shadow-yukselti)]"
              >
                {/* Brand Logo Box / Monogram */}
                <div>
                  <div className="mb-3 flex h-14 w-full items-center justify-center rounded-[var(--radius-girdi)] border border-kenar/50 bg-yuzey-gomulu px-3 py-2 transition-colors group-hover:border-vurgu/40 group-hover:bg-vurgu-zemin/40">
                    <span className="font-mono text-base font-extrabold tracking-wider text-metin-marka transition-colors group-hover:text-vurgu-guclu">
                      {supplier.shortCode}
                    </span>
                  </div>

                  {/* Brand Name & Authorization Pill */}
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="line-clamp-1 text-sm font-bold text-metin transition-colors group-hover:text-vurgu">
                      {supplier.name}
                    </h3>
                    {supplier.authorized && (
                      <span title="Resmi Yetkili Distribütör" className="inline-flex shrink-0">
                        <CheckCircle2
                          size={14}
                          className="text-basari-600"
                          aria-label="Yetkili Distribütör"
                        />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 line-clamp-1 text-[11px] text-metin-ucuncul">
                    {supplier.specialty}
                  </p>
                </div>

                {/* Alt link — uydurma "X Ürün" sayaci kaldirildi (marka bazli
                    gercek sayim veren API ucu yok). */}
                <div className="mt-4 flex items-center justify-end border-t border-kenar/60 pt-2.5 text-[11px]">
                  <span className="inline-flex items-center font-bold text-vurgu transition-transform group-hover:translate-x-0.5">
                    Ürünleri Gör <ArrowRight size={12} className="ml-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Kapsayici>
    </section>
  );
}
