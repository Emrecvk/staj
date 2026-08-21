import { Package, Building2, ShoppingCart, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Genel Bakış</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Toplam Ürün</p>
              <h3 className="text-3xl font-bold text-gray-900">12,450</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package size={24} />
            </div>
          </div>
          <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
            <TrendingUp size={12} /> +120 bu ay
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Bekleyen Firmalar</p>
              <h3 className="text-3xl font-bold text-gray-900">8</h3>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Building2 size={24} />
            </div>
          </div>
          <a href="/yonetim/firmalar" className="text-xs text-brand-cyan hover:underline font-medium">
            Onay bekleyen başvuruları incele
          </a>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Yeni Siparişler</p>
              <h3 className="text-3xl font-bold text-gray-900">45</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <ShoppingCart size={24} />
            </div>
          </div>
          <a href="/yonetim/siparisler" className="text-xs text-brand-cyan hover:underline font-medium">
            Sipariş yönetimine git
          </a>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Bekleyen Teklifler</p>
              <h3 className="text-3xl font-bold text-gray-900">12</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <a href="/yonetim/teklifler" className="text-xs text-brand-cyan hover:underline font-medium">
            Teklif taleplerini fiyatlandır
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle size={18} /> Kritik Stok Uyarıları
            </h3>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-gray-100">
              {[1, 2, 3].map(i => (
                <li key={i} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-gray-900">1N4148-STK{i}</p>
                    <p className="text-xs text-gray-500">Switching Diode, 100V</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold text-sm">4 Adet</p>
                    <p className="text-xs text-gray-500">Min: 100</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Son Aktiviteler</h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm text-gray-900">Yeni ürün eklendi: <strong>LM358N</strong></p>
                  <p className="text-xs text-gray-500">2 saat önce</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm text-gray-900">Sipariş <strong>#ORD-0821</strong> kargolandı olarak güncellendi.</p>
                  <p className="text-xs text-gray-500">4 saat önce</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm text-gray-900">Firma <strong>Mekatronik A.Ş.</strong> başvurusu onaylandı.</p>
                  <p className="text-xs text-gray-500">5 saat önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
