"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter, LayoutGrid, List, ChevronLeft, ChevronRight, X, ArrowUpDown,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductListCard } from "@/components/product-list-card";
import { Buton } from "@/components/ui/buton";
import { Cekmece } from "@/components/ui/cekmece";
import { BosDurum, HataDurumu, UrunKartiIskeleti } from "@/components/ui/yuzey";
import { FiltrePaneli } from "./filtre-paneli";
import { GEZINME_ANAHTARLARI } from "./parametreler";
import type { ProductResult } from "@/lib/api";

const SIRALAMA_SECENEKLERI = [
  { deger: "", ad: "Önerilen" },
  { deger: "fiyat_artan", ad: "Fiyat (artan)" },
  { deger: "fiyat_azalan", ad: "Fiyat (azalan)" },
  // Backend "stok" bekliyor. Onceki surumde "stok_azalan" gonderiliyordu ve
  // sunucu bunu tanimadigi icin sessizce varsayilan siralamaya dusuyordu.
  { deger: "stok", ad: "Stok (en çok)" },
  { deger: "populer", ad: "Popüler" },
  { deger: "yeni", ad: "Yeni eklenenler" },
];

export function ProductListingClient({ initialData }: { initialData: ProductResult | null }) {
  const [mobilFiltreAcik, setMobilFiltreAcik] = useState(false);
  const router = useRouter();
  const sorguParametreleri = useSearchParams();

  // Filtre degisimi sunucuya gidiyor. useTransition olmadan kullanici
  // tikladiktan sonra sonuc gelene kadar hicbir geri bildirim gormuyor ve
  // arayuz donmus gibi hissettiriyor.
  const [beklemede, gecisBaslat] = useTransition();

  const gorunum = sorguParametreleri.get("gorunum") === "liste" ? "liste" : "izgara";
  const sadeceStoktakiler = sorguParametreleri.get("sadeceStoktakiler") === "true";

  /** Aktif parametrik filtreler: kod -> secili degerler. */
  const aktifFiltreler: Record<string, string[]> = {};
  sorguParametreleri.forEach((deger, anahtar) => {
    if (GEZINME_ANAHTARLARI.has(anahtar)) return;
    (aktifFiltreler[anahtar] ??= []).push(deger);
  });

  const gezin = useCallback(
    (parametreler: URLSearchParams) => {
      gecisBaslat(() => router.push(`/urunler?${parametreler.toString()}`, { scroll: false }));
    },
    [router],
  );

  const filtreDegistir = useCallback(
    (kod: string, deger: string, secili: boolean) => {
      const p = new URLSearchParams(sorguParametreleri.toString());
      p.set("sayfaNo", "1");

      if (secili) {
        p.append(kod, deger);
      } else {
        const kalanlar = p.getAll(kod).filter((d) => d !== deger);
        p.delete(kod);
        kalanlar.forEach((d) => p.append(kod, d));
      }
      gezin(p);
    },
    [sorguParametreleri, gezin],
  );

  const stokDegistir = useCallback(
    (acik: boolean) => {
      const p = new URLSearchParams(sorguParametreleri.toString());
      p.set("sayfaNo", "1");
      if (acik) p.set("sadeceStoktakiler", "true");
      else p.delete("sadeceStoktakiler");
      gezin(p);
    },
    [sorguParametreleri, gezin],
  );

  const filtreleriTemizle = useCallback(() => {
    const p = new URLSearchParams();
    // Arama metni, kategori ve gorunum tercihi korunur: bunlar filtre degil,
    // kullanicinin bulundugu yer.
    for (const anahtar of ["aramaMetni", "kategoriId", "gorunum"]) {
      const d = sorguParametreleri.get(anahtar);
      if (d) p.set(anahtar, d);
    }
    gezin(p);
  }, [sorguParametreleri, gezin]);

  const siralamaDegistir = useCallback(
    (deger: string) => {
      const p = new URLSearchParams(sorguParametreleri.toString());
      if (deger) p.set("siralama", deger);
      else p.delete("siralama");
      p.set("sayfaNo", "1");
      gezin(p);
    },
    [sorguParametreleri, gezin],
  );

  /** Görünüm tercihi URL'de tutulur; aksi hâlde her filtre tıklamasında
      sunucu yeniden render edip tercihi sıfırlıyordu. */
  const gorunumDegistir = useCallback(
    (yeni: "izgara" | "liste") => {
      const p = new URLSearchParams(sorguParametreleri.toString());
      if (yeni === "liste") p.set("gorunum", "liste");
      else p.delete("gorunum");
      gezin(p);
    },
    [sorguParametreleri, gezin],
  );

  const sayfaDegistir = useCallback(
    (sayfa: number) => {
      const p = new URLSearchParams(sorguParametreleri.toString());
      p.set("sayfaNo", String(sayfa));
      gezin(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [sorguParametreleri, gezin],
  );

  // API erisilemedi: bos sonuctan FARKLI bir durum, ayri gosterilmeli.
  if (!initialData?.urunler) {
    return (
      <HataDurumu
        baslik="Katalog yüklenemedi"
        aciklama="Ürün servisine şu anda ulaşılamıyor. Bağlantınızı kontrol edip tekrar deneyin."
        onTekrarDene={() => router.refresh()}
      />
    );
  }

  const { urunler, filtreler } = initialData;
  const aktifCipler = Object.entries(aktifFiltreler).flatMap(([kod, degerler]) =>
    degerler.map((deger) => ({ kod, deger })),
  );

  const panelOzellikleri = {
    filtreler,
    aktifFiltreler,
    sadeceStoktakiler,
    onFiltreDegisim: filtreDegistir,
    onStokDegisim: stokDegistir,
    onTemizle: filtreleriTemizle,
  };

  return (
    <div className="flex flex-col items-start gap-6 lg:flex-row">
      <aside className="hidden w-72 shrink-0 lg:block">
        <FiltrePaneli {...panelOzellikleri} />
      </aside>

      <Cekmece
        acik={mobilFiltreAcik}
        onDegisim={setMobilFiltreAcik}
        baslik="Filtreler"
        aciklama={`${urunler.toplamKayit.toLocaleString("tr-TR")} ürün arasından seçin`}
        altAlan={
          <Buton tamGenislik gorunum="vurgu" onClick={() => setMobilFiltreAcik(false)}>
            Sonuçları göster
          </Buton>
        }
      >
        <FiltrePaneli {...panelOzellikleri} kutuIcinde={false} />
      </Cekmece>

      <div className="w-full flex-grow">
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-kart)]
                     border border-kenar bg-yuzey-kart px-4 py-3"
        >
          <p className="text-sm text-metin-ikincil">
            <b className="font-mono tabular-nums text-metin">
              {urunler.toplamKayit.toLocaleString("tr-TR")}
            </b>{" "}
            ürün
            {beklemede && <span className="ml-2 text-metin-ucuncul">güncelleniyor…</span>}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Buton
              gorunum="anahat"
              boyut="kucuk"
              className="lg:hidden"
              ikon={<Filter size={14} />}
              onClick={() => setMobilFiltreAcik(true)}
            >
              Filtrele
              {aktifCipler.length + (sadeceStoktakiler ? 1 : 0) > 0 &&
                ` (${aktifCipler.length + (sadeceStoktakiler ? 1 : 0)})`}
            </Buton>

            <label className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-metin-ucuncul" aria-hidden />
              <span className="sr-only">Sıralama</span>
              <select
                value={sorguParametreleri.get("siralama") ?? ""}
                onChange={(olay) => siralamaDegistir(olay.target.value)}
                className="min-w-0 max-w-[9.5rem] rounded-[var(--radius-girdi)] border border-kenar
                           bg-yuzey-kart px-2 py-1.5 text-sm text-metin"
              >
                {SIRALAMA_SECENEKLERI.map((s) => (
                  <option key={s.deger} value={s.deger}>{s.ad}</option>
                ))}
              </select>
            </label>

            <div
              className="flex items-center gap-0.5 rounded-[var(--radius-girdi)] border border-kenar p-0.5"
              role="group"
              aria-label="Görünüm"
            >
              {([
                { tip: "izgara", Ikon: LayoutGrid, ad: "Izgara görünümü" },
                { tip: "liste", Ikon: List, ad: "Liste görünümü" },
              ] as const).map(({ tip, Ikon, ad }) => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => gorunumDegistir(tip)}
                  aria-label={ad}
                  aria-pressed={gorunum === tip}
                  className={`rounded-[4px] p-1.5 transition-colors duration-[var(--sure-ipucu)] ${
                    gorunum === tip
                      ? "bg-yuzey-gomulu text-vurgu"
                      : "text-metin-ucuncul hover:text-metin"
                  }`}
                >
                  <Ikon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aktif filtre çipleri.
            Parametrik katalogda en büyük kullanılabilirlik kazancı bu: hangi
            filtrelerin açık olduğunu görmek için paneli taramak gerekmiyor ve
            her biri tek tıkla kaldırılabiliyor. */}
        {(aktifCipler.length > 0 || sadeceStoktakiler) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {sadeceStoktakiler && (
              <FiltreCipi etiket="Yalnızca stoktakiler" onKaldir={() => stokDegistir(false)} />
            )}
            {aktifCipler.map(({ kod, deger }) => (
              <FiltreCipi
                key={`${kod}-${deger}`}
                etiket={deger}
                onKaldir={() => filtreDegistir(kod, deger, false)}
              />
            ))}
            <button
              type="button"
              onClick={filtreleriTemizle}
              className="text-xs font-medium text-metin-ikincil underline underline-offset-2
                         transition-colors duration-[var(--sure-ipucu)] hover:text-hata-600"
            >
              Tümünü temizle
            </button>
          </div>
        )}

        {/* Bekleme sırasında sonuçlar YERİNDE kalır, yalnızca soluklaşır.
            İskeletle değiştirmek kullanıcının bağlamını kaybettiriyor;
            filtre daraltırken listenin nasıl değiştiğini görmek gerekiyor. */}
        <div
          className={`transition-opacity duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] ${
            beklemede ? "pointer-events-none opacity-55" : "opacity-100"
          }`}
          aria-busy={beklemede}
        >
          {urunler.kayitlar.length === 0 ? (
            <BosDurum
              baslik="Eşleşen ürün yok"
              aciklama="Seçtiğiniz filtreler birlikte hiçbir ürüne uymuyor. Bir filtreyi kaldırıp tekrar deneyin."
              ikon={<Filter size={36} strokeWidth={1.5} />}
            />
          ) : gorunum === "izgara" ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {urunler.kayitlar.map((urun) => (
                <ProductCard key={urun.id} product={urun} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {urunler.kayitlar.map((urun) => (
                <ProductListCard key={urun.id} product={urun} />
              ))}
            </div>
          )}
        </div>

        {urunler.toplamSayfa > 1 && (
          <Sayfalama
            sayfaNo={urunler.sayfaNo}
            toplamSayfa={urunler.toplamSayfa}
            onDegisim={sayfaDegistir}
          />
        )}
      </div>
    </div>
  );
}

function FiltreCipi({ etiket, onKaldir }: { etiket: string; onKaldir: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-kenar bg-yuzey-kart
                 py-1 pl-2.5 pr-1 text-xs font-medium text-metin"
    >
      {etiket}
      <button
        type="button"
        onClick={onKaldir}
        aria-label={`${etiket} filtresini kaldır`}
        className="rounded-full p-0.5 text-metin-ucuncul transition-colors
                   duration-[var(--sure-ipucu)] hover:bg-hata-50 hover:text-hata-600"
      >
        <X size={12} />
      </button>
    </span>
  );
}

function Sayfalama({
  sayfaNo, toplamSayfa, onDegisim,
}: {
  sayfaNo: number;
  toplamSayfa: number;
  onDegisim: (sayfa: number) => void;
}) {
  // En fazla 5 numara; mevcut sayfa ortada kalacak sekilde kaydirilir.
  const baslangic = Math.max(1, Math.min(sayfaNo - 2, toplamSayfa - 4));
  const numaralar = Array.from(
    { length: Math.min(5, toplamSayfa) },
    (_, i) => baslangic + i,
  ).filter((n) => n >= 1 && n <= toplamSayfa);

  const okSinifi =
    "inline-flex size-9 items-center justify-center rounded-[var(--radius-girdi)] border border-kenar " +
    "text-metin-ikincil transition-[background-color,color] duration-[var(--sure-ipucu)] " +
    "hover:bg-yuzey-gomulu hover:text-metin disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Sayfalama">
      <button
        type="button"
        onClick={() => onDegisim(sayfaNo - 1)}
        disabled={sayfaNo <= 1}
        aria-label="Önceki sayfa"
        className={okSinifi}
      >
        <ChevronLeft size={17} />
      </button>

      {numaralar.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onDegisim(n)}
          aria-current={n === sayfaNo ? "page" : undefined}
          className={`inline-flex size-9 items-center justify-center rounded-[var(--radius-girdi)]
                      font-mono text-sm tabular-nums transition-[background-color,color]
                      duration-[var(--sure-ipucu)] ${
                        n === sayfaNo
                          ? "bg-marka font-bold text-metin-ters"
                          : "border border-kenar text-metin-ikincil hover:bg-yuzey-gomulu hover:text-metin"
                      }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onDegisim(sayfaNo + 1)}
        disabled={sayfaNo >= toplamSayfa}
        aria-label="Sonraki sayfa"
        className={okSinifi}
      >
        <ChevronRight size={17} />
      </button>

      <span className="ml-2 hidden font-mono text-xs tabular-nums text-metin-ucuncul sm:inline">
        {sayfaNo} / {toplamSayfa}
      </span>
    </nav>
  );
}

/** Sunucudan ilk veri gelene kadar gösterilen iskelet. */
export function KatalogIskeleti() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <UrunKartiIskeleti key={i} />
      ))}
    </div>
  );
}
