"use client";

import { Edit3 } from "lucide-react";

export default function AdminQuotesPage() {
  const quotes = [
    { id: 1, no: "TKLF-2026-0001", firma: "RoboTech San. Tic.", durum: "Bekliyor", tarih: "2026-08-21", kalemSayisi: 2 }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teklif Yönetimi</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Talep No</th>
                <th className="px-4 py-3 text-left font-medium">Firma</th>
                <th className="px-4 py-3 text-left font-medium">Tarih</th>
                <th className="px-4 py-3 text-center font-medium">Kalem</th>
                <th className="px-4 py-3 text-left font-medium">Durum</th>
                <th className="px-4 py-3 text-right font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-bold text-brand-navy">{q.no}</td>
                  <td className="px-4 py-4 text-gray-900">{q.firma}</td>
                  <td className="px-4 py-4 text-gray-600">{q.tarih}</td>
                  <td className="px-4 py-4 text-center text-gray-900 font-medium">{q.kalemSayisi}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      {q.durum}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-cyan text-white hover:bg-opacity-90 rounded font-medium transition-colors">
                      <Edit3 size={14} /> Fiyatlandır
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
