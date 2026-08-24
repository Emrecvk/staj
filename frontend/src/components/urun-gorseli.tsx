"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { gercekGorselVarMi } from "@/lib/gorsel";

export function UrunGorseli({
  src,
  urunKodu,
  className = "",
}: {
  src: string | null;
  urunKodu: string;
  className?: string;
}) {
  const [hataKaynak, setHataKaynak] = useState<string | null>(null);
  const gercek = gercekGorselVarMi(src);
  const yuklenemedi = !gercek || Boolean(src && hataKaynak === src);

  if (!src || yuklenemedi) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-2 text-center ${className}`}>
        <Package size={30} strokeWidth={1.5} className="text-metin-ucuncul" aria-hidden="true" />
        <span className="max-w-full break-all font-mono text-xs font-semibold text-metin-ikincil">
          {urunKodu}
        </span>
        <span className="text-[11px] text-metin-ucuncul">Ürün görseli mevcut değil</span>
      </div>
    );
  }

  return (
    // Kaynaklar yönetim panelinden girilebildiği için alan adı sabit değildir.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${urunKodu} ürün görseli`}
      className={`h-full w-full object-contain ${className}`}
      onError={() => setHataKaynak(src)}
    />
  );
}
