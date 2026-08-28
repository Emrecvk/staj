"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Minus, Plus, Bell, FileText } from "lucide-react";
import { FavoriButonu, KarsilastirmaButonu } from "@/components/favori-karsilastirma-butonlari";
import { UrunGorseli } from "@/components/urun-gorseli";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { bildir } from "@/components/ui/bildirim";
import type { ProductSummary, PackagingOption } from "@/lib/api";
import { StokBildirimModal } from "@/components/stok-bildirim-modal";
import { paraBicimle } from "@/lib/miktar-kurali";

/**
 * Özdisan tarzı katalog ürün kartı: belirgin stok durumu, adet seçici ve
 * hızlı sepet aksiyonu.
 *
 * Not: Liste özet DTO'su ambalaj/fiyat-kademesi taşımadığı için gerçek bir
 * ambalajId yok. Bu yüzden "Sepete Ekle" ambalaj verisi yoksa ürün sayfasına
 * yönlendirir (uydurma id/miktar göndermeyiz) — mevcut hızlı-ekle deseni.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const router = useRouter();
  const [adet, setAdet] = useState(1);
  const [ekleniyor, setEkleniyor] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [bildirimAcik, setBildirimAcik] = useState(false);

  const stokVar = product.toplamStok > 0;
  const azStok = stokVar && product.toplamStok < 100;

  // Özdisan katalogdaki 12.244 ürünün 7.442'si için fiyat yayımlamıyor.
  // paraBicimle(undefined) bunları "₺0,00" diye basıyordu ve yanında çalışan
  // bir "Sepete Ekle" butonu duruyordu; kullanıcı bedava sandığı ürüne tıklayıp
  // 422 alıyordu. Fiyatı olmayan ürün satılık değil, TEKLİFLİK.
  const fiyatVar = typeof product.baslangicFiyati === "number" && product.baslangicFiyati > 0;

  const varsayilanAmbalaj: PackagingOption | null =
    product.ambalajlarVeFiyatlar?.find((a) => a.varsayilanMi) ??
    product.ambalajlarVeFiyatlar?.[0] ??
    null;

  const sepeteEkle = () => {
    if (!varsayilanAmbalaj) {
      // Gerçek ambalaj bilgisi listede yok; kullanıcı PDP'de seçsin.
      router.push(`/urunler/${product.id}`);
      return;
    }
    setEkleniyor(true);
    startTransition(async () => {
      const sonuc = await addToCart(varsayilanAmbalaj.ambalajId, varsayilanAmbalaj.moq * adet);
      if (sonuc.success) {
        bildir.eylemli(
          "Sepete eklendi",
          "Sepete Git",
          () => router.push("/sepet"),
          product.ureticiUrunKodu,
        );
        notifyCartUpdated();
        router.refresh();
      } else {
        bildir.hata("Sepete eklenemedi", sonuc.message);
      }
      setEkleniyor(false);
    });
  };

  const mesgul = ekleniyor && isPending;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-kenar
                 bg-yuzey-kart shadow-sm transition-[border-color,box-shadow]
                 duration-[var(--sure-acilir)] ease-[var(--ease-cikis)]
                 hover:border-kenar-guclu hover:shadow-token-yukselti"
    >
      {/* Görsel + rozetler + hover aksiyonları */}
      <div className="relative shrink-0 border-b border-kenar bg-yuzey-gomulu">
        <Link
          href={`/urunler/${product.id}`}
          className="flex aspect-[4/3] items-center justify-center p-4"
          aria-label={`${product.ureticiUrunKodu} ürün detayı`}
        >
          <UrunGorseli src={product.anaGorselUrl} urunKodu={product.ureticiUrunKodu} className="p-2" />
        </Link>

        {product.kampanyaliMi && (
          <span className="absolute left-2 top-2 rounded-full bg-uyari-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Fırsat
          </span>
        )}

        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity duration-[var(--sure-acilir)] focus-within:opacity-100 group-hover:opacity-100">
          <KarsilastirmaButonu
            urunId={product.id}
            product={{
              ureticiUrunKodu: product.ureticiUrunKodu,
              ureticiAd: product.ureticiAd,
              anaGorselUrl: product.anaGorselUrl,
              baslangicFiyati: product.baslangicFiyati,
              paraBirimi: product.paraBirimi,
              toplamStok: product.toplamStok,
              kategoriId: product.kategoriId,
              ozellikler: product.ozellikler,
            }}
          />
          <FavoriButonu urunId={product.id} />
        </div>
      </div>

      {/* Bilgi */}
      <div className="flex flex-grow flex-col p-4">
        <span className="mb-1 text-xs font-medium text-metin-ucuncul">{product.ureticiAd}</span>

        <h3 className="mb-1.5 font-mono text-sm font-bold leading-tight text-metin">
          <Link
            href={`/urunler/${product.id}`}
            className="line-clamp-1 transition-colors duration-[var(--sure-ipucu)] hover:text-vurgu"
          >
            {product.ureticiUrunKodu}
          </Link>
        </h3>

        <p className="mb-3 line-clamp-2 flex-grow text-xs leading-relaxed text-metin-ikincil">
          {product.kisaAciklama}
        </p>

        {/* Belirgin stok durumu (Özdisan tarzı) */}
        <div className="mb-3">
          {stokVar ? (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                azStok ? "text-uyari-600" : "text-basari-600"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${azStok ? "bg-uyari-500" : "bg-basari-500"}`} />
              <span className="font-mono tabular-nums">{product.toplamStok.toLocaleString("tr-TR")}</span>
              {azStok ? " adet (sınırlı)" : " adet stokta"}
            </span>
          ) : (
            <button type="button" onClick={() => setBildirimAcik(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-vurgu-guclu hover:underline">
              <Bell size={13} /> Gelince haber ver
            </button>
          )}
        </div>

        {/* Fiyat */}
        <div className="mb-3 border-t border-kenar pt-3">
          <div className="text-[10px] text-metin-ucuncul">
            {fiyatVar ? "Başlangıç fiyatı" : "Fiyat"}
          </div>
          {fiyatVar ? (
            <div className="font-mono text-lg font-bold tabular-nums text-metin">
              {paraBicimle(product.baslangicFiyati, product.paraBirimi)}
            </div>
          ) : (
            <div className="text-sm font-bold text-metin-ikincil">Teklife tabi</div>
          )}
        </div>

        {/* Adet seçici + sepete ekle */}
        <div className="mt-auto flex items-center gap-2">
          <div className="flex h-9 shrink-0 items-center rounded-token-girdi border border-kenar">
            <button
              type="button"
              onClick={() => setAdet((a) => Math.max(1, a - 1))}
              disabled={adet <= 1}
              aria-label="Adet azalt"
              className="flex h-full w-8 items-center justify-center text-metin-ikincil transition-colors hover:text-vurgu disabled:opacity-40"
            >
              <Minus size={13} />
            </button>
            <span className="w-7 text-center font-mono text-sm font-bold tabular-nums text-metin">{adet}</span>
            <button
              type="button"
              onClick={() => setAdet((a) => a + 1)}
              aria-label="Adet artır"
              className="flex h-full w-8 items-center justify-center text-metin-ikincil transition-colors hover:text-vurgu"
            >
              <Plus size={13} />
            </button>
          </div>

          {fiyatVar ? (
            <button
              type="button"
              onClick={sepeteEkle}
              disabled={mesgul}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-token-girdi
                         bg-vurgu px-3 text-xs font-bold text-white transition-[background-color,transform]
                         duration-[var(--sure-basma)] ease-[var(--ease-cikis)]
                         hover:bg-vurgu-guclu active:scale-[0.97] disabled:opacity-60"
            >
              {mesgul ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={14} /> Sepete Ekle
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/teklif-iste?urunId=${product.id}`}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-token-girdi
                         border border-vurgu px-3 text-xs font-bold text-vurgu
                         transition-colors hover:bg-vurgu hover:text-white"
            >
              <FileText size={14} /> Teklif İste
            </Link>
          )}
        </div>
      </div>
      <StokBildirimModal
        isOpen={bildirimAcik}
        onClose={() => setBildirimAcik(false)}
        mpn={product.ureticiUrunKodu}
        ambalajId={varsayilanAmbalaj?.ambalajId ?? null}
      />
    </article>
  );
}
