"use client";

import Link from "next/link";
import Image from "next/image";
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
import { SAYFALAMA_SURESI_MS, SayfalamaNoktasi } from "@/components/ui/sayfalama-noktasi";
import { kategoriBaglantisiniKur } from "@/lib/kategori-baglantisi";
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

const SLAYTLAR = [
  {
    etiket: "Duyuru",
    baslik: "Component by Çevik 26. sayısı yayında!",
    aciklama: "Elektronik sektörünün güncel gelişmeleri, yeni ürünler ve teknoloji trendleri sizi bekliyor.",
    gorsel: "/hero-duyuru-dergi.png",
    gorselAlt: "Elektronik komponentlerle çevrelenmiş açık teknik dergi",
  },
  {
    etiket: "Workshop",
    baslik: "Yeni nesil kontrolcü atölyesi",
    aciklama: "MCU, HMI ve gömülü sistemler için teknik içerikleri ve uygulama örneklerini keşfedin.",
    gorsel: "/hero-duyuru-workshop.png",
    gorselAlt: "Mikrodenetleyici kartı üzerinde ölçüm yapılan elektronik atölyesi",
  },
  {
    etiket: "Yeni",
    baslik: "Line Card’ımız yayında!",
    aciklama: "Global iş ortaklarımız ve genişleyen ürün portföyümüzle yanınızdayız.",
    gorsel: "/hero-duyuru-line-card.png",
    gorselAlt: "Farklı elektronik komponent ailelerinden oluşan ürün portföyü",
  },
] as const;

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
  useEffect(() => {
    const hareketAzaltildi = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hareketAzaltildi) return;
    const timer = window.setTimeout(
      () => setActiveSlide((value) => (value + 1) % SLAYTLAR.length),
      SAYFALAMA_SURESI_MS,
    );
    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  useEffect(() => () => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
  }, []);

  const slide = SLAYTLAR[activeSlide];

  const kategoriBaglantisi = (ad: string) => kategoriBaglantisiniKur(categories, ad);

  return (
    <section className="bg-yuzey" aria-label="Ana giriş">
      <Kapsayici className="py-6 md:py-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <nav
              aria-label="Ana kategoriler"
              className="relative z-20 hidden h-full rounded-token-panel border border-kenar bg-yuzey-kart px-3 py-3 lg:col-span-3 lg:block"
              onMouseLeave={handleNavLeave}
            >
              <h2 className="sr-only">Kategoriler</h2>
              <ul className="mx-auto flex h-full w-full max-w-[300px] translate-x-3 flex-col justify-center gap-4">
                {VITRIN_KATEGORI_AGACI.map((kategori, index) => {
                  const Icon = VITRIN_KATEGORI_IKONLARI[index] ?? Boxes;
                  return (
                    <li key={kategori.ad} onMouseEnter={() => handleCategoryHover(index)}>
                      <Link href={kategoriBaglantisi(kategori.ad)} className="group flex items-center gap-3 rounded-token-girdi px-1.5 py-2 transition-colors hover:bg-vurgu-zemin">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-vurgu-zemin">
                          <Icon size={19} className="text-vurgu" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 text-sm font-medium leading-snug text-metin">{kategori.ad}</span>
                        <ArrowRight size={14} className="shrink-0 text-metin-ucuncul opacity-40" aria-hidden="true" />
                      </Link>
                      {hoveredCategory === index && kategori.altlar.length > 0 && (
                        <div className="absolute left-[calc(100%+1rem)] top-0 z-30 min-h-full">
                          <div className={`flex min-h-[620px] items-stretch overflow-visible rounded-token-panel border border-kenar bg-yuzey-kart shadow-token-katman transition-[width] duration-200 ${hoveredThirdCategory?.altlar.length ? "w-[990px]" : hoveredSubCategory?.altlar.length ? "w-[660px]" : "w-[330px]"}`}>
                            <div className="w-[330px] shrink-0 p-6">
                              <h3 className="flex h-14 items-start text-2xl font-extrabold leading-tight text-metin-marka">{kategori.ad}</h3>
                              <ul className="mt-5">
                                {kategori.altlar.map((alt) => (
                                  <li key={alt.ad} onMouseEnter={() => { setHoveredSubCategory(alt); setHoveredThirdCategory(null); }}>
                                    <Link href={kategoriBaglantisi(alt.ad)} className={`flex min-h-10 items-center justify-between gap-3 px-3 py-2 text-[15px] transition-colors ${hoveredSubCategory?.ad === alt.ad ? "bg-yuzey-gomulu font-semibold text-metin-marka" : "text-metin hover:bg-yuzey-gomulu"}`}>
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
                                      <Link href={kategoriBaglantisi(alt.ad)} className={`flex min-h-10 items-center justify-between gap-3 px-3 py-2 text-[15px] transition-colors ${hoveredThirdCategory?.ad === alt.ad ? "bg-yuzey-gomulu font-semibold text-metin-marka" : "text-metin hover:bg-yuzey-gomulu"}`}>
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

          <div className="relative min-h-[460px] overflow-hidden rounded-token-panel border border-kenar bg-yuzey-kart p-7 md:p-8 lg:col-span-9">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-marka) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex min-h-[380px] flex-col md:max-w-[58%]">
              <h1 className="mt-8 max-w-[18ch] text-4xl font-black uppercase leading-[1.05] tracking-tight text-metin-marka md:text-5xl">
                {slide.baslik}
              </h1>
              <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-metin-ikincil">
                {slide.aciklama}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-10">
                <div className="flex items-center gap-2">
                  {typeof stoktakiUrun === "number" && stoktakiUrun > 0 && (
                    <Link
                      href="/urunler?sadeceStoktakiler=true"
                      className="inline-flex w-44 shrink-0 items-center justify-center gap-2 rounded-full border border-kenar bg-yuzey-kart px-5 py-4 text-sm font-semibold text-metin-ikincil transition-colors hover:border-vurgu hover:text-vurgu"
                    >
                      <span className="tabular-nums font-bold text-[#12ae8c]">{stoktakiUrun.toLocaleString("tr-TR")}</span>
                      ürün stokta
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-14 right-5 z-10 flex items-center md:right-[calc(36%+2rem)]" aria-label="Duyuru slaytları">
              {SLAYTLAR.map((item, index) => {
                const secili = activeSlide === index;
                return (
                  <button
                    type="button"
                    key={item.etiket}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`${item.etiket} duyurusunu göster`}
                    aria-current={secili ? "true" : undefined}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                  >
                    <SayfalamaNoktasi secili={secili} />
                  </button>
                );
              })}
            </div>
            <div className="absolute inset-y-6 right-6 hidden w-[36%] overflow-hidden rounded-token-kart border border-white/30 bg-marka shadow-token-katman md:block">
              <Image
                key={slide.gorsel}
                src={slide.gorsel}
                alt={slide.gorselAlt}
                fill
                priority={activeSlide === 0}
                sizes="(min-width: 1024px) 27vw, 36vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Kapsayici>
    </section>
  );
}
