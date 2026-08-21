"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeftRight, Loader2 } from "lucide-react";
import {
  favoriEkle, favoriSil, karsilastirmayaEkle, karsilastirmadanCikar,
} from "@/lib/katalog-actions";

type Boyut = "kucuk" | "buyuk";

/**
 * Favori ve karşılaştırma kontrolleri.
 *
 * Önceki sürümde bu butonlar arayüzde vardı ama hiçbir şeye bağlı değildi
 * (`onClick={(e) => e.preventDefault()}`), lib/api.ts içindeki
 * toggleFavorite/toggleCompare ise "Mock API call" döndürüyordu. Artık
 * gerçek uçlara bağlılar.
 *
 * Favori giriş ister; misafir kullanıcı giriş sayfasına yönlendirilir.
 * Karşılaştırma misafir oturum anahtarıyla da çalışır.
 */
export function FavoriButonu({ urunId, baslangicta = false, boyut = "kucuk" }: {
  urunId: number; baslangicta?: boolean; boyut?: Boyut;
}) {
  const router = useRouter();
  const [favori, setFavori] = useState(baslangicta);
  const [beklemede, basla] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const tikla = (olay: React.MouseEvent) => {
    // Kart bir Link içinde olabilir; tıklama ürüne gitmesin.
    olay.preventDefault();
    olay.stopPropagation();

    basla(async () => {
      const sonuc = favori ? await favoriSil(urunId) : await favoriEkle(urunId);

      if (sonuc.success) {
        setFavori(!favori);
        setHata(null);
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
        boyut === "buyuk" ? "bg-gray-50 p-2 hover:bg-gray-100" : "bg-white p-1.5 shadow-sm"
      } ${favori ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
    >
      {beklemede
        ? <Loader2 size={ikonBoyutu} className="animate-spin" />
        : <Heart size={ikonBoyutu} fill={favori ? "currentColor" : "none"} />}
    </button>
  );
}

export function KarsilastirmaButonu({ urunId, baslangicta = false }: {
  urunId: number; baslangicta?: boolean;
}) {
  const [listede, setListede] = useState(baslangicta);
  const [beklemede, basla] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const tikla = (olay: React.MouseEvent) => {
    olay.preventDefault();
    olay.stopPropagation();

    basla(async () => {
      const sonuc = listede
        ? await karsilastirmadanCikar(urunId)
        : await karsilastirmayaEkle(urunId);

      if (sonuc.success) { setListede(!listede); setHata(null); }
      else setHata(sonuc.message ?? "İşlem başarısız.");
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
      className={`rounded-full bg-gray-50 p-2 transition-colors hover:bg-gray-100 disabled:opacity-50 ${
        listede ? "text-brand-cyan" : "text-gray-400 hover:text-brand-cyan"
      }`}
    >
      {beklemede
        ? <Loader2 size={20} className="animate-spin" />
        : <ArrowLeftRight size={20} />}
    </button>
  );
}
