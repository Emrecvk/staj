"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileUp, CheckCircle, AlertTriangle, XCircle, ShoppingCart,
  Loader2, ArrowRight, Upload, Info,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { bomEslestir, bomAdaySec } from "@/lib/bom-actions";
import { bomMetniniAyristir, type BomEslesmeSonucu, type EslesmeAdayi } from "@/lib/bom-tipler";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";

const KABUL_EDILEN = ".csv,.tsv,.txt";

export default function BomPage() {
  const router = useRouter();
  const dosyaRef = useRef<HTMLInputElement>(null);

  const [bomMetni, setBomMetni] = useState("");
  const [sonuclar, setSonuclar] = useState<BomEslesmeSonucu[]>([]);
  const [atlananSatirlar, setAtlananSatirlar] = useState<number[]>([]);
  const [hata, setHata] = useState<string | null>(null);
  const [sepetHatalari, setSepetHatalari] = useState<string[]>([]);
  const [isleniyor, basla] = useTransition();
  const [sepeteEkleniyor, setSepeteEkleniyor] = useState(false);

  const dosyaSec = async (dosya: File) => {
    setHata(null);

    if (/\.xlsx?$/i.test(dosya.name)) {
      setHata(
        "Excel dosyaları doğrudan okunamıyor. Excel'de \"Farklı Kaydet → CSV (virgülle ayrılmış)\" " +
        "seçeneğiyle kaydedip yeniden yükleyin.",
      );
      return;
    }

    const metin = await dosya.text();
    setBomMetni(metin);
    isle(metin);
  };

  const isle = (metin: string) => {
    const { satirlar, atlanan } = bomMetniniAyristir(metin);
    setAtlananSatirlar(atlanan);

    if (satirlar.length === 0) {
      setHata("Okunabilir satır bulunamadı. Her satır \"ÜrünKodu, Miktar\" biçiminde olmalı.");
      setSonuclar([]);
      return;
    }

    setHata(null);
    basla(async () => setSonuclar(await bomEslestir(satirlar)));
  };

  const adaySec = (indeks: number, aday: EslesmeAdayi) => {
    basla(async () => {
      const secilen = await bomAdaySec(
        sonuclar[indeks].listeId,
        sonuclar[indeks].kalemId,
        aday.id,
      );
      setSonuclar(mevcut => mevcut.map((s, i) =>
        i === indeks
          ? { ...s, secilen, durum: secilen ? "eslesti" : "ambalajsiz" }
          : s));
    });
  };

  const topluSepeteEkle = async () => {
    setSepeteEkleniyor(true);
    setSepetHatalari([]);

    const eslesenler = sonuclar.filter(s => s.durum === "eslesti" && s.secilen);
    const hatalar: string[] = [];

    for (const satir of eslesenler) {
      // Gerçek ambalaj kimliği ve MOQ/katlama kurallarına göre düzeltilmiş
      // miktar gönderilir; sunucu aynı kuralı yeniden doğrular.
      const sonuc = await addToCart(satir.secilen!.ambalajId, satir.secilen!.gecerliMiktar);
      if (!sonuc.success) {
        hatalar.push(`${satir.secilen!.ureticiUrunKodu}: ${sonuc.message ?? "eklenemedi"}`);
      }
    }

    setSepeteEkleniyor(false);
    if (hatalar.length < eslesenler.length) notifyCartUpdated();

    // Kısmi başarıda kullanıcıyı sessizce sepete atmak yerine ne olduğunu göster.
    if (hatalar.length > 0) { setSepetHatalari(hatalar); return; }
    router.push("/sepet");
  };

  const eslesenSayisi = sonuclar.filter(s => s.durum === "eslesti").length;
  const coklu = sonuclar.filter(s => s.durum === "coklu").length;
  const eslesmeyen = sonuclar.filter(s => s.durum === "eslesmedi" || s.durum === "ambalajsiz").length;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader categories={[]} />

      <main className="container mx-auto flex-grow px-4 py-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-extrabold text-brand-navy">
          <FileUp size={32} /> BOM Yükleme ve Eşleştirme
        </h1>
        <p className="mb-8 max-w-3xl text-gray-600">
          Malzeme listenizi (Bill of Materials) CSV olarak yükleyin veya aşağıya yapıştırın.
          Her satırda <strong>Ürün Kodu, Miktar</strong> bulunmalıdır.
        </p>

        {sonuclar.length === 0 ? (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dosya = e.dataTransfer.files?.[0];
                if (dosya) dosyaSec(dosya);
              }}
              className="mb-6 flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
            >
              <Upload size={28} className="text-gray-400" />
              <p className="text-sm text-gray-600">
                CSV dosyanızı buraya sürükleyin veya
              </p>
              <button
                type="button"
                onClick={() => dosyaRef.current?.click()}
                className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90"
              >
                Dosya seç
              </button>
              <input
                ref={dosyaRef}
                type="file"
                accept={KABUL_EDILEN}
                className="hidden"
                aria-label="BOM dosyası seç"
                onChange={(e) => {
                  const dosya = e.target.files?.[0];
                  if (dosya) dosyaSec(dosya);
                }}
              />
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <Info size={12} /> CSV, TSV veya TXT. Excel için önce &quot;CSV olarak kaydet&quot;.
              </p>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="bom-metni">
              veya listeyi yapıştırın
            </label>
            <textarea
              id="bom-metni"
              className="mb-4 w-full rounded-lg border border-gray-300 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              rows={8}
              placeholder={"1N4148, 1000\nLM358, 500\nBilinmeyenUrun, 100"}
              value={bomMetni}
              onChange={(e) => setBomMetni(e.target.value)}
            />

            {hata && (
              <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {hata}
              </p>
            )}

            <button
              type="button"
              onClick={() => isle(bomMetni)}
              disabled={isleniyor || !bomMetni.trim()}
              className="flex items-center gap-2 rounded-lg bg-brand-cyan px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {isleniyor ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Listeyi Eşleştir
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Ozet etiket="Eşleşen" adet={eslesenSayisi} renk="text-green-700 bg-green-50" />
              <Ozet etiket="Seçim bekleyen" adet={coklu} renk="text-amber-700 bg-amber-50" />
              <Ozet etiket="Eşleşmeyen" adet={eslesmeyen} renk="text-red-700 bg-red-50" />
            </div>

            {atlananSatirlar.length > 0 && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Miktarı okunamayan {atlananSatirlar.length} satır atlandı
                (satır {atlananSatirlar.slice(0, 10).join(", ")}
                {atlananSatirlar.length > 10 ? "…" : ""}).
              </p>
            )}

            {sepetHatalari.length > 0 && (
              <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-bold">Bazı kalemler sepete eklenemedi:</p>
                <ul className="mt-1 list-inside list-disc">
                  {sepetHatalari.map((h) => <li key={h}>{h}</li>)}
                </ul>
              </div>
            )}

            <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="p-4">BOM Satırı</th>
                      <th className="p-4">İstenen</th>
                      <th className="p-4">Eşleşme</th>
                      <th className="p-4">Ambalaj / Miktar</th>
                      <th className="p-4">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sonuclar.map((s, i) => (
                      <tr key={`${s.satirNo}-${s.mpn}`} className="align-top">
                        <td className="p-4 font-mono font-bold text-gray-900">{s.mpn}</td>
                        <td className="p-4 text-gray-600">{s.miktar}</td>
                        <td className="p-4">
                          {s.secilen ? (
                            <div>
                              <p className="font-bold text-gray-900">{s.secilen.ureticiUrunKodu}</p>
                              <p className="text-xs text-gray-500">
                                {s.secilen.ureticiAd} — {s.secilen.kisaAciklama}
                              </p>
                            </div>
                          ) : s.durum === "coklu" ? (
                            <div className="space-y-1">
                              <p className="mb-1 text-xs text-gray-500">
                                {s.adaylar.length} aday — birini seçin:
                              </p>
                              {s.adaylar.slice(0, 5).map((a) => (
                                <button
                                  key={a.id} type="button" onClick={() => adaySec(i, a)}
                                  disabled={isleniyor}
                                  className="block w-full rounded border border-gray-300 px-2 py-1 text-left text-xs hover:border-brand-cyan disabled:opacity-50"
                                >
                                  <span className="font-bold">{a.ureticiUrunKodu}</span> — {a.ureticiAd}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          {s.secilen ? (
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">{s.secilen.ambalajAdi}</p>
                              <p className="text-gray-600">
                                {s.secilen.gecerliMiktar} adet
                                {s.secilen.miktarDuzeltildiMi && (
                                  <span className="ml-1 text-amber-700">
                                    (MOQ {s.secilen.moq}, MPQ {s.secilen.mpq}
                                    {s.secilen.katlamaMiktari > 1 && `, ${s.secilen.katlamaMiktari}'li katlama`}
                                    {" "}nedeniyle yukarı yuvarlandı)
                                  </span>
                                )}
                              </p>
                              {!s.secilen.stokYeterliMi && (
                                <p className="text-red-600">Stok yetersiz ({s.secilen.stokMiktari})</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Rozet durum={s.durum} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button" onClick={topluSepeteEkle}
                disabled={sepeteEkleniyor || eslesenSayisi === 0}
                className="flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {sepeteEkleniyor
                  ? <Loader2 size={16} className="animate-spin" />
                  : <ShoppingCart size={16} />}
                Eşleşen {eslesenSayisi} kalemi sepete ekle
              </button>
              <button
                type="button"
                onClick={() => { setSonuclar([]); setSepetHatalari([]); setAtlananSatirlar([]); }}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Yeni liste yükle
              </button>
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Ozet({ etiket, adet, renk }: { etiket: string; adet: number; renk: string }) {
  return (
    <div className={`rounded-xl p-4 ${renk}`}>
      <p className="text-sm font-medium">{etiket}</p>
      <p className="text-2xl font-bold">{adet}</p>
    </div>
  );
}

function Rozet({ durum }: { durum: BomEslesmeSonucu["durum"] }) {
  if (durum === "eslesti") {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-green-700">
        <CheckCircle size={14} /> Eşleşti
      </span>
    );
  }
  if (durum === "coklu") {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
        <AlertTriangle size={14} /> Seçim gerekli
      </span>
    );
  }
  if (durum === "ambalajsiz") {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
        <AlertTriangle size={14} /> Ambalaj tanımsız
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-red-700">
      <XCircle size={14} /> Eşleşmedi
    </span>
  );
}
