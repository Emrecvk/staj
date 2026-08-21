"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, XCircle, Loader2 } from "lucide-react";
import {
  teklifIncelemeyeAl, teklifFiyatlandir, teklifReddet, getAdminTeklifDetay,
} from "@/lib/admin-api";
import { TEKLIF_DURUMLARI, type AdminTeklif, type AdminTeklifKalemi } from "@/lib/admin-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { ApiHatasi, BasariBildirimi, BosDurum, DurumRozeti } from "@/components/admin/durum-bildirimi";

const YENI = 1, INCELENIYOR = 2;

function durumTonu(durum: number) {
  if (durum === 5 || durum === 8) return "yesil" as const;
  if (durum === 6 || durum === 7) return "kirmizi" as const;
  if (durum === 1) return "sari" as const;
  return "mavi" as const;
}

/** Fiyatlandırma formunda düzenlenen satır. */
type KalemGirdisi = {
  teklifEdilenMiktar: string;
  teklifEdilenBirimFiyat: string;
  paraBirimi: string;
  teklifEdilenTeslimSuresiGun: string;
  satisTemsilcisiNotu: string;
};

function girdiyeCevir(k: AdminTeklifKalemi): KalemGirdisi {
  return {
    teklifEdilenMiktar: String(k.teklifEdilenMiktar ?? k.miktar),
    teklifEdilenBirimFiyat: k.teklifEdilenBirimFiyat != null ? String(k.teklifEdilenBirimFiyat) : "",
    paraBirimi: k.paraBirimi ?? "USD",
    teklifEdilenTeslimSuresiGun: k.teklifEdilenTeslimSuresiGun != null
      ? String(k.teklifEdilenTeslimSuresiGun) : "",
    satisTemsilcisiNotu: k.satisTemsilcisiNotu ?? "",
  };
}

const girdiSinifi =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-cyan focus:ring-brand-cyan";

export function TeklifYonetimi({ teklifler }: { teklifler: AdminTeklif[] }) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [redOnayi, setRedOnayi] = useState<AdminTeklif | null>(null);
  const [fiyatlanan, setFiyatlanan] = useState<AdminTeklif | null>(null);
  const [yukleniyor, setYukleniyor] = useState<number | null>(null);

  const bildir = (sonuc: { success: boolean; message?: string }, metin: string) => {
    if (sonuc.success) { setBasari(metin); setHata(null); router.refresh(); }
    else { setHata(sonuc.message ?? "İşlem başarısız."); setBasari(null); }
  };

  const incelemeyeAl = (t: AdminTeklif) => {
    basla(async () => bildir(await teklifIncelemeyeAl(t.id), `${t.talepNo} incelemeye alındı.`));
  };

  const fiyatPaneliniAc = async (t: AdminTeklif) => {
    setYukleniyor(t.id);
    // Liste ucu kalemleri taşımayabilir; detayı ayrıca çekiyoruz.
    const sonuc = await getAdminTeklifDetay(t.id);
    setYukleniyor(null);

    if (!sonuc.success) { setHata(sonuc.message); return; }
    setFiyatlanan(sonuc.data);
  };

  const reddet = () => {
    if (!redOnayi) return;
    basla(async () => {
      bildir(await teklifReddet(redOnayi.id), `${redOnayi.talepNo} reddedildi.`);
      setRedOnayi(null);
    });
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Teklif Talepleri</h1>
      <p className="mb-6 text-sm text-gray-500">
        Fiyatlandırılan teklif müşteri onayına düşer. Geçerlilik tarihi geçtiğinde teklif
        otomatik olarak süresi dolmuş sayılır.
      </p>

      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {teklifler.length === 0 ? (
          <BosDurum mesaj="Henüz teklif talebi yok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="p-4">Talep No</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Geçerlilik</th>
                  <th className="p-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teklifler.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{t.talepNo}</td>
                    <td className="p-4">
                      <DurumRozeti metin={TEKLIF_DURUMLARI[t.durum] ?? `#${t.durum}`} ton={durumTonu(t.durum)} />
                    </td>
                    <td className="p-4 text-gray-600">
                      {t.gecerlilikTarihi
                        ? new Date(t.gecerlilikTarihi).toLocaleDateString("tr-TR")
                        : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {t.durum === YENI && (
                          <button
                            type="button" onClick={() => incelemeyeAl(t)} disabled={beklemede}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Eye size={14} /> İncelemeye al
                          </button>
                        )}
                        {(t.durum === YENI || t.durum === INCELENIYOR) && (
                          <>
                            <button
                              type="button" onClick={() => fiyatPaneliniAc(t)} disabled={yukleniyor === t.id}
                              className="flex items-center gap-1 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                            >
                              {yukleniyor === t.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Edit3 size={14} />} Fiyatlandır
                            </button>
                            <button
                              type="button" onClick={() => setRedOnayi(t)}
                              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                            >
                              <XCircle size={14} /> Reddet
                            </button>
                          </>
                        )}
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
        acik={redOnayi !== null}
        yikici
        baslik="Teklifi reddet"
        mesaj={redOnayi
          ? `${redOnayi.talepNo} numaralı teklif reddedilecek ve müşteriye bildirilecek. Bu geçiş geri alınamaz.`
          : ""}
        onayMetni="Reddet"
        islemSuruyor={beklemede}
        onOnayla={reddet}
        onIptal={() => setRedOnayi(null)}
      />

      {fiyatlanan && (
        <FiyatlandirmaPaneli
          teklif={fiyatlanan}
          onKapat={() => setFiyatlanan(null)}
          onTamam={(mesaj) => { setFiyatlanan(null); setBasari(mesaj); setHata(null); router.refresh(); }}
          onHata={(mesaj) => { setFiyatlanan(null); setHata(mesaj); }}
        />
      )}
    </div>
  );
}

function FiyatlandirmaPaneli({ teklif, onKapat, onTamam, onHata }: {
  teklif: AdminTeklif;
  onKapat: () => void;
  onTamam: (mesaj: string) => void;
  onHata: (mesaj: string) => void;
}) {
  const [beklemede, basla] = useTransition();
  const [kalemler, setKalemler] = useState<Record<number, KalemGirdisi>>(
    () => Object.fromEntries(teklif.kalemler.map(k => [k.id, girdiyeCevir(k)])));

  // Varsayılan geçerlilik: bugünden 14 gün sonra.
  // Date.now() saf olmadığı için render sırasında değil, state başlatıcısında
  // bir kez hesaplanır — aksi hâlde her render farklı değer üretir.
  const [varsayilanGecerlilik] = useState(() =>
    new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10));
  const [enErkenTarih] = useState(() => new Date().toISOString().slice(0, 10));

  const guncelle = (id: number, alan: keyof KalemGirdisi, deger: string) =>
    setKalemler(d => ({ ...d, [id]: { ...d[id], [alan]: deger } }));

  const gonder = (formData: FormData) => {
    basla(async () => {
      const sonuc = await teklifFiyatlandir(teklif.id, {
        // Tarihi gün sonuna sabitle; sadece tarih gönderildiğinde teklif
        // o günün başında dolmuş sayılıyordu.
        gecerlilikTarihi: new Date(`${formData.get("gecerlilikTarihi")}T23:59:59Z`).toISOString(),
        temsilciNotu: String(formData.get("temsilciNotu") ?? "") || undefined,
        kalemler: Object.fromEntries(
          Object.entries(kalemler).map(([id, g]) => [Number(id), {
            teklifEdilenMiktar: g.teklifEdilenMiktar ? Number(g.teklifEdilenMiktar) : null,
            teklifEdilenBirimFiyat: g.teklifEdilenBirimFiyat ? Number(g.teklifEdilenBirimFiyat) : null,
            paraBirimi: g.paraBirimi || null,
            teklifEdilenTeslimSuresiGun: g.teklifEdilenTeslimSuresiGun
              ? Number(g.teklifEdilenTeslimSuresiGun) : null,
            satisTemsilcisiNotu: g.satisTemsilcisiNotu || null,
          }]),
        ),
      });

      if (sonuc.success) onTamam(`${teklif.talepNo} fiyatlandırıldı, müşteri onayına gönderildi.`);
      else onHata(sonuc.message);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-4xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Teklifi Fiyatlandır — {teklif.talepNo}</h2>
            {teklif.musteriNotu && (
              <p className="mt-1 text-sm text-gray-500">Müşteri notu: {teklif.musteriNotu}</p>
            )}
          </div>
          <button type="button" onClick={onKapat} className="text-sm text-gray-500 hover:text-gray-800">
            Kapat
          </button>
        </div>

        <form action={gonder} className="p-5">
          <div className="mb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="p-3">Ürün</th>
                  <th className="p-3">İstenen</th>
                  <th className="p-3">Teklif Miktarı</th>
                  <th className="p-3">Birim Fiyat</th>
                  <th className="p-3">Para Br.</th>
                  <th className="p-3">Teslim (gün)</th>
                  <th className="p-3">Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teklif.kalemler.map((k) => (
                  <tr key={k.id}>
                    <td className="p-3 font-medium text-gray-900">
                      {k.serbestUrunKodu ?? `Ürün #${k.urunId}`}
                    </td>
                    <td className="p-3 text-gray-600">{k.miktar}</td>
                    <td className="p-3">
                      <input type="number" min={1} aria-label="Teklif edilen miktar"
                        value={kalemler[k.id]?.teklifEdilenMiktar ?? ""}
                        onChange={e => guncelle(k.id, "teklifEdilenMiktar", e.target.value)}
                        className={girdiSinifi} />
                    </td>
                    <td className="p-3">
                      <input type="number" step="0.0001" min={0} aria-label="Birim fiyat"
                        value={kalemler[k.id]?.teklifEdilenBirimFiyat ?? ""}
                        onChange={e => guncelle(k.id, "teklifEdilenBirimFiyat", e.target.value)}
                        className={girdiSinifi} />
                    </td>
                    <td className="p-3">
                      <select aria-label="Para birimi"
                        value={kalemler[k.id]?.paraBirimi ?? "USD"}
                        onChange={e => guncelle(k.id, "paraBirimi", e.target.value)}
                        className={girdiSinifi}>
                        <option>TRY</option><option>USD</option><option>EUR</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input type="number" min={0} aria-label="Teslim süresi"
                        value={kalemler[k.id]?.teklifEdilenTeslimSuresiGun ?? ""}
                        onChange={e => guncelle(k.id, "teklifEdilenTeslimSuresiGun", e.target.value)}
                        className={girdiSinifi} />
                    </td>
                    <td className="p-3">
                      <input aria-label="Satış temsilcisi notu"
                        value={kalemler[k.id]?.satisTemsilcisiNotu ?? ""}
                        onChange={e => guncelle(k.id, "satisTemsilcisiNotu", e.target.value)}
                        className={girdiSinifi} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Geçerlilik Tarihi</span>
              <input name="gecerlilikTarihi" type="date" required
                defaultValue={varsayilanGecerlilik}
                min={enErkenTarih}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Temsilci Notu</span>
              <input name="temsilciNotu"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onKapat}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Vazgeç
            </button>
            <button type="submit" disabled={beklemede}
              className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {beklemede && <Loader2 size={14} className="animate-spin" />}
              Fiyatlandır ve müşteri onayına gönder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
