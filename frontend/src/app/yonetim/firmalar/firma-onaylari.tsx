"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { firmaOnayla } from "@/lib/admin-api";
import type { AdminFirma } from "@/lib/admin-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { ApiHatasi, BasariBildirimi, BosDurum } from "@/components/admin/durum-bildirimi";

/** FirmaOnayDurumu: Beklemede=1, Onaylandi=2, Reddedildi=3 */
const ONAYLA = 2;
const REDDET = 3;

export function FirmaOnaylari({ firmalar }: { firmalar: AdminFirma[] }) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();
  const [onay, setOnay] = useState<{ firma: AdminFirma; durum: number } | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  const uygula = () => {
    if (!onay) return;
    basla(async () => {
      const sonuc = await firmaOnayla(onay.firma.id, onay.durum);
      if (sonuc.success) {
        setBasari(`${onay.firma.unvan} başvurusu ${onay.durum === ONAYLA ? "onaylandı" : "reddedildi"}.`);
        setHata(null);
        router.refresh();
      } else {
        setHata(sonuc.message);
        setBasari(null);
      }
      setOnay(null);
    });
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Firma Başvuruları</h1>
      <p className="mb-6 text-sm text-gray-500">
        Onay bekleyen {firmalar.length} başvuru. Onaylanan firmanın yetkilisi B2B fiyatlarına
        ve teklif isteme akışına erişir.
      </p>

      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {firmalar.length === 0 ? (
          <BosDurum mesaj="Onay bekleyen firma başvurusu yok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="p-4">Unvan</th>
                  <th className="p-4">Vergi Dairesi / No</th>
                  <th className="p-4">KEP</th>
                  <th className="p-4">Kullanıcı</th>
                  <th className="p-4">Başvuru</th>
                  <th className="p-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {firmalar.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{f.unvan}</td>
                    <td className="p-4 text-gray-600">
                      {f.vergiDairesi}<br />
                      <span className="text-xs text-gray-500">{f.vergiNo}</span>
                    </td>
                    <td className="p-4 text-gray-600">{f.kepAdresi ?? "—"}</td>
                    <td className="p-4 text-gray-600">{f.kullaniciSayisi}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(f.basvuruTarihi).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button" onClick={() => setOnay({ firma: f, durum: ONAYLA })}
                          aria-label={`${f.unvan} onayla`}
                          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
                        >
                          <Check size={14} /> Onayla
                        </button>
                        <button
                          type="button" onClick={() => setOnay({ firma: f, durum: REDDET })}
                          aria-label={`${f.unvan} reddet`}
                          className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                        >
                          <X size={14} /> Reddet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OnayPenceresi
        acik={onay !== null}
        yikici={onay?.durum === REDDET}
        baslik={onay?.durum === ONAYLA ? "Firmayı onayla" : "Başvuruyu reddet"}
        mesaj={
          onay?.durum === ONAYLA
            ? `"${onay.firma.unvan}" onaylanacak ve firma yetkilisi kurumsal fiyatlara erişecek. Vergi numarasını (${onay.firma.vergiNo}) doğruladığınızdan emin olun.`
            : onay
              ? `"${onay.firma.unvan}" başvurusu reddedilecek. Kullanıcı bireysel hesap olarak devam eder.`
              : ""
        }
        onayMetni={onay?.durum === ONAYLA ? "Onayla" : "Reddet"}
        islemSuruyor={beklemede}
        onOnayla={uygula}
        onIptal={() => setOnay(null)}
      />
    </div>
  );
}
