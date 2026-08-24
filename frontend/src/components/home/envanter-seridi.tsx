import { Kapsayici } from "@/components/ui/yuzey";

interface KatalogOzetProps {
  ozet?: {
    toplamUrun: number;
    stoktakiUrun: number;
    kategoriSayisi?: number;
  } | null;
}

/**
 * Sakin tek satir guven seridi. Onceki 4 buyuk sayac "dashboard" hissi
 * veriyordu; artik gercek rakamlar tek satirda, olculu bir bicimde.
 */
export function EnvanterSeridi({ ozet }: KatalogOzetProps) {
  if (!ozet) return null;

  const parcalar = [
    `${ozet.toplamUrun.toLocaleString("tr-TR")} ürün`,
    `${ozet.stoktakiUrun.toLocaleString("tr-TR")} stoklu parça`,
    typeof ozet.kategoriSayisi === "number" && ozet.kategoriSayisi > 0
      ? `${ozet.kategoriSayisi.toLocaleString("tr-TR")} teknik kategori`
      : null,
  ].filter(Boolean) as string[];

  return (
    <section className="border-b border-kenar bg-yuzey-kart" aria-label="Katalog Özeti">
      <Kapsayici>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-xs font-medium text-metin-ikincil sm:text-sm">
          {parcalar.map((p, i) => (
            <span key={p} className="flex items-center gap-3">
              {i > 0 && <span className="text-kenar-guclu" aria-hidden="true">•</span>}
              <span>
                <span className="font-mono font-bold tabular-nums text-metin-marka">
                  {p.split(" ")[0]}
                </span>{" "}
                {p.split(" ").slice(1).join(" ")}
              </span>
            </span>
          ))}
        </div>
      </Kapsayici>
    </section>
  );
}
