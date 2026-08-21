"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { adresEkle, adresSil } from "@/lib/profil-api";
import type { Adres } from "@/lib/profil-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { ApiHatasi, BasariBildirimi } from "@/components/admin/durum-bildirimi";

const girdiSinifi =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-cyan focus:ring-brand-cyan";

export function AdresYonetimi({ adresler }: { adresler: Adres[] }) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();
  const [formAcik, setFormAcik] = useState(false);
  const [silinecek, setSilinecek] = useState<Adres | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  const ekle = (formData: FormData) => {
    const metin = (ad: string) => String(formData.get(ad) ?? "").trim();

    basla(async () => {
      const sonuc = await adresEkle({
        baslik: metin("baslik"),
        sehir: metin("sehir"),
        ilce: metin("ilce"),
        postaKodu: metin("postaKodu"),
        acikAdres: metin("acikAdres"),
        faturaAdresiMi: formData.get("faturaAdresiMi") === "on",
      });

      if (sonuc.success) {
        setBasari("Adres eklendi.");
        setHata(null);
        setFormAcik(false);
        router.refresh();
      } else {
        setHata(sonuc.message);
        setBasari(null);
      }
    });
  };

  const sil = () => {
    if (!silinecek) return;
    basla(async () => {
      const sonuc = await adresSil(silinecek.id);
      if (sonuc.success) {
        setBasari(`"${silinecek.baslik}" adresi silindi.`);
        setHata(null);
        router.refresh();
      } else {
        setHata(sonuc.message);
        setBasari(null);
      }
      setSilinecek(null);
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Adreslerim</h1>
        <button
          type="button" onClick={() => setFormAcik(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90"
        >
          <Plus size={16} /> Yeni Adres
        </button>
      </div>

      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}

      {adresler.length === 0 ? (
        <div className="rounded-xl border border-gray-200 p-12 text-center">
          <MapPin size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Kayıtlı adresiniz yok. Sipariş verebilmek için adres ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {adresler.map((a) => (
            <div key={a.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{a.baslik}</p>
                  {a.faturaAdresiMi && (
                    <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Fatura adresi
                    </span>
                  )}
                </div>
                <button
                  type="button" onClick={() => setSilinecek(a)}
                  aria-label={`${a.baslik} adresini sil`}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {a.acikAdres}<br />
                {a.ilce} / {a.sehir} {a.postaKodu}
              </p>
            </div>
          ))}
        </div>
      )}

      <OnayPenceresi
        acik={silinecek !== null}
        yikici
        baslik="Adresi sil"
        mesaj={silinecek
          ? `"${silinecek.baslik}" adresi silinecek. Bu adresi kullanan geçmiş siparişleriniz etkilenmez.`
          : ""}
        onayMetni="Sil"
        islemSuruyor={beklemede}
        onOnayla={sil}
        onIptal={() => setSilinecek(null)}
      />

      {formAcik && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-900">Yeni Adres</h2>
              <button type="button" onClick={() => setFormAcik(false)}
                className="text-sm text-gray-500 hover:text-gray-800">Kapat</button>
            </div>

            <form action={ekle} className="space-y-4 p-5">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Adres Başlığı</span>
                <input name="baslik" required className={girdiSinifi} placeholder="Ofis, Depo…" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">İl</span>
                  <input name="sehir" required className={girdiSinifi} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">İlçe</span>
                  <input name="ilce" required className={girdiSinifi} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Posta Kodu</span>
                <input name="postaKodu" required inputMode="numeric" className={girdiSinifi} />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Açık Adres</span>
                <textarea name="acikAdres" required rows={3} className={girdiSinifi} />
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="faturaAdresiMi" className="rounded" />
                Bu adresi fatura adresi olarak kullan
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setFormAcik(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Vazgeç
                </button>
                <button type="submit" disabled={beklemede}
                  className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                  {beklemede && <Loader2 size={14} className="animate-spin" />}
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
