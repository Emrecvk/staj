"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Cpu,
  Layers,
  Lightbulb,
  ToggleRight,
  type LucideIcon,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import type { Category } from "@/lib/api";

const IKON_ESLEME: Record<string, LucideIcon> = {
  "elektronik-komponentler": Cpu,
  "led-aydinlatma": Lightbulb,
  "maker-iot": Layers,
  "uretim-ekipmanlari": ToggleRight,
  otomasyon: Boxes,
};

interface HeroProps {
  categories?: Category[];
  kategoriSayilari?: Record<number, number>;
  stoktakiUrun?: number;
}

export function HeroB2B({ categories = [], kategoriSayilari = {}, stoktakiUrun }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState<Category | null>(null);
  const slides = [
    ["Duyuru", "Component by Çevik 26. sayısı yayında!", "Elektronik sektörünün güncel gelişmeleri, yeni ürünler ve teknoloji trendleri sizi bekliyor.", "Şimdi Keşfet!", "COMPONENT."],
    ["Workshop", "Yeni nesil kontrolcü atölyesi", "MCU, HMI ve gömülü sistemler için teknik içerikleri ve uygulama örneklerini keşfedin.", "Videoyu İzle", "WORKSHOP"],
    ["Yeni", "Line Card’ımız yayında!", "Global iş ortaklarımız ve genişleyen ürün portföyümüzle yanınızdayız.", "İncele", "LINE CARD"],
  ];
  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((value) => (value + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const slide = slides[activeSlide];
  return (
    <section className="border-b border-kenar bg-yuzey" aria-label="Ana giriş">
      <Kapsayici className="py-6 md:py-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {categories.length > 0 && (
          <nav
            aria-label="Ana kategoriler"
            className="relative z-20 hidden rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart px-6 py-7 lg:col-span-4 lg:block"
            onMouseLeave={() => { setHoveredCategory(null); setHoveredSubCategory(null); }}
          >
            <h2 className="sr-only">Kategoriler</h2>
            <ul>
              {categories.map((kategori) => {
                const Icon = IKON_ESLEME[kategori.slug] ?? Boxes;
                const altKategoriler = kategori.altKategoriler ?? [];
                const urunSayisi = kategoriSayilari[kategori.id];
                return (
                  <li
                    key={kategori.id}
                    onMouseEnter={() => {
                      setHoveredCategory(kategori.id);
                      setHoveredSubCategory(null);
                    }}
                  >
                    <Link
                      href={`/urunler?kategoriId=${kategori.id}`}
                      className="group flex items-center gap-4 rounded-[var(--radius-girdi)] px-2 py-4 transition-colors hover:bg-vurgu-zemin"
                    >
                      <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-lg bg-[#eeeff7]">
                        <Icon size={21} className="text-vurgu" aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-base font-medium text-metin group-hover:text-vurgu-guclu">
                        {kategori.ad}
                      </span>
                      {typeof urunSayisi === "number" && urunSayisi > 0 && (
                        <span className="text-xs font-semibold text-metin-ucuncul tabular-nums">
                          {urunSayisi.toLocaleString("tr-TR")}
                        </span>
                      )}
                      <ArrowRight size={14} className="text-metin-ucuncul ml-2" aria-hidden="true" />
                    </Link>
                    {hoveredCategory === kategori.id && altKategoriler.length > 0 && (
                      <div
                        className="absolute top-0 left-full z-30 h-[590px] pl-4"
                        onMouseEnter={() => setHoveredCategory(kategori.id)}
                      >
                        <div className={`flex h-full rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart p-7 shadow-[var(--shadow-katman)] transition-[width] duration-300 overflow-hidden ${hoveredSubCategory ? "w-[600px]" : "w-[360px]"}`}>

                          <div className="w-[304px] shrink-0 overflow-y-auto pr-6">
                            <h3 className="text-2xl font-extrabold leading-tight text-metin-marka">{kategori.ad}</h3>
                            <ul className="mt-5 space-y-1">
                              {altKategoriler.map((alt) => (
                                <li key={alt.id} onMouseEnter={() => setHoveredSubCategory(alt)}>
                                  <Link
                                    href={`/urunler?kategoriId=${alt.id}`}
                                    className={`flex items-center py-1.5 text-base transition-colors ${hoveredSubCategory?.id === alt.id ? "text-vurgu font-medium" : "text-metin"}`}
                                  >
                                    <span>{alt.ad}</span>
                                    <ArrowRight size={15} className={`ml-2 ${hoveredSubCategory?.id === alt.id ? "text-vurgu" : "text-kenar-guclu"}`} />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {hoveredSubCategory && (hoveredSubCategory.altKategoriler?.length ?? 0) > 0 && (
                            <div className="w-[220px] shrink-0 overflow-y-auto border-l border-kenar px-6">
                              <h4 className="text-lg font-bold text-metin-marka">{hoveredSubCategory.ad}</h4>
                              <ul className="mt-5 space-y-2 text-base text-metin-ikincil">
                                {(hoveredSubCategory.altKategoriler ?? []).map((item) => (
                                  <li key={item.id}>
                                    <Link
                                      href={`/urunler?kategoriId=${item.id}`}
                                      className="flex items-center py-1 hover:text-vurgu transition-colors"
                                    >
                                      <span>{item.ad}</span>
                                      <ArrowRight size={15} className="text-kenar-guclu ml-2" />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          )}

          <div className={`relative min-h-[440px] overflow-hidden rounded-[var(--radius-panel)] border border-kenar bg-[#faf9f7] p-8 md:p-12 ${categories.length > 0 ? "lg:col-span-8" : "lg:col-span-12"}`}>
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-marka) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
              aria-hidden="true"
            />
            <div className="relative flex h-full flex-col">
              <span className="inline-flex w-fit items-center rounded-full bg-[#12ae8c] px-3.5 py-1.5 text-sm font-bold text-white">
                {slide[0]}
              </span>
              <h1 className="mt-14 max-w-[18ch] text-4xl font-black uppercase leading-[1.05] tracking-tight text-[#292d32] md:text-5xl">
                {slide[1]}
              </h1>
              <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-[#46515c]">
                {slide[2]}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-10">
                <Link
                  href="/hakkimizda"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1834b8] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-[#11288f]"
                >
                  {slide[3]} <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {typeof stoktakiUrun === "number" && stoktakiUrun > 0 && (
                  <Link
                    href="/urunler?sadeceStoktakiler=true"
                    className="inline-flex items-center gap-2 rounded-full border border-[#d5d8de] bg-white px-5 py-4 text-sm font-semibold text-[#46515c] transition-colors hover:border-[#1834b8] hover:text-[#1834b8]"
                  >
                    <span className="tabular-nums font-bold text-[#12ae8c]">{stoktakiUrun.toLocaleString("tr-TR")}</span>
                    ürün stokta
                  </Link>
                )}
              </div>
            </div>
            <div className="pointer-events-none absolute right-8 top-1/2 hidden h-64 w-52 -translate-y-1/2 rotate-6 rounded-md bg-[#10263f] shadow-xl md:block" aria-hidden="true">
              <div className="m-3 h-16 border-b border-white/20 pt-2 text-center text-2xl font-black italic text-white">{slide[4]}</div>
              <div className="m-5 h-24 rounded-full bg-[#1b3f61]" />
              <div className="mx-5 space-y-2"><div className="h-2 w-4/5 bg-[#14ae8c]" /><div className="h-2 w-3/5 bg-white/50" /><div className="h-2 w-2/3 bg-white/30" /></div>
            </div>
            <div className="absolute bottom-10 right-10 flex items-center gap-4" aria-label="Duyuru slaytları">{slides.map((item, index) => <button type="button" key={item[0]} onClick={() => setActiveSlide(index)} aria-label={`${item[0]} duyurusunu göster`} className={`h-2.5 w-2.5 rounded-full transition-all ${activeSlide === index ? "bg-blue-500 ring-4 ring-blue-100" : "bg-gray-300"}`} />)}</div>
          </div>
        </div>
      </Kapsayici>
    </section>
  );
}
