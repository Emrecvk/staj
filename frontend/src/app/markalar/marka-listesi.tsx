"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { getUreticiler, type Category, type UreticiOzet } from "@/lib/api";
import { markaLogosuGetir } from "@/lib/vitrin-gorselleri";

type MarkaListesiProps = {
  ureticiler: UreticiOzet[];
  kategoriler: Category[];
  kategoriSayilari: Record<number, number>;
};

export function MarkaListesi({ ureticiler: ilkUreticiler, kategoriler, kategoriSayilari }: MarkaListesiProps) {
  const [arama, setArama] = useState("");
  const [kategoriAcik, setKategoriAcik] = useState(false);
  const [seciliKategori, setSeciliKategori] = useState<Category | null>(null);
  const [ureticiler, setUreticiler] = useState(ilkUreticiler);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kategoriSec(kategori: Category) {
    setSeciliKategori(kategori);
    setKategoriAcik(false);
    setYukleniyor(true);
    try {
      setUreticiler(await getUreticiler(kategori.id));
    } finally {
      setYukleniyor(false);
    }
  }

  function filtreleriTemizle() {
    setSeciliKategori(null);
    setUreticiler(ilkUreticiler);
    setArama("");
  }

  const gruplar = useMemo(() => {
    const aramaKucuk = arama.toLocaleLowerCase("tr");
    return ureticiler
      .filter((uretici) => uretici.ad.toLocaleLowerCase("tr").includes(aramaKucuk))
      .sort((a, b) => a.ad.localeCompare(b.ad, "tr"))
      .reduce<Record<string, UreticiOzet[]>>((sonuc, uretici) => {
        const harf = uretici.ad.charAt(0).toLocaleUpperCase("tr");
        (sonuc[harf] ??= []).push(uretici);
        return sonuc;
      }, {});
  }, [arama, ureticiler]);

  return (
    <div className="grid items-start gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="pt-12 lg:sticky lg:top-24 lg:self-start lg:pr-10">
        <h2 className="mb-8 text-3xl font-medium tracking-tight text-metin-marka">Arama</h2>
        <label className="relative block">
          <span className="sr-only">Üretici veya marka ara</span>
          <input
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Üretici Ara"
            className="h-12 w-full max-w-[280px] rounded-token-girdi border border-kenar-guclu bg-yuzey-kart px-4 pr-11 text-sm text-metin outline-none transition-colors placeholder:text-metin-ucuncul focus:border-vurgu"
          />
          <Search size={19} className="pointer-events-none absolute right-4 top-3.5 text-metin-ucuncul" aria-hidden="true" />
        </label>

        <div className="relative mt-7">
          <button
            type="button"
            onClick={() => setKategoriAcik((acik) => !acik)}
            aria-expanded={kategoriAcik}
            className="flex h-12 w-full max-w-[280px] items-center justify-between rounded-token-girdi border border-kenar-guclu bg-yuzey-kart px-4 text-left text-sm text-metin-ikincil transition-colors hover:border-vurgu"
          >
            <span>{seciliKategori?.ad ?? "Kategori Seçiniz"}</span>
            <ChevronDown size={18} className={kategoriAcik ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden="true" />
          </button>
          {kategoriAcik && (
            <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-token-girdi border border-vurgu bg-yuzey-kart shadow-token-katman">
              {kategoriler.map((kategori) => (
                <button
                  type="button"
                  key={kategori.id}
                  onClick={() => void kategoriSec(kategori)}
                  className="flex w-full items-center gap-3 border-b border-kenar px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-yuzey-gomulu"
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${seciliKategori?.id === kategori.id ? "border-vurgu bg-vurgu text-white" : "border-kenar-guclu"}`}>
                    {seciliKategori?.id === kategori.id && <Check size={15} aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-metin">{kategori.ad}</span>
                  <span className="text-sm font-bold text-yesil">{kategoriSayilari[kategori.id] ?? 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {seciliKategori && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-metin-marka">Uygulanan Filtreler</h2>
              <button type="button" onClick={filtreleriTemizle} className="text-sm font-bold text-vurgu hover:underline">Tümünü Kaldır</button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-full border border-kenar-guclu px-5 py-3 text-sm font-bold text-metin-marka">
              <span className="truncate">{seciliKategori.ad}</span>
              <button type="button" onClick={filtreleriTemizle} aria-label="Kategoriyi kaldır" className="shrink-0 text-mercan transition-transform hover:scale-110"><X size={23} /></button>
            </div>
          </div>
        )}
      </aside>

      <section aria-labelledby="ureticiler-baslik" className="border-kenar pt-12 lg:border-l lg:pl-12">
        <div className="mb-8 flex items-center justify-between border-b border-kenar pb-5">
          <h1 id="ureticiler-baslik" className="text-4xl font-extrabold tracking-tight text-metin-marka">Üreticiler</h1>
          {yukleniyor && <Loader2 size={20} className="animate-spin text-vurgu" aria-label="Yükleniyor" />}
        </div>
        {Object.keys(gruplar).length === 0 ? (
          <div className="rounded-token-kart border border-dashed border-kenar-guclu p-12 text-center text-sm text-metin-ikincil">Bu aramayla eşleşen üretici bulunamadı.</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(gruplar).map(([harf, grup]) => (
              <section key={harf} id={`harf-${harf}`} className="scroll-mt-28">
                <h3 className="mb-3 border-b border-kenar pb-2 text-xl font-bold text-vurgu">{harf}</h3>
                <div className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
                  {grup.map((uretici) => {
                    const logoUrl = markaLogosuGetir(uretici.ad, uretici.logoUrl);
                    return (
                    <Link key={uretici.id} href={`/urunler?ureticiId=${uretici.id}`} className="group flex min-h-16 items-center gap-4 border-b border-kenar py-2.5 transition-colors hover:bg-yuzey-gomulu">
                      <span className="flex h-10 w-20 shrink-0 items-center justify-center border border-kenar bg-yuzey-kart p-1.5">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logoUrl} alt={uretici.ad} className="max-h-full max-w-full object-contain" loading="lazy" />
                        ) : <span className="text-xs font-black text-metin-marka">{uretici.ad.slice(0, 2).toUpperCase()}</span>}
                      </span>
                      <span className="text-base font-medium text-vurgu group-hover:underline">{uretici.ad}</span>
                    </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
