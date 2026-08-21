"use client";

import { FileText, Plus } from "lucide-react";

export default function AdminContentPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog ve İçerik Yönetimi</h1>
        <button className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90">
          <Plus size={16} /> Yeni İçerik Ekle
        </button>
      </div>

      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <FileText size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-700 mb-2">İçerik Bulunamadı</h3>
        <p className="text-gray-500 max-w-md">Henüz bir blog yazısı veya sayfa içeriği oluşturmadınız.</p>
      </div>
    </div>
  );
}
