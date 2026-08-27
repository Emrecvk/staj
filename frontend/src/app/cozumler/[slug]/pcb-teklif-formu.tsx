"use client";

import { useState } from "react";
import { Minus, Plus, Send } from "lucide-react";

type PcbModu = "PCB" | "Stencil";

export function PcbTeklifFormu() {
  const [modu, setModu] = useState<PcbModu>("PCB");
  const [uzunluk, setUzunluk] = useState(100);
  const [genislik, setGenislik] = useState(100);
  const [miktar, setMiktar] = useState(5);
  const [katman, setKatman] = useState("2 Katman");
  const [kalinlik, setKalinlik] = useState("1.6 mm");

  function teklifIste() {
    const konu = `${modu} üretim teklifi`;
    const govde = [
      `Hizmet: ${modu}`,
      `Boyut: ${uzunluk} x ${genislik} mm`,
      `Miktar: ${miktar} adet`,
      `Katman: ${katman}`,
      `Kalınlık: ${kalinlik}`,
    ].join("\n");
    window.location.href = `mailto:destek@cevik.com.tr?subject=${encodeURIComponent(konu)}&body=${encodeURIComponent(govde)}`;
  }

  const adim = (setter: (deger: number) => void, deger: number, miktarAdimi: number) => (
    <div className="flex h-11 items-center overflow-hidden rounded-full bg-white text-sm text-metin-marka">
      <button type="button" onClick={() => setter(Math.max(miktarAdimi, deger - miktarAdimi))} className="flex h-full w-11 items-center justify-center bg-cyan-100 hover:bg-cyan-200" aria-label="Azalt"><Minus size={15} /></button>
      <span className="min-w-20 px-3 text-center">{deger}</span>
      <button type="button" onClick={() => setter(deger + miktarAdimi)} className="flex h-full w-11 items-center justify-center bg-cyan-100 hover:bg-cyan-200" aria-label="Artır"><Plus size={15} /></button>
    </div>
  );

  return (
    <div className="rounded-token-panel border border-white/25 bg-navy-900/95 p-5 text-white shadow-token-katman backdrop-blur-sm sm:p-6">
      <div className="grid grid-cols-2 rounded-full border border-cyan-200 p-0.5 text-center text-sm font-bold">
        {(["PCB", "Stencil"] as PcbModu[]).map((secenek) => <button key={secenek} type="button" onClick={() => setModu(secenek)} className={`rounded-full py-2 transition-colors ${modu === secenek ? "bg-cyan-100 text-metin-marka" : "text-white/80 hover:bg-white/10"}`}>{secenek}</button>)}
      </div>
      <div className="mt-5 grid gap-4 text-xs">
        <div><p className="mb-2 font-bold text-cyan-200">Boyutlar (mm)</p><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><div><span className="mb-1 block text-white/65">Uzunluk</span>{adim(setUzunluk, uzunluk, 10)}</div><span className="mt-5 text-lg text-white/60">×</span><div><span className="mb-1 block text-white/65">Genişlik</span>{adim(setGenislik, genislik, 10)}</div></div></div>
        <div><p className="mb-2 font-bold text-cyan-200">Miktar</p>{adim(setMiktar, miktar, 1)}</div>
        <div className="grid grid-cols-2 gap-4"><label><span className="mb-2 block font-bold text-cyan-200">Katman</span><select value={katman} onChange={(e) => setKatman(e.target.value)} className="h-10 w-full rounded-lg bg-white px-3 text-sm text-metin-marka"><option>2 Katman</option><option>4 Katman</option><option>6 Katman</option><option>8 Katman</option></select></label><label><span className="mb-2 block font-bold text-cyan-200">Kalınlık</span><select value={kalinlik} onChange={(e) => setKalinlik(e.target.value)} className="h-10 w-full rounded-lg bg-white px-3 text-sm text-metin-marka"><option>1.0 mm</option><option>1.6 mm</option><option>2.0 mm</option></select></label></div>
        <button type="button" onClick={teklifIste} className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-vurgu text-sm font-bold text-white transition-colors hover:bg-vurgu-guclu">E-posta Taslağını Aç <Send size={16} /></button>
      </div>
    </div>
  );
}
