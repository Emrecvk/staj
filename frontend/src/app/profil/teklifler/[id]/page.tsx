import { FileText, Check, X, Calendar, User, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Mock data for the quote details
  const teklif = {
    id: parseInt(resolvedParams.id),
    talepNo: `TKLF-2026-${resolvedParams.id.padStart(4, '0')}`,
    durum: "Teklif Iletildi", // "Bekliyor", "Teklif Iletildi", "Onaylandi", "Reddedildi"
    gecerlilikTarihi: "2026-08-30T17:00:00Z",
    musteriNotu: "Bu ürünleri Q3 üretimimiz için talep ediyoruz. Hedef fiyatımız 0.12 USD'dir.",
    temsilciNotu: "Merhabalar, belirttiğiniz hedef fiyata en yakın şekilde teklifimiz hazırlanmıştır.",
    kalemler: [
      {
        id: 1,
        urunKodu: "1N4148",
        miktar: 10000,
        teklifEdilenMiktar: 10000,
        teklifEdilenBirimFiyat: 0.125,
        paraBirimi: "USD",
        teklifEdilenTeslimSuresiGun: 14
      },
      {
        id: 2,
        urunKodu: "LM358",
        miktar: 5000,
        teklifEdilenMiktar: 5000,
        teklifEdilenBirimFiyat: 0.28,
        paraBirimi: "USD",
        teklifEdilenTeslimSuresiGun: 7
      }
    ]
  };

  if (!teklif) {
    notFound();
  }

  // Calculate totals
  const total = teklif.kalemler.reduce((acc, k) => acc + (k.teklifEdilenBirimFiyat || 0) * (k.teklifEdilenMiktar || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={24} className="text-brand-cyan" /> 
            Teklif Detayı: {teklif.talepNo}
          </h1>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <Info size={16} /> Müşteri Onayı Bekleniyor
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} /> Geçerlilik Bilgisi
          </h3>
          <div className="text-3xl font-extrabold text-brand-navy mb-1">30 Ağu 2026</div>
          <div className="text-sm text-gray-500">Tarihine kadar geçerlidir</div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} /> Temsilci Notu
          </h3>
          <p className="text-sm text-gray-700 italic">"{teklif.temsilciNotu}"</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ürün</th>
                <th className="px-4 py-3 text-right font-medium">Talep</th>
                <th className="px-4 py-3 text-right font-medium">Teklif (Adet)</th>
                <th className="px-4 py-3 text-right font-medium">Termin (Gün)</th>
                <th className="px-4 py-3 text-right font-medium">Birim Fiyat</th>
                <th className="px-4 py-3 text-right font-medium">Toplam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teklif.kalemler.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.urunKodu}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{item.miktar}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-navy">{item.teklifEdilenMiktar}</td>
                  <td className="px-4 py-3 text-right">{item.teklifEdilenTeslimSuresiGun}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.paraBirimi, maximumFractionDigits: 4 }).format(item.teklifEdilenBirimFiyat || 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.paraBirimi }).format((item.teklifEdilenMiktar || 0) * (item.teklifEdilenBirimFiyat || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={5} className="px-4 py-4 text-right font-bold text-gray-900 text-lg">Genel Toplam:</td>
                <td className="px-4 py-4 text-right font-extrabold text-brand-navy text-xl">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: "USD" }).format(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-500 max-w-sm mr-auto">
          Teklifi onayladığınızda, ürünler sepetinize özel fiyatlarla eklenecek ve sipariş aşamasına geçebileceksiniz.
        </p>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 px-6 rounded-lg transition-colors">
          <X size={18} /> Teklifi Reddet
        </button>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm">
          <Check size={18} /> Onayla ve Siparişe Geç
        </button>
      </div>
    </div>
  );
}
