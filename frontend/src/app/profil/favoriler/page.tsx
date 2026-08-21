import { Heart, Search } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Favorilerim</h1>

      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <Heart size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-700 mb-2">Favorileriniz Boş</h3>
        <p className="text-gray-500 max-w-md mb-6">Henüz favorilerinize eklediğiniz bir ürün bulunmuyor.</p>
        <a href="/urunler" className="flex items-center gap-2 bg-brand-cyan text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90">
          <Search size={18} /> Ürünleri Keşfet
        </a>
      </div>
    </div>
  );
}
