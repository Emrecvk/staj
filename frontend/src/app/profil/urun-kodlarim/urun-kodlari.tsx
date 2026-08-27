"use client";

import { useEffect, useState, useTransition } from "react";
import { Edit3, Loader2, Plus, Search, Tags, Trash2, X } from "lucide-react";
import {
  musteriUrunKoduEkle,
  musteriUrunKoduGuncelle,
  musteriUrunKoduSil,
} from "@/lib/profil-api";
import type { MusteriUrunKodu } from "@/lib/profil-tipler";
import type { ProductSummary } from "@/lib/api";
import { ApiHatasi, BasariBildirimi } from "@/components/admin/durum-bildirimi";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";

const girdiSinifi = "w-full rounded-md border border-kenar-guclu bg-yuzey px-3 py-2 text-sm text-metin focus:border-vurgu focus:outline-none";

export function MusteriUrunKodlari({ kodlar }: { kodlar: MusteriUrunKodu[] }) {
  const [liste, setListe] = useState(kodlar);
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MusteriUrunKodu | null>(null);
  const [silinecek, setSilinecek] = useState<MusteriUrunKodu | null>(null);
  const [arama, setArama] = useState("");
  const [adaylar, setAdaylar] = useState<ProductSummary[]>([]);
  const [urun, setUrun] = useState<ProductSummary | null>(null);
  const [musteriKodu, setMusteriKodu] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [beklemede, basla] = useTransition();

  useEffect(() => {
    if (arama.trim().length < 2) return;
    const denetleyici = new AbortController();
    const zamanlayici = setTimeout(async () => {
      try {
        const yanit = await fetch(`/api/Katalog/urunler?aramaMetni=${encodeURIComponent(arama)}&sayfaBoyutu=8`, { signal: denetleyici.signal });
        if (yanit.ok) setAdaylar(((await yanit.json()) as { urunler?: { kayitlar?: ProductSummary[] } }).urunler?.kayitlar ?? []);
      } catch { /* Arama iptal edildi veya API geçici olarak kapalı. */ }
    }, 250);
    return () => { clearTimeout(zamanlayici); denetleyici.abort(); };
  }, [arama]);

  const yeniForm = () => {
    setDuzenlenen(null); setUrun(null); setArama(""); setAdaylar([]); setMusteriKodu(""); setAciklama(""); setHata(null); setFormAcik(true);
  };

  const duzenle = (kayit: MusteriUrunKodu) => {
    setDuzenlenen(kayit); setMusteriKodu(kayit.musteriKodu); setAciklama(kayit.aciklama ?? ""); setHata(null); setFormAcik(true);
  };

  const kaydet = (e: React.FormEvent) => {
    e.preventDefault();
    basla(async () => {
      if (duzenlenen) {
        const sonuc = await musteriUrunKoduGuncelle(duzenlenen.id, { musteriKodu: musteriKodu.trim(), aciklama: aciklama.trim() || undefined });
        if (!sonuc.success) { setHata(sonuc.message); return; }
        setListe(liste.map((x) => x.id === duzenlenen.id ? { ...x, musteriKodu: musteriKodu.trim(), aciklama: aciklama.trim() || null } : x));
        setBasari("Ürün kodu güncellendi.");
      } else if (urun) {
        const sonuc = await musteriUrunKoduEkle({ urunId: urun.id, musteriKodu: musteriKodu.trim(), aciklama: aciklama.trim() || undefined });
        if (!sonuc.success) { setHata(sonuc.message); return; }
        setListe([...liste, sonuc.data]);
        setBasari("Ürün kodu eklendi.");
      } else {
        setHata("Önce katalogdan bir ürün seçin.");
        return;
      }
      setFormAcik(false);
    });
  };

  const sil = () => {
    if (!silinecek) return;
    basla(async () => {
      const sonuc = await musteriUrunKoduSil(silinecek.id);
      if (!sonuc.success) { setHata(sonuc.message); return; }
      setListe(liste.filter((x) => x.id !== silinecek.id)); setBasari("Ürün kodu silindi."); setSilinecek(null);
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-metin">Ürün Kodlarım</h1><p className="mt-1 text-sm text-metin-ikincil">Kendi ERP veya stok kodlarınızı katalog ürünleriyle eşleştirin.</p></div>
        <button type="button" onClick={yeniForm} className="flex shrink-0 items-center gap-2 rounded-lg bg-marka px-4 py-2 text-sm font-bold text-white hover:bg-marka-hover"><Plus size={16} /> Kod Ekle</button>
      </div>
      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}
      {liste.length === 0 ? (
        <div className="rounded-xl border border-dashed border-kenar-guclu p-12 text-center"><Tags size={34} className="mx-auto mb-3 text-metin-ucuncul" /><p className="font-semibold text-metin">Henüz eşlenmiş ürün kodunuz yok.</p><p className="mt-1 text-sm text-metin-ikincil">ERP kodlarınızı kataloğa bağlamak için Kod Ekle düğmesini kullanın.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-kenar"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-yuzey-gomulu text-xs uppercase tracking-wide text-metin-ucuncul"><tr><th className="px-4 py-3">Üretici kodu</th><th className="px-4 py-3">Müşteri kodu</th><th className="px-4 py-3">Açıklama</th><th className="px-4 py-3 text-right">İşlem</th></tr></thead><tbody className="divide-y divide-kenar">{liste.map((kayit) => <tr key={kayit.id} className="text-metin"><td className="px-4 py-3 font-mono font-bold">{kayit.ureticiUrunKodu}</td><td className="px-4 py-3 font-mono text-vurgu-guclu">{kayit.musteriKodu}</td><td className="px-4 py-3 text-metin-ikincil">{kayit.aciklama || "—"}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" onClick={() => duzenle(kayit)} className="rounded p-2 text-metin-ikincil hover:bg-yuzey-gomulu hover:text-vurgu" aria-label="Düzenle"><Edit3 size={15} /></button><button type="button" onClick={() => setSilinecek(kayit)} className="rounded p-2 text-hata-600 hover:bg-hata-50" aria-label="Sil"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>
      )}

      {formAcik && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"><div className="my-8 w-full max-w-lg rounded-xl bg-yuzey-kart shadow-xl"><div className="flex items-center justify-between border-b border-kenar p-5"><h2 className="text-lg font-bold text-metin">{duzenlenen ? "Ürün kodunu düzenle" : "Ürün kodu ekle"}</h2><button type="button" onClick={() => setFormAcik(false)} aria-label="Kapat"><X size={18} /></button></div><form onSubmit={kaydet} className="space-y-4 p-5">
        {!duzenlenen && <div className="relative"><label className="mb-1 block text-sm font-medium text-metin-ikincil">Katalog ürünü ara</label><div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-metin-ucuncul" /><input value={urun ? urun.ureticiUrunKodu : arama} onChange={(e) => { setUrun(null); setArama(e.target.value); }} className={`${girdiSinifi} pl-9`} placeholder="MPN veya üretici adı" />{arama.trim().length >= 2 && adaylar.length > 0 && !urun && <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-kenar bg-yuzey-kart shadow-lg">{adaylar.map((aday) => <button key={aday.id} type="button" onClick={() => { setUrun(aday); setArama(""); setAdaylar([]); }} className="block w-full border-b border-kenar px-3 py-2 text-left hover:bg-yuzey-gomulu"><span className="font-mono text-sm font-bold text-metin">{aday.ureticiUrunKodu}</span><span className="ml-2 text-xs text-metin-ikincil">{aday.ureticiAd} · {aday.kisaAciklama}</span></button>)}</div>}</div>{urun && <p className="mt-1 text-xs text-basari-600">Seçildi: {urun.ureticiAd} / {urun.ureticiUrunKodu}</p>}</div>}
        <label className="block"><span className="mb-1 block text-sm font-medium text-metin-ikincil">Müşteri / ERP kodu</span><input required value={musteriKodu} onChange={(e) => setMusteriKodu(e.target.value)} className={girdiSinifi} placeholder="ERP-RES-001" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium text-metin-ikincil">Açıklama <span className="font-normal">(isteğe bağlı)</span></span><textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} rows={2} className={girdiSinifi} placeholder="Üretim hattı veya proje notu" /></label>
        <div className="flex justify-end gap-3 border-t border-kenar pt-4"><button type="button" onClick={() => setFormAcik(false)} className="rounded-lg border border-kenar-guclu px-4 py-2 text-sm text-metin-ikincil">Vazgeç</button><button type="submit" disabled={beklemede || (!duzenlenen && !urun)} className="flex items-center gap-2 rounded-lg bg-marka px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{beklemede && <Loader2 size={14} className="animate-spin" />} Kaydet</button></div>
      </form></div></div>}
      <OnayPenceresi acik={silinecek !== null} yikici baslik="Ürün kodunu sil" mesaj={silinecek ? `${silinecek.musteriKodu} eşlemesi silinecek.` : ""} onayMetni="Sil" islemSuruyor={beklemede} onOnayla={sil} onIptal={() => setSilinecek(null)} />
    </div>
  );
}
