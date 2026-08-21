"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, FolderTree, Factory, SlidersHorizontal, Loader2 } from "lucide-react";
import {
  kategoriEkle, kategoriGuncelle, kategoriSil,
  ureticiEkle, ureticiGuncelle, ureticiSil,
  ozellikEkle, ozellikGuncelle,
} from "@/lib/admin-api";
import type { AdminKategori, AdminUretici, AdminOzellik } from "@/lib/admin-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { ApiHatasi, BasariBildirimi, BosDurum } from "@/components/admin/durum-bildirimi";

const VERI_TIPLERI = [
  { deger: 1, ad: "Metin" }, { deger: 2, ad: "Sayı" }, { deger: 3, ad: "Aralık" },
  { deger: 4, ad: "Mantıksal" }, { deger: 5, ad: "Seçim" },
];
const GOSTERIM_TIPLERI = [
  { deger: 1, ad: "Onay Kutusu" }, { deger: 2, ad: "Aralık Kaydırıcı" }, { deger: 3, ad: "Açılır Liste" },
];

const girdiSinifi =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-cyan focus:ring-brand-cyan";

type Sekme = "kategori" | "uretici" | "ozellik";
type Silme = { tur: "kategori" | "uretici"; id: number; ad: string } | null;

export function TanimYonetimi({ kategoriler, ureticiler, ozellikler }: {
  kategoriler: AdminKategori[];
  ureticiler: AdminUretici[];
  ozellikler: AdminOzellik[];
}) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();
  const [sekme, setSekme] = useState<Sekme>("kategori");
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [silme, setSilme] = useState<Silme>(null);
  const [form, setForm] = useState<
    | { tur: "kategori"; kayit: AdminKategori | null }
    | { tur: "uretici"; kayit: AdminUretici | null }
    | { tur: "ozellik"; kayit: AdminOzellik | null }
    | null
  >(null);

  const bildir = (sonuc: { success: boolean; message?: string }, metin: string) => {
    if (sonuc.success) { setBasari(metin); setHata(null); router.refresh(); }
    else { setHata(sonuc.message ?? "İşlem başarısız."); setBasari(null); }
  };

  const silmeyiUygula = () => {
    if (!silme) return;
    basla(async () => {
      const sonuc = silme.tur === "kategori"
        ? await kategoriSil(silme.id)
        : await ureticiSil(silme.id);
      bildir(sonuc, `${silme.ad} silindi.`);
      setSilme(null);
    });
  };

  const sekmeler: { anahtar: Sekme; ad: string; ikon: React.ReactNode; adet: number }[] = [
    { anahtar: "kategori", ad: "Kategoriler", ikon: <FolderTree size={16} />, adet: kategoriler.length },
    { anahtar: "uretici", ad: "Üreticiler", ikon: <Factory size={16} />, adet: ureticiler.length },
    { anahtar: "ozellik", ad: "Parametrik Özellikler", ikon: <SlidersHorizontal size={16} />, adet: ozellikler.length },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori, Üretici ve Özellikler</h1>
          <p className="mt-1 text-sm text-gray-500">
            Parametrik özellik tanımları katalog filtre panelini besler.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ tur: sekme, kayit: null } as never)}
          className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90"
        >
          <Plus size={16} /> Yeni Tanım Ekle
        </button>
      </div>

      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}

      <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200">
        {sekmeler.map((s) => (
          <button
            key={s.anahtar} type="button" onClick={() => setSekme(s.anahtar)}
            aria-current={sekme === s.anahtar ? "page" : undefined}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              sekme === s.anahtar
                ? "border-brand-cyan text-brand-cyan"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {s.ikon} {s.ad}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s.adet}</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {sekme === "kategori" && (
          kategoriler.length === 0 ? <BosDurum mesaj="Kategori yok." /> : (
            <Tablo basliklar={["Ad", "Yol", "Seviye", "Yaprak", "Durum", ""]}>
              {kategoriler.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900" style={{ paddingLeft: `${16 + k.seviye * 16}px` }}>
                    {k.adTr}
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500">{k.yol}</td>
                  <td className="p-4 text-gray-600">{k.seviye}</td>
                  <td className="p-4 text-gray-600">{k.yaprakMi ? "Evet" : "Hayır"}</td>
                  <td className="p-4">{k.aktif ? "Aktif" : "Pasif"}</td>
                  <td className="p-4">
                    <Islemler
                      onDuzenle={() => setForm({ tur: "kategori", kayit: k })}
                      onSil={() => setSilme({ tur: "kategori", id: k.id, ad: k.adTr })}
                    />
                  </td>
                </tr>
              ))}
            </Tablo>
          )
        )}

        {sekme === "uretici" && (
          ureticiler.length === 0 ? <BosDurum mesaj="Üretici yok." /> : (
            <Tablo basliklar={["Ad", "Slug", "Ürün", "Yetkili Dist.", "Durum", ""]}>
              {ureticiler.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{u.ad}</td>
                  <td className="p-4 font-mono text-xs text-gray-500">{u.slug}</td>
                  <td className="p-4 text-gray-600">{u.urunSayisi}</td>
                  <td className="p-4 text-gray-600">{u.yetkiliDistributorMu ? "Evet" : "Hayır"}</td>
                  <td className="p-4">{u.aktif ? "Aktif" : "Pasif"}</td>
                  <td className="p-4">
                    <Islemler
                      onDuzenle={() => setForm({ tur: "uretici", kayit: u })}
                      onSil={() => setSilme({ tur: "uretici", id: u.id, ad: u.ad })}
                    />
                  </td>
                </tr>
              ))}
            </Tablo>
          )
        )}

        {sekme === "ozellik" && (
          ozellikler.length === 0 ? <BosDurum mesaj="Özellik tanımı yok." /> : (
            <Tablo basliklar={["Kod", "Ad", "Veri Tipi", "Birim", "Filtre", "Kategori", ""]}>
              {ozellikler.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs font-bold text-gray-900">{o.kod}</td>
                  <td className="p-4 text-gray-900">{o.adTr}</td>
                  <td className="p-4 text-gray-600">
                    {VERI_TIPLERI.find(v => v.deger === o.veriTipi)?.ad ?? o.veriTipi}
                  </td>
                  <td className="p-4 text-gray-600">{o.birim ?? "—"}</td>
                  <td className="p-4 text-gray-600">{o.filtrelenebilirMi ? "Evet" : "Hayır"}</td>
                  <td className="p-4 text-gray-600">{o.kullanildigiKategoriSayisi}</td>
                  <td className="p-4">
                    {/* Özellik tanımı için silme ucu yok — kategorilere bağlı
                        olduğu için yalnızca güncellenebilir. */}
                    <Islemler onDuzenle={() => setForm({ tur: "ozellik", kayit: o })} />
                  </td>
                </tr>
              ))}
            </Tablo>
          )
        )}
      </div>

      <OnayPenceresi
        acik={silme !== null}
        yikici
        baslik={silme?.tur === "kategori" ? "Kategoriyi sil" : "Üreticiyi sil"}
        mesaj={silme
          ? `"${silme.ad}" silinecek (soft-delete). ` +
            (silme.tur === "kategori"
              ? "Alt kategorisi veya ürünü olan kategori silinemez; bu durumda sunucu işlemi reddeder."
              : "Ürünü olan üretici silinemez; bu durumda sunucu işlemi reddeder.")
          : ""}
        onayMetni="Sil"
        islemSuruyor={beklemede}
        onOnayla={silmeyiUygula}
        onIptal={() => setSilme(null)}
      />

      {form && (
        <TanimFormu
          form={form}
          kategoriler={kategoriler}
          onKapat={() => setForm(null)}
          onTamam={(mesaj) => { setForm(null); setBasari(mesaj); setHata(null); router.refresh(); }}
          onHata={(mesaj) => { setForm(null); setHata(mesaj); }}
        />
      )}
    </div>
  );
}

function Tablo({ basliklar, children }: { basliklar: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>{basliklar.map((b, i) => <th key={i} className="p-4">{b}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

function Islemler({ onDuzenle, onSil }: { onDuzenle: () => void; onSil?: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <button type="button" onClick={onDuzenle} aria-label="Düzenle"
        className="rounded p-2 text-gray-600 hover:bg-gray-100">
        <Edit2 size={16} />
      </button>
      {onSil && (
        <button type="button" onClick={onSil} aria-label="Sil"
          className="rounded p-2 text-red-600 hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

function TanimFormu({ form, kategoriler, onKapat, onTamam, onHata }: {
  form:
    | { tur: "kategori"; kayit: AdminKategori | null }
    | { tur: "uretici"; kayit: AdminUretici | null }
    | { tur: "ozellik"; kayit: AdminOzellik | null };
  kategoriler: AdminKategori[];
  onKapat: () => void;
  onTamam: (mesaj: string) => void;
  onHata: (mesaj: string) => void;
}) {
  const [beklemede, basla] = useTransition();
  const yeniMi = form.kayit === null;

  const gonder = (formData: FormData) => {
    const metin = (ad: string) => String(formData.get(ad) ?? "").trim();
    const sayi = (ad: string) => Number(formData.get(ad) ?? 0);
    const kutu = (ad: string) => formData.get(ad) === "on";

    basla(async () => {
      let sonuc: { success: boolean; message?: string };
      let etiket: string;

      if (form.tur === "kategori") {
        const dto = {
          ustKategoriId: formData.get("ustKategoriId") ? sayi("ustKategoriId") : null,
          adTr: metin("adTr"), adEn: metin("adEn") || metin("adTr"),
          slugTr: metin("slugTr"), slugEn: metin("slugEn") || metin("slugTr"),
          sira: sayi("sira"), yaprakMi: kutu("yaprakMi"), aktif: kutu("aktif"),
        };
        sonuc = yeniMi ? await kategoriEkle(dto) : await kategoriGuncelle(form.kayit!.id, dto);
        etiket = "Kategori";
      } else if (form.tur === "uretici") {
        const dto = {
          ad: metin("ad"), slug: metin("slug"),
          logoUrl: metin("logoUrl") || null, webSitesi: metin("webSitesi") || null,
          aciklama: metin("aciklama") || null,
          yetkiliDistributorMu: kutu("yetkiliDistributorMu"), aktif: kutu("aktif"),
        };
        sonuc = yeniMi ? await ureticiEkle(dto) : await ureticiGuncelle(form.kayit!.id, dto);
        etiket = "Üretici";
      } else {
        const dto = {
          kod: metin("kod"), adTr: metin("adTr"), adEn: metin("adEn") || metin("adTr"),
          veriTipi: sayi("veriTipi"), birim: metin("birim") || null,
          filtrelenebilirMi: kutu("filtrelenebilirMi"), siralanabilirMi: kutu("siralanabilirMi"),
          gosterimTipi: sayi("gosterimTipi"),
        };
        sonuc = yeniMi ? await ozellikEkle(dto) : await ozellikGuncelle(form.kayit!.id, dto);
        etiket = "Özellik tanımı";
      }

      if (sonuc.success) onTamam(`${etiket} ${yeniMi ? "eklendi" : "güncellendi"}.`);
      else onHata(sonuc.message ?? "İşlem başarısız.");
    });
  };

  const baslik = { kategori: "Kategori", uretici: "Üretici", ozellik: "Özellik Tanımı" }[form.tur];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 className="text-lg font-bold text-gray-900">
            {yeniMi ? `Yeni ${baslik}` : `${baslik} Düzenle`}
          </h2>
          <button type="button" onClick={onKapat} className="text-sm text-gray-500 hover:text-gray-800">
            Kapat
          </button>
        </div>

        <form action={gonder} className="space-y-4 p-5">
          {form.tur === "kategori" && (
            <>
              {yeniMi && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Üst Kategori</span>
                  <select name="ustKategoriId" className={girdiSinifi}>
                    <option value="">Kök kategori</option>
                    {kategoriler.filter(k => !k.yaprakMi).map(k => (
                      <option key={k.id} value={k.id}>{k.adTr}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Metin ad="adTr" etiket="Ad (TR)" gerekli varsayilan={form.kayit?.adTr} />
                <Metin ad="adEn" etiket="Ad (EN)" varsayilan={form.kayit?.adEn} />
                <Metin ad="slugTr" etiket="Slug (TR)" gerekli varsayilan={form.kayit?.slugTr} />
                <Metin ad="slugEn" etiket="Slug (EN)" />
                <Metin ad="sira" etiket="Sıra" tip="number" varsayilan={String(form.kayit?.sira ?? 0)} />
              </div>
              <div className="flex gap-6">
                <Kutu ad="yaprakMi" etiket="Yaprak kategori (ürün alabilir)" varsayilan={form.kayit?.yaprakMi} />
                <Kutu ad="aktif" etiket="Aktif" varsayilan={form.kayit?.aktif ?? true} />
              </div>
            </>
          )}

          {form.tur === "uretici" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Metin ad="ad" etiket="Ad" gerekli varsayilan={form.kayit?.ad} />
                <Metin ad="slug" etiket="Slug" gerekli varsayilan={form.kayit?.slug} />
              </div>
              <Metin ad="logoUrl" etiket="Logo URL" tip="url" varsayilan={form.kayit?.logoUrl ?? ""} />
              <Metin ad="webSitesi" etiket="Web Sitesi" tip="url" varsayilan={form.kayit?.webSitesi ?? ""} />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Açıklama</span>
                <textarea name="aciklama" rows={2} className={girdiSinifi} />
              </label>
              <div className="flex gap-6">
                <Kutu ad="yetkiliDistributorMu" etiket="Yetkili distribütör"
                  varsayilan={form.kayit?.yetkiliDistributorMu} />
                <Kutu ad="aktif" etiket="Aktif" varsayilan={form.kayit?.aktif ?? true} />
              </div>
            </>
          )}

          {form.tur === "ozellik" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Metin ad="kod" etiket="Kod" gerekli varsayilan={form.kayit?.kod}
                  ipucu="Değiştirilemez anahtar, örn. direnc_degeri" />
                <Metin ad="birim" etiket="Birim" varsayilan={form.kayit?.birim ?? ""} ipucu="örn. Ω, V, mA" />
                <Metin ad="adTr" etiket="Ad (TR)" gerekli varsayilan={form.kayit?.adTr} />
                <Metin ad="adEn" etiket="Ad (EN)" varsayilan={form.kayit?.adEn} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Veri Tipi</span>
                  <select name="veriTipi" defaultValue={form.kayit?.veriTipi ?? 1} className={girdiSinifi}>
                    {VERI_TIPLERI.map(v => <option key={v.deger} value={v.deger}>{v.ad}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Gösterim Tipi</span>
                  <select name="gosterimTipi" defaultValue={form.kayit?.gosterimTipi ?? 1} className={girdiSinifi}>
                    {GOSTERIM_TIPLERI.map(g => <option key={g.deger} value={g.deger}>{g.ad}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex gap-6">
                <Kutu ad="filtrelenebilirMi" etiket="Filtrelenebilir"
                  varsayilan={form.kayit?.filtrelenebilirMi ?? true} />
                <Kutu ad="siralanabilirMi" etiket="Sıralanabilir" varsayilan={form.kayit?.siralanabilirMi} />
              </div>
            </>
          )}

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
      </div>
    </div>
  );
}

function Metin({ ad, etiket, gerekli, tip = "text", varsayilan, ipucu }: {
  ad: string; etiket: string; gerekli?: boolean; tip?: string;
  varsayilan?: string; ipucu?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{etiket}</span>
      <input name={ad} type={tip} required={gerekli} defaultValue={varsayilan} className={girdiSinifi} />
      {ipucu && <span className="mt-1 block text-xs text-gray-500">{ipucu}</span>}
    </label>
  );
}

function Kutu({ ad, etiket, varsayilan }: { ad: string; etiket: string; varsayilan?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" name={ad} defaultChecked={varsayilan} className="rounded" /> {etiket}
    </label>
  );
}
