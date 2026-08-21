"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { OnayKutusu } from "@/components/ui/form";
import type { FacetGroup } from "@/lib/api";

/* ---------------------------------------------------------------------------
   Filtre paneli

   Modül seviyesinde tanımlı: bileşen fonksiyonunun İÇİNDE tanımlanırsa her
   render yeni bir bileşen TİPİ üretilir, React alt ağacı söküp yeniden kurar
   ve panelin kaydırma konumu ile odak her filtre tıklamasında sıfırlanır.

   Hareket YOK. Filtre onay kutusu bir oturumda 40+ kez tıklanıyor; bu
   sıklıkta her tıklamada oynayan bir animasyon üçüncü tıklamada yorucu
   hale gelir. Geri bildirim zaten sonucun kendisi.
   --------------------------------------------------------------------------- */

const BASLANGIC_GOSTERIM = 6;

function FacetGrubu({
  grup, seciliDegerler, onDegisim,
}: {
  grup: FacetGroup;
  seciliDegerler: string[];
  onDegisim: (kod: string, deger: string, secili: boolean) => void;
}) {
  const [hepsiAcik, setHepsiAcik] = useState(false);

  // İç içe kaydırma yerine "daha fazla göster": panelin kendisi zaten
  // kayıyor, içinde ikinci bir kaydırma alanı açmak kullanıcıyı sıkıştırıyor.
  const gorunenler = hepsiAcik ? grup.secenekler : grup.secenekler.slice(0, BASLANGIC_GOSTERIM);
  const gizliSayi = grup.secenekler.length - gorunenler.length;

  return (
    <div className="border-t border-kenar px-4 py-3.5 first:border-t-0">
      <h4 className="mb-2.5 text-sm font-semibold text-metin">{grup.ad}</h4>

      <div className="space-y-1">
        {gorunenler.map((secenek) => (
          <OnayKutusu
            key={secenek.hamDeger}
            checked={seciliDegerler.includes(secenek.hamDeger)}
            onChange={(olay) => onDegisim(grup.kod, secenek.hamDeger, olay.target.checked)}
            etiket={secenek.deger}
            sayac={secenek.urunSayisi}
          />
        ))}
      </div>

      {gizliSayi > 0 && (
        <button
          type="button"
          onClick={() => setHepsiAcik(true)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-vurgu
                     transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu-guclu"
        >
          <ChevronDown size={13} /> {gizliSayi} seçenek daha
        </button>
      )}
    </div>
  );
}

export function FiltrePaneli({
  filtreler, aktifFiltreler, sadeceStoktakiler,
  onFiltreDegisim, onStokDegisim, onTemizle, kutuIcinde = true,
}: {
  filtreler: FacetGroup[];
  aktifFiltreler: Record<string, string[]>;
  sadeceStoktakiler: boolean;
  onFiltreDegisim: (kod: string, deger: string, secili: boolean) => void;
  onStokDegisim: (acik: boolean) => void;
  onTemizle: () => void;
  /** Çekmece içinde kart çerçevesi istemiyoruz: kart içinde kart olmaz. */
  kutuIcinde?: boolean;
}) {
  const aktifSayi =
    Object.values(aktifFiltreler).reduce((t, d) => t + d.length, 0) + (sadeceStoktakiler ? 1 : 0);

  return (
    <div
      className={
        kutuIcinde
          ? "overflow-hidden rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart"
          : ""
      }
    >
      {kutuIcinde && (
        <div className="flex items-center justify-between border-b border-kenar bg-yuzey-gomulu px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-metin">
            <SlidersHorizontal size={15} /> Filtreler
          </h3>
          {aktifSayi > 0 && (
            <button
              type="button"
              onClick={onTemizle}
              className="text-xs font-medium text-metin-ikincil underline underline-offset-2
                         transition-colors duration-[var(--sure-ipucu)] hover:text-hata-600"
            >
              Temizle
            </button>
          )}
        </div>
      )}

      {/* Stok filtresi her zaman en üstte: satın almacının ilk sorusu
          "elimde var mı" ve bu bilgi kategori seçilmeden de mevcut. */}
      <div className="border-b border-kenar px-4 py-3.5">
        <OnayKutusu
          checked={sadeceStoktakiler}
          onChange={(olay) => onStokDegisim(olay.target.checked)}
          etiket={<span className="font-medium">Yalnızca stoktakiler</span>}
        />
      </div>

      {filtreler.length === 0 ? (
        <p className="px-4 py-6 text-sm leading-relaxed text-metin-ikincil">
          Parametrik filtreler kategoriye özeldir. Kılıf, gerilim ve tolerans gibi
          teknik özelliklere göre daraltmak için önce bir kategori seçin.
        </p>
      ) : (
        filtreler.map((grup) => (
          <FacetGrubu
            key={grup.kod}
            grup={grup}
            seciliDegerler={aktifFiltreler[grup.kod] ?? []}
            onDegisim={onFiltreDegisim}
          />
        ))
      )}
    </div>
  );
}
