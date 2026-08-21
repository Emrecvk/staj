"use client";

import { FileText } from "lucide-react";

export default function QuotesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tekliflerim</h1>

      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Talep No</th>
              <th className="px-4 py-3 text-left font-medium">Tarih</th>
              <th className="px-4 py-3 text-left font-medium">Geçerlilik</th>
              <th className="px-4 py-3 text-left font-medium">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = '/profil/teklifler/1'}>
              <td className="px-4 py-4 font-bold text-brand-navy">
                <a href="/profil/teklifler/1" className="hover:underline">TKLF-2026-0001</a>
              </td>
              <td className="px-4 py-4 text-gray-600">21 Ağu 2026</td>
              <td className="px-4 py-4 text-gray-600">30 Ağu 2026</td>
              <td className="px-4 py-4">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium border border-yellow-200">
                  Onay Bekliyor
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
