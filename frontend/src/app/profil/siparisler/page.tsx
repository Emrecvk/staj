import { Package } from "lucide-react";

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Siparişlerim</h1>

      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-gray-100 pb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Sipariş Tarihi: <span className="text-gray-900 font-medium">21 Ağu 2026</span></div>
                <div className="text-sm text-gray-500">Sipariş Özeti: <span className="text-gray-900 font-medium">2 Ürün</span></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase">Toplam</div>
                  <div className="text-lg font-bold text-brand-navy">₺450,00</div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Hazırlanıyor</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-3 rounded-lg text-gray-400">
                  <Package size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Sipariş No: ORD-2026-08{i}1</div>
                  <a href="#" className="text-sm text-brand-cyan hover:underline">Sipariş Detayı</a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
