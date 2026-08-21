"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuote } from "@/lib/cart-actions";
import { Loader2, AlertCircle, FileText } from "lucide-react";

export function QuoteRequestForm({ cart }: { cart: any }) {
  const [musteriNotu, setMusteriNotu] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    try {
      const res = await createQuote({ musteriNotu });
      if (res.success) {
        // Successful quote request logic - redirect to quotes page or success page
        router.push(`/profil/teklifler`);
      } else {
        setError(res.message || "Teklif talebi oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Bağlantı hatası.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg">Teklif Notu (Opsiyonel)</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Projeniz hakkında detaylar, hedef fiyat beklentiniz veya termin süreleri gibi satış temsilcimize iletmek istediğiniz notları buraya yazabilirsiniz.
          </p>
          <textarea
            value={musteriNotu}
            onChange={e => setMusteriNotu(e.target.value)}
            placeholder="Örn: Bu ürünleri Q3 üretimimiz için talep ediyoruz. Hedef fiyatımız 0.12 USD'dir."
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-cyan min-h-[150px] text-sm"
          ></textarea>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 max-w-md">
          Sepetinizdeki ürünler için teklif talep ediyorsunuz. Bu işlem sonucunda sepetiniz boşaltılacaktır.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-brand-navy hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
          Teklif Talebini Gönder
        </button>
      </div>
    </form>
  );
}
