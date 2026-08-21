import { MapPin, Plus } from "lucide-react";

export default function AddressesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Adreslerim</h1>
        <button className="flex items-center gap-2 bg-brand-cyan text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90">
          <Plus size={16} /> Yeni Adres
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-brand-navy rounded-xl p-5 relative">
          <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-2 py-1 text-xs font-semibold rounded">Varsayılan</div>
          <div className="flex items-center gap-2 mb-3 text-brand-navy font-bold">
            <MapPin size={18} /> Ev Adresi
          </div>
          <div className="text-gray-600 text-sm mb-4 leading-relaxed">
            Mustafa Kemal Mah. Dumlupınar Bulv. No: 266<br />
            Tepe Prime A Blok Kat: 2 No: 18<br />
            Çankaya / Ankara
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="text-sm text-brand-cyan font-medium hover:underline">Düzenle</button>
            <button className="text-sm text-red-500 font-medium hover:underline">Sil</button>
          </div>
        </div>
      </div>
    </div>
  );
}
