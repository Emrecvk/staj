"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

const DESTEK_EPOSTASI = "destek@cevik.com.tr";

export function EpostaEylemleri() {
  const [kopyalandi, setKopyalandi] = useState(false);

  async function epostayiKopyala() {
    try {
      await navigator.clipboard.writeText(DESTEK_EPOSTASI);
      setKopyalandi(true);
    } catch {
      window.location.href = `mailto:${DESTEK_EPOSTASI}`;
    }
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <a
        href={`mailto:${DESTEK_EPOSTASI}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-token-girdi bg-vurgu px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-vurgu-guclu focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vurgu"
      >
        <Mail size={16} aria-hidden="true" /> E-posta gönder
      </a>
      <button
        type="button"
        onClick={epostayiKopyala}
        className="inline-flex min-h-11 items-center gap-2 rounded-token-girdi border border-kenar-guclu bg-yuzey-kart px-4 py-2.5 text-sm font-bold text-metin-marka transition-colors hover:border-vurgu/50 hover:bg-vurgu-zemin focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vurgu"
      >
        {kopyalandi ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {kopyalandi ? "Adres kopyalandı" : "Adresi kopyala"}
      </button>
    </div>
  );
}
