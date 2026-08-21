"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

/* ---------------------------------------------------------------------------
   Dialog

   Hareket kararları:
   - scale(0.96)'dan açılır, scale(0)'dan DEĞİL. Gerçek dünyada hiçbir şey
     yokluktan belirmez; sıfırdan büyüyen kutu "hiçlikten çıkmış" görünür.
   - transform-origin merkez. Popover'lar tetikleyicisinden açılmalı ama
     dialog bir tetikleyiciye çapalı değil, ekranın ortasında beliriyor.
   - Çıkış girişten hızlı (250ms → 150ms). Kullanıcı kapatmaya karar verdiyse
     sistem beklemez; karar anı yavaş, yanıt anı hızlı.
   - Dialog seyrek görülür (silme onayı, form). Bu sıklıkta animasyon
     yorucu değil, faydalı: bağlam değiştiğini anlatıyor.
   --------------------------------------------------------------------------- */

export function Dialog({
  acik, onKapat, baslik, aciklama, genislik = "orta", children,
}: {
  acik: boolean;
  onKapat: () => void;
  baslik: string;
  aciklama?: string;
  genislik?: "dar" | "orta" | "genis";
  children: ReactNode;
}) {
  const azaltilmisHareket = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  const genislikler = {
    dar: "max-w-md",
    orta: "max-w-2xl",
    genis: "max-w-4xl",
  } as const;

  useEffect(() => {
    if (!acik) return;

    const escDinleyici = (olay: KeyboardEvent) => {
      if (olay.key === "Escape") onKapat();
    };
    document.addEventListener("keydown", escDinleyici);

    // Arka plan kaymasın: dialog açıkken sayfayı kaydırmak kafa karıştırıcı.
    const oncekiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Odak panele taşınsın ki klavye kullanıcısı dialog içinde başlasın.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", escDinleyici);
      document.body.style.overflow = oncekiTasma;
    };
  }, [acik, onKapat]);

  return (
    <AnimatePresence>
      {acik && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <motion.div
            className="fixed inset-0 bg-navy-950/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={onKapat}
            aria-hidden
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-baslik"
            aria-describedby={aciklama ? "dialog-aciklama" : undefined}
            tabIndex={-1}
            className={`relative my-8 w-full ${genislikler[genislik]} rounded-[var(--radius-panel)]
                        border border-kenar bg-yuzey-kart shadow-[var(--shadow-katman)] outline-none`}
            initial={azaltilmisHareket ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            // Çıkış girişten hızlı: süre variant'ın kendi üzerinde tanımlı.
            exit={
              azaltilmisHareket
                ? { opacity: 0, transition: { duration: 0.12 } }
                : { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }
            }
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-kenar p-5">
              <div>
                <h2 id="dialog-baslik" className="text-lg font-bold text-metin">
                  {baslik}
                </h2>
                {aciklama && (
                  <p id="dialog-aciklama" className="mt-1 text-sm text-metin-ikincil">
                    {aciklama}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onKapat}
                aria-label="Kapat"
                className="-m-1 rounded p-1 text-metin-ucuncul transition-colors
                           duration-[var(--sure-ipucu)] hover:bg-yuzey-gomulu hover:text-metin"
              >
                <X size={18} />
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
