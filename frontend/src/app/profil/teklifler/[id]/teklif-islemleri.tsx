"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShoppingCart, Loader2 } from "lucide-react";
import { teklifKabulEt, teklifReddetMusteri, teklifiSiparieCevir } from "@/lib/profil-api";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { ApiHatasi, BasariBildirimi } from "@/components/admin/durum-bildirimi";

/** TeklifDurumu: Fiyatlandirildi=3, MusteriOnayiBekliyor=4, KabulEdildi=5 */
const FIYATLANDIRILDI = 3;
const MUSTERI_ONAYI_BEKLIYOR = 4;
const KABUL_EDILDI = 5;

type Islem = "kabul" | "red" | "siparis" | null;

export function TeklifIslemleri({ teklifId, talepNo, durum, gecerlilikTarihi }: {
  teklifId: number;
  talepNo: string;
  durum: number;
  gecerlilikTarihi: string | null;
}) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();
  const [islem, setIslem] = useState<Islem>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  const kararVerilebilir = durum === FIYATLANDIRILDI || durum === MUSTERI_ONAYI_BEKLIYOR;
  const siparieCevrilebilir = durum === KABUL_EDILDI;

  // Geçerliliği geçmiş teklif kabul edilemez; sunucu da ayrıca reddeder.
  const suresiDoldu = gecerlilikTarihi !== null && new Date(gecerlilikTarihi) < new Date();

  const uygula = () => {
    if (!islem) return;

    basla(async () => {
      const sonuc =
        islem === "kabul" ? await teklifKabulEt(teklifId)
        : islem === "red" ? await teklifReddetMusteri(teklifId)
        : await teklifiSiparieCevir(teklifId);

      if (sonuc.success) {
        setBasari(
          islem === "kabul" ? `${talepNo} kabul edildi.`
          : islem === "red" ? `${talepNo} reddedildi.`
          : `${talepNo} siparişe dönüştürüldü.`,
        );
        setHata(null);
        router.refresh();
      } else {
        setHata(sonuc.message);
        setBasari(null);
      }
      setIslem(null);
    });
  };

  if (!kararVerilebilir && !siparieCevrilebilir) {
    return (
      <>
        {hata && <ApiHatasi mesaj={hata} />}
        {basari && <BasariBildirimi mesaj={basari} />}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {hata && <ApiHatasi mesaj={hata} />}
      {basari && <BasariBildirimi mesaj={basari} />}

      {suresiDoldu && kararVerilebilir && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Bu teklifin geçerlilik süresi dolmuş. Satış temsilcinizden yeni fiyat isteyin.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {kararVerilebilir && (
          <>
            <button
              type="button" onClick={() => setIslem("kabul")}
              disabled={beklemede || suresiDoldu}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {beklemede ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Teklifi Kabul Et
            </button>
            <button
              type="button" onClick={() => setIslem("red")} disabled={beklemede}
              className="flex items-center gap-2 rounded-lg border border-red-300 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <X size={16} /> Reddet
            </button>
          </>
        )}

        {siparieCevrilebilir && (
          <button
            type="button" onClick={() => setIslem("siparis")} disabled={beklemede}
            className="flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {beklemede ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
            Siparişe Dönüştür
          </button>
        )}
      </div>

      <OnayPenceresi
        acik={islem !== null}
        yikici={islem === "red"}
        baslik={
          islem === "kabul" ? "Teklifi kabul et"
          : islem === "red" ? "Teklifi reddet"
          : "Siparişe dönüştür"
        }
        mesaj={
          islem === "kabul"
            ? `${talepNo} numaralı teklifi kabul ediyorsunuz. Teklifteki fiyatlar sipariş anında korunur.`
            : islem === "red"
              ? `${talepNo} numaralı teklifi reddediyorsunuz. Bu işlem geri alınamaz.`
              : `${talepNo} numaralı kabul edilmiş teklif siparişe dönüştürülecek. Teklif fiyatları aynen aktarılır ve aynı teklif ikinci kez siparişe çevrilemez.`
        }
        onayMetni={islem === "kabul" ? "Kabul et" : islem === "red" ? "Reddet" : "Siparişe dönüştür"}
        islemSuruyor={beklemede}
        onOnayla={uygula}
        onIptal={() => setIslem(null)}
      />
    </div>
  );
}
