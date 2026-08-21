"use client";

import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

/* ---------------------------------------------------------------------------
   Çekmece (mobil filtre paneli)

   Neden vaul: sürükleyerek kapatma davranışını doğru yapmak sanıldığından zor.
   Momentum ("hızlı fiske de kapatmalı, sadece eşiği geçmek değil"), sınırda
   sönümleme, çoklu dokunuş koruması ve pointer capture. Vaul bunların hepsini
   hallediyor.

   400ms, iOS çekmece eğrisiyle. Tek 300ms üstü hareketimiz: bu fiziksel bir
   nesnenin gelmesi, bir arayüz geçişi değil. Kullanıcı paneli parmağıyla
   çekiyormuş gibi hissetmeli.
   --------------------------------------------------------------------------- */

export function Cekmece({
  acik, onDegisim, baslik, aciklama, altAlan, children,
}: {
  acik: boolean;
  onDegisim: (acik: boolean) => void;
  baslik: string;
  aciklama?: string;
  /** Sabit alt alan: "Sonuçları göster" gibi eylemler kaydırmayla kaybolmasın. */
  altAlan?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Drawer.Root open={acik} onOpenChange={onDegisim}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-navy-950/50" />

        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col
                     rounded-t-[var(--radius-panel)] border-t border-kenar bg-yuzey-kart
                     outline-none"
        >
          {/* Tutamak: kullanıcıya bunun sürüklenebilir olduğunu söyleyen tek işaret. */}
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-kenar-guclu" />

          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <Drawer.Title className="text-base font-bold text-metin">{baslik}</Drawer.Title>
              {aciklama && (
                <Drawer.Description className="mt-0.5 text-sm text-metin-ikincil">
                  {aciklama}
                </Drawer.Description>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDegisim(false)}
              aria-label="Kapat"
              className="-m-1 rounded p-1 text-metin-ucuncul transition-colors
                         duration-[var(--sure-ipucu)] hover:bg-yuzey-gomulu hover:text-metin"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto overscroll-contain border-t border-kenar px-5 py-4">
            {children}
          </div>

          {altAlan && (
            <div className="shrink-0 border-t border-kenar bg-yuzey-kart p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {altAlan}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
