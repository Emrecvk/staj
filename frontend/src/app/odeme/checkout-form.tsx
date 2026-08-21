"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/cart-actions";
import { Loader2, AlertCircle } from "lucide-react";

export function CheckoutForm({ addresses, cart }: { addresses: any[], cart: any }) {
  const [faturaAdresiId, setFaturaAdresiId] = useState<number>(addresses[0]?.id || 0);
  const [teslimatAdresiId, setTeslimatAdresiId] = useState<number>(addresses[0]?.id || 0);
  const [musteriNotu, setMusteriNotu] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Simulate 20% failure rate for sandbox
    if (Math.random() < 0.20) {
      setError("Ödeme reddedildi (Sandbox Simülasyonu). Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.");
      setIsPending(false);
      return;
    }

    try {
      const res = await createOrder({ faturaAdresiId, teslimatAdresiId, musteriNotu });
      if (res.success) {
        router.push(`/siparis-basarili?siparisNo=${res.siparisNo || 'TEST-123'}`);
      } else {
        setError(res.message || "Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Bağlantı hatası.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg">1. Teslimat Adresi</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <label 
                key={addr.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${teslimatAdresiId === addr.id ? 'border-brand-cyan bg-cyan-50' : 'border-gray-200 hover:border-brand-cyan'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="radio" 
                    name="teslimatAdresi" 
                    value={addr.id} 
                    checked={teslimatAdresiId === addr.id}
                    onChange={() => setTeslimatAdresiId(addr.id)}
                    className="text-brand-cyan focus:ring-brand-cyan"
                  />
                  <span className="font-bold text-gray-900">{addr.baslik}</span>
                </div>
                <div className="text-sm text-gray-600 ml-7">
                  {addr.acikAdres}<br/>{addr.ilce} / {addr.sehir}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg">2. Fatura Adresi</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <label 
                key={addr.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${faturaAdresiId === addr.id ? 'border-brand-cyan bg-cyan-50' : 'border-gray-200 hover:border-brand-cyan'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="radio" 
                    name="faturaAdresi" 
                    value={addr.id} 
                    checked={faturaAdresiId === addr.id}
                    onChange={() => setFaturaAdresiId(addr.id)}
                    className="text-brand-cyan focus:ring-brand-cyan"
                  />
                  <span className="font-bold text-gray-900">{addr.baslik}</span>
                </div>
                <div className="text-sm text-gray-600 ml-7">
                  {addr.acikAdres}<br/>{addr.ilce} / {addr.sehir}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg">3. Ödeme Bilgileri (Sandbox)</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
              <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-cyan focus:border-brand-cyan" placeholder="Ad Soyad" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
              <input type="text" required maxLength={19} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-cyan focus:border-brand-cyan" placeholder="0000 0000 0000 0000" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Son Kul. Tarihi</label>
                <input type="text" required maxLength={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-cyan focus:border-brand-cyan" placeholder="AA/YY" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input type="text" required maxLength={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-cyan focus:border-brand-cyan" placeholder="123" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
               <AlertCircle size={12} /> Bu bir sandbox ödeme simülasyonudur. Test için rastgele veriler girebilirsiniz. Sistem %20 ihtimalle ret (decline) hatası döndürecektir.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg">4. Sipariş Notu</h3>
        </div>
        <div className="p-6">
          <textarea
            value={musteriNotu}
            onChange={e => setMusteriNotu(e.target.value)}
            placeholder="Siparişinizle ilgili iletmek istediğiniz özel bir not varsa buraya yazabilirsiniz..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-cyan min-h-[100px] text-sm"
          ></textarea>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 max-w-sm">
          Siparişi onayla butonuna basarak Mesafeli Satış Sözleşmesi'ni kabul etmiş sayılırsınız.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="bg-brand-navy hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 size={20} className="animate-spin" />}
          Siparişi Onayla ve Öde
        </button>
      </div>
    </form>
  );
}
