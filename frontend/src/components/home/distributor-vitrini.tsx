"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import type { UreticiOzet } from "@/lib/api";

/**
 * Yetkili distribütör markaları vitrini. Markalar ve ürün sayıları GERÇEK
 * API verisinden gelir (`/Katalog/ureticiler`); tıklama gerçek üretici
 * filtresine (`/urunler?ureticiId=...`) götürür. Uzmanlık etiketi yalnızca
 * bilinen markalar için kürasyonla zenginleştirilir, veri değildir.
 */

// Bilinen markalar için kozmetik uzmanlık etiketi. Eşleşme yoksa boş geçilir;
// uydurma sayı/oran değil, yalnızca görsel zenginlik.
const UZMANLIK: Record<string, string> = {
  STMicroelectronics: "MCU, Güç Yarı İletkenleri & Sensörler",
  "Texas Instruments": "Analog, Güç Yönetimi & DSP",
  Microchip: "PIC & AVR MCU, EEPROM",
  NXP: "MCU, Arayüz & Otomotiv",
  Renesas: "MCU & Analog",
  "Analog Devices": "Yüksek Başarımlı Analog",
  onsemi: "Güç & Ayrık Yarı İletkenler",
  "Diodes Inc": "Ayrık & Arayüz",
  Murata: "MLCC Seramik Kapasitör & RF",
  Yageo: "SMD Çip Direnç & İndüktör",
  Vishay: "Ayrık Yarı İletkenler & Pasifler",
};

function monogram(ad: string): string {
  const temiz = ad.replace(/[^A-Za-z0-9 ]/g, "").trim();
  if (temiz.length <= 8) return temiz.toUpperCase();
  const kelimeler = temiz.split(/\s+/);
  if (kelimeler.length > 1) return kelimeler.map((k) => k[0]).join("").toUpperCase().slice(0, 4);
  return temiz.slice(0, 6).toUpperCase();
}

export function DistributorVitrini({ ureticiler }: { ureticiler: UreticiOzet[] }) {
  const [sayfa, setSayfa] = useState(0);
  const visibleCount = 5; // masaüstünde görünür kart sayısı

  if (!ureticiler || ureticiler.length === 0) return null;

  const toplamSayfa = Math.ceil(ureticiler.length / visibleCount);
  const aktifSayfa = Math.min(sayfa, toplamSayfa - 1);
  const gorunenler = ureticiler.slice(aktifSayfa * visibleCount, aktifSayfa * visibleCount + visibleCount);

  return (
    <section className="bg-yuzey py-12 md:py-16" aria-label="Yetkili Distribütör Markaları">
      <Kapsayici>
        {/* Başlık */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-metin md:text-3xl">
            Yetkili Distribütör Markaları
          </h2>
        </div>

        {/* Marka kartları */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {gorunenler.map((uretici) => {
            const markaUrl = `/urunler?ureticiId=${uretici.id}`;
            const uzmanlik = UZMANLIK[uretici.ad];

            return (
              <Link
                key={uretici.id}
                href={markaUrl}
                aria-label={`${uretici.ad} ürünlerini görüntüle`}
                className="group relative flex flex-col justify-between rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 transition-all duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-[var(--shadow-yukselti)]"
              >
                <div>
                  {/* Logo kutusu / monogram */}
                  <div className="mb-3 flex h-14 w-full items-center justify-center rounded-[var(--radius-girdi)] border border-kenar/50 bg-yuzey-gomulu px-3 py-2 transition-colors group-hover:border-vurgu/40 group-hover:bg-vurgu-zemin/40">
                    {uretici.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={uretici.logoUrl}
                        alt={uretici.ad}
                        className="max-h-9 w-auto object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-mono text-base font-extrabold tracking-wider text-metin-marka transition-colors group-hover:text-vurgu-guclu">
                        {monogram(uretici.ad)}
                      </span>
                    )}
                  </div>

                  {/* Marka adı + yetkili rozeti */}
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="line-clamp-1 text-sm font-bold text-metin transition-colors group-hover:text-vurgu">
                      {uretici.ad}
                    </h3>
                    {uretici.yetkiliDistributorMu && (
                      <span title="Resmi Yetkili Distribütör" className="inline-flex shrink-0">
                        <CheckCircle2 size={14} className="text-basari-600" aria-label="Yetkili Distribütör" />
                      </span>
                    )}
                  </div>

                  {uzmanlik && (
                    <p className="mt-1 line-clamp-1 text-[11px] text-metin-ucuncul">{uzmanlik}</p>
                  )}
                </div>

                {/* Gerçek ürün sayısı + git oku */}
                <div className="mt-4 flex items-center justify-between border-t border-kenar/60 pt-2.5 text-[11px]">
                  <span className="text-metin-ucuncul">
                    {uretici.urunSayisi.toLocaleString("tr-TR")} ürün
                  </span>
                  <span className="inline-flex items-center font-bold text-vurgu transition-transform group-hover:translate-x-0.5">
                    Ürünleri Gör <ArrowRight size={12} className="ml-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Nokta sayfalama */}
        {toplamSayfa > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: toplamSayfa }).map((_, i) => {
              const secili = i === aktifSayfa;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSayfa(i)}
                  aria-label={`Sayfa ${i + 1}`}
                  aria-current={secili ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-[var(--sure-acilir)] ${
                    secili ? "w-6 bg-vurgu" : "w-2 bg-kenar hover:bg-vurgu/50"
                  }`}
                />
              );
            })}
          </div>
        )}
      </Kapsayici>
    </section>
  );
}
