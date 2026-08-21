import { Package, Heart, CreditCard, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfileDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hesap Özeti</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Package size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Siparişler</div>
          </div>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex items-center gap-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-full"><Heart size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Favoriler</div>
          </div>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-full"><CreditCard size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">₺0</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Bakiye</div>
          </div>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex items-center gap-4">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-full"><Shield size={24} /></div>
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">Doğrulandı</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">E-posta Durumu</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Son Siparişler</h2>
            <Link href="/profil/siparisler" className="text-sm font-medium text-brand-cyan hover:underline">Tümünü Gör</Link>
          </div>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Sipariş No</th>
                  <th className="px-4 py-3 text-left font-medium">Tarih</th>
                  <th className="px-4 py-3 text-left font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3">ORD-2026-0821</td>
                  <td className="px-4 py-3 text-gray-500">21 Ağu 2026</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Hazırlanıyor</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">ORD-2026-0715</td>
                  <td className="px-4 py-3 text-gray-500">15 Tem 2026</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Teslim Edildi</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Kişisel Bilgiler</h2>
            <button className="text-sm font-medium text-brand-cyan hover:underline">Düzenle</button>
          </div>
          <div className="border border-gray-100 rounded-lg p-5">
            <div className="grid grid-cols-3 gap-4 mb-4 border-b border-gray-100 pb-4">
              <div className="text-gray-500 text-sm">Ad Soyad</div>
              <div className="col-span-2 font-medium text-sm text-gray-900">Kullanıcı</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4 border-b border-gray-100 pb-4">
              <div className="text-gray-500 text-sm">E-posta</div>
              <div className="col-span-2 font-medium text-sm text-gray-900">ornek@mail.com</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-gray-500 text-sm">Telefon</div>
              <div className="col-span-2 font-medium text-sm text-gray-900">+90 555 123 4567</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
