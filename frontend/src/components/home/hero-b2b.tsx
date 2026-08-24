"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
import {
  VITRIN_KATEGORI_AGACI,
  type VitrinKategoriDali,
} from "@/components/home/vitrin-kategori-verisi";

const VITRIN_KATEGORI_IKONLARI: LucideIcon[] = [
  Cpu,
  Lightbulb,
  Layers,
  ToggleRight,
  Boxes,
];

interface HeroProps {
  categories?: Category[];
  kategoriSayilari?: Record<number, number>;
  stoktakiUrun?: number;
}

export function HeroB2B({ categories = [], stoktakiUrun }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState<VitrinKategoriDali | null>(null);
  const [hoveredThirdCategory, setHoveredThirdCategory] = useState<VitrinKategoriDali | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryHover = (id: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(id);
      setHoveredSubCategory(null);
      setHoveredThirdCategory(null);
    }, 150);
  };

  const handleNavLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setHoveredSubCategory(null);
      setHoveredThirdCategory(null);
    }, 200);
  };
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

  const tumGercekKategoriler = (dallar: Category[]): Category[] =>
    dallar.flatMap((dal) => [dal, ...tumGercekKategoriler(dal.altKategoriler ?? [])]);

  const kategoriBaglantisi = (ad: string) => {
    const normalize = (deger: string) =>
      deger.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]/g, "");
    const eslesen = tumGercekKategoriler(categories).find(
      (kategori) => normalize(kategori.ad) === normalize(ad),
    );
    return eslesen
      ? `/urunler?kategoriId=${eslesen.id}`
      : `/urunler?aramaMetni=${encodeURIComponent(ad)}`;
  };

  return (
    <section className="bg-yuzey" aria-label="Ana giriş">
      <Kapsayici className="py-6 md:py-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {categories.length > 0 && (
            <nav
              aria-label="Ana kategoriler"
              className="relative z-20 hidden h-full rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart px-3 py-3 lg:col-span-3 lg:block"
              onMouseLeave={handleNavLeave}
            >
              <h2 className="sr-only">Kategoriler</h2>
              <ul className="mx-auto flex h-full w-full max-w-[300px] flex-col justify-center gap-1">
                {VITRIN_KATEGORI_AGACI.map((kategori, index) => {
                  const Icon = VITRIN_KATEGORI_IKONLARI[index] ?? Boxes;
                  return (
                    <li key={kategori.ad} onMouseEnter={() => handleCategoryHover(index)}>
                      <Link href={kategoriBaglantisi(kategori.ad)} className="group flex items-center gap-3 rounded-[var(--radius-girdi)] px-1.5 py-2 transition-colors hover:bg-vurgu-zemin">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eeeff7]">
                          <Icon size={19} className="text-vurgu" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-metin">{kategori.ad}</span>
                        <ArrowRight size={14} className="shrink-0 text-metin-ucuncul opacity-40" aria-hidden="true" />
                      </Link>
                      {hoveredCategory === index && kategori.altlar.length > 0 && (
                        <div className="absolute left-[calc(100%+1rem)] top-0 z-30 min-h-full">
                          <div className={`flex min-h-[620px] items-stretch overflow-visible rounded-[var(--radius-panel)] border border-kenar bg-yuzey-kart shadow-[var(--shadow-katman)] transition-[width] duration-200 ${hoveredThirdCategory?.altlar.length ? "w-[990px]" : hoveredSubCategory?.altlar.length ? "w-[660px]" : "w-[330px]"}`}>
                            <div className="w-[330px] shrink-0 p-6">
                              <h3 className="flex h-14 items-start text-2xl font-extrabold leading-tight text-metin-marka">{kategori.ad}</h3>
                              <ul className="mt-5">
                                {kategori.altlar.map((alt) => (
                                  <li key={alt.ad} onMouseEnter={() => { setHoveredSubCategory(alt); setHoveredThirdCategory(null); }}>
                                    <Link href={kategoriBaglantisi(alt.ad)} className={`flex min-h-10 items-center justify-between gap-3 px-3 py-2 text-[15px] transition-colors ${hoveredSubCategory?.ad === alt.ad ? "bg-[#e5eaee] font-semibold text-metin-marka" : "text-metin hover:bg-yuzey-gomulu"}`}>
                                      <span>{alt.ad}</span>
                                      {alt.altlar.length > 0 && <ArrowRight size={15} className={hoveredSubCategory?.ad === alt.ad ? "text-vurgu" : "text-kenar-guclu"} />}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {hoveredSubCategory && hoveredSubCategory.altlar.length > 0 && (
                              <div className="w-[330px] shrink-0 border-l border-kenar px-6 pb-6 pt-[100px]">
                                <ul>
                                  {hoveredSubCategory.altlar.map((alt) => (
                                    <li key={alt.ad} onMouseEnter={() => setHoveredThirdCategory(alt)}>
                                      <Link href={kategoriBaglantisi(alt.ad)} className={`flex min-h-10 items-center justify-between gap-3 px-3 py-2 text-[15px] transition-colors ${hoveredThirdCategory?.ad === alt.ad ? "bg-[#e5eaee] font-semibold text-metin-marka" : "text-metin hover:bg-yuzey-gomulu"}`}>
                                        <span>{alt.ad}</span>
                                        {alt.altlar.length > 0 && <ArrowRight size={15} className={hoveredThirdCategory?.ad === alt.ad ? "text-vurgu" : "text-kenar-guclu"} />}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {hoveredThirdCategory && hoveredThirdCategory.altlar.length > 0 && (
                              <div className="w-[330px] shrink-0 border-l border-kenar px-6 pb-6 pt-[100px]">
                                <ul>
                                  {hoveredThirdCategory.altlar.map((alt) => (
                                    <li key={alt.ad}>
                                      <Link href={kategoriBaglantisi(alt.ad)} className="block min-h-10 px-3 py-2 text-[15px] text-metin transition-colors hover:bg-yuzey-gomulu hover:text-vurgu">{alt.ad}</Link>
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

          <div className={`relative h-[520px] overflow-hidden rounded-[var(--radius-panel)] border border-kenar bg-[#faf9f7] p-8 md:p-10 ${categories.length > 0 ? "lg:col-span-9" : "lg:col-span-12"}`}>
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
