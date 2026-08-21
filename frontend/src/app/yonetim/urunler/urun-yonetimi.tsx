"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, RotateCcw, Package, Layers, Loader2 } from "lucide-react";
import {
  urunEkle, urunGuncelle, urunSil, urunGeriAl,
  getAdminUrunDetay, stokGuncelle, fiyatGuncelle,
} from "@/lib/admin-api";
import type { AdminUrun, AdminKategori, AdminUretici } from "@/lib/admin-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { ApiHatasi, BasariBildirimi, BosDurum } from "@/components/admin/durum-bildirimi";

const URUN_DURUM_SECENEKLERI = [
  { deger: 1, ad: "Aktif" },
  { deger: 2, ad: "Yeni Tasarıma Önerilmez" },
  { deger: 3, ad: "Ömrü Sonu" },
  { deger: 4, ad: "Kullanımdan Kalktı" },
];
const ROHS_SECENEKLERI = [
  { deger: 0, ad: "Bilinmiyor" }, { deger: 1, ad: "Belgeli" }, { deger: 2, ad: "Belgesiz" },
];
const MONTAJ_SECENEKLERI = [
  { deger: 0, ad: "Yok" }, { deger: 1, ad: "SMT" }, { deger: 2, ad: "THT" },
];

type Ambalaj = {
  id: number; ad?: string; stokMiktari: number; gelecekStokMiktari: number;
  fiyatKademeleri?: { minMiktar: number; maxMiktar: number | null; birimFiyat: number; paraBirimi: string }[];
};

type Onay =
  | { tip: "sil"; urun: AdminUrun }
  | { tip: "geri-al"; urun: AdminUrun }
  | null;

export function UrunYonetimi({ urunler, toplam, kategoriler, ureticiler, arama, silinmisleriGoster }: {
  urunler: AdminUrun[];
  toplam: number;
  kategoriler: AdminKategori[];
  ureticiler: AdminUretici[];
  arama: string;
  silinmisleriGoster: boolean;
}) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();

  const [onay, setOnay] = useState<Onay>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [duzenlenen, setDuzenlenen] = useState<AdminUrun | "yeni" | null>(null);
  const [stokUrunu, setStokUrunu] = useState<{ urun: AdminUrun; ambalajlar: Ambalaj[] } | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const bildir = (sonuc: { success: boolean; message?: string }, basariMetni: string) => {
    if (sonuc.success) {
      setBasari(basariMetni);
      setHata(null);
      router.refresh();
    } else {
      setHata(sonuc.message ?? "İşlem başarısız.");
      setBasari(null);
    }
  };

  const onayiUygula = () => {
    if (!onay) return;
    basla(async () => {
      const sonuc = onay.tip === "sil"
        ? await urunSil(onay.urun.id)
        : await urunGeriAl(onay.urun.id);

      bildir(sonuc, onay.tip === "sil"
        ? `${onay.urun.ureticiUrunKodu} silindi (soft-delete).`
        : `${onay.urun.ureticiUrunKodu} geri alındı.`);
      setOnay(null);
    });
  };

  const stokPaneliniAc = async (urun: AdminUrun) => {
    setYukleniyor(true);
    const sonuc = await getAdminUrunDetay(urun.id);
    setYukleniyor(false);

    if (!sonuc.success) { setHata(sonuc.message); return; }

    const ambalajlar = (sonuc.data.urunAmbalajlari as Ambalaj[] | undefined) ?? [];
    setStokUrunu({ urun, ambalajlar });
  };

  const aramaYap = (formData: FormData) => {
    const sorgu = new URLSearchParams();
    const metin = String(formData.get("arama") ?? "").trim();
    if (metin) sorgu.set("arama", metin);
    if (formData.get("silinmisler")) sorgu.set("silinmisler", "1");
    router.push(`/yonetim/urunler?${sorgu}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">{toplam.toLocaleString("tr-TR")} kayıt</p>
        </div>
        <button
          type="button"
          onClick={() => setDuzenlenen("yeni")}
          className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90"
        >
          <Plus size={16} /> Yeni Ürün Ekle
        </button>
      </div>

      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}

      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <form action={aramaYap} className="flex flex-wrap items-center gap-4 border-b border-gray-100 bg-gray-50 p-4">
          <input
            name="arama"
            defaultValue={arama}
            placeholder="Ürün kodu ara…"
            aria-label="Ürün kodu ara"
            className="min-w-0 flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-cyan focus:ring-brand-cyan"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="silinmisler" defaultChecked={silinmisleriGoster} className="rounded" />
            Silinmişleri göster
          </label>
          <button type="submit" className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white">
            Ara
          </button>
        </form>

        {urunler.length === 0 ? (
          <BosDurum mesaj="Aramanıza uyan ürün bulunamadı." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="p-4">Ürün Kodu</th>
                  <th className="p-4">Açıklama</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {urunler.map((u) => (
                  <tr key={u.id} className={u.silindiMi ? "bg-red-50/40" : "hover:bg-gray-50"}>
                    <td className="p-4 font-bold text-gray-900">{u.ureticiUrunKodu}</td>
                    <td className="p-4 text-gray-600">{u.kisaAciklama}</td>
                    <td className="p-4 font-medium">{u.toplamStok.toLocaleString("tr-TR")}</td>
                    <td className="p-4">
                      {u.silindiMi
                        ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">Silinmiş</span>
                        : <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                            {u.aktif ? "Aktif" : "Pasif"}
                          </span>}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {u.silindiMi ? (
                          <button
                            type="button" onClick={() => setOnay({ tip: "geri-al", urun: u })}
                            aria-label={`${u.ureticiUrunKodu} geri al`}
                            className="rounded p-2 text-green-600 hover:bg-green-50"
                          >
                            <RotateCcw size={16} />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button" onClick={() => stokPaneliniAc(u)} disabled={yukleniyor}
                              aria-label={`${u.ureticiUrunKodu} stok ve fiyat`}
                              className="rounded p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                            >
                              <Layers size={16} />
                            </button>
                            <button
                              type="button" onClick={() => setDuzenlenen(u)}
                              aria-label={`${u.ureticiUrunKodu} düzenle`}
                              className="rounded p-2 text-gray-600 hover:bg-gray-100"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button" onClick={() => setOnay({ tip: "sil", urun: u })}
                              aria-label={`${u.ureticiUrunKodu} sil`}
                              className="rounded p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
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
        acik={onay !== null}
        yikici={onay?.tip === "sil"}
        baslik={onay?.tip === "sil" ? "Ürünü sil" : "Ürünü geri al"}
        mesaj={
          onay?.tip === "sil"
            ? `"${onay.urun.ureticiUrunKodu}" katalogdan kaldırılacak. Kayıt fiziksel olarak silinmez (soft-delete); geçmiş siparişler etkilenmez ve istediğinizde geri alabilirsiniz.`
            : onay
              ? `"${onay.urun.ureticiUrunKodu}" yeniden katalogda görünür olacak.`
              : ""
        }
        onayMetni={onay?.tip === "sil" ? "Sil" : "Geri al"}
        islemSuruyor={beklemede}
        onOnayla={onayiUygula}
        onIptal={() => setOnay(null)}
      />

      {duzenlenen && (
        <UrunFormu
          urun={duzenlenen === "yeni" ? null : duzenlenen}
          kategoriler={kategoriler}
          ureticiler={ureticiler}
          onKapat={() => setDuzenlenen(null)}
          onTamam={(mesaj) => { setDuzenlenen(null); setBasari(mesaj); setHata(null); router.refresh(); }}
          onHata={(mesaj) => setHata(mesaj)}
        />
      )}

      {stokUrunu && (
        <StokFiyatPaneli
          urun={stokUrunu.urun}
          ambalajlar={stokUrunu.ambalajlar}
          onKapat={() => setStokUrunu(null)}
          onTamam={(mesaj) => { setStokUrunu(null); setBasari(mesaj); setHata(null); router.refresh(); }}
          onHata={(mesaj) => setHata(mesaj)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function Kutu({ baslik, onKapat, children }: {
  baslik: string; onKapat: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 className="text-lg font-bold text-gray-900">{baslik}</h2>
          <button type="button" onClick={onKapat} className="text-sm text-gray-500 hover:text-gray-800">
            Kapat
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Alan({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{etiket}</span>
      {children}
    </label>
  );
}

const girdiSinifi =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-cyan focus:ring-brand-cyan";

function UrunFormu({ urun, kategoriler, ureticiler, onKapat, onTamam, onHata }: {
  urun: AdminUrun | null;
  kategoriler: AdminKategori[];
  ureticiler: AdminUretici[];
  onKapat: () => void;
  onTamam: (mesaj: string) => void;
  onHata: (mesaj: string) => void;
}) {
  const [beklemede, basla] = useTransition();
  const yeniMi = urun === null;

  const gonder = (formData: FormData) => {
    const sayi = (ad: string) => Number(formData.get(ad));
    const metin = (ad: string) => String(formData.get(ad) ?? "").trim();

    basla(async () => {
      const sonuc = yeniMi
        ? await urunEkle({
            kategoriId: sayi("kategoriId"),
            ureticiId: sayi("ureticiId"),
            ureticiUrunKodu: metin("ureticiUrunKodu"),
            kisaAciklama: metin("kisaAciklama"),
            detayliAciklamaTr: metin("detayliAciklamaTr") || undefined,
            anaGorselUrl: metin("anaGorselUrl") || undefined,
            urunDurumu: sayi("urunDurumu"),
            rohsDurumu: sayi("rohsDurumu"),
            montajTipi: sayi("montajTipi"),
            aktif: formData.get("aktif") === "on",
          })
        : await urunGuncelle(urun.id, {
            kisaAciklama: metin("kisaAciklama"),
            detayliAciklamaTr: metin("detayliAciklamaTr") || undefined,
            anaGorselUrl: metin("anaGorselUrl") || undefined,
            urunDurumu: sayi("urunDurumu"),
            rohsDurumu: sayi("rohsDurumu"),
            montajTipi: sayi("montajTipi"),
            kampanyaliMi: formData.get("kampanyaliMi") === "on",
            aktif: formData.get("aktif") === "on",
          });

      if (sonuc.success) onTamam(yeniMi ? "Ürün eklendi." : "Ürün güncellendi.");
      else { onHata(sonuc.message); onKapat(); }
    });
  };

  return (
    <Kutu baslik={yeniMi ? "Yeni Ürün" : `Ürünü Düzenle — ${urun.ureticiUrunKodu}`} onKapat={onKapat}>
      <form action={gonder} className="space-y-4 p-5">
        {yeniMi && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Alan etiket="Kategori">
                <select name="kategoriId" required className={girdiSinifi}>
                  <option value="">Seçin…</option>
                  {kategoriler.filter(k => k.yaprakMi).map(k => (
                    <option key={k.id} value={k.id}>{k.adTr}</option>
                  ))}
                </select>
              </Alan>
              <Alan etiket="Üretici">
                <select name="ureticiId" required className={girdiSinifi}>
                  <option value="">Seçin…</option>
                  {ureticiler.map(u => <option key={u.id} value={u.id}>{u.ad}</option>)}
                </select>
              </Alan>
            </div>
            <Alan etiket="Üretici Ürün Kodu (MPN)">
              <input name="ureticiUrunKodu" required className={girdiSinifi} placeholder="örn. LM358N" />
            </Alan>
          </>
        )}

        <Alan etiket="Kısa Açıklama">
          <input name="kisaAciklama" required defaultValue={urun?.kisaAciklama} className={girdiSinifi} />
        </Alan>

        <Alan etiket="Detaylı Açıklama">
          <textarea name="detayliAciklamaTr" rows={3} className={girdiSinifi} />
        </Alan>

        <Alan etiket="Ana Görsel URL">
          <input name="anaGorselUrl" type="url" className={girdiSinifi} placeholder="https://…" />
        </Alan>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Alan etiket="Ürün Durumu">
            <select name="urunDurumu" defaultValue={urun?.urunDurumu ?? 1} className={girdiSinifi}>
              {URUN_DURUM_SECENEKLERI.map(s => <option key={s.deger} value={s.deger}>{s.ad}</option>)}
            </select>
          </Alan>
          <Alan etiket="RoHS">
            <select name="rohsDurumu" defaultValue={0} className={girdiSinifi}>
              {ROHS_SECENEKLERI.map(s => <option key={s.deger} value={s.deger}>{s.ad}</option>)}
            </select>
          </Alan>
          <Alan etiket="Montaj Tipi">
            <select name="montajTipi" defaultValue={0} className={girdiSinifi}>
              {MONTAJ_SECENEKLERI.map(s => <option key={s.deger} value={s.deger}>{s.ad}</option>)}
            </select>
          </Alan>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="aktif" defaultChecked={urun?.aktif ?? true} className="rounded" /> Aktif
          </label>
          {!yeniMi && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="kampanyaliMi" className="rounded" /> Kampanyalı
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onKapat}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Vazgeç
          </button>
          <button type="submit" disabled={beklemede}
            className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {beklemede && <Loader2 size={14} className="animate-spin" />}
            {yeniMi ? "Ekle" : "Kaydet"}
          </button>
        </div>
      </form>
    </Kutu>
  );
}

// ---------------------------------------------------------------------------

function StokFiyatPaneli({ urun, ambalajlar, onKapat, onTamam, onHata }: {
  urun: AdminUrun;
  ambalajlar: Ambalaj[];
  onKapat: () => void;
  onTamam: (mesaj: string) => void;
  onHata: (mesaj: string) => void;
}) {
  const [beklemede, basla] = useTransition();
  const [secili, setSecili] = useState<Ambalaj | null>(ambalajlar[0] ?? null);

  // Kademeler yerelde düzenlenir, tek seferde gönderilir — API kademelerin
  // tamamını değiştirir (RemoveRange + ekleme), kısmi güncelleme yoktur.
  const [kademeler, setKademeler] = useState(
    () => secili?.fiyatKademeleri?.map(k => ({ ...k })) ?? []);

  const ambalajSec = (a: Ambalaj) => {
    setSecili(a);
    setKademeler(a.fiyatKademeleri?.map(k => ({ ...k })) ?? []);
  };

  const stokKaydet = (formData: FormData) => {
    if (!secili) return;
    basla(async () => {
      const sonuc = await stokGuncelle({
        urunAmbalajId: secili.id,
        stokMiktari: Number(formData.get("stokMiktari")),
        gelecekStokMiktari: Number(formData.get("gelecekStokMiktari")),
        gelecekStokTarihi: String(formData.get("gelecekStokTarihi") ?? "") || null,
      });
      if (sonuc.success) onTamam("Stok güncellendi.");
      else { onHata(sonuc.message); onKapat(); }
    });
  };

  const fiyatKaydet = () => {
    if (!secili) return;
    basla(async () => {
      const sonuc = await fiyatGuncelle({ urunAmbalajId: secili.id, kademeler });
      if (sonuc.success) onTamam("Fiyat kademeleri güncellendi.");
      else { onHata(sonuc.message); onKapat(); }
    });
  };

  return (
    <Kutu baslik={`Stok ve Fiyat — ${urun.ureticiUrunKodu}`} onKapat={onKapat}>
      {ambalajlar.length === 0 ? (
        <BosDurum mesaj="Bu ürüne tanımlı ambalaj yok. Stok ve fiyat ambalaj bazında tutulur." />
      ) : (
        <div className="p-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {ambalajlar.map(a => (
              <button
                key={a.id} type="button" onClick={() => ambalajSec(a)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  secili?.id === a.id
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {a.ad ?? `Ambalaj #${a.id}`}
              </button>
            ))}
          </div>

          {secili && (
            <>
              <form action={stokKaydet} className="mb-6 rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                  <Package size={16} /> Stok
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Alan etiket="Mevcut Stok">
                    <input name="stokMiktari" type="number" min={0}
                      defaultValue={secili.stokMiktari} className={girdiSinifi} />
                  </Alan>
                  <Alan etiket="Gelecek Stok">
                    <input name="gelecekStokMiktari" type="number" min={0}
                      defaultValue={secili.gelecekStokMiktari} className={girdiSinifi} />
                  </Alan>
                  <Alan etiket="Gelecek Stok Tarihi">
                    <input name="gelecekStokTarihi" type="date" className={girdiSinifi} />
                  </Alan>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="submit" disabled={beklemede}
                    className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                    Stoğu Kaydet
                  </button>
                </div>
              </form>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                  <Layers size={16} /> Kademeli Fiyat
                </h3>
                <p className="mb-3 text-xs text-gray-500">
                  Kademe aralıkları çakışamaz ve son kademe hariç üst sınır zorunludur;
                  aksi hâlde API 422 döndürür.
                </p>

                <div className="space-y-2">
                  {kademeler.map((k, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <input type="number" min={1} value={k.minMiktar} aria-label="Min miktar"
                        onChange={e => setKademeler(d => d.map((x, j) =>
                          j === i ? { ...x, minMiktar: Number(e.target.value) } : x))}
                        className={girdiSinifi} placeholder="Min" />
                      <input type="number" value={k.maxMiktar ?? ""} aria-label="Max miktar"
                        onChange={e => setKademeler(d => d.map((x, j) =>
                          j === i ? { ...x, maxMiktar: e.target.value ? Number(e.target.value) : null } : x))}
                        className={girdiSinifi} placeholder="Max (boş = sınırsız)" />
                      <input type="number" step="0.0001" min={0} value={k.birimFiyat} aria-label="Birim fiyat"
                        onChange={e => setKademeler(d => d.map((x, j) =>
                          j === i ? { ...x, birimFiyat: Number(e.target.value) } : x))}
                        className={girdiSinifi} placeholder="Birim fiyat" />
                      <div className="flex gap-2">
                        <select value={k.paraBirimi} aria-label="Para birimi"
                          onChange={e => setKademeler(d => d.map((x, j) =>
                            j === i ? { ...x, paraBirimi: e.target.value } : x))}
                          className={girdiSinifi}>
                          <option>TRY</option><option>USD</option><option>EUR</option>
                        </select>
                        <button type="button" aria-label={`${i + 1}. kademeyi sil`}
                          onClick={() => setKademeler(d => d.filter((_, j) => j !== i))}
                          className="rounded p-2 text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between">
                  <button type="button"
                    onClick={() => setKademeler(d => [...d, {
                      minMiktar: (d.at(-1)?.maxMiktar ?? 0) + 1,
                      maxMiktar: null, birimFiyat: 0, paraBirimi: "USD",
                    }])}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Plus size={14} /> Kademe ekle
                  </button>
                  <button type="button" onClick={fiyatKaydet} disabled={beklemede || kademeler.length === 0}
                    className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                    Fiyatları Kaydet
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Kutu>
  );
}
