import { Building2 } from "lucide-react";

export default function CompanyPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Firma Bilgilerim</h1>
        <button className="text-sm font-medium text-brand-cyan hover:underline">Düzenle</button>
      </div>

      <div className="border border-gray-100 rounded-lg p-6 bg-white">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="bg-brand-navy p-4 rounded-lg text-white">
            <Building2 size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Örnek Teknoloji A.Ş.</h2>
            <div className="text-sm text-gray-500">Kurumsal Müşteri</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <div className="text-sm text-gray-500 mb-1">Vergi Dairesi</div>
            <div className="font-medium text-gray-900">Ankara VD</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Vergi Numarası</div>
            <div className="font-medium text-gray-900">1234567890</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-gray-500 mb-1">KEP Adresi</div>
            <div className="font-medium text-gray-900">ornekteknoloji@hs01.kep.tr</div>
          </div>
        </div>
      </div>
    </div>
  );
}
