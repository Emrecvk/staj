"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Kapsayici } from "@/components/ui/yuzey";
import { SAYFALAMA_SURESI_MS, SayfalamaNoktasi } from "@/components/ui/sayfalama-noktasi";
import type { UreticiOzet } from "@/lib/api";
import { markaLogosuGetir } from "@/lib/vitrin-gorselleri";

/**
 * Yetkili distribütör markaları vitrini. Markalar GERÇEK API verisinden
 * gelir (`/Katalog/ureticiler`); tıklama gerçek üretici filtresine
 * (`/urunler?ureticiId=...`) götürür.
 */

export function DistributorVitrini({ ureticiler }: { ureticiler: UreticiOzet[] }) {
  const [sayfa, setSayfa] = useState(0);
  const visibleCount = 5; // masaüstünde görünür kart sayısı
  const logoluUreticiler = ureticiler.filter((uretici) =>
    Boolean(markaLogosuGetir(uretici.ad, uretici.logoUrl)),
  );
  // Vitrin yalnızca ilk 25 gerçek üreticiyi sayfalayarak sabit beş noktalı
  // bir kontrol sunar; üretici kataloğunun tamamı /markalar sayfasındadır.
  const vitrinUreticileri = logoluUreticiler.slice(0, visibleCount * 5);
  const toplamSayfa = Math.min(5, Math.ceil(vitrinUreticileri.length / visibleCount));
  const aktifSayfa = toplamSayfa > 0 ? Math.min(sayfa, toplamSayfa - 1) : 0;

  useEffect(() => {
    const hareketAzaltildi = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hareketAzaltildi || toplamSayfa <= 1) return;

    const timer = window.setTimeout(
      () => setSayfa((deger) => (deger + 1) % toplamSayfa),
      SAYFALAMA_SURESI_MS,
    );
    return () => window.clearTimeout(timer);
  }, [aktifSayfa, toplamSayfa]);

  if (logoluUreticiler.length === 0) return null;

  const gorunenler = vitrinUreticileri.slice(aktifSayfa * visibleCount, aktifSayfa * visibleCount + visibleCount);

  return (
    <section className="bg-yuzey py-12 md:py-16" aria-label="Yetkili Distribütör Markaları">
      <Kapsayici>
        {/* Başlık ve Sayfalama */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-metin md:text-3xl">
            Yetkili Distribütör Markaları
          </h2>

          {/* Nokta sayfalama */}
          {toplamSayfa > 1 && (
            <div className="flex items-center gap-2">
              {Array.from({ length: toplamSayfa }).map((_, i) => {
                const secili = i === aktifSayfa;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSayfa(i)}
                    aria-label={`Sayfa ${i + 1}`}
                    aria-current={secili ? "true" : undefined}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                  >
                    <SayfalamaNoktasi secili={secili} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Marka logoları */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {gorunenler.map((uretici) => {
            const markaUrl = `/urunler?ureticiId=${uretici.id}`;
            const logoUrl = markaLogosuGetir(uretici.ad, uretici.logoUrl);

            return (
              <Link
                key={uretici.id}
                href={markaUrl}
                aria-label={`${uretici.ad} ürünlerini görüntüle`}
                className="group flex h-24 items-center justify-center px-5 transition-opacity duration-[var(--sure-acilir)] hover:opacity-70"
              >
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={uretici.ad}
                    className="max-h-14 max-w-full object-contain"
                    loading="lazy"
                  />
                )}
              </Link>
            );
          })}
        </div>

        </Kapsayici>
    </section>
  );
}
