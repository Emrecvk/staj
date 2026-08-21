"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Truck,
  Wrench,
  Search,
  Upload,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";

const HERO_SLIDES = [
  {
    id: 1,
    badge: "%100 Yetkili Distribütör",
    badgeIcon: ShieldCheck,
    title: "Türkiye'nin Güvenilir Elektronik Komponent Dağıtıcısı",
    subtitle:
      "100.000+ stoklu parça, aynı gün kargo ve resmi üretici garantisi.",
    highlight: "100.000+ stoklu parça",
    ctaText: "Kataloğu İncele",
    ctaHref: "/urunler",
    secondaryText: "Hızlı Teklif",
    secondaryHref: "/teklif-iste",
    stat: { label: "Aktif Stoklu Parça", value: "100.000+" },
  },
  {
    id: 2,
    badge: "B2B BOM Eşleştirme Motoru",
    badgeIcon: FileSpreadsheet,
    title: "BOM Yükleme ve Akıllı Parça Eşleme",
    subtitle:
      "Malzeme listenizi tek tıkla yükleyin, anında fiyatlandırın ve toplu siparişe dönüştürün.",
    highlight: "Akıllı Parça Eşleme",
    ctaText: "BOM Yükle",
    ctaHref: "/bom",
    secondaryText: "Örnek Şablon",
    secondaryHref: "/bom",
    stat: { label: "Ortalama Eşleşme Süresi", value: "< 2 Saniye" },
  },
  {
    id: 3,
    badge: "Merkez Depo Garantisi",
    badgeIcon: Truck,
    title: "Aynı Gün Sevkiyat & Hızlı Lojistik",
    subtitle:
      "16:00'a kadar verilen tüm siparişler İstanbul merkez depomuzdan aynı gün kargoya verilir.",
    highlight: "Aynı Gün Sevkiyat",
    ctaText: "Stoklu Ürünler",
    ctaHref: "/urunler?sadeceStoktakiler=true",
    secondaryText: "Depo Durumu",
    secondaryHref: "/iletisim",
    stat: { label: "Sipariş Kesim Saati", value: "16:00" },
  },
  {
    id: 4,
    badge: "Teknik Mühendislik Çözümleri",
    badgeIcon: Wrench,
    title: "Saha Uygulama Mühendisliği (FAE) Desteği",
    subtitle:
      "Devre tasarımı, pin-to-pin muadil analizi ve tasarım optimizasyonunda uzman mühendis desteği.",
    highlight: "Uzman Mühendis Desteği",
    ctaText: "Mühendise Danış",
    ctaHref: "/teklif-iste?konu=fae_destegi",
    secondaryText: "Teknik Bülten",
    secondaryHref: "/urunler",
    stat: { label: "Uzman FAE Kadrosu", value: "%100 Destek" },
  },
];

const POPULER_ARAMALAR = ["STM32", "LM358", "ESP32", "1N4148", "NE555", "GRM188"];

const ORNEK_BOM_METNI = `STM32F407VGT6 100
LM358DR 2500
GRM188R71C104KA01D 4000
1N4148 5000`;

export function HeroB2B() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pasteText, setPasteText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [widgetSuccess, setWidgetSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-play slider
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  // BOM Quick parsing logic (tolerant of comma, semicolon, tab, whitespace)
  const parseAndNavigateBom = (rawText: string) => {
    setWidgetError(null);
    setWidgetSuccess(null);

    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setWidgetError("Lütfen en az bir MPN ve miktar satırı girin.");
      return;
    }

    const splitLine = (line: string): string[] => {
      if (line.includes(",")) return line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (line.includes(";")) return line.split(";").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (line.includes("\t")) return line.split("\t").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      return line.split(/\s+/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
    };

    const firstCols = splitLine(lines[0]).map((h) => h.toLowerCase());
    const hasHeader = firstCols.some((c) =>
      ["mpn", "parca", "part", "kod", "urun_kodu", "qty", "miktar", "adet"].some((k) => c.includes(k))
    );

    const startIdx = hasHeader ? 1 : 0;
    const parsedItems: Array<{ mpn: string; miktar: number }> = [];

    for (let i = startIdx; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      const mpn = cols[0] || "";
      let miktar = 1;

      if (cols[1]) {
        const parsedNum = parseInt(cols[1].replace(/[.\s]/g, ""), 10);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          miktar = parsedNum;
        }
      }

      if (mpn) {
        parsedItems.push({ mpn, miktar });
      }
    }

    if (parsedItems.length === 0) {
      setWidgetError("Geçerli parça kodu bulunamadı. Örnek format: STM32F407 100");
      return;
    }

    setWidgetSuccess(`${parsedItems.length} parça ayrıştırıldı, BOM motoruna aktarılıyor...`);

    startTransition(() => {
      const encoded = encodeURIComponent(JSON.stringify(parsedItems));
      router.push(`/bom?data=${encoded}`);
    });
  };

  const handleFileUpload = async (file: File) => {
    setWidgetError(null);
    setWidgetSuccess(null);

    const validExtensions = [".csv", ".tsv", ".txt", ".xlsx", ".xls"];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setWidgetError("Desteklenen formatlar: .csv, .tsv, .txt, .xlsx");
      return;
    }

    if (/\.xlsx?$/i.test(file.name)) {
      // Direct notice & redirect to /bom with file assistance
      setWidgetSuccess("Excel dosyası algılandı. BOM yükleme merkezine aktarılıyor...");
      startTransition(() => {
        router.push("/bom");
      });
      return;
    }

    try {
      const text = await file.text();
      parseAndNavigateBom(text);
    } catch {
      setWidgetError("Dosya okunamadı. Lütfen geçerli bir CSV dosyası seçin.");
    }
  };

  return (
    <section
      className="relative overflow-hidden border-b border-kenar bg-marka text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="B2B Hero Alanı ve Hızlı Sipariş Merkezi"
    >
      {/* Background Subtle Geometric Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #00B4D8 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <Kapsayici className="relative z-10 py-10 md:py-14 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
          {/* -------------------------------------------------------------
              LEFT 65% (lg:col-span-7 / xl:col-span-8): B2B HERO SLIDER
              ------------------------------------------------------------- */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-7 xl:col-span-8">
            {/* Top Slide Meta Badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-xs">
                <BadgeIcon size={14} className="text-cyan-400" aria-hidden="true" />
                {slide.badge}
              </span>
              <span className="hidden text-xs text-navy-300 sm:inline-block">
                TCMB Onaylı Kurumsal B2B Tedarik
              </span>
            </div>

            {/* Main Headline & Animated Transition Container */}
            <div className="min-h-[140px] md:min-h-[160px]">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.15]">
                {slide.title}
              </h1>
              <p className="mt-3.5 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                {slide.subtitle}
              </p>
            </div>

            {/* Slider CTAs & Quick Stat Indicator */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 rounded-[var(--radius-girdi)] bg-cyan-500 px-6 py-3 text-sm font-bold text-navy-950 transition-[transform,background-color] duration-[var(--sure-basma)] ease-[var(--ease-cikis)] hover:bg-cyan-400 active:scale-[0.97]"
              >
                {slide.ctaText}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>

              <Link
                href={slide.secondaryHref}
                className="inline-flex items-center gap-2 rounded-[var(--radius-girdi)] border border-navy-600 bg-navy-900/60 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xs transition-colors duration-[var(--sure-ipucu)] hover:border-cyan-500/50 hover:bg-navy-800"
              >
                {slide.secondaryText}
              </Link>

              <div className="ml-auto hidden items-center gap-2 border-l border-navy-700/80 pl-4 sm:flex">
                <div className="text-right">
                  <div className="text-[11px] font-medium text-navy-300">
                    {slide.stat.label}
                  </div>
                  <div className="font-mono text-base font-bold tabular-nums text-cyan-300">
                    {slide.stat.value}
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated Fast Search & Popular Tags */}
            <div className="border-t border-navy-800/90 pt-5">
              <form action="/urunler" className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-grow">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-notr-400"
                    aria-hidden="true"
                  />
                  <input
                    name="aramaMetni"
                    type="search"
                    aria-label="MPN, parça kodu, üretici veya açıklama ara"
                    placeholder="MPN, üretici kodu veya kategori ara (Örn: STM32F407, LM358)..."
                    className="h-11 w-full rounded-[var(--radius-girdi)] border border-navy-700 bg-navy-900/80 pl-10 pr-4 font-mono text-sm text-white placeholder:font-sans placeholder:text-navy-400 focus-visible:border-cyan-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-girdi)] bg-navy-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-600 active:scale-[0.98]"
                >
                  <Search size={15} aria-hidden="true" />
                  Ara
                </button>
              </form>

              {/* Popular Tags */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-navy-300">
                <span className="font-medium text-navy-400">Popüler MPN:</span>
                {POPULER_ARAMALAR.map((terim) => (
                  <Link
                    key={terim}
                    href={`/urunler?aramaMetni=${terim}`}
                    className="font-mono text-navy-200 underline decoration-navy-600 underline-offset-2 transition-colors hover:text-cyan-400 hover:decoration-cyan-400"
                  >
                    {terim}
                  </Link>
                ))}
              </div>
            </div>

            {/* Slider Navigation Dots & Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2" role="tablist" aria-label="Slider Slaytları">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === currentSlide}
                    aria-label={`Slayt ${idx + 1}: ${s.title}`}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-[var(--sure-acilir)] ${
                      idx === currentSlide
                        ? "w-8 bg-cyan-400"
                        : "w-2 bg-navy-600 hover:bg-navy-400"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Önceki Slayt"
                  className="rounded-full border border-navy-700 bg-navy-900/80 p-1.5 text-navy-300 transition-colors hover:border-cyan-500 hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Sonraki Slayt"
                  className="rounded-full border border-navy-700 bg-navy-900/80 p-1.5 text-navy-300 transition-colors hover:border-cyan-500 hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              RIGHT 35% (lg:col-span-5 / xl:col-span-4): QUICK BOM WIDGET
              ------------------------------------------------------------- */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-[var(--radius-panel)] border border-navy-700/80 bg-yuzey-kart p-5 text-metin shadow-[var(--shadow-katman)] sm:p-6">
              {/* Widget Header */}
              <div className="mb-4 flex items-center justify-between border-b border-kenar pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-[var(--radius-girdi)] bg-vurgu-zemin p-2 text-vurgu-guclu">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-metin">
                      Hızlı BOM & Parça Yükle
                    </h2>
                    <p className="text-xs text-metin-ikincil">
                      Toplu malzeme listenizi anında fiyatlandırın
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-basari-50 px-2 py-0.5 text-[11px] font-semibold text-basari-600">
                  Canlı Motor
                </span>
              </div>

              {/* Tabs for Upload vs Paste */}
              <div
                role="tablist"
                className="mb-4 grid grid-cols-2 rounded-[var(--radius-girdi)] bg-yuzey-gomulu p-1 text-xs font-semibold"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "upload"}
                  onClick={() => {
                    setActiveTab("upload");
                    setWidgetError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-[var(--radius-girdi)] py-2 transition-all ${
                    activeTab === "upload"
                      ? "bg-yuzey-kart text-vurgu-guclu shadow-xs"
                      : "text-metin-ikincil hover:text-metin"
                  }`}
                >
                  <Upload size={14} /> Dosya Yükle
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "paste"}
                  onClick={() => {
                    setActiveTab("paste");
                    setWidgetError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-[var(--radius-girdi)] py-2 transition-all ${
                    activeTab === "paste"
                      ? "bg-yuzey-kart text-vurgu-guclu shadow-xs"
                      : "text-metin-ikincil hover:text-metin"
                  }`}
                >
                  <FileText size={14} /> Çoklu Yapıştır
                </button>
              </div>

              {/* Tab 1: CSV / Excel Drag & Drop Upload */}
              {activeTab === "upload" && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) handleFileUpload(droppedFile);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-kart)] border-2 border-dashed p-6 text-center transition-all ${
                      dragOver
                        ? "border-vurgu bg-vurgu-zemin/60"
                        : "border-kenar bg-yuzey hover:border-vurgu/70 hover:bg-vurgu-zemin/30"
                    }`}
                  >
                    <div className="mb-2 rounded-full bg-yuzey-gomulu p-3 text-metin-ucuncul">
                      <Upload size={22} className="text-vurgu" />
                    </div>
                    <p className="text-xs font-bold text-metin">
                      CSV, TSV veya Excel dosyanızı buraya sürükleyin
                    </p>
                    <p className="mt-1 text-[11px] text-metin-ikincil">
                      veya bilgisayarınızdan dosya seçin
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.tsv,.txt,.xlsx,.xls,text/csv,application/vnd.ms-excel"
                      aria-label="BOM Dosyası Seç"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-metin-ucuncul">
                    <span>Desteklenen: .CSV, .XLSX, .TSV</span>
                    <Link
                      href="/bom"
                      className="font-medium text-vurgu hover:underline"
                    >
                      BOM Rehberi ➔
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 2: Quick Multi-part Paste */}
              {activeTab === "paste" && (
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      rows={5}
                      aria-label="Çoklu MPN ve Miktar Yapıştırma Alanı"
                      placeholder={"STM32F407VGT6 100\nLM358DR 2500\nGRM188R71C104KA01D 4000"}
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      className="w-full rounded-[var(--radius-girdi)] border border-kenar bg-yuzey p-3 font-mono text-xs text-metin placeholder:font-sans placeholder:text-metin-ucuncul focus-visible:border-vurgu focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vurgu"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-metin-ucuncul">
                      Format: [MPN] [Miktar] (Satır satır)
                    </span>
                    <button
                      type="button"
                      onClick={() => setPasteText(ORNEK_BOM_METNI)}
                      className="inline-flex items-center gap-1 font-semibold text-vurgu hover:underline"
                    >
                      <Sparkles size={12} /> Örnek Doldur
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isPending || !pasteText.trim()}
                    onClick={() => parseAndNavigateBom(pasteText)}
                    className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-girdi)] bg-vurgu py-2.5 text-xs font-bold text-white transition-[background-color,transform] hover:bg-vurgu-guclu active:scale-[0.98] disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Layers size={14} />
                    )}
                    Listeyi Ayrıştır ve Eşleştir
                  </button>
                </div>
              )}

              {/* Status & Error Feedback */}
              {widgetError && (
                <div
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-[var(--radius-girdi)] border border-hata-500/20 bg-hata-50 p-2.5 text-xs text-hata-600"
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{widgetError}</span>
                </div>
              )}

              {widgetSuccess && (
                <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-girdi)] border border-basari-500/20 bg-basari-50 p-2.5 text-xs text-basari-600">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  <span>{widgetSuccess}</span>
                </div>
              )}

              {/* Direct BOM Route Shortcut */}
              <div className="mt-4 border-t border-kenar pt-3 text-center">
                <Link
                  href="/bom"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-vurgu transition-colors hover:text-vurgu-guclu"
                >
                  Gelişmiş BOM Eşleştirme Motoruna Git <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Kapsayici>
    </section>
  );
}
