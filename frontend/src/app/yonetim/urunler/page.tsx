"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, RotateCcw, Package } from "lucide-react";

export default function AdminProductsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const mockProducts = [
    { id: 1, kodu: "1N4148", ad: "Diyot", stok: 15000, silinmisMi: false },
    { id: 2, kodu: "LM358", ad: "Op-Amp", stok: 500, silinmisMi: false },
    { id: 3, kodu: "RES-10K", ad: "Direnç", stok: 0, silinmisMi: true },
  ];

  const handleDelete = (p: any) => {
    setSelectedProduct(p);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    // API call to soft-delete
    alert(`${selectedProduct.kodu} başarıyla silindi (soft-delete).`);
    setShowConfirm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
        <button className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90">
          <Plus size={16} /> Yeni Ürün Ekle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Ürün kodu veya adına göre ara..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-brand-cyan focus:border-brand-cyan outline-none text-sm"
            />
          </div>
          <select className="border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-brand-cyan">
            <option>Tüm Durumlar</option>
            <option>Aktif Ürünler</option>
            <option>Silinenler</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">MPN / Kod</th>
                <th className="px-4 py-3 text-left font-medium">Ad / Kategori</th>
                <th className="px-4 py-3 text-right font-medium">Stok</th>
                <th className="px-4 py-3 text-center font-medium">Durum</th>
                <th className="px-4 py-3 text-right font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-bold text-gray-900">{p.kodu}</td>
                  <td className="px-4 py-4 text-gray-600">{p.ad}</td>
                  <td className="px-4 py-4 text-right font-medium">
                    {p.stok > 0 ? p.stok.toLocaleString('tr-TR') : <span className="text-red-500">Stokta Yok</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {p.silinmisMi ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Silinmiş</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Aktif</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2">
                    <button title="Stok/Fiyat Yönetimi" className="p-1.5 text-gray-500 hover:text-brand-cyan hover:bg-cyan-50 rounded transition-colors">
                      <Package size={16} />
                    </button>
                    <button title="Düzenle" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Edit2 size={16} />
                    </button>
                    {p.silinmisMi ? (
                      <button title="Geri Al" className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                        <RotateCcw size={16} />
                      </button>
                    ) : (
                      <button onClick={() => handleDelete(p)} title="Sil" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ürünü Sil?</h3>
            <p className="text-gray-600 mb-6">
              <strong>{selectedProduct?.kodu}</strong> kodlu ürünü silmek istediğinize emin misiniz? Bu işlem ürünü aramalardan gizler (Soft-delete).
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
