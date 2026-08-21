"use client";

import { FolderTree, Plus } from "lucide-react";

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kategori, Üretici ve Özellikler</h1>
        <button className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90">
          <Plus size={16} /> Yeni Tanım Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <FolderTree size={18} /> Kategoriler
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Yarı İletkenler</li>
            <li className="pl-4 text-gray-500">Diyotlar</li>
            <li className="pl-4 text-gray-500">Transistörler</li>
            <li>Pasif Bileşenler</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Üreticiler</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Texas Instruments</li>
            <li>STMicroelectronics</li>
            <li>Analog Devices</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Parametrik Özellikler</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Kılıf Tipi (Package)</li>
            <li>Maksimum Akım (A)</li>
            <li>Çalışma Sıcaklığı</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
