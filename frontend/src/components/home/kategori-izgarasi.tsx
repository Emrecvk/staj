import Link from "next/link";
import {
  Cpu,
  Layers,
  Cable,
  ToggleRight,
  BatteryCharging,
  Lightbulb,
  Activity,
  Radio,
  Boxes,
  Wrench,
  ShieldCheck,
  Network,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";
import type { Category } from "@/lib/api";

interface CategoryCardItem {
  id: number;
  ad: string;
  slug: string;
  ikon: LucideIcon;
  urunSayisi: number;
  ornekselAltKategoriler: string[];
}

const DEFAULT_CATEGORY_FAMILIES: CategoryCardItem[] = [
  {
    id: 1,
    ad: "Yarı İletkenler",
    slug: "yari-iletkenler",
    ikon: Cpu,
    urunSayisi: 42850,
    ornekselAltKategoriler: ["MCU & DSP", "MOSFET & Transistör", "LDO & Regülatör"],
  },
  {
    id: 2,
    ad: "Pasif Komponentler",
    slug: "pasif-komponentler",
    ikon: Layers,
    urunSayisi: 86400,
    ornekselAltKategoriler: ["SMD Kondansatör", "Çip Direnç", "Güç İndüktörleri"],
  },
  {
    id: 3,
    ad: "Konnektörler",
    slug: "konnektorler",
    ikon: Cable,
    urunSayisi: 38200,
    ornekselAltKategoriler: ["PCB Klemens", "Pin Header", "USB & Veri Soketi"],
  },
  {
    id: 4,
    ad: "Elektromekanik",
    slug: "elektromekanik",
    ikon: ToggleRight,
    urunSayisi: 21500,
    ornekselAltKategoriler: ["Güç Röleleri", "Tact Switch", "DC Fanlar & Soğutma"],
  },
  {
    id: 5,
    ad: "Güç Kaynakları",
    slug: "guc-kaynaklari",
    ikon: BatteryCharging,
    urunSayisi: 15400,
    ornekselAltKategoriler: ["DIN Ray AC/DC", "Metal Kasa SMPS", "DC-DC İzole Modül"],
  },
  {
    id: 6,
    ad: "Optoelektronik",
    slug: "optoelektronik",
    ikon: Lightbulb,
    urunSayisi: 18700,
    ornekselAltKategoriler: ["SMD LED", "TFT & OLED Ekran", "Optokuplörler"],
  },
  {
    id: 7,
    ad: "Sensörler & Dönüştürücüler",
    slug: "sensorler",
    ikon: Activity,
    urunSayisi: 12800,
    ornekselAltKategoriler: ["Sıcaklık & Nem", "IMU & İvmeölçer", "Akım & Hall Sensörü"],
  },
  {
    id: 8,
    ad: "RF & Kablosuz",
    slug: "rf-kablosuz",
    ikon: Radio,
    urunSayisi: 8900,
    ornekselAltKategoriler: ["Wi-Fi & Bluetooth", "LoRa / Sub-1GHz", "GPS / GNSS Modül"],
  },
  {
    id: 9,
    ad: "Geliştirme Kartları",
    slug: "gelistirme-kartlari",
    ikon: Boxes,
    urunSayisi: 6400,
    ornekselAltKategoriler: ["MCU Kitleri", "Programlayıcı & Debug", "Prototipleme"],
  },
  {
    id: 10,
    ad: "Test & Ölçüm",
    slug: "test-olcum",
    ikon: Wrench,
    urunSayisi: 9200,
    ornekselAltKategoriler: ["Multimetre", "Osiloskop", "Lehimleme İstasyonu"],
  },
  {
    id: 11,
    ad: "Devre Koruma",
    slug: "devre-koruma",
    ikon: ShieldCheck,
    urunSayisi: 5600,
    ornekselAltKategoriler: ["SMD Sigorta", "TVS & ESD Koruma", "PPTC Sigorta"],
  },
  {
    id: 12,
    ad: "Kablo & Aksesuar",
    slug: "kablo-aksesuar",
    ikon: Network,
    urunSayisi: 7800,
    ornekselAltKategoriler: ["Şerit Kablo", "Isıyla Daralan Makaron", "Kablo Pabuçları"],
  },
];

export function KategoriIzgarasi({ categories = [] }: { categories?: Category[] }) {
  // Blend server categories if available with our icon mapping
  const categoryItems: CategoryCardItem[] = DEFAULT_CATEGORY_FAMILIES.map((fam) => {
    const matched = categories.find(
      (c) =>
        c.slug === fam.slug ||
        c.ad.toLowerCase().includes(fam.ad.toLowerCase())
    );

    if (matched) {
      return {
        ...fam,
        id: matched.id,
        ad: matched.ad,
        slug: matched.slug,
        ornekselAltKategoriler:
          matched.altKategoriler && matched.altKategoriler.length > 0
            ? matched.altKategoriler.map((a) => a.ad).slice(0, 3)
            : fam.ornekselAltKategoriler,
      };
    }
    return { ...fam, id: 80000 + fam.id };
  });

  return (
    <section className="bg-yuzey py-12 md:py-16" aria-label="Temel Komponent Kategorileri">
      <Kapsayici>
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-vurgu">
              Komponent Kataloğu
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-metin md:text-3xl">
              Ürün Aileleri ve Kategoriler
            </h2>
            <p className="mt-1.5 text-sm text-metin-ikincil">
              Mühendislik ve üretim projeleriniz için 12 ana kategoride 100.000+ aktif stoklu komponent.
            </p>
          </div>

          <Link
            href="/urunler"
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-vurgu transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu-guclu sm:self-auto"
          >
            Tüm Kataloğu Gör <ArrowRight size={16} />
          </Link>
        </div>

        {/* 6x2 Responsive Category Grid */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
          {categoryItems.map((cat) => {
            const Icon = cat.ikon;
            return (
              <Link
                key={cat.id}
                href={`/urunler?kategoriId=${cat.id}&slug=${encodeURIComponent(cat.slug)}`}
                className="group relative flex flex-col justify-between rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 transition-all duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-[var(--shadow-yukselti)]"
              >
                <div>
                  {/* Category SVG Icon */}
                  <div className="mb-3 inline-flex rounded-[var(--radius-girdi)] bg-vurgu-zemin p-2.5 text-vurgu transition-colors duration-[var(--sure-ipucu)] group-hover:bg-vurgu group-hover:text-white">
                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  {/* Category Title */}
                  <h3 className="text-sm font-bold leading-snug text-metin transition-colors group-hover:text-vurgu">
                    {cat.ad}
                  </h3>

                  {/* SKU Count Pill */}
                  <div className="mt-1.5">
                    <span className="inline-block font-mono text-xs font-semibold tabular-nums text-metin-ucuncul">
                      {cat.urunSayisi.toLocaleString("tr-TR")} ürün
                    </span>
                  </div>
                </div>

                {/* Subcategories preview on hover */}
                {cat.ornekselAltKategoriler && cat.ornekselAltKategoriler.length > 0 && (
                  <div className="mt-3 border-t border-kenar/60 pt-2">
                    <p className="line-clamp-1 text-[11px] leading-tight text-metin-ikincil">
                      {cat.ornekselAltKategoriler.join(", ")}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </Kapsayici>
    </section>
  );
}
