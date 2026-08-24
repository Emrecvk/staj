"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Cpu, ShoppingCart } from "lucide-react";
import { useHeaderCart } from "@/lib/stores/header-state";
import { Kapsayici } from "@/components/ui/yuzey";

export function AltPromos() {
  const { itemCount, toplamTutar, paraBirimi } = useHeaderCart();
  const [siteCurrency, setSiteCurrency] = useState("TRY");

  useEffect(() => {
    const handleCurrencyChange = (event: Event) => {
      setSiteCurrency((event as CustomEvent<string>).detail);
    };
    window.addEventListener("site-currency-change", handleCurrencyChange);
    return () => window.removeEventListener("site-currency-change", handleCurrencyChange);
  }, []);

  return (
    <section className="bg-yuzey py-4 md:py-5" aria-label="Hızlı erişim kartları">
      <Kapsayici>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="relative min-h-[220px] overflow-hidden rounded-[var(--radius-panel)] border border-kenar bg-[#f5f6f8] px-5 py-5">
            <div className="relative z-10 max-w-[58%]">
              <div className="flex items-center gap-2.5 text-xl font-bold text-metin-marka">
                <Cpu size={25} className="text-vurgu" aria-hidden="true" /> Çözümler
              </div>
              <ul className="mt-4 space-y-0.5 text-sm leading-relaxed text-[#7693d3]">
                <li>Elektronik komponent tedariği</li>
                <li>FAE ve Ar-Ge desteği</li>
                <li>PCB ve üretim çözümleri</li>
                <li>Otomasyon uygulamaları</li>
              </ul>
            </div>
            <div className="absolute -bottom-6 -right-4 flex h-36 w-36 rotate-[-12deg] items-center justify-center rounded-[38%] bg-[#0d804a] shadow-xl" aria-hidden="true">
              <Cpu size={72} strokeWidth={1} className="text-emerald-100/80" />
            </div>
          </article>

          <article className="min-h-[220px] rounded-[var(--radius-panel)] border border-kenar bg-[#f5f6f8] px-5 py-5">
            <div className="flex items-center gap-2.5 text-xl font-bold text-metin-marka">
              <ShoppingCart size={25} className="text-vurgu" aria-hidden="true" /> Sepetiniz
            </div>
            <div className="mt-5 flex gap-2 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => <span key={index} className="h-16 min-w-16 rounded-lg border border-[#d9dbe6] bg-[#e8e8f2]" />)}
            </div>
            <p className="mt-4 text-base text-metin-ikincil">Sepetinizde <strong className="text-vurgu-guclu">{itemCount} ürün</strong> bulunmaktadır.</p>
            <div className="mt-3 flex items-center justify-between text-base text-metin-ikincil">
              <span>Ara Toplam:</span>
              <Link href="/sepet" className="inline-flex items-center gap-4 text-2xl font-bold text-vurgu-guclu hover:text-marka">
                {toplamTutar.toFixed(2)} {siteCurrency || paraBirimi}<span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1834b8] text-white"><ArrowRight size={24} /></span>
              </Link>
            </div>
          </article>

          <article className="relative min-h-[220px] overflow-hidden rounded-[var(--radius-panel)] border border-kenar bg-[#f5f6f8] px-5 py-5">
            <div className="max-w-[62%]">
              <div className="flex items-center gap-2.5 text-xl font-bold text-metin-marka"><BookOpen size={25} className="text-vurgu" aria-hidden="true" /> Line Card</div>
              <p className="mt-4 text-sm leading-relaxed text-metin-ikincil">Güçlü üretici portföyümüzü ve uygulama alanlarımızı keşfedin.</p>
              <Link href="/hakkimizda" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1834b8] px-7 py-2.5 text-sm font-bold text-white hover:bg-[#11288f]">İncele <ArrowRight size={16} /></Link>
            </div>
            <div className="absolute bottom-4 right-4 h-36 w-28 rotate-6 rounded-sm bg-[#c5cceb] p-2 shadow-lg" aria-hidden="true"><div className="h-full border border-white/60 bg-[#9aa8df]/70 p-2 text-[9px] font-bold leading-tight text-white">LINE CARD<br /><br />ÇEVİK ELEKTRONİK<br /><br />ÜRETİCİLER</div></div>
          </article>
        </div>
      </Kapsayici>
    </section>
  );
}
