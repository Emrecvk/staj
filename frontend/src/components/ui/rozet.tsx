import type { ReactNode } from "react";

/* ---------------------------------------------------------------------------
   Rozet

   Yarıçap kuralı gereği full-pill. Katalogda bir kartın üstünde aynı anda
   stok, RoHS ve yaşam döngüsü rozeti bulunabiliyor; bu yüzden renkler
   bilerek düşük doygunlukta. Üç parlak rozet yan yana taramayı bozuyor.
   --------------------------------------------------------------------------- */

type Ton = "notr" | "bilgi" | "basari" | "uyari" | "hata" | "vurgu";

const tonlar: Record<Ton, string> = {
  notr: "bg-yuzey-gomulu text-metin-ikincil",
  bilgi: "bg-navy-50 text-navy-700",
  basari: "bg-basari-50 text-basari-600",
  uyari: "bg-uyari-50 text-uyari-600",
  hata: "bg-hata-50 text-hata-600",
  vurgu: "bg-vurgu-zemin text-vurgu-guclu",
};

export function Rozet({
  ton = "notr", ikon, children, className = "",
}: {
  ton?: Ton;
  ikon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5
                  text-[11px] font-semibold leading-5 ${tonlar[ton]} ${className}`}
    >
      {ikon}
      {children}
    </span>
  );
}

/**
 * Stok rozeti.
 *
 * Eşikler katalog gerçeğine göre: satın almacı için "1 adet var" ile
 * "10.000 adet var" aynı şey değil, bu yüzden miktar da gösteriliyor.
 */
export function StokRozeti({ miktar, gelecekStok }: { miktar: number; gelecekStok?: number }) {
  if (miktar > 0) {
    return (
      <Rozet ton={miktar < 100 ? "uyari" : "basari"}>
        <span className="font-mono tabular-nums">{miktar.toLocaleString("tr-TR")}</span>
        {" adet stokta"}
      </Rozet>
    );
  }

  if (gelecekStok && gelecekStok > 0) {
    return (
      <Rozet ton="bilgi">
        Yolda: <span className="font-mono tabular-nums">{gelecekStok.toLocaleString("tr-TR")}</span>
      </Rozet>
    );
  }

  return <Rozet ton="notr">Stokta yok</Rozet>;
}

/**
 * Ürün yaşam döngüsü rozeti.
 * Cevik.Alan.Ortak.UrunDurumu ile birebir.
 * Aktif ürün için rozet basılmaz: normal durum gürültü yaratmamalı.
 */
export function YasamDongusuRozeti({ durum }: { durum: number }) {
  const harita: Record<number, { metin: string; ton: Ton }> = {
    2: { metin: "NRND", ton: "uyari" },
    3: { metin: "EOL", ton: "hata" },
    4: { metin: "Üretimden kalktı", ton: "hata" },
  };

  const kayit = harita[durum];
  return kayit ? <Rozet ton={kayit.ton}>{kayit.metin}</Rozet> : null;
}
