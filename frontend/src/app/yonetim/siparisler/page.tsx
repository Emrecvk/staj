"use client";

import { Eye, Save } from "lucide-react";

export default function AdminOrdersPage() {
  const orders = [
    { id: 1, no: "ORD-2026-100", musteri: "Ali Yılmaz", tutar: 1500, durum: "Hazırlanıyor", tarih: "2026-08-20" },
    { id: 2, no: "ORD-2026-101", musteri: "Mekatronik A.Ş.", tutar: 45000, durum: "Kargolandı", tarih: "2026-08-19" }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sipariş Yönetimi</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Sipariş No</th>
                <th className="px-4 py-3 text-left font-medium">Müşteri</th>
                <th className="px-4 py-3 text-left font-medium">Tarih</th>
                <th className="px-4 py-3 text-right font-medium">Tutar</th>
                <th className="px-4 py-3 text-left font-medium">Durum Güncelle</th>
                <th className="px-4 py-3 text-right font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-bold text-brand-navy">{o.no}</td>
                  <td className="px-4 py-4 text-gray-900">{o.musteri}</td>
                  <td className="px-4 py-4 text-gray-600">{o.tarih}</td>
                  <td className="px-4 py-4 text-right font-bold text-gray-900">{o.tutar} ₺</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <select 
                        defaultValue={o.durum}
                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                      >
                        <option>Bekliyor</option>
                        <option>Hazırlanıyor</option>
                        <option>Kargolandı</option>
                        <option>Teslim Edildi</option>
                        <option>İptal</option>
                      </select>
                      <button title="Kaydet" className="text-green-600 hover:bg-green-50 p-1 rounded">
                        <Save size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded font-medium transition-colors">
                      <Eye size={14} /> Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
