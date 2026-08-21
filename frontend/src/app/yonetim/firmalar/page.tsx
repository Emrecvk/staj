"use client";

import { Check, X } from "lucide-react";

export default function AdminCompaniesPage() {
  const pendingCompanies = [
    { id: 1, ad: "Mekatronik A.Ş.", vd: "Ankara", vn: "1112223334", tarih: "2026-08-21" },
    { id: 2, ad: "RoboTech San. Tic.", vd: "İstanbul", vn: "9998887776", tarih: "2026-08-20" }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Firma Başvuruları</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Firma Ünvanı</th>
                <th className="px-4 py-3 text-left font-medium">Vergi Dairesi / No</th>
                <th className="px-4 py-3 text-left font-medium">Başvuru Tarihi</th>
                <th className="px-4 py-3 text-right font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-bold text-gray-900">{c.ad}</td>
                  <td className="px-4 py-4 text-gray-600">{c.vd} / {c.vn}</td>
                  <td className="px-4 py-4 text-gray-600">{c.tarih}</td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium transition-colors">
                      <X size={14} /> Reddet
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded font-medium transition-colors">
                      <Check size={14} /> Onayla
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
