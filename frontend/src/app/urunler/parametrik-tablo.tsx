"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Copy,
  Check,
  ShoppingCart,
  Loader2,
  Building2,
  Package,
  ArrowLeftRight,
} from "lucide-react";
import type { ProductSummary, PackagingOption } from "@/lib/api";
import { useComparisonStore } from "@/lib/stores/comparison-store";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { miktariDogrulaAmbalaj, paraBicimle } from "@/lib/miktar-kurali";
import { bildir } from "@/components/ui/bildirim";
import { StokRozeti } from "@/components/ui/rozet";

interface ParametrikTabloProps {
  urunler: ProductSummary[];
}

export function ParametrikTablo({ urunler }: ParametrikTabloProps) {
  const { isInComparison, addItem, removeItem } = useComparisonStore();

  if (!urunler || urunler.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-token-kart border border-kenar bg-yuzey-kart shadow-sm">
      <table className="w-full min-w-[1020px] border-collapse text-left text-xs" role="table">
        <thead>
          <tr className="border-b border-kenar bg-yuzey-gomulu font-semibold text-metin">
            <th scope="col" className="w-10 px-3 py-3 text-center" title="Karşılaştır">
              <span className="sr-only">Karşılaştır</span>
              <ArrowLeftRight size={14} className="mx-auto text-metin-ucuncul" />
            </th>
            <th scope="col" className="w-14 px-2 py-3 text-center">Görsel</th>
            <th scope="col" className="w-44 px-3 py-3">Parça Kodu (MPN)</th>
            <th scope="col" className="w-32 px-3 py-3">Üretici</th>
            <th scope="col" className="min-w-[180px] max-w-[240px] px-3 py-3">Açıklama</th>
            <th scope="col" className="w-16 px-2 py-3 text-center">Datasheet</th>
            <th scope="col" className="w-32 px-3 py-3">Stok Dağılımı</th>
            <th scope="col" className="w-44 px-3 py-3">Fiyat Kademeleri</th>
            <th scope="col" className="w-32 px-3 py-3">Ambalaj & MOQ</th>
            <th scope="col" className="min-w-[160px] px-3 py-3">Özellikler</th>
            <th scope="col" className="w-44 px-3 py-3 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kenar">
          {urunler.map((urun) => (
            <TabloSatiri
              key={urun.id}
              urun={urun}
              seciliMi={isInComparison(urun.id)}
              onSecimDegisim={(secildi) => {
                if (secildi) {
                  const eklendi = addItem({
                    id: urun.id,
                    ureticiUrunKodu: urun.ureticiUrunKodu,
                    ureticiAd: urun.ureticiAd,
                    anaGorselUrl: urun.anaGorselUrl,
                    baslangicFiyati: urun.baslangicFiyati,
                    paraBirimi: urun.paraBirimi,
                    toplamStok: urun.toplamStok,
                    kategoriId: urun.kategoriId ?? 1,
                    ozellikler: urun.ozellikler,
                  });
                  if (!eklendi) {
                    bildir.bilgi("En fazla 4 ürün karşılaştırabilirsiniz.", "Listeden bir ürün çıkarıp tekrar deneyin.");
                  } else {
                    bildir.basarili(`${urun.ureticiUrunKodu} karşılaştırma listesine eklendi.`);
                  }
                } else {
                  removeItem(urun.id);
                  bildir.bilgi(`${urun.ureticiUrunKodu} karşılaştırma listesinden çıkarıldı.`);
                }
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabloSatiri({
  urun,
  seciliMi,
  onSecimDegisim,
}: {
  urun: ProductSummary;
  seciliMi: boolean;
  onSecimDegisim: (secildi: boolean) => void;
}) {
  const router = useRouter();
  const [kopyalandi, setKopyalandi] = useState(false);
  const [zoomGoster, setZoomGoster] = useState(false);
  const [beklemede, gecisBaslat] = useTransition();

  // Varsayılan ambalaj seçimi
  const ambalajlar: PackagingOption[] = urun.ambalajlarVeFiyatlar && urun.ambalajlarVeFiyatlar.length > 0
    ? urun.ambalajlarVeFiyatlar
    : [
        {
          ambalajId: urun.id * 10,
          ad: "Standart Paket",
          ambalajTipi: 0,
          mpq: 1,
          moq: 1,
          katlamaMiktari: 1,
          stokMiktari: urun.toplamStok,
          gelecekStokMiktari: 0,
          gelecekStokTarihi: null,
          varsayilanMi: true,
          fiyatlar: [
            {
              minMiktar: 1,
              maxMiktar: null,
              birimFiyat: urun.baslangicFiyati,
              paraBirimi: urun.paraBirimi,
            },
          ],
        },
      ];

  const seciliAmbalaj = ambalajlar[0];
  const baslangicMiktar = seciliAmbalaj.moq > 0 ? seciliAmbalaj.moq : 1;
  const [miktar, setMiktar] = useState<number>(baslangicMiktar);
  const [miktarGirdisi, setMiktarGirdisi] = useState<string>(String(baslangicMiktar));
  const [miktarHatasi, setMiktarHatasi] = useState<string | null>(null);

  // MPN Kopyalama
  const mpnKopyala = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(urun.ureticiUrunKodu);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
      bildir.basarili("MPN panoya kopyalandı", urun.ureticiUrunKodu);
    }
  };

  // Miktar Doğrulama ve Güncelleme
  const handleMiktarChange = (val: string) => {
    setMiktarGirdisi(val);
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setMiktarHatasi("Geçerli bir miktar girin.");
      return;
    }
    const dogrulama = miktariDogrulaAmbalaj(num, seciliAmbalaj);
    if (!dogrulama.gecerliMi) {
      setMiktarHatasi(dogrulama.hata);
      setMiktar(dogrulama.onerilenMiktar);
    } else {
      setMiktarHatasi(null);
      setMiktar(num);
    }
  };

  const handleMiktarBlur = () => {
    const num = parseInt(miktarGirdisi, 10);
    if (isNaN(num) || num <= 0) {
      const gecerli = seciliAmbalaj.moq > 0 ? seciliAmbalaj.moq : 1;
      setMiktar(gecerli);
      setMiktarGirdisi(String(gecerli));
      setMiktarHatasi(null);
      return;
    }
    const dogrulama = miktariDogrulaAmbalaj(num, seciliAmbalaj);
    setMiktar(dogrulama.onerilenMiktar);
    setMiktarGirdisi(String(dogrulama.onerilenMiktar));
    setMiktarHatasi(null);
  };

  // Sepete Hızlı Ekleme
  const handleSepeteEkle = () => {
    const dogrulama = miktariDogrulaAmbalaj(miktar, seciliAmbalaj);
    const eklenecekMiktar = dogrulama.onerilenMiktar;

    gecisBaslat(async () => {
      const res = await addToCart(seciliAmbalaj.ambalajId, eklenecekMiktar);
      if (res.success) {
        notifyCartUpdated();
        bildir.eylemli(
          `${urun.ureticiUrunKodu} sepete eklendi`,
          "Sepete Git",
          () => {
            router.push("/sepet");
          },
          `${eklenecekMiktar.toLocaleString("tr-TR")} adet (${seciliAmbalaj.ad})`
        );
      } else {
        bildir.hata(res.message || "Sepete eklenirken bir hata oluştu.");
      }
    });
  };

  // Datasheet URL'si
  const datasheet = urun.dokumanlar?.find(
    (d) => d.tip === 1 || d.url?.toLowerCase().endsWith(".pdf") || d.baslik?.toLowerCase().includes("datasheet")
  );

  return (
    <tr className="transition-colors hover:bg-yuzey-gomulu/60">
      {/* 1. SEÇİM (Karşılaştırma Checkbox) */}
      <td className="px-3 py-3 text-center">
        <label className="inline-flex cursor-pointer items-center justify-center p-1">
          <input
            type="checkbox"
            checked={seciliMi}
            onChange={(e) => onSecimDegisim(e.target.checked)}
            aria-label={`${urun.ureticiUrunKodu} ürününü karşılaştırmaya ekle`}
            className="size-4 rounded border-kenar-guclu text-vurgu accent-cyan-600 focus:ring-vurgu"
          />
        </label>
      </td>

      {/* 2. GÖRSEL & HOVER ZOOM */}
      <td className="relative px-2 py-3 text-center">
        <div
          className="group/thumb relative mx-auto flex size-10 items-center justify-center rounded-token-girdi border border-kenar bg-yuzey-gomulu"
          onMouseEnter={() => setZoomGoster(true)}
          onMouseLeave={() => setZoomGoster(false)}
        >
          {urun.anaGorselUrl ? (
            // Katalog görselleri panelden girilen dış host'lardan gelir;
            // next/image yapılandırılmamış host'ta 400 döner. Düz <img> şart.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urun.anaGorselUrl}
              alt={urun.ureticiUrunKodu}
              className="size-9 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="font-mono text-[9px] font-bold text-metin-ucuncul">
              {urun.ureticiUrunKodu.slice(0, 4)}
            </span>
          )}

          {/* Hover Zoom Popover */}
          {zoomGoster && (
            <div className="pointer-events-none absolute left-12 top-1/2 z-50 -translate-y-1/2 rounded-token-kart border border-kenar-guclu bg-yuzey-kart p-3 shadow-token-katman w-48 text-left">
              <div className="mb-2 flex aspect-square items-center justify-center rounded border border-kenar bg-yuzey-gomulu p-2">
                {urun.anaGorselUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urun.anaGorselUrl}
                    alt={urun.ureticiUrunKodu}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Package size={32} className="text-metin-ucuncul" />
                )}
              </div>
              <div className="font-mono text-xs font-bold text-metin">{urun.ureticiUrunKodu}</div>
              <div className="text-[11px] text-metin-ikincil">{urun.ureticiAd}</div>
              {urun.gorselTemsiliMi && (
                <div className="mt-1 text-[9px] italic text-metin-ucuncul">*Görsel temsilidir</div>
              )}
            </div>
          )}
        </div>
      </td>

      {/* 3. PARÇA KODU (MPN) & 1-CLICK COPY */}
      <td className="px-3 py-3 font-mono">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/urunler/${urun.id}`}
            className="font-mono font-semibold text-metin-marka transition-colors hover:text-vurgu hover:underline line-clamp-1"
            title={urun.ureticiUrunKodu}
          >
            {urun.ureticiUrunKodu}
          </Link>
          <button
            type="button"
            onClick={mpnKopyala}
            aria-label="MPN Kopyala"
            title={kopyalandi ? "Kopyalandı!" : "Panoya Kopyala"}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded p-1 text-metin-ucuncul transition-colors hover:bg-yuzey-gomulu hover:text-metin"
          >
            {kopyalandi ? (
              <Check size={13} className="text-basari-600" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>
        {urun.kampanyaliMi && (
          <span className="mt-0.5 inline-block rounded bg-uyari-50 px-1.5 py-0.2 text-[9px] font-bold uppercase text-uyari-600">
            Fırsat
          </span>
        )}
      </td>

      {/* 4. ÜRETİCİ */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          {urun.ureticiLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urun.ureticiLogoUrl}
              alt={urun.ureticiAd}
              className="h-4 max-w-[48px] object-contain"
            />
          ) : (
            <Building2 size={13} className="shrink-0 text-metin-ucuncul" />
          )}
          <span className="truncate font-medium text-metin" title={urun.ureticiAd}>
            {urun.ureticiAd}
          </span>
        </div>
      </td>

      {/* 5. AÇIKLAMA */}
      <td className="min-w-[180px] max-w-[240px] px-3 py-3">
        <p className="line-clamp-2 text-metin-ikincil" title={urun.kisaAciklama}>
          {urun.kisaAciklama}
        </p>
      </td>

      {/* 6. DATASHEET PDF */}
      <td className="px-2 py-3 text-center">
        {datasheet?.url ? (
          <a
            href={datasheet.url}
            target="_blank"
            rel="noopener noreferrer"
            title={datasheet.baslik || "Teknik Doküman (PDF)"}
            aria-label={`${urun.ureticiUrunKodu} Datasheet PDF İndir`}
            className="inline-flex size-7 items-center justify-center rounded-token-girdi border border-kenar bg-yuzey-kart text-vurgu transition-colors hover:border-vurgu hover:bg-vurgu-zemin hover:text-vurgu-guclu"
          >
            <FileText size={15} />
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Datasheet mevcut değil"
            aria-label="Datasheet mevcut değil"
            className="inline-flex size-7 items-center justify-center rounded-token-girdi border border-kenar bg-yuzey-gomulu text-metin-ucuncul opacity-40"
          >
            <FileText size={15} />
          </button>
        )}
      </td>

      {/* 7. TOPLAM STOK */}
      <td className="px-3 py-3">
        <StokRozeti miktar={urun.toplamStok} />
      </td>

      {/* 8. FİYAT KADEMELERİ */}
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1">
          {seciliAmbalaj.fiyatlar && seciliAmbalaj.fiyatlar.length > 0 ? (
            seciliAmbalaj.fiyatlar.map((tier) => (
              <span
                key={tier.minMiktar}
                className="inline-flex items-center rounded border border-kenar bg-yuzey-gomulu px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-metin"
                title={`${tier.minMiktar}+ adet için birim fiyat`}
              >
                <b className="font-semibold text-metin-ikincil">{tier.minMiktar}+:</b>&nbsp;
                {paraBicimle(tier.birimFiyat, tier.paraBirimi, tier.birimFiyat < 1 ? 4 : 2)}
              </span>
            ))
          ) : (
            <span className="font-mono text-xs font-bold tabular-nums text-metin">
              {paraBicimle(urun.baslangicFiyati, urun.paraBirimi, urun.baslangicFiyati < 1 ? 4 : 2)}
            </span>
          )}
        </div>
      </td>

      {/* 9. AMBALAJ & MOQ */}
      <td className="px-3 py-3 text-[11px]">
        <div className="font-medium text-metin truncate" title={seciliAmbalaj.ad}>
          {seciliAmbalaj.ad}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-metin-ikincil">
          <span className="rounded bg-yuzey-gomulu px-1 py-0.5 tabular-nums">
            MOQ: {seciliAmbalaj.moq.toLocaleString("tr-TR")}
          </span>
          {seciliAmbalaj.katlamaMiktari > 1 && (
            <span className="rounded bg-yuzey-gomulu px-1 py-0.5 tabular-nums">
              Kat: {seciliAmbalaj.katlamaMiktari.toLocaleString("tr-TR")}
            </span>
          )}
        </div>
      </td>

      {/* 10. ÖZELLİKLER (Parametrik Nitelikler) */}
      <td className="min-w-[160px] px-3 py-3">
        {urun.ozellikler && Object.keys(urun.ozellikler).length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {Object.entries(urun.ozellikler).slice(0, 3).map(([key, val]) => (
              <span
                key={key}
                className="inline-block rounded bg-yuzey-gomulu px-1.5 py-0.5 font-mono text-[10px] text-metin-ikincil truncate max-w-[180px]"
                title={`${key}: ${val}`}
              >
                <span className="text-metin-ucuncul">{key}:</span> {val}
              </span>
            ))}
            {Object.keys(urun.ozellikler).length > 3 && (
              <span
                className="text-[10px] text-metin-ucuncul"
                title={Object.entries(urun.ozellikler).slice(3).map(([k, v]) => `${k}: ${v}`).join(", ")}
              >
                +{Object.keys(urun.ozellikler).length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-metin-ucuncul">-</span>
        )}
      </td>

      {/* 11. İŞLEM (Adet Girişi & Sepete Ekle) */}
      <td className="px-3 py-3 text-right">
        <div className="inline-flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={seciliAmbalaj.moq || 1}
              step={seciliAmbalaj.katlamaMiktari || 1}
              value={miktarGirdisi}
              onChange={(e) => handleMiktarChange(e.target.value)}
              onBlur={handleMiktarBlur}
              aria-label={`${urun.ureticiUrunKodu} sipariş adedi`}
              className="w-16 rounded-token-girdi border border-kenar bg-yuzey-kart px-1.5 py-1 text-center font-mono text-xs tabular-nums text-metin focus:border-vurgu focus:outline-none"
            />

            <button
              type="button"
              onClick={handleSepeteEkle}
              disabled={beklemede || !!miktarHatasi}
              aria-label={`${urun.ureticiUrunKodu} sepete ekle`}
              title="Sepete Ekle"
              className="inline-flex h-7 items-center gap-1 rounded-token-girdi bg-vurgu px-2 text-xs font-semibold text-white transition-[background-color,transform] duration-[var(--sure-basma)] hover:bg-vurgu-guclu active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
            >
              {beklemede ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={13} />
                  <span>Ekle</span>
                </>
              )}
            </button>
          </div>

          {miktarHatasi && (
            <span className="text-[9px] text-hata-600 font-medium max-w-[140px] text-right">
              {miktarHatasi}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export const ProductTableView = ParametrikTablo;
