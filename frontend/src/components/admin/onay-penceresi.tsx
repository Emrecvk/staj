"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

export type OnayPenceresiProps = {
  acik: boolean;
  baslik: string;
  mesaj: string;
  /** Yıkıcı işlemlerde kırmızı, durum değişikliklerinde lacivert buton. */
  yikici?: boolean;
  onayMetni?: string;
  islemSuruyor?: boolean;
  onOnayla: () => void;
  onIptal: () => void;
};

/**
 * Silme ve kritik durum değişikliklerinde çıkan onay penceresi.
 *
 * Erişilebilirlik: açıldığında odak onay butonuna taşınır, Escape kapatır,
 * arka plana tıklamak da kapatır. Yıkıcı işlemde odak İPTAL'e verilir —
 * Enter'a refleksle basan kullanıcı yanlışlıkla silmesin.
 */
export function OnayPenceresi({
  acik, baslik, mesaj, yikici = false, onayMetni,
  islemSuruyor = false, onOnayla, onIptal,
}: OnayPenceresiProps) {
  const onayRef = useRef<HTMLButtonElement>(null);
  const iptalRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!acik) return;

    (yikici ? iptalRef : onayRef).current?.focus();

    const escDinleyici = (olay: KeyboardEvent) => {
      if (olay.key === "Escape") onIptal();
    };
    document.addEventListener("keydown", escDinleyici);
    return () => document.removeEventListener("keydown", escDinleyici);
  }, [acik, yikici, onIptal]);

  if (!acik) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onIptal}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="onay-baslik"
        aria-describedby="onay-mesaj"
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(olay) => olay.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <span className={`rounded-lg p-2 ${yikici ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
              <AlertTriangle size={20} />
            </span>
            <h2 id="onay-baslik" className="text-lg font-bold text-gray-900">{baslik}</h2>
          </div>
          <button
            type="button"
            onClick={onIptal}
            aria-label="Kapat"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <p id="onay-mesaj" className="p-5 text-sm leading-relaxed text-gray-600">{mesaj}</p>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
          <button
            ref={iptalRef}
            type="button"
            onClick={onIptal}
            disabled={islemSuruyor}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            ref={onayRef}
            type="button"
            onClick={onOnayla}
            disabled={islemSuruyor}
            className={`rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50 ${
              yikici ? "bg-red-600 hover:bg-red-700" : "bg-brand-navy hover:bg-opacity-90"
            }`}
          >
            {islemSuruyor ? "İşleniyor…" : (onayMetni ?? "Onayla")}
          </button>
        </div>
      </div>
    </div>
  );
}
