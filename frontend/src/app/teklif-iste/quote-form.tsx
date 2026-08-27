"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createQuote } from "@/lib/cart-actions";
import type { Sepet } from "@/lib/sepet-tipler";
import { Loader2, AlertCircle, FileText, CheckCircle2, DollarSign } from "lucide-react";
import { bildir } from "@/components/ui/bildirim";

function fiyatBicimle(deger: number, paraBirimi: string = "USD", basamak: number = 4) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
    maximumFractionDigits: basamak,
  }).format(deger);
}

export function QuoteRequestForm({ cart }: { cart: Sepet }) {
  const router = useRouter();
  const aramaParametreleri = useSearchParams();
  const pcbDetayi = aramaParametreleri.get("konu") && aramaParametreleri.get("detay")
    ? `PCB hizmet talebi: ${aramaParametreleri.get("konu")} - ${aramaParametreleri.get("detay")}`
    : "";
  const [projeNo, setProjeNo] = useState("");
  const [musteriNotu, setMusteriNotu] = useState(pcbDetayi);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [talepNo, setTalepNo] = useState<string | null>(null);
  const [olusturuldu, setOlusturuldu] = useState(false);

  // Kalem bazlı hedef birim fiyat ve talep termin tarihi
  const [hedefFiyatlar, setHedefFiyatlar] = useState<Record<number, string>>({});

  const [terminTarihleri, setTerminTarihleri] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const dateStr = defaultDate.toISOString().split("T")[0];
    cart.kalemler.forEach((item) => {
      init[item.kalemId] = dateStr;
    });
    return init;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const fullNote = [
      projeNo ? `Proje / PO No: ${projeNo}` : "",
      musteriNotu,
      "--- Kalem Detayları ---",
      ...cart.kalemler.map(
        (k) =>
          `${k.urunKodu} | Miktar: ${k.miktar} | Hedef Fiyat: ${hedefFiyatlar[k.kalemId] || "Belirtilmedi"}${hedefFiyatlar[k.kalemId] ? ` ${cart.paraBirimi}` : ""} | Termin: ${terminTarihleri[k.kalemId] || "Standart"}`
      ),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await createQuote({ musteriNotu: fullNote });
      if (res.success) {
        setTalepNo(res.talepNo || null);
        setOlusturuldu(true);
        bildir.basarili(res.talepNo
          ? `Teklif talebiniz başarıyla oluşturuldu (${res.talepNo}).`
          : "Teklif talebiniz başarıyla oluşturuldu.");
        setTimeout(() => {
          router.push(`/profil/teklifler`);
        }, 2500);
      } else {
        setError(res.message || "Teklif talebi oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setIsPending(false);
    }
  };

  if (olusturuldu) {
    return (
      <div className="rounded-token-kart border border-basari-200 bg-basari-50 p-8 text-center shadow-sm animate-in fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-basari-100 text-basari-600">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-bold text-metin-marka mb-2">Teklif Talebiniz Alındı</h2>
        {talepNo ? (
          <p className="text-sm text-metin-ikincil mb-4">
            Resmi teklif takip numaranız: <span className="font-mono font-bold text-metin-marka text-base">{talepNo}</span>
          </p>
        ) : (
          <p className="text-sm text-metin-ikincil mb-4">Talebinizi profilinizdeki teklifler bölümünden takip edebilirsiniz.</p>
        )}
        <p className="text-xs text-metin-ucuncul max-w-md mx-auto mb-6">
          Satış mühendislerimiz talebinizi inceleyerek özel fiyatlandırma çalışmasını tamamlayacak ve teklif onayınıza sunulacaktır.
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/profil/teklifler")}
            className="rounded-token-girdi bg-marka hover:bg-marka/90 text-white font-bold px-6 py-2.5 text-xs shadow-sm transition-colors"
          >
            Tekliflerimi Görüntüle
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-hata-50 border border-hata-200 text-hata-700 p-4 rounded-token-kart flex items-start gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-hata-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Proje ve Genel Not Kartı */}
      <div className="rounded-token-kart border border-kenar bg-yuzey-kart overflow-hidden shadow-sm">
        <div className="p-4 border-b border-kenar bg-yuzey">
          <h3 className="font-bold text-metin-marka text-sm sm:text-base flex items-center gap-2">
            <FileText size={18} className="text-vurgu" />
            Proje ve Teklif Bilgileri
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="rfq-proje-no" className="block text-xs font-semibold text-metin mb-1">
              Proje / PO Referans Numarası (Opsiyonel)
            </label>
            <input
              id="rfq-proje-no"
              type="text"
              placeholder="Örn: PO-2026-X89 veya PROJE-ALPHA"
              value={projeNo}
              onChange={(e) => setProjeNo(e.target.value)}
              className="w-full rounded-token-girdi border border-kenar-guclu bg-yuzey px-3 py-2 text-xs font-mono text-metin focus:border-vurgu focus:outline-none focus:ring-1 focus:ring-vurgu"
            />
          </div>

          <div>
            <label htmlFor="rfq-musteri-notu" className="block text-xs font-semibold text-metin mb-1">
              Genel Açıklama & Satış Temsilcisi Notu
            </label>
            <textarea
              id="rfq-musteri-notu"
              rows={3}
              value={musteriNotu}
              onChange={(e) => setMusteriNotu(e.target.value)}
              placeholder="Örn: Bu ürünleri seri üretimimiz için yıllık parti alımlarında değerlendiriyoruz. Toplu iskonto ve yıllık sevkiyat takvimi rica ederiz."
              className="w-full rounded-token-girdi border border-kenar-guclu bg-yuzey p-3 text-xs text-metin focus:border-vurgu focus:outline-none focus:ring-1 focus:ring-vurgu"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Kalem Kalem Hedef Fiyat & Termin Matrisi */}
      <div className="rounded-token-kart border border-kenar bg-yuzey-kart overflow-hidden shadow-sm">
        <div className="p-4 border-b border-kenar bg-yuzey flex items-center justify-between">
          <h3 className="font-bold text-metin-marka text-sm sm:text-base flex items-center gap-2">
            <DollarSign size={18} className="text-vurgu" />
            Kalem Bazlı Hedef Fiyat ve Termin Talebi
          </h3>
          <span className="text-xs text-metin-ucuncul font-mono">
            {cart.kalemler.length} Kalem
          </span>
        </div>

        <div className="divide-y divide-kenar">
          {cart.kalemler.map((item) => (
            <div key={item.kalemId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-metin-marka">{item.urunKodu}</span>
                  <span className="rounded bg-yuzey-gomulu px-1.5 py-0.5 text-[10px] font-mono text-metin">
                    {item.miktar.toLocaleString("tr-TR")} Adet
                  </span>
                </div>
                <p className="text-xs text-metin-ikincil line-clamp-1 mt-0.5">
                  {item.kisaAciklama || "Elektronik Komponent"}
                </p>
                <div className="text-[11px] text-metin-ucuncul mt-1 font-mono">
                  Liste Birim Fiyatı: {fiyatBicimle(item.birimFiyat, cart.paraBirimi, 4)}
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Hedef Birim Fiyat Girdisi */}
                <div className="w-32">
                  <label htmlFor={`hedef-fiyat-${item.kalemId}`} className="block text-[10px] font-semibold text-metin-ucuncul mb-1">
                    Hedef Birim Fiyat ({cart.paraBirimi})
                  </label>
                  <input
                    id={`hedef-fiyat-${item.kalemId}`}
                    type="number"
                    step="0.0001"
                    min="0"
                    value={hedefFiyatlar[item.kalemId] ?? ""}
                    onChange={(e) =>
                      setHedefFiyatlar((prev) => ({
                        ...prev,
                        [item.kalemId]: e.target.value,
                      }))
                    }
                    className="w-full rounded-token-girdi border border-kenar-guclu bg-yuzey px-2.5 py-1.5 text-xs font-mono font-bold text-metin-marka focus:border-vurgu focus:outline-none"
                  />
                </div>

                {/* Talep Termin Tarihi */}
                <div className="w-36">
                  <label htmlFor={`termin-${item.kalemId}`} className="block text-[10px] font-semibold text-metin-ucuncul mb-1">
                    Talep Termin Tarihi
                  </label>
                  <input
                    id={`termin-${item.kalemId}`}
                    type="date"
                    value={terminTarihleri[item.kalemId] || ""}
                    onChange={(e) =>
                      setTerminTarihleri((prev) => ({
                        ...prev,
                        [item.kalemId]: e.target.value,
                      }))
                    }
                    className="w-full rounded-token-girdi border border-kenar-guclu bg-yuzey px-2.5 py-1.5 text-xs font-mono text-metin focus:border-vurgu focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gönderim Butonu & Bilgilendirme */}
      <div className="rounded-token-kart border border-kenar bg-yuzey-kart p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <p className="text-xs text-metin-ucuncul max-w-md">
          Sepetinizdeki ürünler için resmi teklif talebi oluşturulacaktır. Teklif onaylandıktan sonra siparişe dönüştürülebilir.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto rounded-token-girdi bg-marka hover:bg-marka/90 text-white font-bold py-3.5 px-8 text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          <span>Resmi Teklif Talebini Gönder (RFQ)</span>
        </button>
      </div>
    </form>
  );
}
