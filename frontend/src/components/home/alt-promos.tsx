"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, ShoppingCart } from "lucide-react";
import { useHeaderCart } from "@/lib/stores/header-state";
import { Kapsayici } from "@/components/ui/yuzey";
import { paraBicimle } from "@/lib/miktar-kurali";
import { UrunGorseli } from "@/components/urun-gorseli";

const GOSTERILECEK_KALEM_SAYISI = 5;

export function AltPromos({ siteParaBirimi }: { siteParaBirimi?: string }) {
  const { itemCount, toplamTutar, paraBirimi, kalemler } = useHeaderCart();
  const fazlaKalemSayisi = Math.max(0, kalemler.length - GOSTERILECEK_KALEM_SAYISI);
  const gosterilenKalemler = kalemler.slice(
    0,
    fazlaKalemSayisi > 0 ? GOSTERILECEK_KALEM_SAYISI - 1 : GOSTERILECEK_KALEM_SAYISI,
  );
  const kullanilanKutular = gosterilenKalemler.length + (fazlaKalemSayisi > 0 ? 1 : 0);
  const bosKutuSayisi = Math.max(0, GOSTERILECEK_KALEM_SAYISI - kullanilanKutular);

  return (
    <section className="-mt-6 bg-yuzey py-4 md:py-5" aria-label="Hızlı erişim kartları">
      <Kapsayici>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="relative min-h-[220px] min-w-0 overflow-hidden rounded-token-panel border border-kenar bg-yuzey-gomulu px-5 py-5">
            <div className="relative z-10 max-w-[58%]">
              <div className="flex items-center gap-2.5 text-xl font-bold text-metin-marka">
                <Cpu size={25} className="text-vurgu" aria-hidden="true" /> Çözümler
              </div>
              <ul className="mt-4 space-y-0.5 text-sm leading-relaxed text-metin-ikincil">
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

          <article className="min-h-[220px] min-w-0 overflow-hidden rounded-token-panel border border-kenar bg-yuzey-gomulu px-5 py-5">
            <div className="flex items-center gap-2.5 text-xl font-bold text-metin-marka">
              <ShoppingCart size={25} className="text-vurgu" aria-hidden="true" /> Sepetiniz
            </div>
            <div className="mt-5 flex gap-2 overflow-hidden">
              <>
                  {gosterilenKalemler.map((item) => (
                    <Link
                      key={item.id}
                      href="/sepet"
                      title={`${item.baslik} · ${item.miktar} adet`}
                      className="relative flex h-16 min-w-16 items-center justify-center overflow-hidden rounded-lg border border-kenar bg-yuzey-kart p-1 transition-colors hover:border-vurgu"
                    >
                      <UrunGorseli
                        src={item.anaGorselUrl}
                        urunKodu={item.mpn}
                        className="p-1 [&>span]:hidden [&>svg]:h-5 [&>svg]:w-5"
                      />
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-marka/90 px-1 py-0.5 text-[8px] font-bold leading-none text-white">
                        {item.miktar}
                      </span>
                    </Link>
                  ))}
                  {fazlaKalemSayisi > 0 && (
                    <Link
                      href="/sepet"
                      aria-label={`Sepette ${fazlaKalemSayisi} ürün daha var`}
                      className="flex h-16 min-w-16 items-center justify-center rounded-lg border border-kenar bg-notr-100 text-sm font-bold text-metin-marka transition-colors hover:border-vurgu"
                    >
                      +{fazlaKalemSayisi}
                    </Link>
                  )}
                  {Array.from({ length: bosKutuSayisi }).map((_, index) => (
                    <span
                      key={`bos-${index}`}
                      aria-hidden="true"
                      className="h-16 min-w-16 rounded-lg border border-kenar bg-notr-100"
                    />
                  ))}
              </>
            </div>
            <p className="mt-4 text-base text-metin-ikincil">Sepetinizde <strong className="text-vurgu-guclu">{itemCount} ürün</strong> bulunmaktadır.</p>
            <div className="mt-3 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 text-base text-metin-ikincil">
              <span className="whitespace-nowrap">Ara Toplam:</span>
              <Link href="/sepet" className="inline-flex min-w-0 items-center justify-end gap-2 font-bold text-vurgu-guclu hover:text-marka">
                <span className="min-w-0 break-all text-right text-lg sm:text-2xl">{paraBicimle(toplamTutar, paraBirimi || siteParaBirimi || "TRY", 2)}</span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vurgu text-white"><ArrowRight size={22} /></span>
              </Link>
            </div>
          </article>

          <article className="relative min-h-[220px] min-w-0 overflow-hidden rounded-token-panel border border-kenar bg-yuzey-gomulu px-5 py-5">
            <div className="max-w-[62%]">
              <div className="flex items-center gap-2.5 text-xl font-bold text-metin-marka"><BookOpen size={25} className="text-vurgu" aria-hidden="true" /> Line Card</div>
              <p className="mt-4 text-sm leading-relaxed text-metin-ikincil">Güçlü üretici portföyümüzü ve uygulama alanlarımızı keşfedin.</p>
              <Link href="/hakkimizda" className="mt-5 inline-flex items-center gap-2 rounded-full bg-vurgu px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-vurgu-guclu">İncele <ArrowRight size={16} /></Link>
            </div>
            <div className="absolute bottom-4 right-4 h-36 w-28 rotate-6 rounded-sm bg-cyan-100 p-2 shadow-lg" aria-hidden="true"><div className="h-full border border-white/60 bg-cyan-400/70 p-2 text-[9px] font-bold leading-tight text-navy-950">LINE CARD<br /><br />ÇEVİK ELEKTRONİK<br /><br />ÜRETİCİLER</div></div>
          </article>
        </div>
      </Kapsayici>
    </section>
  );
}
