"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/cart-actions";
import { odemeYap } from "@/lib/odeme-actions";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";

type Adres = {
  id: number;
  baslik: string;
  acikAdres: string;
  ilce: string;
  sehir: string;
};

type BekleyenSiparis = { siparisId: number; siparisNo: string };

/**
 * Sandbox ödeme senaryoları.
 *
 * Kart numarası ALINMIYOR. Gerçek entegrasyonda kart bilgisi tarayıcıdan
 * doğrudan sağlayıcıya gider ve geriye tek kullanımlık jeton döner; API
 * kartı hiç görmez. Sandbox'ta da aynı sözleşme korunuyor: kullanıcı bir
 * senaryo seçiyor, sunucuya yalnızca o jeton gidiyor.
 *
 * Önceki sürüm tarayıcıda `Math.random() < 0.20` ile ret üretiyor ve
 * kullanıcıdan gerçek kart numarası istiyordu — girilen veri hiçbir yere
 * gitmiyordu ve sonuç test edilemiyordu.
 */
const SANDBOX_SENARYOLARI = [
  { jeton: "sandbox-basarili", ad: "Başarılı ödeme", aciklama: "Tahsilat onaylanır, sipariş onaylanır." },
  { jeton: "sandbox-yetersiz-bakiye", ad: "Yetersiz bakiye", aciklama: "Reddedilir, yeniden denenebilir." },
  { jeton: "sandbox-reddedildi", ad: "Banka reddi", aciklama: "Kalıcı ret, yeniden deneme önerilmez." },
  { jeton: "sandbox-saglayici-hatasi", ad: "Sağlayıcı hatası", aciklama: "Geçici hata, yeniden denenebilir." },
];

export function CheckoutForm({ addresses, cart }: { addresses: Adres[]; cart: unknown }) {
  const [faturaAdresiId, setFaturaAdresiId] = useState<number>(addresses[0]?.id || 0);
  const [teslimatAdresiId, setTeslimatAdresiId] = useState<number>(addresses[0]?.id || 0);
  const [musteriNotu, setMusteriNotu] = useState("");
  const [odemeJetonu, setOdemeJetonu] = useState(SANDBOX_SENARYOLARI[0].jeton);
  const [kartSahibi, setKartSahibi] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yenidenDenenebilir, setYenidenDenenebilir] = useState(false);

  // Ödeme başarısız olursa sipariş yeniden oluşturulmaz: aynı sipariş
  // OdemeBekliyor durumunda durur ve kullanıcı sepeti yeniden doldurmadan
  // tekrar deneyebilir. Sunucu da çift tahsilatı ayrıca engeller.
  const [bekleyenSiparis, setBekleyenSiparis] = useState<BekleyenSiparis | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setYenidenDenenebilir(false);

    try {
      let siparis = bekleyenSiparis;

      if (!siparis) {
        const sonuc = await createOrder({ faturaAdresiId, teslimatAdresiId, musteriNotu });

        if (!sonuc.success || !sonuc.siparisId) {
          setError(sonuc.message || "Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
          setIsPending(false);
          return;
        }

        siparis = { siparisId: sonuc.siparisId, siparisNo: sonuc.siparisNo! };
        setBekleyenSiparis(siparis);
      }

      const odeme = await odemeYap(siparis.siparisId, odemeJetonu, kartSahibi || undefined);

      if (odeme.basarili) {
        router.push(`/siparis-basarili?siparisNo=${encodeURIComponent(siparis.siparisNo)}`);
        return;
      }

      setError(odeme.mesaj);
      setYenidenDenenebilir(odeme.yenidenDenenebilir);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setYenidenDenenebilir(true);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div role="alert" className="bg-hata-50 border border-hata-500 text-hata-600 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            {bekleyenSiparis && (
              <p className="mt-1 text-sm">
                {bekleyenSiparis.siparisNo} numaralı siparişiniz oluşturuldu ve ödeme bekliyor.
                {yenidenDenenebilir
                  ? " Aşağıdan tekrar deneyebilirsiniz; sepetiniz korunur."
                  : " Farklı bir ödeme yöntemi deneyin veya bankanızla iletişime geçin."}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar overflow-hidden">
        <div className="p-4 border-b border-kenar bg-yuzey">
          <h3 className="font-bold text-metin text-lg">1. Teslimat Adresi</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <label 
                key={addr.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${teslimatAdresiId === addr.id ? 'border-brand-cyan bg-vurgu-zemin' : 'border-kenar hover:border-brand-cyan'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="radio" 
                    name="teslimatAdresi" 
                    value={addr.id} 
                    checked={teslimatAdresiId === addr.id}
                    onChange={() => setTeslimatAdresiId(addr.id)}
                    className="text-vurgu focus:ring-brand-cyan"
                  />
                  <span className="font-bold text-metin">{addr.baslik}</span>
                </div>
                <div className="text-sm text-metin-ikincil ml-7">
                  {addr.acikAdres}<br/>{addr.ilce} / {addr.sehir}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar overflow-hidden">
        <div className="p-4 border-b border-kenar bg-yuzey">
          <h3 className="font-bold text-metin text-lg">2. Fatura Adresi</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <label 
                key={addr.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${faturaAdresiId === addr.id ? 'border-brand-cyan bg-vurgu-zemin' : 'border-kenar hover:border-brand-cyan'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="radio" 
                    name="faturaAdresi" 
                    value={addr.id} 
                    checked={faturaAdresiId === addr.id}
                    onChange={() => setFaturaAdresiId(addr.id)}
                    className="text-vurgu focus:ring-brand-cyan"
                  />
                  <span className="font-bold text-metin">{addr.baslik}</span>
                </div>
                <div className="text-sm text-metin-ikincil ml-7">
                  {addr.acikAdres}<br/>{addr.ilce} / {addr.sehir}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar overflow-hidden">
        <div className="p-4 border-b border-kenar bg-yuzey">
          <h3 className="font-bold text-metin text-lg">3. Ödeme (Sandbox)</h3>
        </div>
        <div className="p-6">
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            <p>
              Bu bir sandbox ortamıdır ve <strong>kart bilgisi istenmez</strong>. Gerçek
              entegrasyonda kart doğrudan ödeme sağlayıcısına gönderilir, sunucumuz yalnızca
              tek kullanımlık bir jeton görür. Aşağıdan denemek istediğiniz senaryoyu seçin.
            </p>
          </div>

          <fieldset className="mb-4 max-w-xl">
            <legend className="mb-2 text-sm font-medium text-metin">Ödeme senaryosu</legend>
            <div className="space-y-2">
              {SANDBOX_SENARYOLARI.map((senaryo) => (
                <label
                  key={senaryo.jeton}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    odemeJetonu === senaryo.jeton
                      ? "border-brand-cyan bg-vurgu-zemin"
                      : "border-kenar hover:border-brand-cyan"
                  }`}
                >
                  <input
                    type="radio"
                    name="odemeSenaryosu"
                    value={senaryo.jeton}
                    checked={odemeJetonu === senaryo.jeton}
                    onChange={() => setOdemeJetonu(senaryo.jeton)}
                    className="mt-1 text-vurgu focus:ring-brand-cyan"
                  />
                  <span>
                    <span className="block font-bold text-metin">{senaryo.ad}</span>
                    <span className="block text-sm text-metin-ikincil">{senaryo.aciklama}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="max-w-md">
            <label htmlFor="kart-sahibi" className="mb-1 block text-sm font-medium text-metin">
              Kart Üzerindeki İsim <span className="text-metin-ucuncul">(isteğe bağlı)</span>
            </label>
            <input
              id="kart-sahibi"
              type="text"
              value={kartSahibi}
              onChange={(e) => setKartSahibi(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full rounded-md border border-kenar-guclu px-3 py-2 focus:border-brand-cyan focus:ring-brand-cyan"
            />
          </div>
        </div>
      </div>

      <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar overflow-hidden">
        <div className="p-4 border-b border-kenar bg-yuzey">
          <h3 className="font-bold text-metin text-lg">4. Sipariş Notu</h3>
        </div>
        <div className="p-6">
          <textarea
            value={musteriNotu}
            onChange={e => setMusteriNotu(e.target.value)}
            placeholder="Siparişinizle ilgili iletmek istediğiniz özel bir not varsa buraya yazabilirsiniz..."
            className="w-full border border-kenar-guclu rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-cyan min-h-[100px] text-sm"
          ></textarea>
        </div>
      </div>

      <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar p-6 flex items-center justify-between">
        <p className="text-sm text-metin-ucuncul max-w-sm">
          Siparişi onayla butonuna basarak Mesafeli Satış Sözleşmesi&apos;ni kabul etmiş sayılırsınız.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="bg-marka hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 size={20} className="animate-spin" />}
          {bekleyenSiparis ? "Ödemeyi Tekrar Dene" : "Siparişi Onayla ve Öde"}
        </button>
      </div>
    </form>
  );
}
