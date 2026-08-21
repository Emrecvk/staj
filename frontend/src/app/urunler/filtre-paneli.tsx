"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { OnayKutusu } from "@/components/ui/form";
import type { FacetGroup } from "@/lib/api";

/* ---------------------------------------------------------------------------
   Filtre paneli (Collapsible Parametric Filter Accordion Sidebar)
   - Bağımsız açılır/kapanır akordeon grupları
   - Çok seçenekli gruplar için grup içi anlık arama
   - Dinamik ürün sayacı rozetleri
   - 0 sonuçlu seçenekleri devre dışı bırakma (ölü kombinasyon engelleme)
   - Sadece Stoktakiler anahtarı
   - Tümünü Temizle butonu
   --------------------------------------------------------------------------- */

const BASLANGIC_GOSTERIM = 6;

function FacetGrubu({
  grup,
  seciliDegerler,
  onDegisim,
  acikMi,
  onAkordeonToggle,
}: {
  grup: FacetGroup;
  seciliDegerler: string[];
  onDegisim: (kod: string, deger: string, secili: boolean) => void;
  acikMi: boolean;
  onAkordeonToggle: () => void;
}) {
  const [hepsiAcik, setHepsiAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState("");

  // Grup içi arama filtrelemesi
  const filtrelenmisSecenekler = useMemo(() => {
    if (!aramaMetni.trim()) return grup.secenekler;
    const q = aramaMetni.toLowerCase();
    return grup.secenekler.filter(
      (s) =>
        s.deger.toLowerCase().includes(q) ||
        s.hamDeger.toLowerCase().includes(q)
    );
  }, [grup.secenekler, aramaMetni]);

  const seciliSayisi = seciliDegerler.length;

  const gorunenler =
    hepsiAcik || aramaMetni.trim() !== ""
      ? filtrelenmisSecenekler
      : filtrelenmisSecenekler.slice(0, BASLANGIC_GOSTERIM);

  const gizliSayi = filtrelenmisSecenekler.length - gorunenler.length;

  return (
    <div className="border-t border-kenar px-4 py-3.5 first:border-t-0">
      {/* Akordeon Başlığı */}
      <button
        type="button"
        onClick={onAkordeonToggle}
        aria-expanded={acikMi}
        className="flex w-full items-center justify-between py-1 text-left transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-metin">{grup.ad}</span>
          {seciliSayisi > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-vurgu text-[10px] font-bold text-white">
              {seciliSayisi}
            </span>
          )}
        </div>
        <span className="text-metin-ucuncul">
          {acikMi ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {/* Akordeon İçeriği */}
      {acikMi && (
        <div className="mt-2.5 space-y-2">
          {/* Grup İçi Arama Kutusu (5 veya daha fazla seçenek varsa gösterilir) */}
          {grup.secenekler.length >= 5 && (
            <div className="relative mb-2">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-metin-ucuncul"
                aria-hidden
              />
              <input
                type="text"
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                placeholder={`${grup.ad} içinde ara...`}
                aria-label={`${grup.ad} içinde ara`}
                className="w-full rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-gomulu py-1 pl-8 pr-7 text-xs text-metin placeholder:text-metin-ucuncul focus:border-vurgu focus:bg-yuzey-kart focus:outline-none"
              />
              {aramaMetni && (
                <button
                  type="button"
                  onClick={() => setAramaMetni("")}
                  aria-label="Aramayı temizle"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-metin-ucuncul hover:text-metin"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Seçenek Listesi */}
          <div className="space-y-1">
            {gorunenler.length === 0 ? (
              <p className="py-2 text-xs text-metin-ucuncul italic">Eşleşen seçenek bulunamadı.</p>
            ) : (
              gorunenler.map((secenek) => {
                const isDisabled = secenek.urunSayisi === 0;
                return (
                  <div
                    key={secenek.hamDeger}
                    className={isDisabled ? "opacity-45 pointer-events-none" : ""}
                  >
                    <OnayKutusu
                      checked={seciliDegerler.includes(secenek.hamDeger)}
                      disabled={isDisabled}
                      onChange={(olay) =>
                        onDegisim(grup.kod, secenek.hamDeger, olay.target.checked)
                      }
                      etiket={secenek.deger}
                      sayac={secenek.urunSayisi}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* "Daha Fazla Göster" Butonu */}
          {!aramaMetni && gizliSayi > 0 && (
            <button
              type="button"
              onClick={() => setHepsiAcik(true)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-vurgu transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu-guclu"
            >
              <ChevronDown size={13} /> {gizliSayi} seçenek daha
            </button>
          )}
          {!aramaMetni && hepsiAcik && grup.secenekler.length > BASLANGIC_GOSTERIM && (
            <button
              type="button"
              onClick={() => setHepsiAcik(false)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-metin-ucuncul transition-colors hover:text-metin"
            >
              Daha az göster
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function FiltrePaneli({
  filtreler,
  aktifFiltreler,
  sadeceStoktakiler,
  onFiltreDegisim,
  onStokDegisim,
  onTemizle,
  kutuIcinde = true,
}: {
  filtreler: FacetGroup[];
  aktifFiltreler: Record<string, string[]>;
  sadeceStoktakiler: boolean;
  onFiltreDegisim: (kod: string, deger: string, secili: boolean) => void;
  onStokDegisim: (acik: boolean) => void;
  onTemizle: () => void;
  kutuIcinde?: boolean;
}) {
  // Bağımsız akordeon açık/kapalı durumu: varsayılan olarak tüm gruplar açık
  const [acikGruplar, setAcikGruplar] = useState<Record<string, boolean>>(() => {
    const baslangic: Record<string, boolean> = {};
    filtreler.forEach((g) => {
      baslangic[g.kod] = true;
    });
    return baslangic;
  });

  const toggleAkordeon = (kod: string) => {
    setAcikGruplar((onceki) => ({
      ...onceki,
      [kod]: onceki[kod] !== undefined ? !onceki[kod] : false,
    }));
  };

  const aktifSayi =
    Object.values(aktifFiltreler).reduce((t, d) => t + d.length, 0) +
    (sadeceStoktakiler ? 1 : 0);

  return (
    <div
      className={
        kutuIcinde
          ? "overflow-hidden rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart shadow-sm"
          : ""
      }
    >
      {/* Filtre Başlık Çubuğu */}
      <div className="flex items-center justify-between border-b border-kenar bg-yuzey-gomulu px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-metin">
          <SlidersHorizontal size={15} className="text-vurgu" /> Filtreler
        </h3>
        {aktifSayi > 0 && (
          <button
            type="button"
            onClick={onTemizle}
            className="text-xs font-medium text-metin-ikincil underline underline-offset-2 transition-colors duration-[var(--sure-ipucu)] hover:text-hata-600"
          >
            Tümünü Temizle
          </button>
        )}
      </div>

      {/* Sadece Stoktakiler Anahtarı (En üstte sabit) */}
      <div className="border-b border-kenar px-4 py-3.5 bg-yuzey-kart">
        <OnayKutusu
          checked={sadeceStoktakiler}
          onChange={(olay) => onStokDegisim(olay.target.checked)}
          etiket={<span className="font-medium text-metin">Sadece Stoktakiler</span>}
        />
      </div>

      {/* Parametrik Facet Grupları */}
      {filtreler.length === 0 ? (
        <p className="px-4 py-6 text-xs leading-relaxed text-metin-ikincil">
          Parametrik filtreler kategoriye özeldir. Kılıf, gerilim ve tolerans gibi
          teknik özelliklere göre daraltmak için bir kategori seçin.
        </p>
      ) : (
        filtreler.map((grup) => (
          <FacetGrubu
            key={grup.kod}
            grup={grup}
            seciliDegerler={aktifFiltreler[grup.kod] ?? []}
            onDegisim={onFiltreDegisim}
            acikMi={acikGruplar[grup.kod] ?? true}
            onAkordeonToggle={() => toggleAkordeon(grup.kod)}
          />
        ))
      )}
    </div>
  );
}
