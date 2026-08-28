"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  CircuitBoard,
  Cpu,
  Drill,
  Lightbulb,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import { SAYFALAMA_SURESI_MS, SayfalamaNoktasi } from "@/components/ui/sayfalama-noktasi";
import { vitrinKategoriAgaciniKur } from "@/components/home/vitrin-kategori-agaci";
import type { Category } from "@/lib/api";

const VITRIN_KATEGORI_IKONLARI: LucideIcon[] = [
  Cpu,
  Lightbulb,
  CircuitBoard,
  Drill,
  PanelsTopLeft,
];

const SLAYTLAR = [
  {
    etiket: "Katalog",
    baslik: "Doğrulanmış komponent kataloğu",
    aciklama: "Ürün kodu, teknik özellik ve ambalaj seçenekleriyle doğru komponenti hızla bulun.",
    gorsel: "/hero-duyuru-dergi.png",
    gorselAlt: "Elektronik komponent kataloğu ve teknik dokümanlar",
    href: "/urunler",
    eylem: "Kataloğu incele",
  },
  {
    etiket: "Workshop",
    baslik: "Yeni nesil kontrolcü atölyesi",
    aciklama: "MCU, HMI ve gömülü sistemler için teknik içerikleri ve uygulama örneklerini keşfedin.",
    gorsel: "/hero-duyuru-workshop.png",
    gorselAlt: "Mikrodenetleyici kartı üzerinde ölçüm yapılan elektronik atölyesi",
    href: "/cozumler/fae-ve-arge-destegi",
    eylem: "Teknik desteği incele",
  },
  {
    etiket: "Yeni",
    baslik: "Line Card’ımız yayında!",
    aciklama: "Global iş ortaklarımız ve genişleyen ürün portföyümüzle yanınızdayız.",
    gorsel: "/hero-duyuru-line-card.png",
    gorselAlt: "Farklı elektronik komponent ailelerinden oluşan ürün portföyü",
    href: "/markalar",
    eylem: "Üreticileri incele",
  },
] as const;

interface HeroProps {
  categories?: Category[];
  kategoriSayilari?: Record<number, number>;
  stoktakiUrun?: number;
}

export function HeroB2B({ categories = [], stoktakiUrun }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [aktifAnaDal, setAktifAnaDal] = useState<number | null>(null);
  const [aktifIkinciDal, setAktifIkinciDal] = useState<number | null>(null);
  const [aktifUcuncuDal, setAktifUcuncuDal] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const anaDaliAc = (index: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setAktifAnaDal(index);
      setAktifIkinciDal(null);
      setAktifUcuncuDal(null);
    }, 120);
  };

  const handleNavLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setAktifAnaDal(null);
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

  const vitrinKategorileri = vitrinKategoriAgaciniKur(categories);
  const seciliAnaDal = aktifAnaDal === null ? undefined : vitrinKategorileri[aktifAnaDal];
  const seciliIkinciDal =
    aktifIkinciDal === null ? undefined : seciliAnaDal?.altlar[aktifIkinciDal];
  const seciliUcuncuDal =
    aktifUcuncuDal === null ? undefined : seciliIkinciDal?.altlar[aktifUcuncuDal];

  return (
    <section className="bg-yuzey" aria-label="Ana giriş">
      <Kapsayici className="py-6 md:py-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <nav
            aria-label="Ana kategoriler"
            className="relative z-20 hidden h-full rounded-token-panel border border-kenar bg-yuzey-kart px-4 py-4 lg:col-span-4 lg:block"
            onMouseLeave={handleNavLeave}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setAktifAnaDal(null);
              }
            }}
          >
            <h2 className="sr-only">Kategoriler</h2>
            <ul className="mx-auto flex h-full w-full max-w-[360px] flex-col justify-center gap-4">
              {vitrinKategorileri.map((kategori, index) => {
                const Icon = VITRIN_KATEGORI_IKONLARI[index] ?? PanelsTopLeft;
                const secili = aktifAnaDal === index;

                return (
                  <li key={kategori.anahtar} onMouseEnter={() => anaDaliAc(index)}>
                    <Link
                      href={kategori.href}
                      aria-expanded={secili}
                      aria-controls={secili ? "kademeli-kategori-paneli" : undefined}
                      onFocus={() => {
                        setAktifAnaDal(index);
                        setAktifIkinciDal(null);
                        setAktifUcuncuDal(null);
                      }}
                      className={`group flex items-center gap-4 rounded-token-girdi px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vurgu focus-visible:ring-offset-2 ${
                        secili ? "bg-vurgu-zemin" : "hover:bg-vurgu-zemin"
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vurgu-zemin">
                        <Icon size={21} className="text-vurgu" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 text-base font-medium leading-snug text-metin">
                        {kategori.ad}
                      </span>
                      <ArrowRight
                        size={16}
                        className="shrink-0 text-metin-ucuncul opacity-40 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {seciliAnaDal && seciliAnaDal.altlar.length > 0 && (
              <div
                id="kademeli-kategori-paneli"
                data-testid="kademeli-kategori-paneli"
                role="region"
                aria-label={`${seciliAnaDal.ad} alt kategorileri`}
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                }}
                className="absolute left-[calc(100%+1rem)] top-0 z-30 flex w-max"
              >
                <div className="h-[46rem] w-[clamp(13rem,18vw,20rem)] shrink-0 rounded-token-panel border border-kenar bg-yuzey-kart px-5 py-6 shadow-token-katman">
                  <h3 className="mb-6 max-w-[16ch] text-2xl font-black leading-[1.08] text-metin-marka xl:text-3xl">
                    {seciliAnaDal.ad}
                  </h3>
                  <h4 className="sr-only">Ürün grupları</h4>
                  <ul className="space-y-0.5">
                    {seciliAnaDal.altlar.map((dal, index) => {
                      const secili = aktifIkinciDal === index;
                      return (
                        <li key={dal.anahtar}>
                          <Link
                            href={dal.href}
                            aria-expanded={secili && dal.altlar.length > 0}
                            onMouseEnter={() => {
                              setAktifIkinciDal(index);
                              setAktifUcuncuDal(null);
                            }}
                            onFocus={() => {
                              setAktifIkinciDal(index);
                              setAktifUcuncuDal(null);
                            }}
                            className={`group flex items-center justify-between gap-3 rounded-sm px-3 py-1.5 text-sm font-medium leading-5 transition-colors ${
                              secili
                                ? "bg-yuzey-gomulu text-metin-marka"
                                : "text-metin hover:bg-yuzey-gomulu hover:text-vurgu"
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vurgu focus-visible:ring-inset`}
                          >
                            <span>{dal.ad}</span>
                            {dal.altlar.length > 0 && (
                              <ArrowRight
                                size={16}
                                className={`shrink-0 ${secili ? "text-vurgu" : "text-metin-ucuncul opacity-45"}`}
                                aria-hidden="true"
                              />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {seciliIkinciDal && seciliIkinciDal.altlar.length > 0 && (
                  <div className="h-[46rem] w-[clamp(13rem,18vw,20rem)] shrink-0 rounded-token-panel border border-kenar bg-yuzey-kart px-5 pb-6 pt-[7.75rem] shadow-token-katman">
                    <h4 className="sr-only">Alt kategoriler</h4>
                    <ul className="space-y-0.5">
                      {seciliIkinciDal.altlar.map((dal, index) => {
                        const secili = aktifUcuncuDal === index;
                        return (
                          <li key={dal.anahtar}>
                            <Link
                              href={dal.href}
                              aria-expanded={secili && dal.altlar.length > 0}
                              onMouseEnter={() => setAktifUcuncuDal(index)}
                              onFocus={() => setAktifUcuncuDal(index)}
                              className={`group flex items-center justify-between gap-3 rounded-sm px-3 py-1.5 text-sm font-medium leading-5 transition-colors ${
                                secili
                                  ? "bg-yuzey-gomulu text-metin-marka"
                                  : "text-metin hover:bg-yuzey-gomulu hover:text-vurgu"
                              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vurgu focus-visible:ring-inset`}
                            >
                              <span>{dal.ad}</span>
                              {dal.altlar.length > 0 && (
                                <ArrowRight
                                  size={16}
                                  className={`shrink-0 ${secili ? "text-vurgu" : "text-metin-ucuncul opacity-45"}`}
                                  aria-hidden="true"
                                />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {seciliUcuncuDal && seciliUcuncuDal.altlar.length > 0 && (
                  <div className="h-[46rem] w-[clamp(13rem,18vw,20rem)] shrink-0 rounded-token-panel border border-kenar bg-yuzey-kart px-5 pb-6 pt-[7.75rem] shadow-token-katman">
                    <h4 className="sr-only">En alt kategoriler</h4>
                    <ul className="space-y-0.5">
                      {seciliUcuncuDal.altlar.map((dal) => (
                        <li key={dal.anahtar}>
                          <Link
                            href={dal.href}
                            className="flex items-center rounded-sm px-3 py-1.5 text-sm font-medium leading-5 text-metin transition-colors hover:bg-yuzey-gomulu hover:text-vurgu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vurgu focus-visible:ring-inset"
                          >
                            {dal.ad}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="relative min-h-[460px] overflow-hidden rounded-token-panel border border-kenar bg-yuzey-kart p-7 md:p-8 lg:col-span-8">
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
                <Link
                  href={slide.href}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-marka px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vurgu"
                >
                  {slide.eylem}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <div className="flex items-center gap-2">
                  {typeof stoktakiUrun === "number" && stoktakiUrun > 0 && (
                    <Link
                      href="/urunler?sadeceStoktakiler=true"
                      title="En az bir adet stoğu bulunan farklı ürün kodu sayısı"
                      className="inline-flex min-w-44 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-kenar bg-yuzey-kart px-5 py-4 text-sm font-semibold text-metin-ikincil transition-colors hover:border-vurgu hover:text-vurgu"
                    >
                      <span className="tabular-nums font-bold text-[#12ae8c]">{stoktakiUrun.toLocaleString("tr-TR")}</span>
                      stoklu ürün çeşidi
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
