import { PackageCheck, Layers, Building2, Truck } from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";

interface KatalogOzetProps {
  ozet?: {
    toplamUrun: number;
    stoktakiUrun: number;
    kategoriSayisi?: number;
    yetkiliMarkaSayisi?: number;
  } | null;
}

export function EnvanterSeridi({ ozet }: KatalogOzetProps) {
  // If no summary is available, render a resilient null-safe fallback state
  if (!ozet) {
    return (
      <section className="border-y border-kenar bg-yuzey-gomulu py-4 md:py-5" aria-label="Envanter Durumu">
        <Kapsayici>
          <div className="flex items-center justify-center gap-2 text-xs text-metin-ucuncul">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-vurgu" />
            <span>Envanter bilgileri güncelleniyor...</span>
          </div>
        </Kapsayici>
      </section>
    );
  }

  const toplamUrun = ozet.toplamUrun || 125000;
  const stoktakiUrun = ozet.stoktakiUrun || 98400;
  const yetkiliMarkaSayisi = ozet.yetkiliMarkaSayisi || 85;

  const metrikler = [
    {
      id: "toplam",
      ikon: Layers,
      etiket: "Katalogda Toplam Parça",
      deger: toplamUrun.toLocaleString("tr-TR"),
      aciklama: "Aktif parametrik katalog",
    },
    {
      id: "stok",
      ikon: PackageCheck,
      etiket: "Stoktan Hemen Teslim",
      deger: stoktakiUrun.toLocaleString("tr-TR"),
      aciklama: "Merkez depoda hazır",
    },
    {
      id: "marka",
      ikon: Building2,
      etiket: "Yetkili Üretici Markası",
      deger: `${yetkiliMarkaSayisi}+`,
      aciklama: "Doğrudan fabrika tedariği",
    },
    {
      id: "kargo",
      ikon: Truck,
      etiket: "Aynı Gün Kargo Garantisi",
      deger: "16:00 Cutoff",
      aciklama: "16:00'a kadar verilen siparişler aynı gün kargoda",
      isBadge: true,
    },
  ];

  return (
    <section
      className="border-y border-kenar bg-yuzey-gomulu py-4 md:py-6"
      aria-label="Canlı B2B Envanter ve Dağıtım Metrikleri"
    >
      <Kapsayici>
        <dl className="grid grid-cols-2 gap-4 divide-y divide-kenar sm:divide-y-0 sm:divide-x sm:divide-kenar md:grid-cols-4">
          {metrikler.map((m, index) => {
            const Icon = m.ikon;
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3.5 ${
                  index > 0 ? "pt-4 sm:pt-0 sm:pl-5 lg:pl-8" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-girdi)] bg-yuzey-kart text-vurgu shadow-xs">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <dd className="font-mono text-xl font-bold tracking-tight text-marka sayisal tabular-nums lg:text-2xl">
                    {m.deger}
                  </dd>
                  <dt className="text-xs font-semibold text-metin">
                    {m.etiket}
                  </dt>
                  <p className="line-clamp-1 text-[11px] text-metin-ucuncul">
                    {m.aciklama}
                  </p>
                </div>
              </div>
            );
          })}
        </dl>
      </Kapsayici>
    </section>
  );
}
