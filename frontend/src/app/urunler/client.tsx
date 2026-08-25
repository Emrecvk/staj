"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  LayoutGrid,
  List,
  Table2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  ArrowUpDown,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductListCard } from "@/components/product-list-card";
import { ParametrikTablo } from "./parametrik-tablo";
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
  { deger: "stok", ad: "Stok (en çok)" },
  { deger: "populer", ad: "Popüler" },
  { deger: "yeni", ad: "Yeni eklenenler" },
];

const SAYFA_BOYUTLARI = [24, 48, 96];

export type ViewMode = "izgara" | "liste" | "tablo";

export function resolveViewMode(queryMode?: string | null): ViewMode {
  if (queryMode === "tablo") return "tablo";
  if (queryMode === "liste") return "liste";
  return "izgara";
}

export function ProductListingClient({
  initialData,
  ureticiAdlari = {},
}: {
  initialData: ProductResult | null;
  /** Üretici id → ad; aktif-filtre çipinde okunur marka adı göstermek için. */
  ureticiAdlari?: Record<string, string>;
}) {
  const [mobilFiltreAcik, setMobilFiltreAcik] = useState(false);
  const router = useRouter();
  const sorguParametreleri = useSearchParams();

  // useTransition ile engellemesiz (non-blocking) filtreleme ve sayfalama geçişi
  const [beklemede, gecisBaslat] = useTransition();

  const gorunum = resolveViewMode(sorguParametreleri.get("gorunum"));
  const sadeceStoktakiler = sorguParametreleri.get("sadeceStoktakiler") === "true";
  const seciliSayfaBoyutu = parseInt(sorguParametreleri.get("sayfaBoyutu") || "24", 10);
  const sayfaBoyutu = SAYFA_BOYUTLARI.includes(seciliSayfaBoyutu) ? seciliSayfaBoyutu : 24;

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
    // Arama metni, kategori ve görünüm tercihi korunur; diğer tüm filtreler sıfırlanır
    for (const anahtar of ["aramaMetni", "kategoriId", "gorunum", "sayfaBoyutu"]) {
      const d = sorguParametreleri.get(anahtar);
      if (d) p.set(anahtar, d);
    }
    p.set("sayfaNo", "1");
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

  /** 3 Modlu Görünüm Değiştirici: URL parametresi senkronizasyonu */
  const gorunumDegistir = useCallback(
    (yeni: ViewMode) => {
      const p = new URLSearchParams(sorguParametreleri.toString());
      if (yeni === "izgara") {
        p.delete("gorunum");
      } else {
        p.set("gorunum", yeni);
      }
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

  const sayfaBoyutuDegistir = useCallback(
    (yeniBoyut: number) => {
      const p = new URLSearchParams(sorguParametreleri.toString());
      p.set("sayfaBoyutu", String(yeniBoyut));
      p.set("sayfaNo", "1");
      gezin(p);
    },
    [sorguParametreleri, gezin],
  );

  // API erişilemedi hata durumu
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
      {/* Sol Panel: Parametrik Filtre Sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <FiltrePaneli {...panelOzellikleri} />
      </aside>

      {/* Mobil Filtre Çekmecesi */}
      <Cekmece
        acik={mobilFiltreAcik}
        onDegisim={setMobilFiltreAcik}
        baslik="Filtreler"
        aciklama={`${urunler.toplamKayit.toLocaleString("tr-TR")} ürün arasından filtreleyin`}
        altAlan={
          <Buton tamGenislik gorunum="vurgu" onClick={() => setMobilFiltreAcik(false)}>
            Sonuçları göster ({urunler.toplamKayit.toLocaleString("tr-TR")})
          </Buton>
        }
      >
        <FiltrePaneli {...panelOzellikleri} kutuIcinde={false} />
      </Cekmece>

      {/* Sağ Ana Katalog Alanı */}
      <div className="w-full flex-grow min-w-0">
        {/* Üst Kontrol Barı: Ürün Sayısı, Sıralama, Sayfa Boyutu ve 3-Modlu Görünüm Switcher */}
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-kart)]
                     border border-kenar bg-yuzey-kart px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <p className="text-sm text-metin-ikincil">
              <b className="font-mono tabular-nums text-metin">
                {urunler.toplamKayit.toLocaleString("tr-TR")}
              </b>{" "}
              ürün listeleniyor
            </p>
            {beklemede && (
              <span className="text-xs font-medium text-vurgu animate-pulse">
                • güncelleniyor…
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mobil Filtre Butonu */}
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

            {/* Sıralama Seçici */}
            <label className="flex items-center gap-1.5 text-xs text-metin-ikincil">
              <ArrowUpDown size={14} className="text-metin-ucuncul" aria-hidden />
              <span className="sr-only">Sıralama</span>
              <select
                value={sorguParametreleri.get("siralama") ?? ""}
                onChange={(olay) => siralamaDegistir(olay.target.value)}
                className="rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart px-2 py-1.5 text-xs text-metin focus:border-vurgu focus:outline-none"
              >
                {SIRALAMA_SECENEKLERI.map((s) => (
                  <option key={s.deger} value={s.deger}>
                    {s.ad}
                  </option>
                ))}
              </select>
            </label>

            {/* Sayfa Boyutu Seçici (24, 48, 96) */}
            <label className="hidden sm:flex items-center gap-1 text-xs text-metin-ikincil">
              <span className="sr-only">Sayfa Başına Ürün</span>
              <select
                value={sayfaBoyutu}
                onChange={(e) => sayfaBoyutuDegistir(parseInt(e.target.value, 10))}
                className="rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart px-2 py-1.5 text-xs font-mono tabular-nums text-metin focus:border-vurgu focus:outline-none"
              >
                {SAYFA_BOYUTLARI.map((boyut) => (
                  <option key={boyut} value={boyut}>
                    {boyut} / sf
                  </option>
                ))}
              </select>
            </label>

            {/* 3-Modlu Görünüm Seçici: Izgara (⊞), Liste (☰), Yoğun Tablo (☷) */}
            <div
              className="flex items-center gap-0.5 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey p-0.5"
              role="group"
              aria-label="Görünüm Seçici"
            >
              <button
                type="button"
                onClick={() => gorunumDegistir("izgara")}
                aria-label="izgara görünümüne geç"
                aria-pressed={gorunum === "izgara"}
                title="Izgara Görünümü (⊞)"
                className={`rounded-[4px] p-1.5 transition-colors duration-[var(--sure-ipucu)] ${
                  gorunum === "izgara"
                    ? "bg-yuzey-kart text-vurgu shadow-xs font-medium"
                    : "text-metin-ucuncul hover:text-metin"
                }`}
              >
                <LayoutGrid size={16} />
              </button>

              <button
                type="button"
                onClick={() => gorunumDegistir("liste")}
                aria-label="liste görünümüne geç"
                aria-pressed={gorunum === "liste"}
                title="Liste Görünümü (☰)"
                className={`rounded-[4px] p-1.5 transition-colors duration-[var(--sure-ipucu)] ${
                  gorunum === "liste"
                    ? "bg-yuzey-kart text-vurgu shadow-xs font-medium"
                    : "text-metin-ucuncul hover:text-metin"
                }`}
              >
                <List size={16} />
              </button>

              <button
                type="button"
                onClick={() => gorunumDegistir("tablo")}
                aria-label="tablo görünümüne geç"
                aria-pressed={gorunum === "tablo"}
                title="Yoğun Mühendislik Tablosu (☷)"
                className={`rounded-[4px] p-1.5 transition-colors duration-[var(--sure-ipucu)] ${
                  gorunum === "tablo"
                    ? "bg-yuzey-kart text-vurgu shadow-xs font-medium"
                    : "text-metin-ucuncul hover:text-metin"
                }`}
              >
                <Table2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Aktif Filtre Çipleri Barı (Applied Filter Chips) */}
        {(aktifCipler.length > 0 || sadeceStoktakiler) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-kart)] border border-kenar/60 bg-yuzey-gomulu/50 p-2.5">
            <span className="text-xs font-medium text-metin-ikincil">Aktif Filtreler:</span>
            {sadeceStoktakiler && (
              <FiltreCipi
                etiket="Sadece Stokta Olanlar"
                onKaldir={() => stokDegistir(false)}
              />
            )}
            {aktifCipler.map(({ kod, deger }) => (
              <FiltreCipi
                key={`${kod}-${deger}`}
                etiket={
                  kod === "ureticiId"
                    ? `Marka: ${ureticiAdlari[deger] ?? deger}`
                    : deger
                }
                onKaldir={() => filtreDegistir(kod, deger, false)}
              />
            ))}
            <button
              type="button"
              onClick={filtreleriTemizle}
              className="text-xs font-semibold text-vurgu underline underline-offset-2 transition-colors duration-[var(--sure-ipucu)] hover:text-hata-600 ml-1"
            >
              Tümünü Temizle
            </button>
          </div>
        )}

        {/* Katalog İçerik Render Alanı (Transition sırasında soluklaşır, yerinde kalır) */}
        <div
          className={`transition-opacity duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] ${
            beklemede ? "pointer-events-none opacity-60" : "opacity-100"
          }`}
          aria-busy={beklemede}
        >
          {urunler.kayitlar.length === 0 ? (
            <BosDurum
              baslik="Eşleşen ürün bulunamadı"
              aciklama="Seçtiğiniz filtre parametrelerine uyan hiçbir komponent bulunamadı. Filtreleri temizleyip tekrar deneyebilirsiniz."
              ikon={<Filter size={36} strokeWidth={1.5} />}
            />
          ) : gorunum === "tablo" ? (
            <ParametrikTablo urunler={urunler.kayitlar} />
          ) : gorunum === "liste" ? (
            <div className="flex flex-col gap-3">
              {urunler.kayitlar.map((urun) => (
                <ProductListCard key={urun.id} product={urun} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {urunler.kayitlar.map((urun) => (
                <ProductCard key={urun.id} product={urun} />
              ))}
            </div>
          )}
        </div>

        {/* B2B Gelişmiş Sayfalama Kontrolleri */}
        {urunler.toplamKayit > 0 && (
          <B2BSayfalama
            sayfaNo={urunler.sayfaNo}
            toplamSayfa={urunler.toplamSayfa}
            sayfaBoyutu={sayfaBoyutu}
            toplamKayit={urunler.toplamKayit}
            onSayfaDegisim={sayfaDegistir}
            onSayfaBoyutuDegisim={sayfaBoyutuDegistir}
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
                 py-1 pl-2.5 pr-1 text-xs font-medium text-metin shadow-2xs"
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

interface B2BSayfalamaProps {
  sayfaNo: number;
  toplamSayfa: number;
  sayfaBoyutu: number;
  toplamKayit: number;
  onSayfaDegisim: (sayfa: number) => void;
  onSayfaBoyutuDegisim: (boyut: number) => void;
}

export function B2BSayfalama({
  sayfaNo,
  toplamSayfa,
  sayfaBoyutu,
  toplamKayit,
  onSayfaDegisim,
  onSayfaBoyutuDegisim,
}: B2BSayfalamaProps) {
  const [hedefSayfa, setHedefSayfa] = useState("");

  const start = Math.max(1, (sayfaNo - 1) * sayfaBoyutu + 1);
  const end = Math.min(sayfaNo * sayfaBoyutu, toplamKayit);
  const summaryText = `${start.toLocaleString("tr-TR")} - ${end.toLocaleString("tr-TR")} / ${toplamKayit.toLocaleString("tr-TR")} ürün`;

  // En fazla 5 numara; mevcut sayfa ortada kalacak şekilde kaydırılır
  const baslangic = Math.max(1, Math.min(sayfaNo - 2, toplamSayfa - 4));
  const numaralar = Array.from(
    { length: Math.min(5, Math.max(1, toplamSayfa)) },
    (_, i) => baslangic + i,
  ).filter((n) => n >= 1 && n <= toplamSayfa);

  const handleSayfaGit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(hedefSayfa, 10);
    if (isNaN(page) || page < 1) {
      onSayfaDegisim(1);
    } else if (page > toplamSayfa) {
      onSayfaDegisim(toplamSayfa);
    } else {
      onSayfaDegisim(page);
    }
    setHedefSayfa("");
  };

  const butonSinifi =
    "inline-flex size-8 sm:size-9 items-center justify-center rounded-[var(--radius-girdi)] border border-kenar " +
    "text-metin-ikincil transition-[background-color,color] duration-[var(--sure-ipucu)] " +
    "hover:bg-yuzey-gomulu hover:text-metin disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-kenar pt-5 sm:flex-row">
      {/* Sol: Özet Bilgi Metni */}
      <div className="text-xs font-medium text-metin-ikincil font-mono tabular-nums">
        {summaryText}
      </div>

      {/* Orta: Sayfalama Düğmeleri (İlk, Önceki, Sayı Butonları, Sonraki, Son) */}
      <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="B2B Sayfalama">
        {/* İlk Sayfa */}
        <button
          type="button"
          onClick={() => onSayfaDegisim(1)}
          disabled={sayfaNo <= 1}
          aria-label="İlk sayfa"
          title="İlk Sayfa (1)"
          className={butonSinifi}
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Önceki Sayfa */}
        <button
          type="button"
          onClick={() => onSayfaDegisim(sayfaNo - 1)}
          disabled={sayfaNo <= 1}
          aria-label="Önceki sayfa"
          title="Önceki Sayfa"
          className={butonSinifi}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Numaralı Sayfalar */}
        {numaralar.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSayfaDegisim(n)}
            aria-current={n === sayfaNo ? "page" : undefined}
            className={`inline-flex size-8 sm:size-9 items-center justify-center rounded-[var(--radius-girdi)]
                        font-mono text-xs sm:text-sm tabular-nums transition-[background-color,color]
                        duration-[var(--sure-ipucu)] ${
                          n === sayfaNo
                            ? "bg-marka font-bold text-dolgu-uzeri shadow-2xs"
                            : "border border-kenar text-metin-ikincil hover:bg-yuzey-gomulu hover:text-metin"
                        }`}
          >
            {n}
          </button>
        ))}

        {/* Sonraki Sayfa */}
        <button
          type="button"
          onClick={() => onSayfaDegisim(sayfaNo + 1)}
          disabled={sayfaNo >= toplamSayfa}
          aria-label="Sonraki sayfa"
          title="Sonraki Sayfa"
          className={butonSinifi}
        >
          <ChevronRight size={16} />
        </button>

        {/* Son Sayfa */}
        <button
          type="button"
          onClick={() => onSayfaDegisim(toplamSayfa)}
          disabled={sayfaNo >= toplamSayfa}
          aria-label="Son sayfa"
          title={`Son Sayfa (${toplamSayfa})`}
          className={butonSinifi}
        >
          <ChevronsRight size={16} />
        </button>
      </nav>

      {/* Sağ: Sayfaya Doğrudan Git Formu & Sayfa Boyutu */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSayfaGit} className="flex items-center gap-1.5 text-xs text-metin-ikincil">
          <label htmlFor="sayfa-git-girdi" className="whitespace-nowrap">
            Sayfaya Git:
          </label>
          <input
            id="sayfa-git-girdi"
            type="number"
            min={1}
            max={Math.max(1, toplamSayfa)}
            value={hedefSayfa}
            onChange={(e) => setHedefSayfa(e.target.value)}
            placeholder={String(sayfaNo)}
            className="w-14 rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart px-2 py-1 text-center font-mono text-xs tabular-nums text-metin focus:border-vurgu focus:outline-none"
          />
          <button
            type="submit"
            disabled={!hedefSayfa.trim()}
            className="rounded-[var(--radius-girdi)] border border-kenar-guclu bg-yuzey-gomulu px-2 py-1 font-semibold text-metin transition-colors hover:bg-vurgu hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            Git
          </button>
        </form>

        <label className="flex items-center gap-1 text-xs text-metin-ikincil">
          <span className="sr-only">Sayfa Başına Göster</span>
          <select
            value={sayfaBoyutu}
            onChange={(e) => onSayfaBoyutuDegisim(parseInt(e.target.value, 10))}
            className="rounded-[var(--radius-girdi)] border border-kenar bg-yuzey-kart px-2 py-1 text-xs font-mono tabular-nums text-metin focus:border-vurgu focus:outline-none"
          >
            {SAYFA_BOYUTLARI.map((boyut) => (
              <option key={boyut} value={boyut}>
                {boyut} / sayfa
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
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
