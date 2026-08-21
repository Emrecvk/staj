import Link from "next/link";
import { Search, Heart } from "lucide-react";
import { favorileriGetirTam } from "@/lib/profil-api";
import { FavoriButonu } from "@/components/favori-karsilastirma-butonlari";

export const dynamic = "force-dynamic";

export default async function FavorilerPage() {
  const favoriler = await favorileriGetirTam();

  if (favoriler.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 py-20 text-center">
        <Heart size={40} className="mb-4 text-gray-300" />
        <h3 className="mb-2 text-lg font-bold text-gray-700">Favorileriniz Boş</h3>
        <p className="mb-6 max-w-md text-gray-500">
          Henüz favorilerinize eklediğiniz bir ürün bulunmuyor.
        </p>
        <Link
          href="/urunler"
          className="flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3 font-bold text-white hover:bg-opacity-90"
        >
          <Search size={18} /> Ürünleri Keşfet
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Favorilerim</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {favoriler.map((f) => (
          <div key={f.urunId} className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
            <div className="min-w-0">
              <Link
                href={`/urunler/${f.urunId}`}
                className="font-bold text-brand-navy hover:text-brand-cyan hover:underline"
              >
                {f.urunKodu}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{f.kisaAciklama}</p>
              {f.fiyat !== null && (
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {f.fiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
            {/* Kalp dolu gelir; tıklayınca favoriden çıkarır. */}
            <FavoriButonu urunId={f.urunId} baslangicta boyut="buyuk" />
          </div>
        ))}
      </div>
    </div>
  );
}
