"use client";

import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";

/* ---------------------------------------------------------------------------
   İpucu

   Katalogda süs değil ihtiyaç: RoHS, MSL, NRND, MOQ, MPQ gibi kısaltmalar
   her satırda geçiyor ve satın almacı hepsini bilmek zorunda değil.

   İki hareket kararı:
   1. İlk ipucu 400ms gecikmeli açılır; imleç sayfada gezerken kazara açılmasın.
   2. Bir ipucu AÇIKKEN komşu ipuçları ANINDA ve animasyonsuz açılır. Kullanıcı
      artık ipuçlarını okuyor; her birinde tekrar beklemek araç çubuğunu ağır
      hissettiriyor. Gecikmenin amacı kaza önlemekti, o amaç zaten karşılandı.

   Ortak "yakın zamanda açıldı" durumu modül seviyesinde tutuluyor; bileşenler
   arası paylaşılması gereken tek şey bu.
   --------------------------------------------------------------------------- */

let sonKapanma = 0;
const ANINDA_PENCERESI = 500;

export function Ipucu({
  icerik, children, yon = "ust",
}: {
  icerik: ReactNode;
  children: ReactNode;
  yon?: "ust" | "alt";
}) {
  const [acik, setAcik] = useState(false);
  const [anindaMi, setAnindaMi] = useState(false);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const ac = () => {
    const anindaAc = Date.now() - sonKapanma < ANINDA_PENCERESI;
    setAnindaMi(anindaAc);

    if (anindaAc) {
      setAcik(true);
      return;
    }
    zamanlayici.current = setTimeout(() => setAcik(true), 400);
  };

  const kapat = () => {
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
    if (acik) sonKapanma = Date.now();
    setAcik(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={ac}
      onMouseLeave={kapat}
      // Klavye kullanıcısı da ipucunu görebilmeli.
      onFocus={ac}
      onBlur={kapat}
    >
      <span aria-describedby={acik ? id : undefined} className="inline-flex">
        {children}
      </span>

      {acik && (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-40 w-max max-w-xs -translate-x-1/2
                      rounded-token-girdi bg-navy-900 px-2.5 py-1.5
                      text-xs font-medium leading-relaxed text-white shadow-token-katman
                      ${yon === "ust" ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}
          style={{
            // Komşu ipuçları animasyonsuz; ilk ipucu yumuşak açılır.
            animation: anindaMi
              ? undefined
              : `ipucu-gir var(--sure-ipucu) var(--ease-cikis)`,
          }}
        >
          {icerik}
        </span>
      )}

      <style>{`
        @keyframes ipucu-gir {
          from { opacity: 0; transform: translate(-50%, ${yon === "ust" ? "2px" : "-2px"}) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </span>
  );
}

/** Katalogda geçen kısaltmaların açıklamaları. */
export const KISALTMALAR: Record<string, string> = {
  MOQ: "Minimum Order Quantity — sipariş edilebilecek en küçük miktar.",
  MPQ: "Minimum Packaging Quantity — ambalajın içindeki adet.",
  RoHS: "Restriction of Hazardous Substances — tehlikeli madde kısıtlaması belgesi.",
  NRND: "Not Recommended for New Designs — üretici yeni tasarımlarda önermiyor.",
  EOL: "End of Life — üretici üretimi durduruyor.",
  SMT: "Surface Mount Technology — yüzey montaj.",
  THT: "Through Hole Technology — delikten geçmeli montaj.",
};

/** Kısaltmayı ipucuyla sarmalar. Sözlükte yoksa düz metin bırakır. */
export function Kisaltma({ kod }: { kod: string }) {
  const aciklama = KISALTMALAR[kod];
  if (!aciklama) return <>{kod}</>;

  return (
    <Ipucu icerik={aciklama}>
      <abbr
        title=""
        className="cursor-help border-b border-dotted border-kenar-guclu no-underline"
      >
        {kod}
      </abbr>
    </Ipucu>
  );
}
