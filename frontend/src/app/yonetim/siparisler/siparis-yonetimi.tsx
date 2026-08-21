"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { siparisDurumGuncelle } from "@/lib/admin-api";
import { SIPARIS_DURUMLARI, type AdminSiparis } from "@/lib/admin-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { ApiHatasi, BasariBildirimi, BosDurum, DurumRozeti } from "@/components/admin/durum-bildirimi";

/** İptal ve iade geri alınamaz; onay penceresi bunları yıkıcı sayar. */
const GERI_ALINAMAZ = [7, 8];

function durumTonu(durum: number) {
  if (durum === 6) return "yesil" as const;
  if (GERI_ALINAMAZ.includes(durum)) return "kirmizi" as const;
  if (durum === 1 || durum === 2) return "sari" as const;
  return "mavi" as const;
}

export function SiparisYonetimi({ siparisler, seciliDurum }: {
  siparisler: AdminSiparis[];
  seciliDurum?: number;
}) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();
  const [onay, setOnay] = useState<{ siparis: AdminSiparis; yeniDurum: number } | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  const uygula = () => {
    if (!onay) return;
    basla(async () => {
      const sonuc = await siparisDurumGuncelle(onay.siparis.id, onay.yeniDurum);
      if (sonuc.success) {
        setBasari(`${onay.siparis.siparisNo} → ${SIPARIS_DURUMLARI[onay.yeniDurum]}`);
        setHata(null);
        router.refresh();
      } else {
        // Geçersiz durum geçişi API'de 422 döner; mesajı olduğu gibi göster.
        setHata(sonuc.message);
        setBasari(null);
      }
      setOnay(null);
    });
  };

  const filtrele = (durum: string) => {
    router.push(durum ? `/yonetim/siparisler?durum=${durum}` : "/yonetim/siparisler");
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-metin">Sipariş Yönetimi</h1>
      <p className="mb-6 text-sm text-metin-ucuncul">
        Durum geçişleri sunucudaki sipariş durum makinesine tabidir; yalnızca izin verilen
        geçişler buton olarak gösterilir.
      </p>

      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}

      <div className="mb-4">
        <label className="text-sm font-medium text-metin-ikincil">
          Durum filtresi{" "}
          <select
            defaultValue={seciliDurum ?? ""}
            onChange={(e) => filtrele(e.target.value)}
            className="ml-2 rounded-md border border-kenar-guclu px-3 py-2 text-sm"
          >
            <option value="">Tümü</option>
            {Object.entries(SIPARIS_DURUMLARI).map(([deger, ad]) => (
              <option key={deger} value={deger}>{ad}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-kenar bg-yuzey-kart shadow-sm">
        {siparisler.length === 0 ? (
          <BosDurum mesaj="Bu filtreye uyan sipariş yok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yuzey text-left text-xs uppercase tracking-wide text-metin-ucuncul">
                <tr>
                  <th className="p-4">Sipariş No</th>
                  <th className="p-4">Müşteri</th>
                  <th className="p-4">Tutar</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Geçiş</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kenar">
                {siparisler.map((s) => (
                  <tr key={s.id} className="hover:bg-yuzey">
                    <td className="p-4 font-bold text-metin">
                      {s.siparisNo}
                      <span className="block text-xs font-normal text-metin-ucuncul">
                        {s.kalemSayisi} kalem
                      </span>
                    </td>
                    <td className="p-4 text-metin-ikincil">
                      {s.firmaUnvani ?? s.musteriAdi ?? "—"}
                    </td>
                    <td className="p-4 font-medium text-metin">
                      {s.genelToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {s.paraBirimi}
                    </td>
                    <td className="p-4 text-metin-ikincil">
                      {new Date(s.tarih).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="p-4">
                      <DurumRozeti metin={SIPARIS_DURUMLARI[s.durum] ?? `#${s.durum}`} ton={durumTonu(s.durum)} />
                    </td>
                    <td className="p-4">
                      {s.izinliGecisler.length === 0 ? (
                        <span className="text-xs text-metin-ucuncul">Son durum</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.izinliGecisler.map((d) => (
                            <button
                              key={d} type="button"
                              onClick={() => setOnay({ siparis: s, yeniDurum: d })}
                              className="rounded-lg border border-kenar-guclu px-2.5 py-1 text-xs font-medium text-metin-ikincil hover:border-vurgu hover:text-vurgu"
                            >
                              {SIPARIS_DURUMLARI[d] ?? `#${d}`}
                            </button>
                          ))}
                        </div>
                      )}
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
        yikici={onay ? GERI_ALINAMAZ.includes(onay.yeniDurum) : false}
        baslik="Sipariş durumunu değiştir"
        mesaj={
          onay
            ? `${onay.siparis.siparisNo} numaralı sipariş "${SIPARIS_DURUMLARI[onay.siparis.durum]}" durumundan ` +
              `"${SIPARIS_DURUMLARI[onay.yeniDurum]}" durumuna geçirilecek.` +
              (GERI_ALINAMAZ.includes(onay.yeniDurum)
                ? " Bu geçiş geri alınamaz ve iptal durumunda stok müşteriye iade edilir."
                : "")
            : ""
        }
        onayMetni="Durumu değiştir"
        islemSuruyor={beklemede}
        onOnayla={uygula}
        onIptal={() => setOnay(null)}
      />
    </div>
  );
}
