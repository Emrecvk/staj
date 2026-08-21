import { FileText } from "lucide-react";

export default function QuotesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tekliflerim</h1>

      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <FileText size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-700 mb-2">Teklif Bulunamadı</h3>
        <p className="text-gray-500 max-w-md">Şu ana kadar oluşturulmuş bir teklif talebiniz bulunmuyor.</p>
      </div>
    </div>
  );
}
