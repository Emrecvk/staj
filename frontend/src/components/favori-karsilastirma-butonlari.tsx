"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeftRight, Loader2 } from "lucide-react";
import {
  favoriEkle, favoriSil, karsilastirmayaEkle, karsilastirmadanCikar,
} from "@/lib/katalog-actions";
import { useComparisonStore, type ComparisonItem } from "@/lib/stores/comparison-store";
import { notifyFavoritesUpdated } from "@/lib/stores/header-state";

type Boyut = "kucuk" | "buyuk";

/**
 * Favori ve karşılaştırma kontrolleri.
 * Gerçek sunucu eylemlerine ve reaktif istemci durumlarına bağlıdır.
 */
export function FavoriButonu({ urunId, baslangicta = false, boyut = "kucuk" }: {
  urunId: number; baslangicta?: boolean; boyut?: Boyut;
}) {
  const router = useRouter();
  const [favori, setFavori] = useState(baslangicta);
  const [beklemede, basla] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const tikla = (olay: React.MouseEvent) => {
    olay.preventDefault();
    olay.stopPropagation();

    basla(async () => {
      const sonuc = favori ? await favoriSil(urunId) : await favoriEkle(urunId);

      if (sonuc.success) {
        setFavori(!favori);
        setHata(null);
        notifyFavoritesUpdated();
        return;
      }

      if (sonuc.message?.includes("giriş")) {
        router.push(`/giris?devam=/urunler/${urunId}`);
        return;
      }
      setHata(sonuc.message ?? "İşlem başarısız.");
    });
  };

  const ikonBoyutu = boyut === "buyuk" ? 20 : 16;

  return (
    <button
      type="button"
      onClick={tikla}
      disabled={beklemede}
      aria-pressed={favori}
      aria-label={favori ? "Favorilerden çıkar" : "Favorilere ekle"}
      title={hata ?? (favori ? "Favorilerden çıkar" : "Favorilere ekle")}
      className={`rounded-full transition-colors disabled:opacity-50 ${
        boyut === "buyuk" ? "bg-yuzey-gomulu p-2 hover:bg-yuzey" : "bg-yuzey-kart p-1.5 shadow-sm"
      } ${favori ? "text-vurgu" : "text-metin-ucuncul hover:text-vurgu"}`}
    >
      {beklemede
        ? <Loader2 size={ikonBoyutu} className="animate-spin" />
        : <Heart size={ikonBoyutu} fill={favori ? "currentColor" : "none"} />}
    </button>
  );
}

export function KarsilastirmaButonu({
  urunId,
  product,
  baslangicta = false,
}: {
  urunId: number;
  product?: Partial<ComparisonItem>;
  baslangicta?: boolean;
}) {
  const { isInComparison, addItem, removeItem } = useComparisonStore();
  const listede = isInComparison(urunId) || baslangicta;
  const [beklemede, basla] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const tikla = (olay: React.MouseEvent) => {
    olay.preventDefault();
    olay.stopPropagation();

    basla(async () => {
      if (listede) {
        removeItem(urunId);
        await karsilastirmadanCikar(urunId);
      } else {
        const added = addItem({
          id: urunId,
          ureticiUrunKodu: product?.ureticiUrunKodu ?? `URUN-${urunId}`,
          ureticiAd: product?.ureticiAd ?? "Distribütör",
          anaGorselUrl: product?.anaGorselUrl ?? null,
          baslangicFiyati: product?.baslangicFiyati ?? 0,
          paraBirimi: product?.paraBirimi ?? "USD",
          toplamStok: product?.toplamStok ?? 100,
          kategoriId: product?.kategoriId ?? 1,
          ozellikler: product?.ozellikler,
        });
        if (!added) {
          setHata("En fazla 4 ürün karşılaştırabilirsiniz.");
          return;
        }
        await karsilastirmayaEkle(urunId);
      }
      setHata(null);
    });
  };

  return (
    <button
      type="button"
      onClick={tikla}
      disabled={beklemede}
      aria-pressed={listede}
      aria-label={listede ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
      title={hata ?? (listede ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle")}
      className={`rounded-full bg-yuzey-gomulu p-2 transition-colors hover:bg-yuzey disabled:opacity-50 ${
        listede ? "text-vurgu bg-vurgu-zemin" : "text-metin-ucuncul hover:text-vurgu"
      }`}
    >
      {beklemede
        ? <Loader2 size={20} className="animate-spin" />
        : <ArrowLeftRight size={20} />}
    </button>
  );
}
